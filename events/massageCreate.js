// events/messageCreate.js
const fs = require("fs");
const path = require("path");
const ms = require("ms");
const { EmbedBuilder } = require("discord.js");
const { baseEmbed } = require("../utils/embedStyle");
const { afkUsers } = require("../utils/afkData"); // <--- AFK storage

const CONFIG_PATH = path.join(__dirname, "../utils/automodConfig.json");
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

const recentMessages = new Map();

// URL regex
const URL_REGEX = /(https?:\/\/[^\s]+)/i;

module.exports = {
    name: "messageCreate",
    async execute(message, client) {
        if (!message.guild || message.author.bot) return;

        // =====================================
        // 🔥 1. AFK CHECK: User balik dari AFK
        // =====================================
        if (afkUsers.has(message.author.id)) {
            afkUsers.delete(message.author.id);

            const embed = new EmbedBuilder()
                .setTitle("Welcome Back!")
                .setDescription(`You are no longer AFK, **${message.author.username}**`)
                .setColor("#2b2b2b")
                .setFooter({ text: "Scarily AFK System" })
                .setTimestamp();

            message.reply({ embeds: [embed] }).catch(() => {});
        }

        // =====================================
        // 🔥 2. AFK CHECK: User mention orang AFK
        // =====================================
        if (message.mentions.users.size > 0) {
            message.mentions.users.forEach(user => {
                if (afkUsers.has(user.id)) {
                    const data = afkUsers.get(user.id);

                    const unix = Math.floor(data.until.getTime() / 1000); // for <t:timestamp>

                    const embed = new EmbedBuilder()
                        .setTitle(`${user.username} is currently AFK`)
                        .setDescription(
                            `**⏱ Until:** <t:${unix}:t> (local time)\n` +
                            `**📝 Reason:** ${data.reason}`
                        )
                        .setColor("#3a3a3a")
                        .setFooter({ text: "Scarily AFK System" })
                        .setTimestamp();

                    message.reply({ embeds: [embed] }).catch(() => {});
                }
            });
        }

        // =====================================
        // 🔥 3. LINK AUTOMOD
        // =====================================
        if (config.linkAutomod) {
            const hasLink = URL_REGEX.test(message.content);
            if (hasLink) {
                const urls = message.content.match(URL_REGEX) || [];
                let allowed = false;

                // Whitelist
                for (const u of urls) {
                    for (const d of config.whitelistDomains) {
                        if (u.includes(d)) allowed = true;
                    }
                }

                // Allowed roles
                const member = message.member;
                if (member) {
                    for (const r of config.allowedRoles) {
                        const roleName = r.startsWith("@") ? r.slice(1) : r;
                        if (member.roles.cache.some(role => role.name === roleName)) {
                            allowed = true;
                        }
                    }
                }

                // If blocked
                if (!allowed) {
                    try { await message.delete(); } catch (e) {}

                    try {
                        await message.channel.send({
                            embeds: [
                                baseEmbed({
                                    title: "Link Blocked",
                                    description: `User ${message.author.tag} tried to send a non-allowed link.`
                                })
                            ]
                        }).then(m => setTimeout(() => m.delete().catch(() => {}), 7000));
                    } catch (e) {}

                    if (config.logChannel) {
                        const log = message.guild.channels.cache.get(config.logChannel);
                        if (log) {
                            log.send({
                                embeds: [
                                    baseEmbed({
                                        title: "Link Blocked",
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

        // =====================================
        // 🔥 4. SPAM DETECTION
        // =====================================
        if (config.spam && config.spam.enabled) {
            const now = Date.now();
            const window = config.spam.messagesWindow || 5000;
            const threshold = config.spam.messageThreshold || 5;

            const guildId = message.guild.id;
            if (!recentMessages.has(guildId)) recentMessages.set(guildId, new Map());
            const guildMap = recentMessages.get(guildId);

            if (!guildMap.has(message.author.id)) guildMap.set(message.author.id, []);
            const arr = guildMap.get(message.author.id);

            arr.push(now);
            while (arr.length && (now - arr[0]) > window) arr.shift();

            if (arr.length >= threshold) {
                try {
                    const fetched = await message.channel.messages.fetch({ limit: 20 });
                    const toDelete = fetched.filter(m => m.author.id === message.author.id);
                    for (const msg of toDelete) {
                        try { await msg.delete(); } catch (e) {}
                    }
                } catch (e) {}

                try {
                    await message.author.send("You were detected spamming. Please slow down.");
                } catch (e) {}

                try {
                    await message.channel.send({
                        embeds: [
                            baseEmbed({
                                title: "User Muted (Spam)",
                                description: `${message.author.tag} was muted for spamming.`
                            })
                        ]
                    }).then(m => setTimeout(() => m.delete().catch(() => {}), 7000));
                } catch (e) {}

                let muteRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === "muted");

                if (!muteRole) {
                    try {
                        muteRole = await message.guild.roles.create({
                            name: "Muted",
                            permissions: [],
                            reason: "AutoMute for spam"
                        });

                        for (const [id, ch] of message.guild.channels.cache) {
                            await ch.permissionOverwrites.edit(muteRole, { SendMessages: false, Speak: false });
                        }
                    } catch (e) {}
                }

                if (muteRole) {
                    try {
                        await message.member.roles.add(muteRole, "AutoMute Spam");
                        const minutes = config.spam.muteMinutes || 10;

                        setTimeout(async () => {
                            try { await message.member.roles.remove(muteRole); } catch (e) {}
                        }, minutes * 60 * 1000);
                    } catch (e) {}
                }

                arr.length = 0;
            }
        }
    }
};
