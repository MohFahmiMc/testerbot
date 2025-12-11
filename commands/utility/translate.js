const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const translate = require("google-translate-api-x");
const languages = require("../../utils/languageList.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("translate")
        .setDescription("Translate text between 140+ languages.")
        .addStringOption(option =>
            option.setName("from")
                .setDescription("Source language (ex: en, id, ja) or 'auto'.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("to")
                .setDescription("Target language (ex: en, id, ja).")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("text")
                .setDescription("Text you want to translate.")
                .setRequired(true)
        ),

    async execute(interaction) {
        const from = interaction.options.getString("from").toLowerCase();
        const to = interaction.options.getString("to").toLowerCase();
        const text = interaction.options.getString("text");

        if (from !== "auto" && !languages[from]) {
            return interaction.reply({
                content: `Unknown source language code: **${from}**`,
                ephemeral: true
            });
        }

        if (!languages[to]) {
            return interaction.reply({
                content: `Unknown target language code: **${to}**`,
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            const result = await translate(text, {
                from: from === "auto" ? undefined : from,
                to
            });

            const embed = new EmbedBuilder()
                .setColor("#2b2d31")
                .setTitle("🌍 Translation Result")
                .addFields(
                    {
                        name: "From",
                        value: from === "auto"
                            ? `Auto-detected: **${languages[result.from.language.iso]}**`
                            : `${languages[from]} (**${from}**)`,
                        inline: true
                    },
                    {
                        name: "To",
                        value: `${languages[to]} (**${to}**)`,
                        inline: true
                    },
                    {
                        name: "Original",
                        value: `\`\`\`\n${text}\n\`\`\``
                    },
                    {
                        name: "Translated",
                        value: `\`\`\`\n${result.text}\n\`\`\``
                    }
                )
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return interaction.editReply("❌ Translation failed. Try again later.");
        }
    }
};
