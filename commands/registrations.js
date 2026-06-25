const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('registrations')
    .setDescription('Open or close registrations')
    .addStringOption(option =>
        option
            .setName('action')
            .setDescription('open or close')
            .setRequired(true)
            .addChoices(
                { name: 'Open', value: 'open' },
                { name: 'Close', value: 'close' }
            )
    )
    .setDefaultMemberPermissions(
        PermissionFlagsBits.Administrator
    ),

    async execute(interaction) {

        const action =
        interaction.options.getString('action');

        const settingsPath = path.join(
            __dirname,
            '..',
            'database',
            'settings.json'
        );

        const settings = JSON.parse(
            fs.readFileSync(settingsPath, 'utf8')
        );

        settings.registrationsOpen =
            action === 'open';

        fs.writeFileSync(
            settingsPath,
            JSON.stringify(settings, null, 4)
        );

        const logChannel =
        interaction.client.channels.cache.get(
            '1517544055653928991'
        );
        
        if (logChannel) {
            
            await logChannel.send({
                content:
                `📢 Registrations ${action.toUpperCase()}
                
                👤 Staff: <@${interaction.user.id}>`
            });
        
        }

        await interaction.reply({
            content:
            `✅ Registrations are now **${action.toUpperCase()}**.`
        });

    }
};