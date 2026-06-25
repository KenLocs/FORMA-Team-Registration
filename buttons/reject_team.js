const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

module.exports = {
    customId: 'reject_team',

    async execute(interaction) {

        const modal = new ModalBuilder()
        .setCustomId(`reject_team_modal_${interaction.message.id}`)
        .setTitle('Reject Team Registration');

        const reason = new TextInputBuilder()
        .setCustomId('reject_reason')
        .setLabel('Reason for rejection')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(reason)
        );

        await interaction.showModal(modal);

    }
};