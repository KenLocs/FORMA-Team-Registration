require('dotenv').config();

const { 
    Client, 
    GatewayIntentBits, 
    Collection,
    Events
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
client.buttons = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

const buttonsPath = path.join(__dirname, 'buttons');
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const button = require(path.join(buttonsPath, file));
    client.buttons.set(button.customId, button);
}

client.once(Events.ClientReady, readyClient => {
    console.log(`✅ ${readyClient.user.tag} is online!`);
});

client.on(Events.InteractionCreate, async interaction => {
    
    if (interaction.isAutocomplete()) {
        
        const fs = require('fs');
        const path = require('path');
        
        const focusedValue =
        interaction.options.getFocused();
        
        const databasePath = path.join(
            __dirname,
            'database',
            'teams.json'
        );
        
        let teams = [];
        
        if (fs.existsSync(databasePath)) {
            teams = JSON.parse(
                fs.readFileSync(databasePath, 'utf8')
            );
        }
        
        const filtered = teams
        .filter(team =>
            team.teamName
            .toLowerCase()
            .includes(
                focusedValue.toLowerCase()
            )
        )
        .slice(0, 25);
        
        await interaction.respond(
            filtered.map(team => ({
                name: team.teamName,
                value: team.teamName
            }))
        );
        
        return;
    }
    
    if (interaction.isChatInputCommand()) {
        
        const command = client.commands.get(interaction.commandName);
        
        if (!command) return;
        
        return command.execute(interaction);
    
    }
    
    if (interaction.isButton()) {
        
        const button = client.buttons.get(interaction.customId);
        
        if (!button) return;
        
        return button.execute(interaction);
    }
    
    if (interaction.isModalSubmit()) {
        
        if (interaction.customId === 'team_registration_modal') {
            
            const {
                EmbedBuilder,
                ActionRowBuilder,
                ButtonBuilder,
                ButtonStyle
            } = require('discord.js');
            
            const teamName = interaction.fields.getTextInputValue('team_name');
            const captain = interaction.fields.getTextInputValue('captain_id');
            const mainPlayers = interaction.fields
            .getTextInputValue('main_players')
            .split('\n')
            .map(id => id.trim())
            .filter(id => id.length > 0);
            
            const substitutes = interaction.fields
            .getTextInputValue('substitutes')
            .split('\n')
            .map(id => id.trim())
            .filter(id => id.length > 0);
            
            const coachId =
            interaction.fields.getTextInputValue('coach_id') || 'None';

            const activePlayers = [captain, ...mainPlayers];
            
            if (activePlayers.length !== 5) {
                return interaction.reply({
                    content: '❌ Teams must have exactly 5 active players (Captain + 4 players).',
                    flags: 64
                });
            }
            
            const approvalChannel = interaction.client.channels.cache.get('1518265149541191750');
            
            const playerMentions = mainPlayers
            .map(id => `<@${id}>`)
            .join('\n');
            
            const substituteMentions = substitutes.length > 0
            ? substitutes.map(id => `<@${id}>`).join('\n')
            : 'None';
            
            const coachMention = coachId !== 'None'
            ? `<@${coachId}>`
            : 'None';

            const embed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('📥 New Team Registration')
            .addFields(
                {
                    name: '🏷️ Team Name',
                    value:teamName
                },
                {
                    name: '👑 Captain ID',
                    value: `<@${captain}>`
                },
                {
                    name: '👥 Main Players',
                    value: playerMentions
                },
                {
                    name: '🎮 Substitutes',
                    value: substituteMentions
                },
                {
                    name: '🎯 Coach',
                    value: coachMention
                },
                {
                    name: '👤 Submitted By',
                    value: `<@${interaction.user.id}>`
                },
                {
                    name: 'Status',
                    value: '🟡 Pending Review'
                }
            )
            .setTimestamp();
            
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('approved_team')
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                .setCustomId('reject_team')
                .setLabel('Reject')
                .setStyle(ButtonStyle.Danger)
            );

        await approvalChannel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({
            content: 
 `✅ Registration received!

**Team Name:** ${teamName}
**Captain ID:** ${captain}

Your registration has been sent for staff review.`,
             ephemeral: true
            });
        }

        if (interaction.customId.startsWith('edit_team_')) {
            
            const fs = require('fs');
            const path = require('path');
            
            const teamName = interaction.customId.replace(
                'edit_team_',
                ''
            );
            
            const databasePath = path.join(
                __dirname,
                'database',
                'teams.json'
            );
            
            let teams = JSON.parse(
                fs.readFileSync(databasePath, 'utf8')
            );
            
            const team = teams.find(t =>
                t.teamName === teamName
            );
            
            if (!team) {
                return interaction.reply({
                    content: '❌ Team not found.',
                    flags: 64
                });
            }
            
            team.captainId =
            interaction.fields.getTextInputValue('captain');
            
            team.mainPlayers =
            interaction.fields
            .getTextInputValue('players')
            .split('\n')
            .map(id => id.trim())
            .filter(Boolean);

            const activePlayers = [
                team.captainId,
                ...team.mainPlayers
            ];
            
            if (activePlayers.length !== 5) {
                return interaction.reply({
                    content: '❌ Teams must have exactly 5 active players.',
                    flags: 64
                });
            }
            
            team.substitutes =
            interaction.fields
            .getTextInputValue('subs')
            .split('\n')
            .map(id => id.trim())
            .filter(Boolean);
            
            const coach =
            interaction.fields.getTextInputValue('coach');
            
            team.coachId =
            coach.length > 0 ? coach : null;

            team.lastEditedBy = interaction.user.id;
            team.lastEditedAt = new Date().toISOString();
            
            const allPeople = [
                team.captainId,
                ...team.mainPlayers,
                ...team.substitutes
            ];
            
            if (team.coachId) {
                allPeople.push(team.coachId);
            }

            const uniquePeople = new Set(allPeople);
            
            if (uniquePeople.size !== allPeople.length) {
                
                return interaction.reply({
                    content:
                    '❌ A player appears more than once in this roster.',
                    flags: 64
                });
            
            }

            for (const personId of allPeople) {
                
                const duplicateTeam = teams.find(t => {
                    
                    if (t.teamName === team.teamName) {
                        return false;
                    }
                    
                    return (
                        t.captainId === personId ||
                        (t.mainPlayers || []).includes(personId) ||
                        (t.substitutes || []).includes(personId) ||
                        t.coachId === personId
                    );
                
                });
                
                if (duplicateTeam) {
                    
                    return interaction.reply({
                        content:
                        `❌ <@${personId}> is already registered in **${duplicateTeam.teamName}**.`,
                        flags: 64
                    });
                
                }
            
            }
            
            fs.writeFileSync(
                databasePath,
                JSON.stringify(teams, null, 4)
            );

            const logChannel =
            interaction.client.channels.cache.get(
                '1517544055653928991'
            );
            
            if (logChannel) {
                
                await logChannel.send({
                    content:
                    `🛠 Team Edited
                    
                    🏷️ Team: ${team.teamName}
                    👤 Staff: <@${interaction.user.id}>`
                });
            
            }
            
            await interaction.reply({
                content: `✅ Team **${team.teamName}** updated successfully.`,
                flags: 64
            });
        }

        if (interaction.customId.startsWith('reject_team_modal_')) {
            
            const {
                EmbedBuilder
            } = require('discord.js');
            
            const reason =
            interaction.fields.getTextInputValue(
                'reject_reason'
            );
            
            const messageId =
            interaction.customId.replace(
                'reject_team_modal_',
                ''
            );
            
            const approvalChannel =
            interaction.client.channels.cache.get(
                '1518265149541191750'
            );
            
            const message =
            await approvalChannel.messages.fetch(
                messageId
            );
            
            const oldEmbed = message.embeds[0];
            
            const statusIndex = oldEmbed.fields.findIndex(
                field => field.name === 'Status'
            );
            
            const newEmbed = EmbedBuilder.from(oldEmbed)
            .spliceFields(statusIndex, 1, {
                name: 'Status',
                value: '🔴 Rejected'
            })
            .addFields({
                name: '❌ Rejection Reason',
                value: reason
            });
            
            const disabledRow =
            message.components.map(row => ({
                type: row.type,
                components: row.components.map(button => ({
                    type: button.type,
                    style: button.style,
                    label: button.label,
                    custom_id: button.customId,
                    disabled: true
                }))
            }));
            
            await message.edit({
                embeds: [newEmbed],
                components: disabledRow
            });

            const logChannel =
            interaction.client.channels.cache.get(
                '1517544055653928991'
            );
            
            if (logChannel) {
                
                const teamName =
                oldEmbed.fields.find(
                    field => field.name === '🏷️ Team Name'
                )?.value || 'Unknown Team';
                
                await logChannel.send({
                    content:
                    `🔴 Team Rejected
                    
                    🏷️ Team: ${teamName}
                    👤 Staff: <@${interaction.user.id}>
                    
                    ❌ Reason:
                    ${reason}`
                });
            
            }

            const submittedByField =
            oldEmbed.fields.find(
                field => field.name === '👤 Submitted By'
            );
            
            if (submittedByField) {
                
                const userId =
                submittedByField.value.replace(
                    /[<@!>]/g,
                    ''
                );
                
                try {
                    
                    const applicant =
                    await interaction.client.users.fetch(
                        userId
                    );
                    
                    const teamName =
                    oldEmbed.fields.find(
                        field => field.name === '🏷️ Team Name'
                    )?.value || 'Unknown Team';
                    
                   await applicant.send(
                    `❌ Your team registration has been rejected.
                    
                    🏷️ Team: ${teamName}
                    
                    Reason:
                    ${reason}
                    
                    You may submit a new registration after correcting the issue.`
                );
                
                } catch (error) {
                    
                    console.log(
                        'Could not DM applicant:',
                        error.message
                    );
                
                }
            
            }
            
            await interaction.reply({
                content: '✅ Team rejected.',
                flags: 64
            });
            
            return;
        }

    }
});
console.log("TOKEN EXISTS:", !!process.env.TOKEN);
client.login(process.env.TOKEN);
