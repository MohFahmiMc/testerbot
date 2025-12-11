const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

require("dotenv").config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("promote")
        .setDescription("Show bot promotion / Tampilkan promo bot"),

    async execute(interaction) {
        const OWNER_ID = process.env.OWNER_ID;

        // Gunakan invite bot yang sudah kamu kasih
        const INVITE_LINK = "https://discord.com/oauth2/authorize?client_id=1441022662699909182&permissions=8&integration_type=0&scope=bot";

        const embed = new EmbedBuilder()
            .setTitle("🚀 Jual & Buy Discord Bot Source – Updated Features")
            .setDescription(
                "**ID:** Bot Discord lengkap, siap pakai, fitur baru & rapi.\n" +
                "**EN:** Full-featured Discord bot, ready to deploy, updated features & well-structured."
            )
            .addFields(
                {
                    name: "🛡 Moderation System",
                    value:
                    "**ID:** Ban, Kick, Mute, Unmute, Clear/Bulk delete, Slowmode, Lock/Unlock, Role hierarchy, Nickname, Audit log, Server stats, Top inviter, Announcement, Say command.\n" +
                    "**EN:** Ban, Kick, Mute, Unmute, Clear/Bulk delete, Slowmode, Lock/Unlock, Role hierarchy, Nickname, Audit log, Server stats, Top inviter, Announcement, Say command."
                },
                {
                    name: "🛠 Utility",
                    value:
                    "**ID:** Uptime, Server info, User info, Member count, Roles info, Channel info, Reminder, AFK system, Avatar, About, Bot update, Invite.\n" +
                    "**EN:** Uptime, Server info, User info, Member count, Roles info, Channel info, Reminder, AFK system, Avatar, About, Bot update, Invite."
                },
                {
                    name: "🎮 Fun Commands",
                    value:
                    "**ID:** Meme, Meme video, Color command, Top command usage, Level, Server join age.\n" +
                    "**EN:** Meme, Meme video, Color command, Top command usage, Level, Server join age."
                },
                {
                    name: "⚙ System & Structure",
                    value:
                    "**ID:** Modular commands/events handler, JSON-based data (admins, warns, triggers, welcome, autorole), auto moderation config.\n" +
                    "**EN:** Modular commands/events handler, JSON-based data (admins, warns, triggers, welcome, autorole), auto moderation config."
                },
                {
                    name: "💰 Harga / Pricing",
                    value:
                    "**ID:**\n• BASIC (400K–600K) → Source Only\n• PRO (700K–1.2JT) → Source + Setup\n• PREMIUM (>1.2JT) → Custom fitur + maintenance\n" +
                    "**EN:**\n• BASIC ($25–$40) → Source Only\n• PRO ($45–$80) → Installation Included\n• PREMIUM ($100+) → Custom features & support"
                }
            )
            .setColor("#7f8c8d")
            .setFooter({ text: "Official Bot Promotion • Click buttons below" })
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

        // Reply publik supaya semua orang bisa lihat
        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: false, // publik
        });

        // Opsional: kirim DM ke owner kalau mau notif ada yang gunakan promote
        try {
            const ownerUser = await interaction.client.users.fetch(OWNER_ID);
            await ownerUser.send(
                `⚡ ${interaction.user.tag} menggunakan /promote di server **${interaction.guild.name}** (${interaction.guild.id})`
            );
        } catch (err) {
            console.log("Gagal mengirim DM ke owner:", err);
        }
    }
};
