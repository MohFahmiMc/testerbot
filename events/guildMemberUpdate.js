const { EmbedBuilder, AuditLogEvent } = require("discord.js");

module.exports = {
    name: "guildBanAdd",
    async execute(guild, user) {
        // cari channel welcome/leave dulu
        const fs = require("fs");
        const path = require("path");
        const WELCOME_FILE = path.join(__dirname, "../data/welcome.json");
        if (!fs.existsSync(WELCOME_FILE)) return;
        const data = JSON.parse(fs.readFileSync(WELCOME_FILE, "utf8"));
        const channelId = data[guild.id];
        if (!channelId) return;
        const channel = guild.channels.cache.get(channelId);
        if (!channel) return;

        // ambil info audit log
        const audit = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
        const banLog = audit.entries.first();
        let executor = banLog?.executor;

        const E = { ban: "<:ban:1357260010303918090>" };

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`${E.ban} Member Banned`)
            .setDescription(`**${user.tag}** was banned by ${executor || "Unknown"}.`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }
};
