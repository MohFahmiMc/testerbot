const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

const prefixPath = path.join(__dirname, "../../data/prefixes.json");

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

        await interaction.deferReply({ ephemeral: true });

        // Baca file
        let prefixes = {};
        if (fs.existsSync(prefixPath)) {
            prefixes = JSON.parse(fs.readFileSync(prefixPath, "utf8"));
        }

        const prefix = interaction.options.getString("prefix");

        // Set prefix untuk guild ini
        prefixes[interaction.guild.id] = prefix;

        // Tulis kembali ke file
        fs.writeFileSync(prefixPath, JSON.stringify(prefixes, null, 2));

        // Balas interaction
        await interaction.editReply(`✅ Prefix berhasil diubah menjadi **${prefix}**`);

        // ===============================
        // PUSH KE GITHUB (Async)
        // ===============================
        if (process.env.GH_TOKEN && process.env.GH_REPO) {
            const { exec } = require("child_process");

            exec(`git config --global user.email "system@bot.ai"`);
            exec(`git config --global user.name "Bot-System"`);

            exec(`git add data/prefixes.json && git commit -m "Update prefix for ${interaction.guild.id}" && git push https://${process.env.GH_TOKEN}@github.com/${process.env.GH_REPO}.git HEAD:main`,
                (err, stdout, stderr) => {
                    if (err) console.log("Git push error:", err);
                    if (stderr) console.log("Git push stderr:", stderr);
                }
            );
        }
    }
};
