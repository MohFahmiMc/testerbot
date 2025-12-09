const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// Database TikTok
// kamu bisa tambah sendiri kapan saja
const videos = {
    indonesia: [
        "https://www.tiktok.com/@awreceh.id/video/7265825726370006278",
        "https://www.tiktok.com/@memecomic.id/video/7269912447116109062",
        "https://www.tiktok.com/@humorreceh/video/7282904439009129770",
        "https://www.tiktok.com/@memekocak.id/video/7262634416729896198",
    ],
    global: [
        "https://www.tiktok.com/@memes/video/7285312421546016053",
        "https://www.tiktok.com/@funnyclips/video/7281287263829044523",
        "https://www.tiktok.com/@viral/video/7274339910911776032",
        "https://www.tiktok.com/@topmemes/video/7245320482948293926"
    ]
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("memevideo")
        .setDescription("Send a random meme video from TikTok")
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Choose video source")
                .setRequired(true)
                .addChoices(
                    { name: "Indonesia", value: "indonesia" },
                    { name: "Global", value: "global" }
                )
        ),

    async execute(interaction) {
        const type = interaction.options.getString("type");

        await interaction.deferReply();

        const list = videos[type];
        const random = list[Math.floor(Math.random() * list.length)];

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(type === "indonesia" ? "🇮🇩 Indonesian Meme Video" : "🌍 Global Meme Video")
            .setDescription("Klik link berikut untuk menonton ⬇️")
            .setURL(random)
            .setImage("https://i.ibb.co/QvJPv0m/tiktok-banner.png") // gambar banner aesthetic
            .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};
