const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('remove-team')
    .setDescription('Remove an approved team')
    .addStringOption(option =>
        option
            .setName('name')
            .setDescription('Team name')
            .setRequired(true)
            .setAutocomplete(true)
    )
    .setDefaultMemberPermissions(
        PermissionFlagsBits.Administrator
    ),

    async execute(interaction) {

        const teamName =
        interaction.options.getString('name');

        const databasePath = path.join(
            __dirname,
            '..',
            'database',
            'teams.json'
        );

        let teams = [];

        if (fs.existsSync(databasePath)) {
            teams = JSON.parse(
                fs.readFileSync(databasePath, 'utf8')
            );
        }

        const teamIndex = teams.findIndex(team =>
            team.teamName.toLowerCase() ===
            teamName.toLowerCase()
        );

        if (teamIndex === -1) {
            return interaction.reply({
                content: `❌ Team "${teamName}" not found.`,
                flags: 64
            });
        }

        const removedTeam = teams[teamIndex];

        teams.splice(teamIndex, 1);

        fs.writeFileSync(
            databasePath,
            JSON.stringify(teams, null, 4)
        );

        await interaction.reply({
            content:
            `✅ Team **${removedTeam.teamName}** has been removed.`
        });

        const logChannel =
        interaction.client.channels.cache.get(
            '1525533827894874150'
        );
        
        if (logChannel) {
            
            await logChannel.send({
                content:
                `🗑 Team Removed
                
                🏷️ Team: ${removedTeam.teamName}
                👤 Staff: <@${interaction.user.id}>`
            });
        
        }

    }
};