const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "clientReady",
    once: true,
    async execute(client) {
        console.log(`✅ ${client.user.tag} is now online! Developer: ${process.env.GH_OWNER}`);

        // Dynamic messages array
        const messages = [
            () => `Scarily Bot is active 👻`,
            () => `Join our support server!`,
            () => `Serving over ${client.guilds.cache.size} servers 🌐`,
            () => `Fun, Moderation & Utility`,
            () => `Developer: ${process.env.GH_OWNER}`
        ];

        let index = 0;

        // Update presence every 5 seconds
        setInterval(() => {
            const msg = messages[index]();
            client.user.setActivity(msg, { type: "PLAYING" });
            index = (index + 1) % messages.length;
        }, 5000);

        // Embed + button for support server
        const supportLink = "https://discord.gg/FkvM362RJu";
        const embed = new EmbedBuilder()
            .setTitle("Join Our Support Server!")
            .setDescription("Click the button below to join the official support server.")
            .setColor("Random")
            .setFooter({ text: `Developer: ${process.env.GH_OWNER}` });

        const button = new ButtonBuilder()
            .setLabel("Join Support Server")
            .setStyle(ButtonStyle.Link)
            .setURL(supportLink);

        const row = new ActionRowBuilder().addComponents(button);

        // Send embed + button to a channel in first available guild
        const guild = client.guilds.cache.first();
        if (guild) {
            const channel = guild.channels.cache
                .filter(c => c.isTextBased() && c.permissionsFor(guild.members.me).has("SendMessages"))
                .first();

            if (channel) {
                // Delete previous message from bot if exists to avoid spam
                const messagesFetched = await channel.messages.fetch({ limit: 50 });
                const botMsg = messagesFetched.find(m => m.author.id === client.user.id && m.embeds.length);
                if (botMsg) await botMsg.delete().catch(() => null);

                channel.send({ embeds: [embed], components: [row] }).catch(() => null);
            }
        }
    }
};
