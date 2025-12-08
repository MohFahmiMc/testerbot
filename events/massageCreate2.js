const { setAFK, removeAFK, isAFK, getAFKData } = require("../utils/afk.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "messageCreate",
    async execute(message) {
        if (message.author.bot || !message.guild) return;
        const member = message.member;

        // !afk command
        if (message.content.startsWith("!afk")) {
            const reason = message.content.split(" ").slice(1).join(" ") || "AFK";
            const result = await setAFK(member, reason, message.client);

            if (result.error) return message.reply(result.error);
            if (result.embed) return message.reply({ embeds: [result.embed] });
        }

        // Remove AFK jika user kirim pesan
        if (isAFK(member)) {
            const embed = await removeAFK(member, message.client);
            if (embed) message.reply({ embeds: [embed] });
        }

        // Mention check
        message.mentions.members.forEach(async m => {
            if (isAFK(m)) {
                const afkData = getAFKData(m);
                const embed = new EmbedBuilder()
                    .setTitle(`${m.user.tag} is AFK`)
                    .setDescription(`**Reason:** ${afkData.reason}\n**Since:** <t:${Math.floor(afkData.time / 1000)}:R>`)
                    .setColor("#607d8b")
                    .setFooter({ text: `AFK System`, iconURL: message.client.user.displayAvatarURL() })
                    .setTimestamp();

                message.channel.send({ embeds: [embed] }).catch(() => {});
            }
        });
    }
};
