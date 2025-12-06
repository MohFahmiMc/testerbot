const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");
require("dotenv").config();

const UPDATES_FILE = path.join(__dirname, "../../data/updates.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("botupdate")
        .setDescription("Show all bot updates from GitHub with pagination."),

    async execute(interaction, client) {
        await interaction.deferReply();

        const token = process.env.GH_TOKEN;
        const owner = process.env.GH_OWNER;
        const repo = process.env.GH_REPO;

        if (!token || !owner || !repo) {
            return interaction.editReply("❌ Missing GH_TOKEN, GH_OWNER, GH_REPO in `.env`");
        }

        const commitsURL = `https://api.github.com/repos/${owner}/${repo}/commits`;

        let commits;
        try {
            const res = await fetch(commitsURL, {
                headers: { Authorization: `token ${token}` }
            });
            commits = await res.json();

            if (!res.ok) throw new Error("GitHub API error");
        } catch (err) {
            console.error(err);
            return interaction.editReply("❌ Failed to fetch commits from GitHub API.");
        }

        if (!Array.isArray(commits) || commits.length === 0) {
            return interaction.editReply("❌ No commits were found.");
        }

        // Format commit list (keep up to 50)
        const formatted = commits.slice(0, 50).map(c => ({
            message: c.commit.message,
            date: c.commit.author.date,
            url: c.html_url,
        }));

        // Save to data file
        fs.writeFileSync(UPDATES_FILE, JSON.stringify(formatted, null, 2));

        // Pagination state
        let page = 1;
        const perPage = 5;
        const maxPage = Math.ceil(formatted.length / perPage);

        const buildEmbed = (pageNumber) => {
            const embed = new EmbedBuilder()
                .setTitle("📦 Bot Updates (GitHub Commits)")
                .setColor("#00FFFF")
                .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
                .setFooter({ text: `Page ${pageNumber} / ${maxPage} | Powered by GitHub` })
                .setTimestamp();

            const start = (pageNumber - 1) * perPage;
            const pageItems = formatted.slice(start, start + perPage);

            pageItems.forEach((c) => {
                embed.addFields({
                    name: `📌 ${c.message.split("\n")[0]}`,
                    value: `🔗 [View Commit](${c.url})\n🕒 ${new Date(c.date).toLocaleString()}`,
                    inline: false,
                });
            });

            return embed;
        };

        const buildButtons = () => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev_update")
                    .setStyle(ButtonStyle.Primary)
                    .setLabel("⬅ Previous")
                    .setDisabled(page === 1),

                new ButtonBuilder()
                    .setCustomId("next_update")
                    .setStyle(ButtonStyle.Primary)
                    .setLabel("Next ➡")
                    .setDisabled(page === maxPage)
            );
        };

        let message = await interaction.editReply({
            embeds: [buildEmbed(page)],
            components: [buildButtons()]
        });

        // Collector
        const collector = message.createMessageComponentCollector({
            time: 10 * 60 * 1000 // 10 minutes
        });

        collector.on("collect", async (btn) => {
            if (btn.user.id !== interaction.user.id) {
                return btn.reply({ content: "❌ Only the command user can use these buttons!", ephemeral: true });
            }

            if (btn.customId === "next_update" && page < maxPage) {
                page++;
            }
            if (btn.customId === "prev_update" && page > 1) {
                page--;
            }

            await btn.update({
                embeds: [buildEmbed(page)],
                components: [buildButtons()]
            });
        });

        collector.on("end", () => {
            // Disable buttons after timeout
            message.edit({
                components: []
            }).catch(() => {});
        });
    },
};
