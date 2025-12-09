const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription("Displays detailed information about the bot."),

    async execute(interaction) {
        const bot = interaction.client;

        const guildCount = bot.guilds.cache.size;
        const userCount = bot.users.cache.size;
        const channelCount = bot.channels.cache.size;
        const totalCommands = bot.commands.size;
        const ping = bot.ws.ping;

        // Picked emojis from your list
        const E = {
            title: "<:premium_crown:1357260010303918090>",
            owner: "<:developer:1447459159649030264>",
            servers: "<:utility12:1357261389399593004>",
            users: "<:utility1:1357261562938790050>",
            channels: "<:Utility1:1357261430684123218>",
            commands: "<:Utility1:1357261430684123218>",
            ping: "<:ping1:1447452221699784715>",
            node: "<:blueutility4:1357261525387182251>",
            djs: "<:discord:1447459156436193432>",
            support: "<:Support:1447452228259549215>",
        };

        const embed = new EmbedBuilder()
            .setColor(1300f2)
            .setThumbnail(bot.user.displayAvatarURL())
            .setTitle(`${E.title} About ${bot.user.username}`)
            .setDescription(
                `Here is detailed information about **${bot.user.username}**.\n` +
                `This bot is designed for performance, stability, and modern functionality.`
            )
            .addFields(
                {
                    name: `${E.owner} Bot Owner`,
                    value: `<@${process.env.OWNER_ID}>`,
                    inline: true
                },
                {
                    name: `${E.servers} Servers`,
                    value: `${guildCount}`,
                    inline: true
                },
                {
                    name: `${E.users} Users`,
                    value: `${userCount}`,
                    inline: true
                },
                {
                    name: `${E.channels} Channels`,
                    value: `${channelCount}`,
                    inline: true
                },
                {
                    name: `${E.commands} Commands`,
                    value: `${totalCommands}`,
                    inline: true
                },
                {
                    name: `${E.ping} Latency`,
                    value: `${ping}ms`,
                    inline: true
                },
                {
                    name: `${E.node} Node.js`,
                    value: `${process.version}`,
                    inline: true
                },
                {
                    name: `${E.djs} Discord.js`,
                    value: `${require("discord.js").version}`,
                    inline: true
                },
                {
                    name: `${E.support} Support`,
                    value: `[Join Support Server](https://discord.gg/FkvM362RJu)`,
                    inline: true
                }
            )
            .setFooter({
                text: `${bot.user.username} • About Information`,
                iconURL: bot.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
