const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("github")
        .setDescription("Search for GitHub repositories or users.")
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Search type: repository or user")
                .setRequired(true)
                .addChoices(
                    { name: "Repository", value: "repo" },
                    { name: "User", value: "user" }
                )
        )
        .addStringOption(option =>
            option.setName("query")
                .setDescription("Search query")
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const type = interaction.options.getString("type");
        const query = interaction.options.getString("query");

        try {
            if (type === "user") {
                // Search users
                const userRes = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=5`);
                const userData = await userRes.json();
                if (!userData.items || userData.items.length === 0)
                    return interaction.editReply(`No users found for \`${query}\``);

                const embed = new EmbedBuilder()
                    .setTitle(`GitHub Users Search`)
                    .setColor("#2b2d31")
                    .setTimestamp()
                    .setFooter({ 
                        text: interaction.client.user.username, 
                        iconURL: interaction.client.user.displayAvatarURL() 
                    });

                userData.items.forEach(user => {
                    embed.addFields({
                        name: user.login,
                        value: `[View Profile](${user.html_url})`
                    });
                });

                return interaction.editReply({ embeds: [embed] });

            } else {
                // Search repositories
                const repoRes = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=1`);
                const repoData = await repoRes.json();
                if (!repoData.items || repoData.items.length === 0)
                    return interaction.editReply(`No repositories found for \`${query}\``);

                const repo = repoData.items[0];

                // Get contents
                const contentsRes = await fetch(`https://api.github.com/repos/${repo.full_name}/contents`);
                const contentsData = await contentsRes.json();

                // Get README
                const readmeRes = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`);
                const readmeData = await readmeRes.json();
                let readmeText = "";
                if (readmeData && readmeData.content) {
                    readmeText = Buffer.from(readmeData.content, 'base64').toString('utf-8');
                    if (readmeText.length > 1024) readmeText = readmeText.substring(0, 1020) + "..."; // limit Discord field
                }

                const embed = new EmbedBuilder()
                    .setTitle(repo.full_name)
                    .setURL(repo.html_url)
                    .setColor("#2b2d31")
                    .setDescription(readmeText || "No README available")
                    .addFields({
                        name: "Repository Files",
                        value: contentsData.map(f => f.name).join(", ") || "No files found"
                    })
                    .setFooter({ 
                        text: `Owner: ${repo.owner.login} | GitHub Repository`,
                        iconURL: interaction.client.user.displayAvatarURL()
                    })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }
        } catch (err) {
            console.error(err);
            return interaction.editReply("❌ Something went wrong while fetching GitHub data.");
        }
    }
};
