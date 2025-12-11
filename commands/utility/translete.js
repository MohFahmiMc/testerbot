const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

const translate = require("@vitalets/google-translate-api");

// Daftar bahasa ISO-639-1 (lengkap)
const languages = require("../utils/languageList.json");

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

        // Validasi bahasa
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

        // Progress embed 1/2
        const progressEmbed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("Translating...")
            .setDescription(`Progress: **1/2**\n\nTranslating your text…`)
            .setTimestamp();

        const msg = await interaction.editReply({ embeds: [progressEmbed] });

        try {
            const result = await translate(text, { from, to });

            // Progress embed 2/2
            const doneEmbed = new EmbedBuilder()
                .setColor("#2b2d31")
                .setTitle(" Translation Result")
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
                        name: "Original Text",
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

            await interaction.editReply({ embeds: [doneEmbed] });

        } catch (err) {
            console.error(err);
            return interaction.editReply({
                content: "Failed to translate text.",
                embeds: []
            });
        }
    }
};
