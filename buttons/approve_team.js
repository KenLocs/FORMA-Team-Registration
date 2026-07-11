const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'approved_team',

    async execute(interaction) {

        const databasePath = path.join(__dirname, '..', 'database', 'teams.json');

        let teams = [];

        if (fs.existsSync(databasePath)) {
            teams = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
        }

        const embed = interaction.message.embeds[0];

        console.log(embed.fields);
        
        const teamName = embed.fields.find(f => f.name === '🏷️ Team Name').value;
        
        const captainId = embed.fields
        .find(f => f.name === '👑 Captain ID')
        .value.replace(/[<@!>]/g, '');
        
        const mainPlayers = embed.fields
        .find(f => f.name === '👥 Main Players')
        .value
        .split('\n')
        .map(m => m.replace(/[<@!>]/g, '').trim());
        
        const substitutesField = embed.fields
        .find(f => f.name === '🎮 Substitutes')
        .value;
        
        const substitutes =
        substitutesField === 'None'
        ? []
        : substitutesField
        .split('\n')
        .map(m => m.replace(/[<@!>]/g, '').trim());
        
        const coachField = embed.fields
        .find(f => f.name === '🎯 Coach')
        .value;
        
        const coachId =
        coachField === 'None'
        ? null
        : coachField.replace(/[<@!>]/g, '');
        
        const allPlayers = [
            captainId,
            ...mainPlayers,
            ...substitutes
        ];

        if (coachId) {
            allPlayers.push(coachId);
        }
        
        const submittedBy = embed.fields
        .find(f => f.name === '👤 Submitted By')
        .value.replace(/[<@!>]/g, '');

        const existingTeam = teams.find(team =>
            team.teamName.toLowerCase() === teamName.toLowerCase()
        );
        
        if (existingTeam) {
            return interaction.reply({
                content: `❌ Team **${teamName}** is already registered.`,
                flags: 64
            });
        }

        for (const playerId of allPlayers) {
            
            const duplicateTeam = teams.find(team =>
                team.captainId === playerId ||
                (team.mainPlayers || []).includes(playerId) ||
                (team.substitutes || []).includes(playerId) ||
                team.coachId === playerId
            );
        
            if (duplicateTeam) {
                return interaction.reply({
                    content: `❌ <@${playerId}> is already registered in **${duplicateTeam.teamName}**.`,
                    flags: 64
                });
            }
        
        }

        teams.push({
            teamName,
            captainId,
            mainPlayers,
            substitutes,
            coachId,
            submittedBy,
            approvedBy: interaction.user.id,
            approvedAt: new Date().toISOString()
        });
        
        fs.writeFileSync(
            databasePath,
            JSON.stringify(teams, null, 4)
        );

        const oldEmbed = interaction.message.embeds[0];
        
        const statusIndex = oldEmbed.fields.findIndex(
            field => field.name === 'Status'
        );
        
        const newEmbed = EmbedBuilder.from(oldEmbed)
        .spliceFields(statusIndex, 1, {
            name: 'Status',
            value: '🟢 Approved'
        });

        const disabledRow = interaction.message.components.map(row => ({
            type: row.type,
            components: row.components.map(button => ({
                type: button.type,
                style: button.style,
                label: button.label,
                custom_id: button.customId,
                disabled: true
            }))
        }));

        await interaction.update({
            embeds: [newEmbed],
            components: disabledRow
        });

        const approvedChannel = 
        interaction.client.channels.cache.get('1525533110949642250');

        if (approvedChannel) {

            await approvedChannel.send({
                embeds: [newEmbed]
            });

            const logChannel =
            interaction.client.channels.cache.get(
                '1525533827894874150'
            );
            
            if (logChannel) {
                
                await logChannel.send({
                    content:
                    `🟢 Team Approved
                    
                    🏷️ Team: ${teamName}
                    👤 Staff: <@${interaction.user.id}>`
                });
            
            }

        }

        const submittedByField =
        embed.fields.find(
            field => field.name === '👤 Submitted By'
        );
        
        if (submittedByField) {
            
            const applicantId =
            submittedByField.value.replace(
                /[<@!>]/g,
                ''
            );
            
            try {
                
                const applicant =
                await interaction.client.users.fetch(
                    applicantId
                );
                
                await applicant.send(
                    `🎉 Your team registration has been approved!
                    
                    🏷️ Team: ${teamName}
                    
                    You may now participate in FORMA events.
                    
                    Good luck and have fun!`
                );
            
            } catch (error) {
                
                console.log(
                    'Could not DM applicant:',
                    error.message
                );
            
            }
        
        }

    }
};