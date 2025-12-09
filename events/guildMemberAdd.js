const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const autorolePath = path.join(__dirname, "../data/autorole.json");
const welcomePath = path.join(__dirname, "../data/welcome.json");

module.exports = {
    name: "guildMemberAdd",
    async execute(member) {
        // ==============================
        // AUTOROLE
        // ==============================
        if (fs.existsSync(autorolePath)) {
            const data = JSON.parse(fs.readFileSync(autorolePath, "utf8"));
            const roleId = data[member.guild.id];
            if (roleId) {
                const role = member.guild.roles.cache.get(roleId);
                if (role) member.roles.add(role).catch(() => null);
            }
        }

        // ==============================
        // WELCOME
        // ==============================
        if (!fs.existsSync(welcomePath)) return;

        const welcomeData = JSON.parse(fs.readFileSync(welcomePath, "utf8"));
        const channelId = welcomeData[member.guild.id];
        if (!channelId) return;

        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;

        // Emojis ala about.js
        const E = {
            welcome: "<:premium_crown:1357260010303918090>",
            user: "<:utility1:1357261562938790050>",
            tag: "<:Utility1:1357261430684123218>",
            server: "<:utility12:1357261389399593004>"
        };

        // Banner server
        const bannerURL = member.guild.bannerURL({ size: 512 }) || "https://via.placeholder.com/800x200?text=Welcome+Banner";

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`${E.welcome} Welcome!`)
            .setDescription(`Say hello to **${member.user.tag}**`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setImage(bannerURL)
            .addFields(
                { name: `${E.user} Member Name`, value: `${member.user.username}`, inline: true },
                { name: `${E.tag} Tag`, value: `${member.user.tag}`, inline: true },
                { name: `${E.server} Server`, value: `${member.guild.name}`, inline: false }
            )
            .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() || undefined })
            .setTimestamp();

        channel.send({ embeds: [embed] }).catch(() => null);
    }
};
