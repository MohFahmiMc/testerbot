const { EmbedBuilder } = require("discord.js");
const { afkUsers } = require("../utils/afkData");

module.exports = {
    name: "messageCreate",
    async execute(message) {
        if (!message.guild || message.author.bot) return;

        const userId = message.author.id;

        // ---------------------------------------------------
        // REMOVE AFK ON USER MESSAGE
        // ---------------------------------------------------
        if (afkUsers.has(userId)) {
            afkUsers.delete(userId);

            // Remove AFK nickname
            if (message.member) {
                const name = message.member.displayName;
                if (name.startsWith("[AFK]")) {
                    await message.member.setNickname(name.replace("[AFK] ", "")).catch(() => {});
                }

                // Remove AFK role
                const afkRole = message.guild.roles.cache.find(r => r.name === "AFK");
                if (afkRole && message.member.roles.cache.has(afkRole.id)) {
                    await message.member.roles.remove(afkRole.id).catch(() => {});
                }
            }

            message.reply({
                content: `Welcome back, **${message.author.username}**! I have removed your AFK status.`,
                allowedMentions: { repliedUser: false }
            });
            return;
        }

        // ---------------------------------------------------
        // USER MENTIONS AFK USER → SEND EMBED
        // ---------------------------------------------------
        if (message.mentions.users.size > 0) {
            const mentioned = message.mentions.users.first();

            if (afkUsers.has(mentioned.id)) {
                const data = afkUsers.get(mentioned.id);

                const embed = new EmbedBuilder()
                    .setColor("#808080")
                    .setAuthor({
                        name: `${mentioned.username} is AFK`,
                        iconURL: mentioned.displayAvatarURL()
                    })
                    .setThumbnail(mentioned.displayAvatarURL())
                    .addFields(
                        { name: "Reason", value: data.reason },
                        { name: "Since", value: `<t:${data.timestamp}:F>` },
                        { name: "Elapsed", value: `<t:${data.timestamp}:R>` }
                    )
                    .setFooter({ text: "AFK Notice" })
                    .setTimestamp();

                message.reply({ embeds: [embed] });
            }
        }
    }
};
