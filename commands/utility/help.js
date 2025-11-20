module.exports = {
    name: 'help',
    description: 'Menampilkan semua command yang tersedia',
    category: 'Utility',
    async execute(message, args) {
        const { client } = message;

        // Mengelompokkan command berdasarkan kategori
        const categories = {};

        client.commands.forEach(cmd => {
            const folder = cmd.category || "Other";
            if (!categories[folder]) categories[folder] = [];
            categories[folder].push(cmd.name);
        });

        let reply = "**Daftar Command Bot:**\n\n";
        for (const [category, cmds] of Object.entries(categories)) {
            reply += `__${category}__\n`;
            reply += cmds.map(c => `\`${c}\``).join(", ") + "\n\n";
        }

        message.channel.send(reply);
    }
};
