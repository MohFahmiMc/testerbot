const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// File paths
const KEYS_FILE = path.join(__dirname, "../../data/keys.json");
const PREMIUM_FILE = path.join(__dirname, "../../data/premium.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("premium")
        .setDescription("Premium management system")

        // REDEEM KEY
        .addSubcommand(sub =>
            sub.setName("redeem")
                .setDescription("Redeem a premium key")
                .addStringOption(opt =>
                    opt.setName("key")
                        .setDescription("Your premium key")
                        .setRequired(true)
                )
        )

        // PREMIUM TRIAL
        .addSubcommand(sub =>
            sub.setName("trial")
                .setDescription("Activate a one-time premium trial")
        )

        // OWNER: ADD KEY
        .addSubcommand(sub =>
            sub.setName("addkey")
                .setDescription("Generate a premium key (OWNER ONLY)")
                .addIntegerOption(opt =>
                    opt.setName("days")
                        .setDescription("How long the premium lasts")
                        .setRequired(true)
                )
        )

        // OWNER: LIST KEYS
        .addSubcommand(sub =>
            sub.setName("listkeys")
                .setDescription("List all available premium keys (OWNER ONLY)")
        )

        // OWNER: REMOVE KEY
        .addSubcommand(sub =>
            sub.setName("removekey")
                .setDescription("Delete a premium key (OWNER ONLY)")
                .addStringOption(opt =>
                    opt.setName("key")
                        .setDescription("The key you want to remove")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const ownerId = process.env.OWNER_ID;

        if (!fs.existsSync(KEYS_FILE)) fs.writeFileSync(KEYS_FILE, "{}");
        if (!fs.existsSync(PREMIUM_FILE)) fs.writeFileSync(PREMIUM_FILE, "{}");

        let keys = JSON.parse(fs.readFileSync(KEYS_FILE));
        let premium = JSON.parse(fs.readFileSync(PREMIUM_FILE));

        const sub = interaction.options.getSubcommand();
        const isOwner = interaction.user.id === ownerId;

        // =================================================
        // 🔑 ADDKEY (OWNER)
        // =================================================
        if (sub === "addkey") {
            if (!isOwner)
                return interaction.reply({ content: "❌ Only the bot owner can generate keys.", ephemeral: true });

            const days = interaction.options.getInteger("days");
            const key = `ZEPHYR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

            keys[key] = { days };
            fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));

            const embed = new EmbedBuilder()
                .setTitle("🔑 Premium Key Generated")
                .setColor("Gold")
                .addFields(
                    { name: "Key", value: `\`${key}\`` },
                    { name: "Duration", value: `${days} days` }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // =================================================
        // 📃 LIST KEYS (OWNER)
        // =================================================
        if (sub === "listkeys") {
            if (!isOwner)
                return interaction.reply({ content: "❌ Only the owner can view the key list.", ephemeral: true });

            if (Object.keys(keys).length === 0)
                return interaction.reply({ content: "📭 No available keys.", ephemeral: true });

            const desc = Object.entries(keys)
                .map(([k, v]) => `🟨 **${k}** — ${v.days} days`)
                .join("\n");

            const embed = new EmbedBuilder()
                .setTitle("🔐 Stored Premium Keys")
                .setColor("Yellow")
                .setDescription(desc)
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // =================================================
        // 🗑 REMOVE KEY (OWNER)
        // =================================================
        if (sub === "removekey") {
            if (!isOwner)
                return interaction.reply({ content: "❌ Only the owner can remove keys.", ephemeral: true });

            const key = interaction.options.getString("key");

            if (!keys[key])
                return interaction.reply({ content: "❌ Key not found.", ephemeral: true });

            delete keys[key];
            fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));

            return interaction.reply({ content: `🗑️ Key \`${key}\` has been removed.`, ephemeral: true });
        }

        // =================================================
        // 🎉 TRIAL SYSTEM
        // =================================================
        if (sub === "trial") {
            const uid = interaction.user.id;

            // Cek kalau sudah punya premium
            if (premium[uid] && premium[uid].expires > Date.now()) {
                return interaction.reply({
                    content: "⚠️ You already have premium active.",
                    ephemeral: true
                });
            }

            // Cek kalau sudah pernah trial
            if (premium[uid] && premium[uid].trialUsed === true) {
                return interaction.reply({
                    content: "❌ You have already used your trial.",
                    ephemeral: true
                });
            }

            const trialDays = 3;
            const expire = Date.now() + trialDays * 86400000;

            premium[uid] = {
                expires: expire,
                days: trialDays,
                trialUsed: true
            };

            fs.writeFileSync(PREMIUM_FILE, JSON.stringify(premium, null, 2));

            const embed = new EmbedBuilder()
                .setTitle("🎁 Premium Trial Activated!")
                .setColor("Blue")
                .addFields(
                    { name: "Duration", value: `${trialDays} days` },
                    { name: "Expires At", value: `<t:${Math.floor(expire / 1000)}:F>` }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // =================================================
        // 🎟 REDEEM KEY
        // =================================================
        if (sub === "redeem") {
            const key = interaction.options.getString("key");

            if (!keys[key]) {
                return interaction.reply({ content: "❌ Invalid or expired key.", ephemeral: true });
            }

            const days = keys[key].days;
            const expire = Date.now() + days * 24 * 60 * 60 * 1000;

            premium[interaction.user.id] = {
                expires: expire,
                days,
                trialUsed: true
            };

            fs.writeFileSync(PREMIUM_FILE, JSON.stringify(premium, null, 2));

            delete keys[key];
            fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));

            const embed = new EmbedBuilder()
                .setTitle("🎉 Premium Activated!")
                .setColor("Green")
                .addFields(
                    { name: "Duration", value: `${days} days` },
                    { name: "Expires At", value: `<t:${Math.floor(expire / 1000)}:F>` }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
