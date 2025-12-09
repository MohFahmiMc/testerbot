const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("meme")
        .setDescription("Get a random meme from the internet.")
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Choose meme type.")
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
        const globalAPI = "https://meme-api.com/gimme";
        const indoAPI = "https://candaan-api.vercel.app/api/image/random";

        let data;

        try {
            const res = await fetch(type === "indo" ? indoAPI : globalAPI);
            data = await res.json();
        } catch (err) {
            return interaction.editReply("❌ Failed to fetch meme.");
        }

        // Extract URL
        const img = type === "indo"
            ? data.data.url
            : data.url;

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(type === "indo" ? "🇮🇩 Indonesian Meme" : "🌍 Global Meme")
            .setImage(img)
            .setTimestamp();

        interaction.editReply({ embeds: [embed] });
    }
};
