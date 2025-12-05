const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../../giveaways/data.json");

// Load database
function loadData() {
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify({ giveaways: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

// Save database
function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Giveaway system controller")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((sub) =>
            sub
                .setName("start")
                .setDescription("Start a giveaway")
                .addStringOption((o) =>
                    o.setName("prize").setDescription("Prize name").setRequired(true)
                )
                .addIntegerOption((o) =>
                    o.setName("duration").setDescription("Duration in minutes").setRequired(true)
                )
                .addIntegerOption((o) =>
                    o.setName("winners").setDescription("Number of winners").setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("pause")
                .setDescription("Pause an active giveaway")
                .addStringOption((o) =>
                    o.setName("id").setDescription("Giveaway ID").setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("resume")
                .setDescription("Resume a paused giveaway")
                .addStringOption((o) =>
                    o.setName("id").setDescription("Giveaway ID").setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("end")
                .setDescription("End a giveaway early")
                .addStringOption((o) =>
                    o.setName("id").setDescription("Giveaway ID").setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("reroll")
                .setDescription("Reroll winner(s)")
                .addStringOption((o) =>
                    o.setName("id").setDescription("Giveaway ID").setRequired(true)
                )
        ),

    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();
        const data = loadData();

        // ======== START GIVEAWAY ============
        if (sub === "start") {
            const prize = interaction.options.getString("prize");
            const duration = interaction.options.getInteger("duration");
            const winners = interaction.options.getInteger("winners");

            const endTime = Date.now() + duration * 60000;
            const id = String(Date.now());

            const embed = new EmbedBuilder()
                .setTitle("🎉 GIVEAWAY STARTED")
                .setDescription(`Prize: **${prize}**\nClick the button to join!`)
                .addFields(
                    { name: "🏆 Winners", value: `${winners}`, inline: true },
                    { name: "⏰ Ends", value: `<t:${Math.floor(endTime / 1000)}:R>`, inline: true }
                )
                .setColor("Random")
                .setTimestamp();

            const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

            data.giveaways.push({
                id,
                channelId: interaction.channelId,
                messageId: msg.id,
                guildId: interaction.guildId,
                prize,
                winners,
                endTime,
                paused: false,
                entrants: []
            });

            saveData(data);

            return;
        }

        // ======== FIND GIVEAWAY ============
        const id = interaction.options.getString("id");
        const gw = data.giveaways.find((g) => g.id === id);

        if (!gw) {
            return interaction.reply({
                content: "❌ Giveaway not found.",
                ephemeral: true,
            });
        }

        // ======== PAUSE ============
        if (sub === "pause") {
            if (gw.paused) return interaction.reply("❗ Already paused.");

            gw.paused = true;
            saveData(data);

            return interaction.reply(`⏸️ Giveaway **${gw.prize}** paused.`);
        }

        // ======== RESUME ============
        if (sub === "resume") {
            if (!gw.paused) return interaction.reply("❗ Giveaway is not paused.");

            gw.paused = false;
            saveData(data);

            return interaction.reply(`▶ Giveaway **${gw.prize}** resumed.`);
        }

        // ======== END GIVEAWAY ============
        if (sub === "end") {
            gw.endTime = Date.now();
            saveData(data);

            return interaction.reply(`🛑 Giveaway **${gw.prize}** ended early.`);
        }

        // ======== REROLL ============
        if (sub === "reroll") {
            if (!gw.entrants.length)
                return interaction.reply("❌ No participants to reroll.");

            const winners = [];
            for (let i = 0; i < gw.winners; i++) {
                const w = gw.entrants[Math.floor(Math.random() * gw.entrants.length)];
                if (w) winners.push(`<@${w}>`);
            }

            return interaction.reply(`🔁 Rerolled winners: ${winners.join(", ")}`);
        }
    },
};
