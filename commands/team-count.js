const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('team-count')
    .setDescription('View registration statistics'),

    async execute(interaction) {

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

        const teamCount = teams.length;

        let captains = 0;
        let mainPlayers = 0;
        let substitutes = 0;
        let coaches = 0;

        for (const team of teams) {

            captains++;

            mainPlayers += team.mainPlayers.length;

            substitutes +=
                (team.substitutes || []).length;

            if (team.coachId) {
                coaches++;
            }
        }

        const totalPeople =
            captains +
            mainPlayers +
            substitutes +
            coaches;

        const embed = new EmbedBuilder()
        .setColor('#F1C40F')
        .setTitle('📊 FORMA Statistics')
        .addFields(
            {
                name: 'Approved Teams',
                value: `${teamCount}`,
                inline: true
            },
            {
                name: 'Captains',
                value: `${captains}`,
                inline: true
            },
            {
                name: 'Main Players',
                value: `${mainPlayers}`,
                inline: true
            },
            {
                name: 'Substitutes',
                value: `${substitutes}`,
                inline: true
            },
            {
                name: 'Coaches',
                value: `${coaches}`,
                inline: true
            },
            {
                name: 'Total Registered People',
                value: `${totalPeople}`,
                inline: true
            }
        );

        await interaction.reply({
            embeds: [embed]
        });

    }
};