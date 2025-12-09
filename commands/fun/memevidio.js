const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("memevideo")
        .setDescription("Get a random meme video.")
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Choose video meme type.")
                .addChoices(
                    { name: "Indonesia", value: "indo" },
                    { name: "Global", value: "global" }
                )
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const type = interaction.options.getString("type");

        // API LIST
        const indoAPI = "https://api.tikwm.com/api/feed/search?keywords=meme%20indo";
        const globalAPI = "https://meme-api.com/gimme/memevideos";

        try {
            let url;

            if (type === "indo") {
                const res = await fetch(indoAPI);
                const data = await res.json();

                if (!data.data || data.data.videos.length === 0)
                    return interaction.editReply("❌ No Indonesian meme video found.");

                const vid = data.data.videos[Math.floor(Math.random() * data.data.videos.length)];
                url = vid.play;
            } else {
                const res = await fetch(globalAPI);
                const data = await res.json();
                url = data.url;
            }

            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setTitle(type === "indo" ? "🇮🇩 Indonesian Meme Video" : "🌍 Global Meme Video")
                .setDescription("Here is your meme video!")
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], content: url });

        } catch (err) {
            console.log(err);
            return interaction.editReply("❌ Failed to fetch meme video.");
        }
    }
};
