const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const UPDATES_FILE = path.join(__dirname, "../../data/updates.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("update")
        .setDescription("Show latest bot updates taken from GitHub commits."),

    async execute(interaction, client) {
        await interaction.deferReply();

        const token = process.env.GH_TOKEN;
        const owner = process.env.GH_OWNER;
        const repo = process.env.GH_REPO;

        if (!token || !owner || !repo) {
            return interaction.editReply({
                content: "❌ GitHub configuration missing in `.env` (GH_TOKEN, GH_OWNER, GH_REPO)."
            });
        }

        // Fetch commits
        const commitsURL = `https://api.github.com/repos/${owner}/${repo}/commits`;

        let commits;
        try {
            const res = await fetch(commitsURL, {
                headers: { Authorization: `token ${token}` }
            });

            if (!res.ok) throw new Error("GitHub API error");

            commits = await res.json();
        } catch (err) {
            console.error(err);
            return interaction.editReply("❌ Failed to fetch commits from GitHub.");
        }

        if (!Array.isArray(commits) || commits.length === 0) {
            return interaction.editReply("❌ No commits found in repository.");
        }

        // Prepare JSON storage
        let saved = [];
        if (fs.existsSync(UPDATES_FILE)) {
            saved = JSON.parse(fs.readFileSync(UPDATES_FILE, "utf8"));
        }

        // Save new commits
        const output = commits.slice(0, 20).map(c => ({
            message: c.commit.message,
            date: c.commit.author.date,
            url: c.html_url
        }));

        fs.writeFileSync(UPDATES_FILE, JSON.stringify(output, null, 2));

        // Prepare embed
        const embed = new EmbedBuilder()
            .setTitle("📦 Latest Bot Updates")
            .setColor("#00FFFF")
            .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: "Powered by GitHub commits" })
            .setTimestamp();

        output.slice(0, 5).forEach(c => {
            embed.addFields({
                name: `📌 ${c.message.split("\n")[0]}`,
                value: `🔗 [View Commit](${c.url})\n🕒 ${new Date(c.date).toLocaleString()}`,
                inline: false
            });
        });

        return interaction.editReply({ embeds: [embed] });
    },
};
