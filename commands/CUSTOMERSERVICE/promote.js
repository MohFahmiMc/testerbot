const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

require("dotenv").config(); // pastikan ada di project

module.exports = {
    data: new SlashCommandBuilder()
        .setName("promote")
        .setDescription("Show promotional info"),

    async execute(interaction) {
        const OWNER_ID = process.env.OWNER_ID;
        const CLIENT_ID = process.env.CLIENT_ID;

        const INVITE_LINK = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

        const embed = new EmbedBuilder()
            .setTitle("🚀 Jual & Buy Discord Bot Source – Professional Setup")
            .setDescription(
                "**ID:** Bot Discord full fitur, siap pakai, struktur rapi, dapat langsung dijalankan di hosting manapun.\n" +
                "**EN:** Full-featured Discord bot, professionally structured, ready to deploy instantly on any hosting."
            )
            .addFields(
                {
                    name: "🛡 Moderation System",
                    value:
                    "**ID:** Ban, Kick, Mute, Unmute, Clear chat, Slowmode, Lock/Unlock channel, Role hierarchy, Nickname system.\n" +
                    "**EN:** Ban, Kick, Mute, Unmute, Bulk Delete, Slowmode, Channel Locking, Role hierarchy visibility, Nickname management."
                },
                {
                    name: "🛠 Utility Commands",
                    value:
                    "**ID:** Uptime, Server info, User info, Reminder, Member counter, Invite command, Channel setup.\n" +
                    "**EN:** Uptime, Server/User Analytics, Reminder system, Member counter, Invite generator, Auto channel setup."
                },
                {
                    name: "🎮 Fun Commands",
                    value:
                    "**ID:** Meme, random meme video, top command usage, umur akun join server.\n" +
                    "**EN:** Random meme generator, top usage tracking, join age analytics."
                },
                {
                    name: "📦 Struktur Profesional",
                    value:
                    "**ID:** commands/, events/, utils/, handlers/, deploy tools, database JSON.\n" +
                    "**EN:** Modular file layout, auto-loader setup, deploy-ready architecture."
                },
                {
                    name: "💰 Harga / Pricing",
                    value:
                    "**ID:**\n" +
                    "• BASIC (400K – 600K) → Source Only\n" +
                    "• PRO (700K – 1.2JT) → Source + Setup\n" +
                    "• PREMIUM (>1.2JT) → Custom fitur + maintenance\n\n" +
                    "**EN:**\n" +
                    "• BASIC ($25–$40) → Source Only\n" +
                    "• PRO ($45–$80) → Installation Included\n" +
                    "• PREMIUM ($100+) → Custom Features & Support"
                },
                {
                    name: "💬 Contact",
                    value:
                    "**ID:** Klik tombol bawah untuk menghubungi penjual.\n" +
                    "**EN:** Click a button below to contact the developer directly."
                }
            )
            .setColor("#7f8c8d")
            .setFooter({ text: "Official Bot Promotion • Limited Slots Available" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("💬 Contact Owner")
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/users/${OWNER_ID}`),

            new ButtonBuilder()
                .setLabel("🛒 Buy Now")
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/users/${OWNER_ID}`),

            new ButtonBuilder()
                .setLabel("🤖 Invite Bot")
                .setStyle(ButtonStyle.Link)
                .setURL(INVITE_LINK)
        );

        await interaction.reply({
            embeds: [embed],
            components: [row],
        });
    }
};
