// utils/embedStyle.js
const { EmbedBuilder } = require("discord.js");

const BOT_FOOTER = `${process.env.GH_OWNER || "Scarily Dev"} • Scarily Bot`;

function baseEmbed({ title, description, color = "#0EA5E9", thumbnail } = {}) {
    const e = new EmbedBuilder();
    if (title) e.setTitle(title);
    if (description) e.setDescription(description);
    e.setColor(color);
    if (thumbnail) e.setThumbnail(thumbnail);
    e.setFooter({ text: BOT_FOOTER });
    e.setTimestamp();
    return e;
}

module.exports = { baseEmbed };
