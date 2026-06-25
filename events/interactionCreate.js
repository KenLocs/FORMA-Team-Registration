module.exports = {
    name: 'interactionCreate',

    async execute(interaction, client) {

        // Slash Commands
        if (interaction.isChatInputCommand()) {

            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: 'There was an error executing this command.',
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: 'There was an error executing this command.',
                        ephemeral: true
                    });
                }
            }
        }

        // Buttons
        if (interaction.isButton()) {

            const button = client.buttons.get(interaction.customId);

            if (!button) return;

            try {
                await button.execute(interaction);
            } catch (error) {
                console.error(error);
            }
        }

        if (interaction.isModalSubmit()) {

            if(interaction.customId === 'team_registration_modal') {

                const teamName = interaction.fields.getTextInputValue('team_name');
                const captain = interaction.fields.getTextInputValue('captain_id');

                await interaction.reply({
                    content:
                       `✅ Registration received!\n\n` +
                `**Team:** ${teamName}\n` +
                `**Captain ID:** ${captain}`,
            ephemeral: true
                });
            }
        }
    }
};