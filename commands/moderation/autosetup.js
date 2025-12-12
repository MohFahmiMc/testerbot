const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serversetup")
        .setDescription("Automatically setup the server with default channels and roles.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        // SAFE INTERACTION
        await interaction.deferReply({ ephemeral: true });

        let progress = 0;

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("⚙️ Auto Setup Started")
            .setDescription(`Progress: **${progress}%**`)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        async function updateProgress(val, desc) {
            progress = val;
            embed.setDescription(`${desc}\n\nProgress: **${progress}%**`);
            await interaction.editReply({ embeds: [embed] });
            await wait(800); // prevent spam edits (important)
        }

        const guild = interaction.guild;

        // ━━━━━━━━━━━━━━━━━━━━━━━━
        // DELETE CHANNELS
        // ━━━━━━━━━━━━━━━━━━━━━━━━
        await updateProgress(10, "🗑️ Deleting old channels...");

        await Promise.allSettled(
            guild.channels.cache.map(ch => {
                if (ch.id === interaction.channel.id) return; // prevent deleting interaction channel
                return ch.delete().catch(() => {});
            })
        );

        // Delay to allow Discord catching up
        await wait(1500);

        // ━━━━━━━━━━━━━━━━━━━━━━━━
        // DELETE ROLES
        // ━━━━━━━━━━━━━━━━━━━━━━━━
        await updateProgress(25, "🗑️ Deleting old roles...");

        await Promise.allSettled(
            guild.roles.cache.map(role => {
                if (role.name === "@everyone") return;
                return role.delete().catch(() => {});
            })
        );

        await wait(1000);

        // ━━━━━━━━━━━━━━━━━━━━━━━━
        // CREATE ROLES
        // ━━━━━━━━━━━━━━━━━━━━━━━━
        await updateProgress(40, "🎭 Creating roles...");

        const roleNames = ["Owner", "Co-Owner", "Admin", "Moderator", "Member", "Guest", "Bot"];
        const createdRoles = {};

        for (const r of roleNames) {
            createdRoles[r] = await guild.roles.create({
                name: r,
                color: null,
                mentionable: true
            });
            await wait(200);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━
        // CREATE CATEGORIES
        // ━━━━━━━━━━━━━━━━━━━━━━━━
        await updateProgress(55, "📂 Creating categories...");

        const catAnnouncements = await guild.channels.create({ name: "📢 ANNOUNCEMENTS", type: 4 });
        await wait(150);

        const catUpdates = await guild.channels.create({ name: "📰 UPDATES", type: 4 });
        await wait(150);

        const catRules = await guild.channels.create({ name: "📜 RULES", type: 4 });
        await wait(150);

        const catGeneral = await guild.channels.create({ name: "💬 GENERAL", type: 4 });
        await wait(150);

        const catVoice = await guild.channels.create({ name: "🔊 VOICE", type: 4 });
        await wait(150);

        await updateProgress(70, "📁 Creating channels...");

        // ANNOUNCEMENTS
        await guild.channels.create({ name: "announcement", type: 0, parent: catAnnouncements.id });
        await wait(100);

        // UPDATES
        await guild.channels.create({ name: "updates", type: 0, parent: catUpdates.id });
        await wait(100);

        // RULES
        await guild.channels.create({ name: "rules", type: 0, parent: catRules.id });
        await wait(100);

        // GENERAL
        await guild.channels.create({ name: "general", type: 0, parent: catGeneral.id });
        await wait(100);

        await guild.channels.create({ name: "commands", type: 0, parent: catGeneral.id });
        await wait(100);

        // VOICE
        await guild.channels.create({ name: "voice", type: 2, parent: catVoice.id });
        await wait(100);

        await guild.channels.create({ name: "music", type: 2, parent: catVoice.id });
        await wait(100);

        await guild.channels.create({ name: "livestreaming", type: 2, parent: catVoice.id });
        await wait(100);

        await updateProgress(100, "✅ Auto setup completed!");

        // FINAL MESSAGE
        const finalEmbed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("🎉 Server Setup Completed")
            .setDescription("Your server has been successfully configured.")
            .setTimestamp()
            .setFooter({
                text: interaction.client.user.username,
                iconURL: interaction.client.user.displayAvatarURL()
            });

        await interaction.editReply({ embeds: [finalEmbed] });
    }
};
