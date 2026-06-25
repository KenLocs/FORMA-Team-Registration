const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('teams')
    .setDescription('View all approved teams'),

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

        if (teams.length === 0) {
            return interaction.reply({
                content: '❌ No approved teams found.',
                flags: 64
            });
        }

        const teamList = teams
            .map((team, index) =>
                `${index + 1}. ${team.teamName}`
            )
            .join('\n');

        const embed = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('📋 Registered Teams')
        .setDescription(teamList)
        .addFields({
            name: 'Total Teams',
            value: `${teams.length}`
        });

        await interaction.reply({
            embeds: [embed]
        });

    }
};