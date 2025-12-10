const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const OWNER_ID = process.env.OWNER_ID;
const ADMIN_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(",") : [];
const CHANNEL_ID = "1448139487480909865"; // report channel

module.exports = {
    data: new SlashCommandBuilder()
        .setName("report")
        .setDescription("Report system for bugs/errors")

        // CREATE
        .addSubcommand(sub =>
            sub.setName("create")
                .setDescription("Create a new report")
                .addStringOption(o => o.setName("description").setDescription("Explain the bug/error").setRequired(true))
        )

        // MANAGE (reply, fix, denied)
        .addSubcommand(sub =>
            sub.setName("manage")
                .setDescription("Manage a report (OWNER/ADMIN only)")
                .addStringOption(o => o.setName("message_id").setDescription("Report message ID").setRequired(true))
                .addStringOption(o =>
                    o.setName("action")
                        .setDescription("Action to apply")
                        .setRequired(true)
                        .addChoices(
                            { name: "Reply", value: "reply" },
                            { name: "Fix", value: "fix" },
                            { name: "Denied", value: "denied" }
                        ))
                .addStringOption(o =>
                    o.setName("message")
                        .setDescription("Reply message (required only for reply)")
                        .setRequired(false))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const client = interaction.client;

        const COLORS = {
            default: 0x2b2d31,
            reply: 0xff0000,
            fixed: 0x00ff00,
            denied: 0xff8800
        };

        const isAdmin = [OWNER_ID, ...ADMIN_IDS].includes(interaction.user.id);

        // ---------------- CREATE ----------------
        if (sub === "create") {
            const desc = interaction.options.getString("description");

            const embed = new EmbedBuilder()
                .setTitle("📝 New Report")
                .setDescription(desc)
                .addFields({ name: "Reporter", value: `<@${interaction.user.id}>`, inline: true })
                .setColor(COLORS.default)
                .setFooter({ text: `Use /report manage <id>` })
                .setTimestamp();

            const reportChannel = await client.channels.fetch(CHANNEL_ID);
            const msg = await reportChannel.send({ embeds: [embed] });

            return interaction.reply({
                content: `Report submitted! Message ID: \`${msg.id}\``,
                ephemeral: true
            });
        }

        // ---------------- MANAGE (reply / fix / denied) ----------------
        if (sub === "manage") {

            if (!isAdmin)
                return interaction.reply({ content: "You are not authorized to manage reports.", ephemeral: true });

            const messageId = interaction.options.getString("message_id");
            const action = interaction.options.getString("action");
            const messageText = interaction.options.getString("message");

            const reportChannel = await client.channels.fetch(CHANNEL_ID);
            const msg = await reportChannel.messages.fetch(messageId).catch(() => null);

            if (!msg) return interaction.reply({ content: "Report not found.", ephemeral: true });

            const originalEmbed = msg.embeds[0];
            const reporterId = originalEmbed.fields.find(f => f.name === "Reporter")?.value.match(/\d+/)?.[0];

            if (!reporterId)
                return interaction.reply({ content: "Reporter not found in this report.", ephemeral: true });

            // Build new embed
            const embed = EmbedBuilder.from(originalEmbed);

            // Handle actions
            if (action === "reply") {
                if (!messageText)
                    return interaction.reply({ content: "You must provide a reply message.", ephemeral: true });

                embed.setColor(COLORS.reply)
                    .addFields({
                        name: `Reply from ${interaction.user.tag}`,
                        value: messageText
                    });

                // DM reporter
                const user = await client.users.fetch(reporterId).catch(() => null);
                if (user) {
                    await user.send(`📩 Your report (ID: ${messageId}) has a new reply:\n**${messageText}**`)
                        .catch(() => {});
                }

                await msg.edit({ embeds: [embed] });
                return interaction.reply({ content: "Reply added and user notified.", ephemeral: true });
            }

            if (action === "fix") {
                embed.setColor(COLORS.fixed);

                await msg.edit({ embeds: [embed] });

                const user = await client.users.fetch(reporterId).catch(() => null);
                if (user) {
                    await user.send(`✅ Your report (ID: ${messageId}) has been marked as **fixed**.`)
                        .catch(() => {});
                }

                return interaction.reply({ content: "Report marked as fixed.", ephemeral: true });
            }

            if (action === "denied") {
                embed.setColor(COLORS.denied);

                await msg.edit({ embeds: [embed] });

                const user = await client.users.fetch(reporterId).catch(() => null);
                if (user) {
                    await user.send(`❌ Your report (ID: ${messageId}) has been **denied** by staff.`)
                        .catch(() => {});
                }

                return interaction.reply({ content: "Report denied.", ephemeral: true });
            }
        }
    }
};
