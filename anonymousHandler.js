const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "./data/anonymous.json");

// Load DB
function loadDB() {
    if (!fs.existsSync(dbPath))
        fs.writeFileSync(dbPath, JSON.stringify({ lastId: 0, messages: {} }, null, 2));
    return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}
// Save DB
function saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = async (interaction) => {
    const db = loadDB();

    // ================================
    // 📌 CREATE ANONYMOUS MESSAGE
    // ================================
    if (interaction.customId === "anon_create") {
        const modal = new ModalBuilder()
            .setCustomId("anon_modal_create")
            .setTitle("Create Anonymous Message");

        const input = new TextInputBuilder()
            .setCustomId("anon_text")
            .setLabel("Your anonymous message")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return interaction.showModal(modal);
    }

    // Modal hasil create
    if (interaction.customId === "anon_modal_create") {
        const messageText = interaction.fields.getTextInputValue("anon_text");

        db.lastId++;
        const id = db.lastId;

        db.messages[id] = {
            author: interaction.user.id,
            replies: []
        };
        saveDB(db);

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`🆔 Anonymous #${id}`)
            .setDescription(messageText)
            .setFooter({
                text: "Anonymous Message",
                iconURL: interaction.client.user.displayAvatarURL()
            });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`anon_reply_${id}`)
                .setLabel("Reply")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("anon_create")
                .setLabel("Create New")
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.channel.send({ embeds: [embed], components: [buttons] });

        return interaction.reply({ content: "Anonymous message sent!", ephemeral: true });
    }

    // ================================
    // 📌 REPLY TO ANONYMOUS
    // ================================
    if (interaction.customId.startsWith("anon_reply_")) {
        const id = interaction.customId.split("_")[2];

        if (!db.messages[id])
            return interaction.reply({ content: "This anonymous message does not exist anymore.", ephemeral: true });

        const modal = new ModalBuilder()
            .setCustomId(`anon_modal_reply_${id}`)
            .setTitle(`Reply to Anonymous #${id}`);

        const input = new TextInputBuilder()
            .setCustomId("anon_reply_text")
            .setLabel("Your reply")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return interaction.showModal(modal);
    }

    // Modal hasil reply
    if (interaction.customId.startsWith("anon_modal_reply_")) {
        const id = interaction.customId.split("_")[3];
        const text = interaction.fields.getTextInputValue("anon_reply_text");

        db.messages[id].replies.push({
            user: interaction.user.id,
            text
        });
        saveDB(db);

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`💬 Reply to Anonymous #${id}`)
            .setDescription(text)
            .setFooter({
                text: "Anonymous Reply",
                iconURL: interaction.client.user.displayAvatarURL()
            });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`anon_reply_${id}`)
                .setLabel("Reply Again")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("anon_create")
                .setLabel("Create New")
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.channel.send({ embeds: [embed], components: [buttons] });

        return interaction.reply({
            content: "Reply sent!",
            ephemeral: true
        });
    }
};
