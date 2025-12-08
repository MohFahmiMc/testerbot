const { EmbedBuilder } = require("discord.js");

// AFK memory
const afkUsers = new Map();

// Utility emoji
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

/**
 * Set user AFK
 * @param {GuildMember} member 
 * @param {string} reason 
 * @param {Client} client 
 */
async function setAFK(member, reason = "AFK", client) {
    const guild = member.guild;

    // Cek role AFK
    let afkRole = guild.roles.cache.find(r => r.name === "AFK");
    if (!afkRole) {
        try {
            afkRole = await guild.roles.create({
                name: "AFK",
                color: "GRAY",
                reason: "Role for AFK system"
            });
        } catch (err) {
            console.error("Failed to create AFK role:", err);
            return null;
        }
    }

    // Tambahkan role
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
        .setFooter({ text: `AFK set by ${member.user.tag}`, iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return embed;
}

/**
 * Remove user AFK
 * @param {GuildMember} member 
 */
async function removeAFK(member) {
    if (!afkUsers.has(member.id)) return;

    const guild = member.guild;
    const afkRole = guild.roles.cache.find(r => r.name === "AFK");

    // Hapus role AFK
    if (afkRole && member.roles.cache.has(afkRole.id)) {
        try { await member.roles.remove(afkRole); } catch (err) { console.error(err); }
    }

    afkUsers.delete(member.id);

    const embed = new EmbedBuilder()
        .setColor("GREEN")
        .setTitle("✅ Welcome back!")
        .setDescription("You are no longer AFK.")
        .setFooter({ text: `AFK removed`, iconURL: member.client.user.displayAvatarURL() })
        .setTimestamp();

    return embed;
}

/**
 * Check if member is AFK
 * @param {GuildMember} member 
 */
function isAFK(member) {
    return afkUsers.has(member.id);
}

/**
 * Get AFK data for member
 * @param {GuildMember} member 
 */
function getAFKData(member) {
    return afkUsers.get(member.id) || null;
}

module.exports = {
    afkUsers,
    setAFK,
    removeAFK,
    isAFK,
    getAFKData
};
