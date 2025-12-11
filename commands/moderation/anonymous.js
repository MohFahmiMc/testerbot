const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const anonDB = path.join(__dirname, "../data/anonymous.json");

// Ensure DB exists
if (!fs.existsSync(anonDB)) fs.writeFileSync(anonDB, JSON.stringify({ lastId: 0 }, null, 2));

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup-anonymous")
        .setDescription("Setup the anonymous chat system.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        let anonChannel = interaction.guild.channels.cache.find(ch => ch.name === "anonymous-chat");

        if (!anonChannel) {
            anonChannel = await interaction.guild.channels.create({
                name: "anonymous-chat",
                type: 0,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }
                ]
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("🔒 Anonymous Chat")
            .setDescription("Click the button below to send an anonymous message.")
            .setFooter({ text: interaction.client.user.username });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("anon_create")
                .setLabel("Create Anonymous Chat")
                .setStyle(ButtonStyle.Secondary)
        );

        await anonChannel.send({ embeds: [embed], components: [row] });

        interaction.editReply({
            content: `Anonymous system is ready in <#${anonChannel.id}>.`
        });
    }
};
