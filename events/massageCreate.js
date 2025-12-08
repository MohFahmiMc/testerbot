// events/messageCreate.js                                      const fs = require("fs");                                       const path = require("path");
const ms = require("ms"); // optional but helpful (install ms)
const { baseEmbed } = require("../utils/embedStyle");

const CONFIG_PATH = path.join(__dirname, "../utils/automodConfig.json");
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

const recentMessages = new Map(); // { guildId: { userId: [timestamps...] } }

// simple URL regex
const URL_REGEX = /(https?://[^\s]+)/i;

module.exports = {
name: "messageCreate",
async execute(message, client) {
if (message.author.bot) return;
if (!message.guild) return;

const guildId = message.guild.id;  
    // ---------- LINK AUTOMOD ----------  
    if (config.linkAutomod) {  
        const hasLink = URL_REGEX.test(message.content);  
        if (hasLink) {  
            // check whitelist  
            const urls = message.content.match(URL_REGEX) || [];  
            let allowed = false;  
            for (const u of urls) {  
                for (const d of config.whitelistDomains) {  
                    if (u.includes(d)) allowed = true;  
                }  
            }  

            // check allowed roles by name (mention style or plain)  
            const member = message.member;  
            if (member) {  
                for (const r of config.allowedRoles) {  
                    // r may be "@moderation" or role name. strip leading @ if present  
                    const roleName = r.startsWith("@") ? r.slice(1) : r;  
                    if (member.roles.cache.some(role => role.name === roleName)) allowed = true;  
                }  
            }  

            if (!allowed) {  
                try {  
                    await message.delete();  
                } catch (e) {}  
                // warn  
                try {  
                    await message.channel.send({ embeds: [ baseEmbed({ title: "Link blocked", description: `User ${message.author.tag} tried to post a link that is not allowed.` }) ] })  
                        .then(m => setTimeout(() => m.delete().catch(()=>{}), 7000));  
                } catch (e) {}  
                // log  
                if (config.logChannel) {  
                    const ch = message.guild.channels.cache.get(config.logChannel);  
                    if (ch) ch.send({ embeds: [ baseEmbed({ title: "Link blocked", description: `User: ${message.author.tag}\nChannel: ${message.channel}\nMessage: ${message.content}` }) ] }).catch(()=>{});  
                }  
                return;  
            }  
        }  
    }  

    // ---------- SPAM DETECTION ----------  
    if (config.spam && config.spam.enabled) {  
        const now = Date.now();  
        const window = config.spam.messagesWindow || 5000;  
        const threshold = config.spam.messageThreshold || 5;  

        if (!recentMessages.has(guildId)) recentMessages.set(guildId, new Map());  
        const guildMap = recentMessages.get(guildId);  

        if (!guildMap.has(message.author.id)) guildMap.set(message.author.id, []);  
        const arr = guildMap.get(message.author.id);  

        // push timestamp and prune older than window  
        arr.push(now);  
        while (arr.length && (now - arr[0]) > window) arr.shift();  

        // if threshold exceeded  
        if (arr.length >= threshold) {  
            // delete last few messages by user in channel  
            try {  
                const fetched = await message.channel.messages.fetch({ limit: 20 });  
                const tomDelete = fetched.filter(m => m.author.id === message.author.id).map(m => m.id);  
                for (const id of tomDelete) {  
                    try { await message.channel.messages.delete(id); } catch(e){ }  
                }  
            } catch(e){}  

            // warn (DM then channel)  
            try {  
                await message.author.send("Your messages were detected as spam and were removed. Continued abuse will result in mute.");  
            } catch(e){}  

            try {  
                await message.channel.send({ embeds: [ baseEmbed({ title: "User muted (spam)", description: `${message.author.tag} was muted for spamming.` }) ] })  
                    .then(m => setTimeout(()=>m.delete().catch(()=>{}), 7000));  
            } catch(e){}  

            // apply mute role  
            const guild = message.guild;  
            let muteRole = guild.roles.cache.find(r => r.name.toLowerCase() === "muted");  
            if (!muteRole) {  
                try {  
                    muteRole = await guild.roles.create({ name: "Muted", reason: "AutoMute for spam", permissions: [] });  
                    // try to set channel perms  
                    for (const [id, ch] of guild.channels.cache) {  
                        try {  
                            await ch.permissionOverwrites.edit(muteRole, { SendMessages: false, AddReactions: false, Speak: false });  
                        } catch(e){}  
                    }  
                } catch(e){}  
            }  
            if (muteRole) {  
                try {  
                    const member = message.member;  
                    await member.roles.add(muteRole, "AutoMuted for spam");  
                    // unmute after configured minutes  
                    const minutes = config.spam.muteMinutes || 10;  
                    setTimeout(async () => {  
                        try { await member.roles.remove(muteRole, "Auto unmute after spam mute"); } catch(e){}  
                    }, minutes * 60 * 1000);  
                } catch(e){}  
            }  

            // reset their counter  
            guildMap.set(message.author.id, []);  
        }  
    }  
}

};
