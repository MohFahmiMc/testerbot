const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Delete messages with a progress display.")
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("Amount of messages to delete (1-100).")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Choose which messages to delete.")
                .addChoices(
                    { name: "All Messages", value: "all" },
                    { name: "User Only", value: "user" },
                    { name: "Bot Only", value: "bot" }
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const amount = interaction.options.getInteger("amount");
        const type = interaction.options.getString("type") || "all";

        if (amount < 1 || amount > 100) {
            return interaction.reply({
                content: "<:WARN:1447849961491529770> You can only clear **1–100 messages**.",
                ephemeral: true
            });
        }

        await interaction.deferReply();

        // Emojis
        const E = {
            title: "<:utility12:1357261389399593004>",
            done: "<:blueutility4:1357261525387182251>",
        };

        let deletedCount = 0;

        // Progress embed
        const progressEmbed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`${E.title} Clearing Messages`)
            .setDescription(`Progress: **${deletedCount}/${amount}**`)
            .setTimestamp();

        const progressMsg = await interaction.editReply({ embeds: [progressEmbed] });

        // Loop delete
        while (deletedCount < amount) {
            const fetchLimit = Math.min(10, amount - deletedCount);

            let messages = await interaction.channel.messages.fetch({ limit: fetchLimit });

            // FILTER agar progress message TIDAK kehapus
            messages = messages.filter(m => m.id !== progressMsg.id);

            if (type === "bot")
                messages = messages.filter(m => m.author.bot);
            else if (type === "user")
                messages = messages.filter(m => !m.author.bot);
            // type = all → semua ikut kecuali progress msg

            if (messages.size === 0) break;

            // Bulk delete (skip yg >14 hari, aman otomatis)
            const deleted = await interaction.channel.bulkDelete(messages, true);

            deletedCount += deleted.size;

            // Update progress embed
            progressEmbed.setDescription(`Progress: **${deletedCount}/${amount}**`);
            await progressMsg.edit({ embeds: [progressEmbed] });
        }

        // Final embed
        const finalEmbed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`${E.done} Clear Completed`)
            .setDescription(
                `**${deletedCount}** messages deleted.\n` +
                `Filter: **${type.toUpperCase()}**`
            )
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [finalEmbed] });
    }
};
