const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const statsFile = path.join(__dirname, "../data/realtimestats.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("realtimestats")
        .setDescription("Setup or view server stats (Premium only)")
        .addSubcommand(sub =>
            sub.setName("set")
               .setDescription("Set the channel to post real-time stats")
               .addChannelOption(option =>
                   option.setName("channel")
                         .setDescription("Select the channel")
                         .setRequired(true)
               )
        ),
    async execute(interaction) {
        const ownerId = process.env.OWNER_ID;
        const premiumIds = [ownerId]; // Bisa tambah premium user id lain

        if (!premiumIds.includes(interaction.user.id)) {
            return interaction.reply({ content: "❌ You don't have permission (premium only).", ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "set") {
            const channel = interaction.options.getChannel("channel");

            // Simpan ke file
            const data = { channelId: channel.id, serverId: interaction.guild.id };
            fs.writeFileSync(statsFile, JSON.stringify(data, null, 2));

            await interaction.reply({ content: `✅ Real-time stats will be posted in ${channel}`, ephemeral: true });

            setInterval(async () => {
                const guild = interaction.client.guilds.cache.get(data.serverId);
                if (!guild) return;

                const statsChannel = guild.channels.cache.get(data.channelId);
                if (!statsChannel) return;

                const embed = new EmbedBuilder()
                    .setTitle(`📊 Server Stats - ${guild.name}`)
                    .setColor("#808080") // abu-abu
                    .setThumbnail(guild.iconURL({ dynamic: true })) // server icon atas kanan
                    .addFields(
                        { name: "Total Members", value: `${guild.members.cache.size}`, inline: true },
                        { name: "Total Bots", value: `${guild.members.cache.filter(m => m.user.bot).size}`, inline: true },
                        { name: "Server Owner", value: `<@${guild.ownerId}>`, inline: true },
                        { name: "Server ID", value: `${guild.id}`, inline: true }
                    )
                    .setFooter({
                        text: "Real-time stats",
                        iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) // foto bot di footer
                    })
                    .setTimestamp();

                // Cari message terakhir atau kirim baru
                let messages = await statsChannel.messages.fetch({ limit: 10 });
                let botMessage = messages.find(msg => 
                    msg.author.id === interaction.client.user.id && 
                    msg.embeds.length > 0 && 
                    msg.embeds[0].title.includes("Server Stats")
                );
                
                if (botMessage) {
                    await botMessage.edit({ embeds: [embed] });
                } else {
                    await statsChannel.send({ embeds: [embed] });
                }

            }, 5000); // update tiap 5 detik
        }
    }
};
