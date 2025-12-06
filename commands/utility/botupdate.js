const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const UPDATES_FILE = path.join(__dirname, "../../data/updates.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("botupdate")
        .setDescription("Show bot updates with version, changes and date."),

    async execute(interaction, client) {
        await interaction.deferReply();

        if (!fs.existsSync(UPDATES_FILE)) fs.writeFileSync(UPDATES_FILE, JSON.stringify([]));

        let updates = JSON.parse(fs.readFileSync(UPDATES_FILE, "utf8"));

        if (!Array.isArray(updates)) updates = [];

        // Auto-increment version (v12.21 → v12.22)
        const lastVersion = updates.length ? updates[0].version : "v0.0";
        const versionParts = lastVersion.replace("v", "").split(".").map(n => parseInt(n));
        const newVersion = `v${versionParts[0]}.${versionParts[1] + 1}`;

        // Jika ingin auto-add update saat menjalankan command, bisa uncomment ini:
        /*
        updates.unshift({
            version: newVersion,
            title: "Auto Update",
            changes: ["Auto increment version, check new changes."],
            date: new Date().toISOString()
        });
        fs.writeFileSync(UPDATES_FILE, JSON.stringify(updates, null, 2));
        */

        // Pagination
        let page = 0;
        const perPage = 5;
        const totalPages = Math.ceil(updates.length / perPage);

        const generateEmbed = (pg) => {
            const embed = new EmbedBuilder()
                .setTitle("Bot Updates")
                .setColor("#00FFFF")
                .setFooter({ text: `Page ${pg + 1} / ${totalPages}` })
                .setTimestamp();

            const start = pg * perPage;
            const end = start + perPage;
            const currentUpdates = updates.slice(start, end);

            currentUpdates.forEach(u => {
                embed.addFields({
                    name: `Update ${u.version || "vUnknown"} - ${u.title || ""}`,
                    value: `${u.changes.map(c => `+ ${c}`).join("\n")}\nDate: ${new Date(u.date).toLocaleString()}`,
                    inline: false
                });
            });

            return embed;
        };

        // Buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("⬅ Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("Next ➡")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(totalPages <= 1)
            );

        const msg = await interaction.editReply({ embeds: [generateEmbed(page)], components: [row] });

        const collector = msg.createMessageComponentCollector({ time: 2 * 60 * 1000 });

        collector.on("collect", i => {
            if (i.user.id !== interaction.user.id)
                return i.reply({ content: "❌ You can't use this button.", ephemeral: true });

            if (i.customId === "next") page++;
            else if (i.customId === "prev") page--;

            if (page < 0) page = 0;
            if (page >= totalPages) page = totalPages - 1;

            row.components[0].setDisabled(page === 0);
            row.components[1].setDisabled(page === totalPages - 1);

            i.update({ embeds: [generateEmbed(page)], components: [row] });
        });

        collector.on("end", () => {
            row.components.forEach(b => b.setDisabled(true));
            msg.edit({ components: [row] }).catch(() => {});
        });
    }
};
