const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Create a poll with up to 5 options.")
        .addStringOption(option =>
            option.setName("question")
                .setDescription("The question for your poll")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("option1")
                .setDescription("Option 1")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("option2")
                .setDescription("Option 2")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("option3")
                .setDescription("Option 3")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("option4")
                .setDescription("Option 4")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("option5")
                .setDescription("Option 5")
                .setRequired(false)
        ),

    async execute(interaction) {
        // Check permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({
                content: "❌ You do not have permission to create a poll. Required: Manage Messages",
                ephemeral: true
            });
        }

        const question = interaction.options.getString("question");
        const options = [];
        for (let i = 1; i <= 5; i++) {
            const opt = interaction.options.getString(`option${i}`);
            if (opt) options.push(opt);
        }

        const embed = new EmbedBuilder()
            .setTitle("📊 New Poll")
            .setDescription(`**Question:** ${question}`)
            .setColor("#2b2d31")
            .setTimestamp()
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

        const row = new ActionRowBuilder();
        options.forEach((opt, i) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`poll_${i}`)
                    .setLabel(opt)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        const pollMessage = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        // Simpan vote sementara di memory
        const votes = new Map(); // userId -> choiceIndex

        const collector = pollMessage.createMessageComponentCollector({ time: 86400000 }); // 24 jam

        collector.on("collect", i => {
            if (!i.isButton()) return;
            votes.set(i.user.id, i.customId.split("_")[1]);
            i.reply({ content: `You voted for **${options[i.customId.split("_")[1]]}**`, ephemeral: true });
        });

        collector.on("end", () => {
            // Hitung hasil poll
            const results = new Array(options.length).fill(0);
            for (const choice of votes.values()) {
                results[choice]++;
            }

            let resultText = options.map((opt, i) => `${opt}: **${results[i]} votes**`).join("\n");

            const resultEmbed = new EmbedBuilder()
                .setTitle("📊 Poll Ended")
                .setDescription(`**Question:** ${question}\n\n${resultText}`)
                .setColor("#2b2d31")
                .setTimestamp()
                .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

            pollMessage.edit({ embeds: [resultEmbed], components: [] });
        });
    }
};
