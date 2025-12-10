const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const OWNER_ID = process.env.OWNER_ID;
const ADMIN_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(",") : [];
const CHANNEL_ID = "1448139487480909865";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("report")
        .setDescription("Bug report system")
        .addSubcommand(sub =>
            sub.setName("create")
                .setDescription("Create a new report")
                .addStringOption(o =>
                    o.setName("description")
                        .setDescription("Describe the bug/error")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("reply")
                .setDescription("Reply to a report (admin only)")
                .addStringOption(o =>
                    o.setName("id").setDescription("Report ID").setRequired(true)
                )
                .addStringOption(o =>
                    o.setName("message").setDescription("Reply message").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("fix")
                .setDescription("Mark report as fixed")
                .addStringOption(o =>
                    o.setName("id").setDescription("Report ID").setRequired(true)
                )
                .addStringOption(o =>
                    o.setName("message").setDescription("Fix message").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("deny")
                .setDescription("Deny a report")
                .addStringOption(o =>
                    o.setName("id").setDescription("Report ID").setRequired(true)
                )
                .addStringOption(o =>
                    o.setName("reason").setDescription("Reason").setRequired(true)
                )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const isAdmin = [OWNER_ID, ...ADMIN_IDS].includes(userId);

        // Admin check
        if (sub !== "create" && !isAdmin) {
            return interaction.reply({
                content: "Only owner/admin can do that.",
                ephemeral: true
            });
        }

        // CREATE
        if (sub === "create") {
            const desc = interaction.options.getString("description");
            const channel = await interaction.client.channels.fetch(CHANNEL_ID);

            const embed = new EmbedBuilder()
                .setTitle("📝 New Report")
                .setColor(0x2b2d31)
                .setDescription(desc)
                .addFields(
                    { name: "Reporter", value: `<@${interaction.user.id}>` },
                    { name: "Status", value: "Pending ⏳" }
                )
                .setTimestamp();

            const msg = await channel.send({ embeds: [embed] });

            return interaction.reply({
                content: `Your report has been submitted!\nReport ID: **${msg.id}**`,
                ephemeral: true
            });
        }

        // REPLY / FIX / DENY
        if (sub === "reply") {
            await updateReport(interaction, "replied", 0x3498DB, interaction.options.getString("message"));
        }

        if (sub === "fix") {
            await updateReport(interaction, "fixed", 0x2ECC71, interaction.options.getString("message"));
        }

        if (sub === "deny") {
            await updateReport(interaction, "denied", 0xE74C3C, interaction.options.getString("reason"));
        }
    }
};

// ===================================================================
// UPDATE REPORT FUNCTION
// ===================================================================
async function updateReport(interaction, action, color, adminMessage) {
    const client = interaction.client;
    const reportId = interaction.options.getString("id");
    const channel = await client.channels.fetch(CHANNEL_ID);

    let msg;
    try {
        msg = await channel.messages.fetch(reportId);
    } catch {
        return interaction.reply({ content: "Report not found.", ephemeral: true });
    }

    const oldEmbed = msg.embeds[0];

    // Get reporter ID
    const reporterId = oldEmbed.fields.find(f => f.name === "Reporter")?.value.match(/\d+/)?.[0];
    const reportText = oldEmbed.description || "No description";

    // BUILD NEW EMBED (update)
    const embed = new EmbedBuilder()
        .setTitle(oldEmbed.title || "Report Update")
        .setDescription(reportText)
        .setColor(color)
        .addFields(
            { name: "Reporter", value: `<@${reporterId}>` },
            {
                name:
                    action === "replied"
                        ? `Reply from ${interaction.user.tag}`
                        : action === "fixed"
                            ? `Fixed by ${interaction.user.tag}`
                            : `Denied by ${interaction.user.tag}`,
                value: adminMessage
            },
            {
                name: "Status",
                value:
                    action === "replied"
                        ? "Replied 💬"
                        : action === "fixed"
                            ? "Fixed ✅"
                            : "Denied ❌"
            }
        )
        .setTimestamp();

    // UPDATE MESSAGE IN CHANNEL
    await msg.edit({ embeds: [embed] });

    // DM REPORTER
    const reporter = await client.users.fetch(reporterId).catch(() => null);
    if (reporter) {
        await reporter.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("📢 Report Update")
                    .setColor(color)
                    .addFields(
                        { name: "Report ID", value: reportId },
                        { name: "Original Report", value: reportText },
                        {
                            name:
                                action === "replied"
                                    ? `Reply from ${interaction.user.tag}`
                                    : action === "fixed"
                                        ? `Fixed by ${interaction.user.tag}`
                                        : `Denied by ${interaction.user.tag}`,
                            value: adminMessage
                        }
                    )
                    .setTimestamp()
            ]
        }).catch(() => {});
    }

    // REPLY TO ADMIN
    return interaction.reply({
        content:
            action === "replied"
                ? "Reply sent."
                : action === "fixed"
                    ? "Report marked as fixed."
                    : "Report denied.",
        ephemeral: true
    });
}
