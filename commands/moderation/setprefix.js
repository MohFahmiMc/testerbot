const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

const prefixPath = path.join(__dirname, "../../prefixes.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setprefix")
        .setDescription("Set prefix bot untuk server ini")
        .addStringOption(option =>
            option.setName("prefix")
                .setDescription("Prefix baru")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ You must be admin!", ephemeral: true });
        }

        let prefixes = {};
        if (fs.existsSync(prefixPath)) {
            prefixes = JSON.parse(fs.readFileSync(prefixPath, "utf8"));
        }

        const prefix = interaction.options.getString("prefix");

        prefixes[interaction.guild.id] = prefix;
        fs.writeFileSync(prefixPath, JSON.stringify(prefixes, null, 2));

        await interaction.reply(`✅ Prefix berhasil diubah menjadi **${prefix}**`);

        // ===============================
        // PUSH KE GITHUB
        // ===============================
        if (!process.env.GH_TOKEN || !process.env.GH_REPO) {
            console.log("GH Token tidak ditemukan, skip push.");
            return;
        }

        const { exec } = require("child_process");

        exec(`git config --global user.email "system@bot.ai"`);
        exec(`git config --global user.name "Bot-System"`);

        exec(`git add prefixes.json`);
        exec(`git commit -m "Update prefix"`);
        exec(`git push https://${process.env.GH_TOKEN}@github.com/${process.env.GH_REPO}.git HEAD:main`);
    }
};
