const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const OWNER_ID = process.env.OWNER_ID;
const ADMIN_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(",") : [];
const CHANNEL_ID = "1448139487480909865"; // channel tujuan

module.exports = {
    data: new SlashCommandBuilder()
        .setName("report")
        .setDescription("Report system for bugs/errors")
        .addSubcommand(sub =>
            sub.setName("create")
                .setDescription("Create a new report")
                .addStringOption(o => o.setName("description").setDescription("Explain the bug/error").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("reply")
                .setDescription("Reply to a report (OWNER/ADMIN only)")
                .addStringOption(o => o.setName("message_id").setDescription("Report message ID").setRequired(true))
                .addStringOption(o => o.setName("reply").setDescription("Your reply").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("fix")
                .setDescription("Mark a report as fixed (OWNER/ADMIN only)")
                .addStringOption(o => o.setName("message_id").setDescription("Report message ID").setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const client = interaction.client;

        const COLORS = {
            default: 0x2b2d31,
            reply: 0xff0000,
            fixed: 0x00ff00
        };

        const isAdmin = [OWNER_ID, ...ADMIN_IDS].includes(interaction.user.id);

        try {
            // ---------------- CREATE ----------------
            if (sub === "create") {
                const desc = interaction.options.getString("description");

                // Embed laporan
                const embed = new EmbedBuilder()
                    .setTitle("📝 New Report")
                    .setDescription(desc)
                    .addFields({ name: "Reporter", value: `<@${interaction.user.id}>`, inline: true })
                    .setColor(COLORS.default)
                    .setFooter({ text: `Use /report reply <id> or /report fix <id> to respond` })
                    .setTimestamp();

                // Kirim ke report channel
                const reportChannel = await client.channels.fetch(CHANNEL_ID);
                const msg = await reportChannel.send({ embeds: [embed] });

                // Reply sekali ke user
                return interaction.reply({ content: `Report submitted! Message ID: ${msg.id}`, ephemeral: true });
            }

            // ---------------- REPLY ----------------
            if (sub === "reply") {
                if (!isAdmin) return interaction.reply({ content: "You are not authorized to reply.", ephemeral: true });

                const messageId = interaction.options.getString("message_id");
                const reply = interaction.options.getString("reply");

                const reportChannel = await client.channels.fetch(CHANNEL_ID);
                const msg = await reportChannel.messages.fetch(messageId).catch(() => null);
                if (!msg) return interaction.reply({ content: "Report not found.", ephemeral: true });

                // Update embed dengan reply baru
                const embed = EmbedBuilder.from(msg.embeds[0])
                    .setColor(COLORS.reply)
                    .addFields({ name: `Reply from ${interaction.user.tag}`, value: reply });

                await msg.edit({ embeds: [embed] });

                return interaction.reply({ content: "Reply added.", ephemeral: true });
            }

            // ---------------- FIX ----------------
            if (sub === "fix") {
                if (!isAdmin) return interaction.reply({ content: "You are not authorized to fix.", ephemeral: true });

                const messageId = interaction.options.getString("message_id");
                const reportChannel = await client.channels.fetch(CHANNEL_ID);
                const msg = await reportChannel.messages.fetch(messageId).catch(() => null);
                if (!msg) return interaction.reply({ content: "Report not found.", ephemeral: true });

                // Update embed menjadi hijau
                const embed = EmbedBuilder.from(msg.embeds[0]).setColor(COLORS.fixed);
                await msg.edit({ embeds: [embed] });

                // DM reporter sekali saja
                const reporterId = msg.embeds[0].fields.find(f => f.name === "Reporter")?.value.match(/\d+/)?.[0];
                if (reporterId) {
                    const user = await client.users.fetch(reporterId).catch(() => null);
                    if (user) await user.send(`Your report (ID: ${messageId}) has been fixed ✅`).catch(() => {});
                }

                return interaction.reply({ content: "Report marked as fixed.", ephemeral: true });
            }

        } catch (err) {
            console.error(err);
            if (!interaction.replied) await interaction.reply({ content: "Something went wrong.", ephemeral: true });
        }
    }
};
