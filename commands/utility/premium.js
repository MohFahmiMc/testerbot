const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// ==== ENV ====
const GH_TOKEN = process.env.GH_TOKEN;
const OWNER_ID = process.env.OWNER_ID;
const REPO = process.env.REPO_NAME;
const FILE_PATH = "data/premium.json";

// ==== LOCAL FILE PATH ====
const localFile = path.join(__dirname, "../../data/premium.json");

// ==== LOAD DATA ====
function loadPremium() {
  if (!fs.existsSync(localFile)) {
    fs.writeFileSync(localFile, JSON.stringify({ keys: [], users: {}, trials: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(localFile));
}

// ==== SAVE LOCAL + PUSH TO GITHUB ====
async function savePremium(data) {
  fs.writeFileSync(localFile, JSON.stringify(data, null, 2));

  // Read file content
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

  // Get latest SHA
  const getUrl = `https://api.github.com/repos/${OWNER_ID}/${REPO}/contents/${FILE_PATH}`;
  let sha = null;

  try {
    const res = await axios.get(getUrl, {
      headers: { Authorization: `token ${GH_TOKEN}` }
    });
    sha = res.data.sha;
  } catch (err) {
    console.log("File not found, creating new...");
  }

  // PUSH
  await axios.put(
    getUrl,
    {
      message: "Update premium.json",
      content,
      sha
    },
    {
      headers: { Authorization: `token ${GH_TOKEN}` }
    }
  );
}

// ==== EXPIRATION CHECK ====
function cleanupExpired(data) {
  const now = Date.now();
  for (const uid in data.users) {
    if (data.users[uid].expires < now) delete data.users[uid];
  }
  return data;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("premium")
    .setDescription("Premium system lengkap.")
    .addSubcommand(s =>
      s.setName("addkey")
        .setDescription("Tambahkan key premium.")
        .addStringOption(o =>
          o.setName("key").setDescription("Key premium").setRequired(true)
        )
        .addIntegerOption(o =>
          o.setName("duration").setDescription("Durasi jam").setRequired(true)
        )
    )
    .addSubcommand(s =>
      s.setName("removekey")
        .setDescription("Hapus key premium.")
        .addStringOption(o =>
          o.setName("key").setDescription("Key premium").setRequired(true)
        )
    )
    .addSubcommand(s =>
      s.setName("listkeys")
        .setDescription("List semua key premium.")
    )
    .addSubcommand(s =>
      s.setName("redeem")
        .setDescription("Redeem key premium.")
        .addStringOption(o =>
          o.setName("key").setDescription("Key premium").setRequired(true)
        )
    )
    .addSubcommand(s =>
      s.setName("trial")
        .setDescription("Claim trial premium (3 jam, sekali saja).")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    let data = loadPremium();
    data = cleanupExpired(data);

    const userId = interaction.user.id;

    // =============================
    // == ADDKEY (ADMIN ONLY) ==
    // =============================
    if (sub === "addkey") {
      if (interaction.user.id !== OWNER_ID)
        return interaction.reply("❌ Kamu bukan owner.");

      const key = interaction.options.getString("key");
      const hours = interaction.options.getInteger("duration");

      data.keys.push({ key, duration: hours });

      await savePremium(data);
      return interaction.reply(`✅ Key berhasil ditambah: **${key}** (${hours} jam)`);
    }

    // =============================
    // == REMOVEKEY ==
    // =============================
    if (sub === "removekey") {
      const key = interaction.options.getString("key");
      data.keys = data.keys.filter(k => k.key !== key);

      await savePremium(data);
      return interaction.reply(`🗑️ Key **${key}** dihapus.`);
    }

    // =============================
    // == LISTKEYS ==
    // =============================
    if (sub === "listkeys") {
      if (data.keys.length === 0) return interaction.reply("Tidak ada key.");

      let list = data.keys.map(k => `• **${k.key}** (${k.duration} jam)`).join("\n");

      return interaction.reply(list);
    }

    // =============================
    // == REDEEM ==
    // =============================
    if (sub === "redeem") {
      const key = interaction.options.getString("key");
      const found = data.keys.find(k => k.key === key);

      if (!found) return interaction.reply("❌ Key tidak valid.");

      const durationMs = found.duration * 3600000;

      data.users[userId] = {
        expires: Date.now() + durationMs
      };

      // Hapus key setelah digunakan
      data.keys = data.keys.filter(k => k.key !== key);

      await savePremium(data);
      return interaction.reply(`🎉 Premium aktif selama **${found.duration} jam**!`);
    }

    // =============================
    // == TRIAL 3 JAM (1X SAJA) ==
    // =============================
    if (sub === "trial") {
      if (data.trials[userId]) {
        return interaction.reply("❌ Kamu sudah pernah claim trial.");
      }

      data.trials[userId] = true;
      data.users[userId] = {
        expires: Date.now() + 10800000 // 3 jam
      };

      await savePremium(data);
      return interaction.reply("✨ Kamu mendapatkan **Trial Premium 3 jam!**");
    }
  }
};
