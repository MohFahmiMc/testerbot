// commands/suggestion/suggest.js
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { baseEmbed } = require("../../utils/embedStyle");

const SUG_PATH = path.join(__dirname, "../../utils/suggestions.json");

function loadSuggestions() {
    if (!fs.existsSync(SUG_PATH)) fs.writeFileSync(SUG_PATH, JSON.stringify([]));
    return JSON.parse(fs.readFileSync(SUG_PATH, "utf8"));
}
function saveSuggestions(data) { fs.writeFileSync(SUG_PATH, JSON.stringify(data, null, 2)); }

module.exports = {
    data: new SlashCommandBuilder()
        .setName("suggest")
        .setDescription("Send a suggestion")
        .addStringOption(o => o.setName("text").setDescription("Your suggestion").setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const text = interaction.options.getString("text");

        const embed = baseEmbed({ title: "New Suggestion", description: text });
        embed.addFields({ name: "Author", value: `${interaction.user.tag}`, inline: true });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("s_upvote").setLabel("Upvote (0)").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("s_downvote").setLabel("Downvote (0)").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("s_review").setLabel("Mark Reviewed").setStyle(ButtonStyle.Secondary)
        );

        // find suggestions channel
        const guild = interaction.guild;
        let channel = guild.channels.cache.find(ch => ch.name === "suggestions" && ch.isTextBased());
        if (!channel) channel = interaction.channel;

        const msg = await channel.send({ embeds: [embed], components: [row] });

        // persist suggestion
        const suggestions = loadSuggestions();
        const entry = { id: msg.id, guild: guild.id, channel: channel.id, author: interaction.user.id, text, up: [], down: [], reviewed: false, date: new Date().toISOString() };
        suggestions.unshift(entry);
        saveSuggestions(suggestions);

        await interaction.editReply({ content: "Suggestion submitted.", ephemeral: true });
    }
};
