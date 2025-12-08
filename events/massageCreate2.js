const fs = require("fs");
const path = require("path");
const ms = require("ms");
const { baseEmbed } = require("../utils/embedStyle");

const CONFIG_PATH = path.join(__dirname, "../utils/automodConfig.json");
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

const recentMessages = new Map();
const URL_REGEX = /(https?:\/\/[^\s]+)/i;

// ===============================
// 🔹 AFK SYSTEM MEMORY
// ===============================
const afkUsers = new Map(); // { userId: { reason: string, time: timestamp } }

module.exports = {
    name: "messageCreate",
    async execute(message, client) {

        if (message.author.bot) return;
        if (!message.guild) return;

        const guildId = message.guild.id;

        // ===============================
        // 🔹 AFK COMMAND
        // ===============================
        if (message.content.startsWith("!afk")) {
            const reason = message.content.split(" ").slice(1).join(" ") || "AFK";

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

            // Tambahkan role AFK jika belum ada di user
            if (!message.member.roles.cache.has(afkRole.id)) {
                try {
                    await message.member.roles.add(afkRole);
                } catch (err) {
                    console.error("Failed to add AFK role:", err);
                }
            }

            afkUsers.set(message.author.id, { reason, time: Date.now() });
            return message.reply(`✅ You are now AFK: ${reason}`);
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
            message.reply("✅ Welcome back! You are no longer AFK.");
        }

        // ===============================
        // 🔹 REPLY IF MENTIONED USER IS AFK
        // ===============================
        message.mentions.members.forEach(async (member) => {
            if (afkUsers.has(member.id)) {
                const afkData = afkUsers.get(member.id);
                const embed = new (require("discord.js").EmbedBuilder)()
                    .setTitle(`${member.user.tag} is AFK`)
                    .setDescription(`Reason: ${afkData.reason}\nSince: <t:${Math.floor(afkData.time / 1000)}:R>`)
                    .setColor("GRAY");

                message.channel.send({ embeds: [embed] }).catch(() => {});
            }
        });

        // ===============================
        // 🔹 LINK AUTOMOD
        // ===============================
        if (config.linkAutomod) {
            const hasLink = URL_REGEX.test(message.content);
            if (hasLink) {
                const member = message.member;
                let allowed = false;
                const urls = message.content.match(URL_REGEX) || [];

                if (Array.isArray(config.whitelistDomains)) {
                    for (const u of urls) {
                        for (const d of config.whitelistDomains) {
                            if (u.includes(d)) allowed = true;
                        }
                    }
                }

                if (member && Array.isArray(config.allowedRoles)) {
                    for (const r of config.allowedRoles) {
                        const roleName = r.startsWith("@") ? r.slice(1) : r;
                        if (member.roles.cache.some(role => role.name === roleName)) allowed = true;
                    }
                }

                if (!allowed) {
                    try { await message.delete().catch(() => {}); } catch (e) {}
                    try {
                        await message.channel.send({
                            embeds: [
                                baseEmbed({
                                    title: "Link blocked",
                                    description: `User ${message.author.tag} tried to send a forbidden link.`
                                })
                            ]
                        }).then(m => setTimeout(() => m.delete().catch(() => {}), 7000));
                    } catch (e) {}
                    if (config.logChannel) {
                        const ch = message.guild.channels.cache.get(config.logChannel);
                        if (ch) {
                            ch.send({
                                embeds: [
                                    baseEmbed({
                                        title: "Link blocked",
                                        description: `User: ${message.author.tag}\nChannel: ${message.channel}\nMessage: ${message.content}`
                                    })
                                ]
                            }).catch(() => {});
                        }
                    }
                    return;
                }
            }
        }

        // ===============================
        // 🔹 SPAM DETECTION SYSTEM
        // ===============================
        if (config.spam && config.spam.enabled) {

            const now = Date.now();
            const window = config.spam.messagesWindow || 5000;
            const threshold = config.spam.messageThreshold || 5;

            if (!recentMessages.has(guildId)) recentMessages.set(guildId, new Map());
            const guildMap = recentMessages.get(guildId);

            if (!guildMap.has(message.author.id)) guildMap.set(message.author.id, []);

            const arr = guildMap.get(message.author.id);

            arr.push(now);
            while (arr.length && (now - arr[0]) > window) arr.shift();

            if (arr.length >= threshold) {

                // Delete spam messages
                try {
                    const fetched = await message.channel.messages.fetch({ limit: 20 });
                    const userMessages = fetched.filter(m => m.author.id === message.author.id);
                    for (const m of userMessages.values()) {
                        try { await m.delete(); } catch (e) {}
                    }
                } catch (e) {}

                // DM user
                try { await message.author.send("You were muted for spamming. Further spam will result in punishment."); } catch (e) {}

                // Notify channel
                try {
                    await message.channel.send({
                        embeds: [
                            baseEmbed({
                                title: "User muted (spam)",
                                description: `${message.author.tag} was muted for spamming.`
                            })
                        ]
                    }).then(m => setTimeout(() => m.delete().catch(() => {}), 7000));
                } catch (e) {}

                // Apply mute role
                const guild = message.guild;
                let muteRole = guild.roles.cache.find(r => r.name.toLowerCase() === "muted");

                if (!muteRole) {
                    try {
                        muteRole = await guild.roles.create({
                            name: "Muted",
                            reason: "AutoMute for spam",
                            permissions: []
                        });
                        for (const ch of guild.channels.cache.values()) {
                            try {
                                await ch.permissionOverwrites.edit(muteRole, {
                                    SendMessages: false,
                                    AddReactions: false,
                                    Speak: false
                                });
                            } catch (e) {}
                        }
                    } catch (e) {}
                }

                if (muteRole) {
                    try {
                        await message.member.roles.add(muteRole, "AutoMuted for spam");
                        const minutes = config.spam.muteMinutes || 10;
                        setTimeout(async () => {
                            try { await message.member.roles.remove(muteRole, "Auto unmute"); } catch (e) {}
                        }, minutes * 60000);
                    } catch (e) {}
                }

                guildMap.set(message.author.id, []);
            }
        }
    }
};
