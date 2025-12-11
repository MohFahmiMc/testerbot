const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serversetup")
        .setDescription("Automatically setup the server with default channels and roles.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();

        let progress = 0;
        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("⚙️ Auto Setup Started")
            .setDescription(`Progress: **${progress}%**`)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        async function setProgress(val, desc) {
            progress = val;
            embed.setDescription(`${desc}\n\nProgress: **${progress}%**`);
            await interaction.editReply({ embeds: [embed] });
        }

        const guild = interaction.guild;

        // ━━━━━━━━━━━━━━━━━━━━━━━━
        // DELETE ALL CHANNELS
        // ━━━━━━━━━━━━━━━━━━━━━━━━
        await setProgress(10, "🗑️ Deleting old channels...");
        for (const ch of guild.channels.cache.values()) {
            try { await ch.delete(); } catch {}
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━
        // DELETE ROLES
        // ━━━━━━━━━━━━━━━━━━━━━━━━
        await setProgress(25, "🗑️ Deleting old roles...");
        for (const role of guild.roles.cache.values()) {
            if (role.name === "@everyone") continue;
            try { await role.delete(); } catch {}
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━
        // CREATE ROLES
        // ━━━━━━━━━━━━━━━━━━━━━━━━
        await setProgress(40, "🎭 Creating roles...");

        const roleNames = [
            "Owner",
            "Co-Owner",
            "Admin",
            "Moderator",
            "Member",
            "Guest",
            "Bot"
        ];

        const createdRoles = {};

        for (const r of roleNames) {
            createdRoles[r] = await guild.roles.create({
                name: r,
                color: null,
                mentionable: true
            });
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━
        // CREATE TOP CATEGORIES
        // ━━━━━━━━━━━━━━━━━━━━━━━━
        await setProgress(55, "📂 Creating top categories...");

        const catAnnouncements = await guild.channels.create({
            name: "📢 ANNOUNCEMENTS",
            type: 4
        });

        const catUpdates = await guild.channels.create({
            name: "📰 UPDATES",
            type: 4
        });

        const catRules = await guild.channels.create({
            name: "📜 RULES",
            type: 4
        });

        // ━━━━━━━━━━━━━━━━━━━━━━━━
        // CREATE NORMAL CATEGORIES
        // ━━━━━━━━━━━━━━━━━━━━━━━━
        await setProgress(70, "📁 Creating main categories...");

        const catGeneral = await guild.channels.create({
            name: "💬 GENERAL",
            type: 4
        });

        const catVoice = await guild.channels.create({
            name: "🔊 VOICE",
            type: 4
        });

        // ━━━━━━━━━━━━━━━━━━━━━━━━
        // CREATE CHANNELS
        // ━━━━━━━━━━━━━━━━━━━━━━━━
        await setProgress(85, "📌 Creating channels...");

        // ANNOUNCEMENTS
        await guild.channels.create({
            name: "announcement",
            type: 0,
            parent: catAnnouncements.id
        });

        // UPDATES
        await guild.channels.create({
            name: "updates",
            type: 0,
            parent: catUpdates.id
        });

        // RULES
        await guild.channels.create({
            name: "rules",
            type: 0,
            parent: catRules.id
        });

        // GENERAL
        await guild.channels.create({
            name: "general",
            type: 0,
            parent: catGeneral.id
        });

        await guild.channels.create({
            name: "commands",
            type: 0,
            parent: catGeneral.id
        });

        // VOICE
        await guild.channels.create({
            name: "voice",
            type: 2,
            parent: catVoice.id
        });

        await guild.channels.create({
            name: "music",
            type: 2,
            parent: catVoice.id
        });

        await guild.channels.create({
            name: "livestreaming",
            type: 2,
            parent: catVoice.id
        });

        // ━━━━━━━━━━━━━━━━━━━━━━━━
        // DONE
        // ━━━━━━━━━━━━━━━━━━━━━━━━
        await setProgress(100, "✅ Auto setup completed!");

        const finalEmbed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("✅ Server Setup Completed")
            .setDescription("The server has been rebuilt with a clean structure.")
            .setTimestamp()
            .setFooter({
                text: interaction.client.user.username,
                iconURL: interaction.client.user.displayAvatarURL()
            });

        await interaction.editReply({ embeds: [finalEmbed] });
    }
};
