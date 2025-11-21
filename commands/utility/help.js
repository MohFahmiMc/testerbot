const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "help",
    description: "Menampilkan semua command yang tersedia",
    execute(message, args, client) {
        // Ambil semua command, kelompokkan per kategori
        const categories = {};
        client.commands.forEach(cmd => {
            const category = cmd.category || "Other";
            if (!categories[category]) categories[category] = [];
            categories[category].push(cmd.name);
        });

        // Buat embed
        const embed = new EmbedBuilder()
            .setTitle("📜 Daftar Command")
            .setColor("#0099ff")
            .setFooter({ text: `Server: ${message.guild.name}`, iconURL: message.guild.iconURL() || undefined })
            .setTimestamp();

        // Tambahkan field per kategori
        for (const [category, cmds] of Object.entries(categories)) {
            embed.addFields({ name: category, value: cmds.map(c => `\`${c}\``).join(", "), inline: false });
        }

        // Prefix info
        embed.addFields({
            name: "Prefix yang bisa dipakai",
            value: "`!`, `$`, `/`",
            inline: false
        });

        embed.addFields({
            name: "Cara pakai",
            value: "Gunakan `<prefix><command>` contoh: `!ping`, `$ping`, `/ping`",
            inline: false
        });

        message.channel.send({ embeds: [embed] });
    }
};
