const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("update")
        .setDescription("Show latest bot updates from GitHub."),

    async execute(interaction) {
        await interaction.deferReply();

        const token = process.env.TOKEN; // <-- pakai TOKEN dari .env
        const owner = "MohFahmiMc";
        const repo = "MyDiscordBot";
        const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits`;

        try {
            const response = await fetch(commitsUrl, {
                headers: {
                    Authorization: `token ${token}`,
                    "User-Agent": "DiscordBot"
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status}`);
            }

            const data = await response.json();
            const latestCommits = data.slice(0, 5);

            const embed = new EmbedBuilder()
                .setTitle("🚀 Latest Bot Updates")
                .setColor("#00FFFF")
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            latestCommits.forEach(commit => {
                const message = commit.commit.message.split("\n")[0];
                const sha = commit.sha.substring(0, 7);
                const url = commit.html_url;
                const date = new Date(commit.commit.author.date).toLocaleString();

                embed.addFields({
                    name: `${sha} - ${message}`,
                    value: `[View Commit](${url}) | ${date}`
                });
            });

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.editReply(`❌ Failed to fetch updates: ${err.message}`);
        }
    },
};
