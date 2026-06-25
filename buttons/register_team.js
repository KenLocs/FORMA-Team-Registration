const fs = require('fs');
const path = require('path');
const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

module.exports = {
    customId: 'register_team',

    async execute(interaction) {

        const settingsPath = path.join(
            __dirname,
            '..',
            'database',
            'settings.json'
        );
        
        const settings = JSON.parse(
            fs.readFileSync(settingsPath, 'utf8')
        );
        
        if (!settings.registrationsOpen) {
            
            return interaction.reply({
                content:
                '❌ Team registrations are currently closed.',
                flags: 64
            });
        
        }

        const modal = new ModalBuilder()
        .setCustomId('team_registration_modal')
        .setTitle('FORMA Team Registration');

        const teamName = new TextInputBuilder()
        .setCustomId('team_name')
        .setLabel('Team Name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

        const captainId = new TextInputBuilder()
        .setCustomId('captain_id')
        .setLabel('Captain Discord User ID')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

        const mainPlayers = new TextInputBuilder()
        .setCustomId('main_players')
        .setLabel('Other 4 Main Player Discord User IDs')
        .setPlaceholder('Enter 4 IDs, one per line')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

        const substitutes = new TextInputBuilder()
        .setCustomId('substitutes')
        .setLabel('Substitute Discord User IDs (Optional)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

        const coach = new TextInputBuilder()
        .setCustomId('coach_id')
        .setLabel('Coach Discord User ID (Optional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

        const row1 = new ActionRowBuilder().addComponents(teamName);
        const row2 = new ActionRowBuilder().addComponents(captainId);
        const row3 = new ActionRowBuilder().addComponents(mainPlayers);
        const row4 = new ActionRowBuilder().addComponents(substitutes);
        const row5 = new ActionRowBuilder().addComponents(coach);

        modal.addComponents(
            row1,
            row2,
            row3,
            row4,
            row5
        );

        await interaction.showModal(modal);

    }
};