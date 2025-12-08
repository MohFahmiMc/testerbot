const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const { baseEmbed } = require("../utils/embedStyle");

const CONFIG_PATH = path.join(__dirname, "../utils/automodConfig.json");
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

const recentMessages = new Map();
const URL_REGEX = /(https?:\/\/[^\s]+)/i;
const afkUsers = new Map();

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

module.exports = {
    name: "messageCreate",
    async execute(message, client) {

        if (message.author.bot) return;
        if (!message.guild) return;

        // ===============================
        // 🔹 AFK COMMAND (!afk)
        // ===============================
        if (message.content.startsWith("!afk")) {
            const reason = message.content.split(" ").slice(1).join(" ") || "AFK";

            // Role AFK
            let afkRole = message.guild.roles.cache.find(r => r.name === "AFK");
            if (!afkRole) {
                try {
                    afkRole = await message.guild.roles.create({
                        name: "AFK",
                        color: "GRAY",
                        reason: "Role for AFK system",
                    });
                } catch (err) {
                    console.error("Failed to create AFK role:", err);
                    return message.reply("❌ Could not create AFK role.");
                }
            }

            // Tambahkan role AFK
            if (!message.member.roles.cache.has(afkRole.id)) {
                try { await message.member.roles.add(afkRole); } catch (err) { console.error(err); }
            }

            // Simpan AFK data
            afkUsers.set(message.author.id, { reason, time: Date.now() });

            // Pilih emoji random dari list
            const emoji = utilityEmojis[Math.floor(Math.random() * utilityEmojis.length)];

            // Embed AFK
            const embed = new EmbedBuilder()
                .setColor("GRAY")
                .setTitle(`${emoji} You are now AFK!`)
                .setDescription(`**Reason:** ${reason}`)
                .setFooter({ text: `AFK set by ${message.author.tag}`, iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        // ===============================
        // 🔹 REMOVE AFK IF USER SENDS MESSAGE
        // ===============================
        if (afkUsers.has(message.author.id)) {
            const afkRole = message.guild.roles.cache.find(r => r.name === "AFK");
            if (afkRole && message.member.roles.cache.has(afkRole.id)) {
                await message.member.roles.remove(afkRole).catch(console.error);
            }
            afkUsers.delete(message.author.id);

            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("GREEN")
                        .setTitle("✅ Welcome back!")
                        .setDescription("You are no longer AFK.")
                        .setFooter({ text: `AFK removed`, iconURL: client.user.displayAvatarURL() })
                        .setTimestamp()
                ]
            });
        }

        // ===============================
        // 🔹 REPLY IF MENTIONED USER IS AFK
        // ===============================
        message.mentions.members.forEach(async member => {
            if (afkUsers.has(member.id)) {
                const afkData = afkUsers.get(member.id);
                const embed = new EmbedBuilder()
                    .setTitle(`${member.user.tag} is AFK`)
                    .setDescription(`**Reason:** ${afkData.reason}\n**Since:** <t:${Math.floor(afkData.time / 1000)}:R>`)
                    .setColor("GRAY")
                    .setFooter({ text: `AFK System`, iconURL: client.user.displayAvatarURL() })
                    .setTimestamp();

                message.channel.send({ embeds: [embed] }).catch(() => {});
            }
        });

        // ===============================
        // 🔹 LINK AUTOMOD + SPAM DETECTION
        // (sama seperti kode sebelumnya)
        // ===============================
        // ... kode link automod & spam detection lama
    }
};
