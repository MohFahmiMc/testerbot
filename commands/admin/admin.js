const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// ==== ENV ====
const GH_TOKEN = process.env.GH_TOKEN;
const OWNER_ID = process.env.OWNER_ID;
const REPO = process.env.REPO_NAME;
const FILE_PATH = "data/admin.json";

// ==== LOCAL FILE PATH ====
const localFile = path.join(__dirname, "../../data/admin.json");

// ==== LOAD DATA ====
function loadAdmin() {
  if (!fs.existsSync(localFile)) {
    fs.writeFileSync(localFile, JSON.stringify({ admins: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(localFile));
}

// ==== SAVE LOCAL + PUSH TO GITHUB ====
async function saveAdmin(data) {
  fs.writeFileSync(localFile, JSON.stringify(data, null, 2));

  const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

  const getUrl = `https://api.github.com/repos/${OWNER_ID}/${REPO}/contents/${FILE_PATH}`;
  let sha = null;

  try {
    const res = await axios.get(getUrl, {
      headers: { Authorization: `token ${GH_TOKEN}` }
    });
    sha = res.data.sha;
  } catch (err) {
    console.log("admin.json belum ada di GitHub, akan dibuat baru.");
  }

  await axios.put(
    getUrl,
    {
      message: "Update admin.json",
      content,
      sha
    },
    {
      headers: { Authorization: `token ${GH_TOKEN}` }
    }
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Kelola admin bot.")
    .addSubcommand(s =>
      s.setName("add")
        .setDescription("Tambah admin bot.")
        .addUserOption(o =>
          o.setName("user").setDescription("User yang dijadikan admin").setRequired(true)
        )
    )
    .addSubcommand(s =>
      s.setName("rm")
        .setDescription("Hapus admin bot.")
        .addUserOption(o =>
          o.setName("user").setDescription("User yang dihapus dari admin").setRequired(true)
        )
    )
    .addSubcommand(s =>
      s.setName("list")
        .setDescription("Perlihatkan daftar admin bot.")
    )
    .addSubcommand(s =>
      s.setName("online")
        .setDescription("Cek admin yang sedang online di server ini.")
    ),

  async execute(interaction) {
    const cmd = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    let data = loadAdmin();

    // =============================
    // == ADD (OWNER ONLY) ==
    // =============================
    if (cmd === "add") {
      if (userId !== OWNER_ID)
        return interaction.reply("❌ Hanya OWNER yang boleh menambah admin.");

      const target = interaction.options.getUser("user");

      if (data.admins.includes(target.id))
        return interaction.reply("⚠️ User ini sudah admin.");

      data.admins.push(target.id);
      await saveAdmin(data);

      return interaction.reply(`✅ **${target.tag}** ditambahkan sebagai admin.`);
    }

    // =============================
    // == REMOVE (OWNER ONLY) ==
    // =============================
    if (cmd === "rm") {
      if (userId !== OWNER_ID)
        return interaction.reply("❌ Hanya OWNER yang boleh menghapus admin.");

      const target = interaction.options.getUser("user");

      if (!data.admins.includes(target.id))
        return interaction.reply("⚠️ User ini bukan admin.");

      data.admins = data.admins.filter(id => id !== target.id);
      await saveAdmin(data);

      return interaction.reply(`🗑️ Admin **${target.tag}** dihapus.`);
    }

    // =============================
    // == LIST ADMIN ==
    // =============================
    if (cmd === "list") {
      if (data.admins.length === 0)
        return interaction.reply("Tidak ada admin bot.");

      const list = data.admins
        .map(id => `<@${id}>`)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("📜 Daftar Admin Bot")
        .setDescription(list)
        .setColor("Green");

      return interaction.reply({ embeds: [embed] });
    }

    // =============================
    // == ONLINE ADMIN ==
    // =============================
    if (cmd === "online") {
      const guild = interaction.guild;

      const onlineAdmins = guild.members.cache.filter(m =>
        data.admins.includes(m.id) &&
        m.presence?.status !== "offline"
      );

      if (onlineAdmins.size === 0)
        return interaction.reply("👀 Tidak ada admin yang online.");

      const list = onlineAdmins
        .map(m => `🟢 <@${m.id}> — ${m.presence.status}`)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("🟢 Admin Yang Online")
        .setDescription(list)
        .setColor("Green");

      return interaction.reply({ embeds: [embed] });
    }
  }
};
