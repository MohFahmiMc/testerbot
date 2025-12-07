// events/interactionCreate.buttons.js  (merge into your interactionCreate)
const fs = require("fs");
const path = require("path");
const SUG_PATH = path.join(__dirname, "../utils/suggestions.json");
const { baseEmbed } = require("../utils/embedStyle");

function loadSuggestions() { return JSON.parse(fs.readFileSync(SUG_PATH, "utf8")); }
function saveSuggestions(data) { fs.writeFileSync(SUG_PATH, JSON.stringify(data, null, 2)); }

module.exports = {
    // name: "interactionCreate" // merge this code into your existing interactionCreate event
    async handleButton(interaction) {
        if (!interaction.isButton()) return;
        const id = interaction.customId;

        // suggestion buttons start with s_
        if (id.startsWith("s_")) {
            const suggestions = loadSuggestions();
            const msgId = interaction.message.id;
            const sug = suggestions.find(s => s.id === msgId);
            if (!sug) return interaction.reply({ content: "Suggestion data not found.", ephemeral: true });

            if (id === "s_upvote") {
                if (!sug.up.includes(interaction.user.id)) {
                    sug.up.push(interaction.user.id);
                    // remove from down if present
                    sug.down = sug.down.filter(u => u !== interaction.user.id);
                } else {
                    // toggle off
                    sug.up = sug.up.filter(u => u !== interaction.user.id);
                }
            } else if (id === "s_downvote") {
                if (!sug.down.includes(interaction.user.id)) {
                    sug.down.push(interaction.user.id);
                    sug.up = sug.up.filter(u => u !== interaction.user.id);
                } else {
                    sug.down = sug.down.filter(u => u !== interaction.user.id);
                }
            } else if (id === "s_review") {
                // only allow users with ManageGuild to mark reviewed
                if (!interaction.member.permissions.has("ManageGuild")) {
                    return interaction.reply({ content: "You lack permission to mark reviewed.", ephemeral: true });
                }
                sug.reviewed = !sug.reviewed;
            }

            saveSuggestions(suggestions);

            // update message buttons label counts
            const upCount = sug.up.length;
            const downCount = sug.down.length;

            const row = interaction.message.components[0];
            // update labels (clone create new buttons)
            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
            const newRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("s_upvote").setLabel(`Upvote (${upCount})`).setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("s_downvote").setLabel(`Downvote (${downCount})`).setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("s_review").setLabel(sug.reviewed ? "Reviewed" : "Mark Reviewed").setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ components: [newRow] });
        }
    }
};
