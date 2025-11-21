module.exports = {
    name: "ban",
    description: "Ban a member",
    options: [
        { name: "user", type: 6, description: "User to ban", required: true },
        { name: "reason", type: 3, description: "Reason for ban", required: false }
    ],
    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";

        if (!interaction.guild.members.cache.get(user.id)) {
            return interaction.reply({ content: "User not found in this server.", ephemeral: true });
        }

        try {
            await interaction.guild.members.ban(user, { reason });
            await interaction.reply(`✅ Banned ${user.tag} | Reason: ${reason}`);
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: "❌ Failed to ban user.", ephemeral: true });
        }
    }
};
