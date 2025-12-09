const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const WELCOME_FILE = path.join(__dirname, "../data/welcome.json");

module.exports = {
    name: "guildMemberRemove",
    async execute(member) {
        if (!fs.existsSync(WELCOME_FILE)) return;
        const data = JSON.parse(fs.readFileSync(WELCOME_FILE, "utf8"));
        const channelId = data[member.guild.id];
        if (!channelId) return;

        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;

        // Emoji style
        const E = {
            leave: "<:leave:1357260010303918090>",
            member: "<:utility1:1357261562938790050>"
        };

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`${E.leave} Goodbye!`)
            .setDescription(`${member.user.tag} has left **${member.guild.name}**.\nNow there are **${member.guild.memberCount}** members.`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Member left` })
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }
};
