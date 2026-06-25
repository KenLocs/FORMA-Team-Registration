const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('team')
    .setDescription('View a registered team')
    .addStringOption(option =>
        option
            .setName('name')
            .setDescription('Team name')
            .setRequired(true)
            .setAutocomplete(true)
    ),

    async execute(interaction) {

        const teamName = interaction.options.getString('name');

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

        const team = teams.find(t =>
            t.teamName.toLowerCase() === teamName.toLowerCase()
        );

        if (!team) {
            return interaction.reply({
                content: `❌ Team "${teamName}" not found.`,
                flags: 64
            });
        }

        const mainPlayers = team.mainPlayers.length
            ? team.mainPlayers.map(id => `<@${id}>`).join('\n')
            : 'None';

        const substitutes = team.substitutes.length
            ? team.substitutes.map(id => `<@${id}>`).join('\n')
            : 'None';

        const coach = team.coachId
            ? `<@${team.coachId}>`
            : 'None';

        const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle(`🏷️ ${team.teamName}`)
        .addFields(
            {
                name: '👑 Captain',
                value: `<@${team.captainId}>`
            },
            {
                name: '👥 Main Players',
                value: mainPlayers
            },
            {
                name: '🎮 Substitutes',
                value: substitutes
            },
            {
                name: '🎯 Coach',
                value: coach
            },
            {
                name: '👤 Submitted By',
                value: `<@${team.submittedBy}>`
            },
            {
                name: '✅ Approved By',
                value: `<@${team.approvedBy}>`
            },
            {
                name: '🛠 Last Edited By',
                value: team.lastEditedBy
                ? `<@${team.lastEditedBy}>`
                : 'Never'
            },
            {
                name: '📅 Last Edited',
                value: team.lastEditedAt
                ? `<t:${Math.floor(
                    new Date(team.lastEditedAt).getTime() / 1000
                )}:F>`
                : 'Never'
            }
        )
        .setFooter({
            text: `Approved on ${new Date(team.approvedAt).toLocaleDateString()}`
        });

        await interaction.reply({
            embeds: [embed]
        });

    }
};