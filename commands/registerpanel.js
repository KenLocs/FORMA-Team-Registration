const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('registerpanel')
    .setDescription('Creates the FORMA Team Registration Panel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🏆 FORMA Team Registration')
        .setDescription(
            `Welcome to the official **FORMA Team Registration**.

            ## Requirements
            ✅ Exactly **5 Main Players**

            ✅ Every player must be in this Discord server

            ✅ Every player must have the **Verified** role

            ### Optional
            • Manager
            
            • Coach

            • Up to 2 Substitute Players

            Press the button below to register your team.`
        );
        
        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('register_team')
            .setLabel('Register Team')
            .setEmoji('📝')
            .setStyle(ButtonStyle.Primary)
        );

        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({
            content: '✅ Register panel created.',
            ephemeral: true
        });
    
    }     
};