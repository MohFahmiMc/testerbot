const { EmbedBuilder } = require("discord.js");

// AFK memory
const afkUsers = new Map();

// Emoji utility
const utilityEmojis = [
    "<:scyteam:1356864496945336395>",
    "<:verify:1357254182356385852>",
    "<a:JBF_actingSusNotMeOwO:1357258714251399288>",
    "<a:TDK_TomThinkUwU:1357258748393033750>",
    "<a:AttentionAnimated:1357258884162785360>",
    "<a:verify1:1357258916387360810>",
    "<a:peepoWow:1357259058012229694>",
    "<:utility8:1357261385947418644>",
    "<:utility12:1357261389399593004>",
    "<:Utility1:1357261430684123218>"
];

/**
 * Set user AFK
 */
async function setAFK(member, reason = "AFK", client) {
    const guild = member.guild;

    // Cek role AFK
    let afkRole = guild.roles.cache.find(r => r.name === "AFK");
    if (!afkRole) {
        try {
            afkRole = await guild.roles.create({
                name: "AFK",
                color: "#607d8b",
                reason: "Role for AFK system"
            });
        } catch (err) {
            console.error("Failed to create AFK role:", err);
            return { error: `❌ Could not create AFK role: ${err.message}` };
        }
    }

    // Pastikan bot role tinggi
    if (guild.members.me.roles.highest.position <= afkRole.position) {
        return { error: "❌ Bot role is not high enough to assign AFK role." };
    }

    // Tambahkan role
    if (!member.roles.cache.has(afkRole.id)) {
        try { await member.roles.add(afkRole); } catch (err) { console.error(err); }
    }

    // Simpan username asli dan ganti nickname
    const originalName = member.displayName;
    const afkName = originalName.startsWith("[AFK] ") ? originalName : `[AFK] ${originalName}`;

    try {
        if (member.roles.highest.position < guild.members.me.roles.highest.position) {
            await member.setNickname(afkName, "User is AFK");
        }
    } catch (err) {
        console.log("Cannot change nickname:", err.message);
    }

    // Simpan AFK data
    afkUsers.set(member.id, { reason, time: Date.now(), originalName });

    // Embed
    const emoji = utilityEmojis[Math.floor(Math.random() * utilityEmojis.length)];
    const embed = new EmbedBuilder()
        .setColor("#607d8b")
        .setTitle(`${emoji} You are now AFK!`)
        .setDescription(`**Reason:** ${reason}`)
        .setFooter({ text: `AFK set by ${member.user.tag}`, iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return { embed };
}

/**
 * Remove user AFK
 */
async function removeAFK(member, client) {
    if (!afkUsers.has(member.id)) return null;

    const guild = member.guild;
    const afkRole = guild.roles.cache.find(r => r.name === "AFK");

    // Hapus role
    if (afkRole && member.roles.cache.has(afkRole.id)) {
        try { await member.roles.remove(afkRole); } catch (err) { console.error(err); }
    }

    // Kembalikan username
    const originalName = afkUsers.get(member.id).originalName;
    try { await member.setNickname(originalName, "AFK removed"); } catch (err) {}

    afkUsers.delete(member.id);

    const embed = new EmbedBuilder()
        .setColor("#607d8b")
        .setTitle("Welcome back!")
        .setDescription("You are no longer AFK.")
        .setFooter({ text: `AFK removed`, iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return embed;
}

function isAFK(member) {
    return afkUsers.has(member.id);
}

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
