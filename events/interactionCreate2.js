const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// Emoji utility pilihan
const utilityEmojis = [
    "<:scyteam:1356864496945336395>",
    "<:verify:1357254182356385852>",
    "<a:JBF_actingSusNotMeOwO:1357258714251399288>",
    "<a:TDK_TomThinkUwU:1357258748393033750>",
    "<a:AttentionAnimated:1357258884162785360>",
    "<a:verify1:1357258916387360810>",
    "<a:peepoWow:1357259058012229570>",
    "<:utility8:1357261385947418644>",
    "<:utility12:1357261389399593004>",
    "<:Utility1:1357261430684123218>"
];

// AFK memory
const afkUsers = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("Set yourself as AFK")
        .addStringOption(option => 
            option.setName("reason")
                .setDescription("Reason for being AFK")
                .setRequired(false)
        ),
    async execute(interaction) {
        const reason = interaction.options.getString("reason") || "AFK";
        const member = interaction.member;
        const guild = interaction.guild;

        // Role AFK
        let afkRole = guild.roles.cache.find(r => r.name === "AFK");
        if (!afkRole) {
            try {
                afkRole = await guild.roles.create({
                    name: "AFK",
                    color: "GRAY",
                    reason: "Role for AFK system",
                });
            } catch (err) {
                console.error("Failed to create AFK role:", err);
                return interaction.reply({ content: "❌ Could not create AFK role.", ephemeral: true });
            }
        }

        // Tambahkan role ke user
        if (!member.roles.cache.has(afkRole.id)) {
            try { await member.roles.add(afkRole); } catch (err) { console.error(err); }
        }

        // Simpan AFK data
        afkUsers.set(member.id, { reason, time: Date.now() });

        // Pilih emoji random
        const emoji = utilityEmojis[Math.floor(Math.random() * utilityEmojis.length)];

        // Embed AFK
        const embed = new EmbedBuilder()
            .setColor("GRAY")
            .setTitle(`${emoji} You are now AFK!`)
            .setDescription(`**Reason:** ${reason}`)
            .setFooter({ text: `AFK set by ${member.user.tag}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
    afkUsers // export supaya bisa dipakai di messageCreate untuk mention check
};
