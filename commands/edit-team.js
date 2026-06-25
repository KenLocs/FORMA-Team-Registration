const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('edit-team')
    .setDescription('Edit a registered team')
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

        const team = teams.find(t =>
            t.teamName.toLowerCase() ===
            teamName.toLowerCase()
        );

        if (!team) {
            return interaction.reply({
                content: `❌ Team "${teamName}" not found.`,
                flags: 64
            });
        }

        const modal = new ModalBuilder()
        .setCustomId(`edit_team_${team.teamName}`)
        .setTitle(`Edit ${team.teamName}`);

        const captain = new TextInputBuilder()
        .setCustomId('captain')
        .setLabel('Captain ID')
        .setStyle(TextInputStyle.Short)
        .setValue(team.captainId)
        .setRequired(true);

        const players = new TextInputBuilder()
        .setCustomId('players')
        .setLabel('Main Players')
        .setStyle(TextInputStyle.Paragraph)
        .setValue(team.mainPlayers.join('\n'))
        .setRequired(true);

        const subs = new TextInputBuilder()
        .setCustomId('subs')
        .setLabel('Substitutes')
        .setStyle(TextInputStyle.Paragraph)
        .setValue(team.substitutes.join('\n'))
        .setRequired(false);

        const coach = new TextInputBuilder()
        .setCustomId('coach')
        .setLabel('Coach ID')
        .setStyle(TextInputStyle.Short)
        .setValue(team.coachId || '')
        .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(captain),
            new ActionRowBuilder().addComponents(players),
            new ActionRowBuilder().addComponents(subs),
            new ActionRowBuilder().addComponents(coach)
        );

        await interaction.showModal(modal);

    }
};