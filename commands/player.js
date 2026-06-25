const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('player')
    .setDescription('Check a player team')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('Player to check')
            .setRequired(true)
    ),

    async execute(interaction) {

        const user = interaction.options.getUser('user');

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

        let foundTeam = null;
        let role = null;

        for (const team of teams) {

            if (team.captainId === user.id) {
                foundTeam = team;
                role = 'Captain';
                break;
            }

            if (team.mainPlayers.includes(user.id)) {
                foundTeam = team;
                role = 'Main Player';
                break;
            }

            if (team.substitutes.includes(user.id)) {
                foundTeam = team;
                role = 'Substitute';
                break;
            }

            if (team.coachId === user.id) {
                foundTeam = team;
                role = 'Coach';
                break;
            }
        }

        if (!foundTeam) {
            return interaction.reply({
                content: '❌ This user is not registered on any approved team.',
                flags: 64
            });
        }

        const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle('👤 Player Information')
        .addFields(
            {
                name: 'User',
                value: `<@${user.id}>`
            },
            {
                name: '🏷️ Team',
                value: foundTeam.teamName
            },
            {
                name: '📌 Role',
                value: role
            }
        );

        await interaction.reply({
            embeds: [embed]
        });

    }
};