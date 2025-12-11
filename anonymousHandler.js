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

// Load or create DB
function loadDB() {
    if (!fs.existsSync(dbPath))
        fs.writeFileSync(dbPath, JSON.stringify({ lastId: 0, messages: {} }, null, 2));
    return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}
function saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = async (interaction) => {
    const db = loadDB();

    // ============================
    // CREATE ANONYMOUS CHAT
    // ============================
    if (interaction.customId === "anon_create") {
        const modal = new ModalBuilder()
            .setCustomId("anon_modal_create")
            .setTitle("Create Anonymous Message");

        const input = new TextInputBuilder()
            .setCustomId("anon_text")
            .setLabel("Your anonymous message")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        return interaction.showModal(modal);
    }

    // When modal submitted
    if (interaction.customId === "anon_modal_create") {
        let messageText = interaction.fields.getTextInputValue("anon_text");

        // make unique ID
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
            .setFooter({ text: "Anonymous message" });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`anon_reply_${id}`)
                .setLabel("Reply")
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });

        return interaction.reply({ content: "Anonymous message sent!", ephemeral: true });
    }

    // ============================
    // REPLY TO ANON MESSAGE
    // ============================
    if (interaction.customId.startsWith("anon_reply_")) {
        const id = interaction.customId.split("_")[2];

        if (!db.messages[id])
            return interaction.reply({ content: "This anonymous message no longer exists.", ephemeral: true });

        const modal = new ModalBuilder()
            .setCustomId(`anon_modal_reply_${id}`)
            .setTitle(`Reply to Anonymous #${id}`);

        const input = new TextInputBuilder()
            .setCustomId("anon_reply_text")
            .setLabel("Your reply")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        return interaction.showModal(modal);
    }

    // Reply modal
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
            .setTitle(`Reply to Anonymous #${id}`)
            .setDescription(text)
            .setFooter({ text: "Anonymous reply" });

        // reply to original message
        await interaction.channel.send({ embeds: [embed] });

        return interaction.reply({
            content: "Reply sent!",
            ephemeral: true
        });
    }
};
