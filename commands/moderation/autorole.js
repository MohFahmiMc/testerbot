const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../../data/autoroles.json");

// Pastikan folder data ada
if (!fs.existsSync(path.join(__dirname, "../../data"))) {
    fs.mkdirSync(path.join(__dirname, "../../data"));
}

// Load autoroles JSON
let autoroles = {};
if (fs.existsSync(dataPath)) {
    autoroles = JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole")
        .setDescription("Set a role to be automatically given to new members")
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("Role to assign")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const role = interaction.options.getRole("role");
        const guildId = interaction.guildId;

        autoroles[guildId] = role.id;
        fs.writeFileSync(dataPath, JSON.stringify(autoroles, null, 2));

        await interaction.reply({ content: `Auto role has been set to ${role.name} for new members.`, ephemeral: true });
    }
};

// Event listener untuk member join
module.exports.autoRoleHandler = (client) => {
    client.on("guildMemberAdd", async member => {
        const guildId = member.guild.id;
        if (!autoroles[guildId]) return;

        const role = member.guild.roles.cache.get(autoroles[guildId]);
        if (!role) return;

        try {
            await member.roles.add(role);
            console.log(`Added role ${role.name} to ${member.user.tag}`);
        } catch (err) {
            console.error(`Failed to add role: ${err}`);
        }
    });
};
