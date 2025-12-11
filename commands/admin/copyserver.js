const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");
require("dotenv").config();

const OWNER_IDS = process.env.OWNER_ID?.split(",") || [];
const ADMIN_IDS = process.env.ADMIN_ID?.split(",") || [];
const PREMIUM_IDS = process.env.PREMIUM_ID?.split(",") || [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("copyserver")
        .setDescription("Copy all categories, channels, and roles from another server.")
        .addStringOption(opt =>
            opt.setName("server_id")
               .setDescription("ID server yang ingin kamu copy.")
               .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;

        // 🔐 ACCESS CONTROL
        if (
            !OWNER_IDS.includes(userId) &&
            !ADMIN_IDS.includes(userId) &&
            !PREMIUM_IDS.includes(userId)
        ) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setDescription("❌ You do not have permission to use this command.")
                ],
                ephemeral: true
            });
        }

        const targetServerId = interaction.options.getString("server_id");
        const targetGuild = interaction.client.guilds.cache.get(targetServerId);

        if (!targetGuild) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setDescription("❌ Invalid server ID or the bot is **not inside** that server.")
                ],
                ephemeral: true
            });
        }

        // Progress embed
        let progress = 0;
        const progressEmbed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("📥 Copying Server...")
            .setDescription(`Starting copy...\nProgress: **${progress}%**`);

        await interaction.reply({ embeds: [progressEmbed] });

        // Update function
        async function updateProgress(amount, text = "") {
            progress = amount;
            progressEmbed.setDescription(
                `${text}\n\nProgress: **${progress}%**`
            );
            await interaction.editReply({ embeds: [progressEmbed] });
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // STEP 1 — DELETE OLD CHANNELS
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        await updateProgress(5, "🗑️ Deleting old channels...");

        for (const ch of [...interaction.guild.channels.cache.values()]) {
            try { await ch.delete(); } catch {}
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // STEP 2 — DELETE OLD ROLES
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        await updateProgress(10, "🗑️ Deleting old roles (except @everyone)...");

        for (const role of [...interaction.guild.roles.cache.values()]) {
            if (role.name === "@everyone") continue;
            try { await role.delete(); } catch {}
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // STEP 3 — COPY ROLES
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        await updateProgress(25, "📌 Copying roles...");

        const roleMap = new Map();
        const targetRoles = targetGuild.roles.cache.sort((a, b) => a.position - b.position);

        for (const role of targetRoles.values()) {
            if (role.name === "@everyone") {
                roleMap.set(role.id, interaction.guild.roles.everyone);
                continue;
            }

            const newRole = await interaction.guild.roles.create({
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                mentionable: role.mentionable,
                permissions: role.permissions.bitfield
            });

            roleMap.set(role.id, newRole);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // STEP 4 — COPY CATEGORIES
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        await updateProgress(40, "📂 Copying categories...");

        const categoryMap = new Map();

        for (const cat of targetGuild.channels.cache.filter(c => c.type === 4).values()) {
            const newCat = await interaction.guild.channels.create({
                name: cat.name,
                type: 4,
                permissionOverwrites: cat.permissionOverwrites.cache.map(ov => ({
                    id: roleMap.get(ov.id)?.id || ov.id,
                    allow: ov.allow.bitfield,
                    deny: ov.deny.bitfield
                }))
            });

            categoryMap.set(cat.id, newCat.id);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // STEP 5 — COPY CHANNELS
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        await updateProgress(60, "📁 Copying channels...");

        const textVoiceChannels = targetGuild.channels.cache.filter(
            c => c.type === 0 || c.type === 2
        );

        let count = 0;
        for (const ch of textVoiceChannels.values()) {
            count++;

            await interaction.guild.channels.create({
                name: ch.name,
                type: ch.type,
                parent: categoryMap.get(ch.parentId) || null,
                nsfw: ch.nsfw,
                topic: ch.topic || null,
                bitrate: ch.bitrate || null,
                userLimit: ch.userLimit || null,
                permissionOverwrites: ch.permissionOverwrites.cache.map(ov => ({
                    id: roleMap.get(ov.id)?.id || ov.id,
                    allow: ov.allow.bitfield,
                    deny: ov.deny.bitfield
                }))
            });

            await updateProgress(
                60 + Math.floor((count / textVoiceChannels.size) * 40),
                `📁 Copying channels...\n(${count}/${textVoiceChannels.size})`
            );
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // FINISHED
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        await updateProgress(100, "✅ Server copied successfully!");

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("✅ Copy Completed")
                    .setDescription(
                        `Server copy successful!  
Everything (roles, categories, channels) has been duplicated.`
                    )
            ]
        });
    }
};
