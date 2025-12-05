const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../../giveaways/data.json");

function loadData() {
    if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({ giveaways: [] }, null, 2));
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Advanced giveaway system")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub => sub
            .setName("start")
            .setDescription("Start a giveaway")
            .addStringOption(o => o.setName("prize").setDescription("Prize name").setRequired(true))
            .addIntegerOption(o => o.setName("duration").setDescription("Duration in minutes").setRequired(true))
            .addIntegerOption(o => o.setName("winners").setDescription("Number of winners").setRequired(true))
            .addRoleOption(o => o.setName("extra_role").setDescription("Role with extra entries").setRequired(false))
            .addRoleOption(o => o.setName("required_role").setDescription("Role required to join").setRequired(false))
            .addBooleanOption(o => o.setName("flash").setDescription("Flash giveaway? (1–5 min)").setRequired(false))
        )
        .addSubcommand(sub => sub.setName("pause").setDescription("Pause a giveaway").addStringOption(o => o.setName("id").setDescription("Giveaway ID").setRequired(true)))
        .addSubcommand(sub => sub.setName("resume").setDescription("Resume a giveaway").addStringOption(o => o.setName("id").setDescription("Giveaway ID").setRequired(true)))
        .addSubcommand(sub => sub.setName("end").setDescription("End a giveaway").addStringOption(o => o.setName("id").setDescription("Giveaway ID").setRequired(true)))
        .addSubcommand(sub => sub.setName("reroll").setDescription("Reroll winners").addStringOption(o => o.setName("id").setDescription("Giveaway ID").setRequired(true))),
    
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const data = loadData();

        if (sub === "start") {
            await interaction.deferReply();

            const prize = interaction.options.getString("prize");
            let duration = interaction.options.getInteger("duration");
            const winners = interaction.options.getInteger("winners");
            const extraRole = interaction.options.getRole("extra_role");
            const requiredRole = interaction.options.getRole("required_role");
            const flash = interaction.options.getBoolean("flash") || false;

            if (flash) duration = Math.min(duration, 5); // Flash giveaway max 5 minutes
            if (duration <= 0 || winners <= 0) return interaction.editReply("❌ Duration & winners must be > 0");

            const id = String(Date.now());
            const endTime = Date.now() + duration * 60000;

            const embed = new EmbedBuilder()
                .setTitle(flash ? "⚡ FLASH GIVEAWAY STARTED" : "🎉 GIVEAWAY STARTED")
                .setDescription(`Prize: **${prize}**\nClick the button below to join!`)
                .addFields(
                    { name: "🏆 Winners", value: `${winners}`, inline: true },
                    { name: "⏰ Ends", value: `<t:${Math.floor(endTime/1000)}:R>`, inline: true },
                    ...(extraRole ? [{ name: "✨ Extra Entries Role", value: `${extraRole}`, inline: true }] : []),
                    ...(requiredRole ? [{ name: "🔑 Required Role", value: `${requiredRole}`, inline: true }] : [])
                )
                .setColor(Math.floor(Math.random()*16777215))
                .setTimestamp();

            const button = new ButtonBuilder().setCustomId(`gw_join_${id}`).setLabel("Join Giveaway").setStyle(ButtonStyle.Primary);
            const row = new ActionRowBuilder().addComponents(button);

            const msg = await interaction.editReply({ embeds: [embed], components: [row], fetchReply: true });

            data.giveaways.push({
                id,
                channelId: interaction.channelId,
                messageId: msg.id,
                guildId: interaction.guildId,
                prize,
                winners,
                endTime,
                paused: false,
                entrants: [],
                extraRoleId: extraRole ? extraRole.id : null,
                requiredRoleId: requiredRole ? requiredRole.id : null
            });

            saveData(data);
            return;
        }

        // PAUSE / RESUME / END / REROLL
        const id = interaction.options.getString("id");
        const gw = data.giveaways.find(g => g.id === id);
        if (!gw) return interaction.reply({ content: "❌ Giveaway not found", ephemeral: true });

        if (sub === "pause") { if (gw.paused) return interaction.reply({ content: "❗ Already paused", ephemeral: true }); gw.paused = true; saveData(data); return interaction.reply({ content: `⏸️ Giveaway **${gw.prize}** paused`, ephemeral: true }); }
        if (sub === "resume") { if (!gw.paused) return interaction.reply({ content: "❗ Giveaway not paused", ephemeral: true }); gw.paused = false; saveData(data); return interaction.reply({ content: `▶ Giveaway **${gw.prize}** resumed`, ephemeral: true }); }
        if (sub === "end") { gw.endTime = Date.now(); saveData(data); return interaction.reply({ content: `🛑 Giveaway **${gw.prize}** ended`, ephemeral: true }); }
        if (sub === "reroll") { 
            if (!gw.entrants.length) return interaction.reply({ content: "❌ No participants to reroll", ephemeral: true });
            
            const winnersArr = [];
            const participants = [...gw.entrants];

            // Apply extra entries for role
            if (gw.extraRoleId) {
                const guild = interaction.guild;
                const extraUsers = participants.filter(uid => guild.members.cache.get(uid)?.roles.cache.has(gw.extraRoleId));
                participants.push(...extraUsers); // double entries
            }

            for (let i=0; i<gw.winners; i++) {
                const winner = participants[Math.floor(Math.random()*participants.length)];
                if (winner) winnersArr.push(`<@${winner}>`);
            }

            return interaction.reply({ content: `🔁 Rerolled winners: ${winnersArr.join(", ")}`, ephemeral: true });
        }
    }
};
