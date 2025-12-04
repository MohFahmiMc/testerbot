// commands/moderation/giveaway.js
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const ms = require("ms");

const DATA_PATH = path.join(__dirname, "../../data/giveaways.json");
if (!fs.existsSync(path.join(__dirname, "../../data"))) fs.mkdirSync(path.join(__dirname, "../../data"));

// Persistence helpers
function loadData() {
  try {
    if (!fs.existsSync(DATA_PATH)) return {};
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed loading giveaways.json", e);
    return {};
  }
}
function saveData(obj) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(obj, null, 2), "utf8");
  } catch (e) {
    console.error("Failed saving giveaways.json", e);
  }
}

// In-memory stores
let GIVEAWAYS = loadData(); // keyed by messageId
const SCHEDULES = {}; // msgId -> { updateInterval, endTimeout }

// helpers
function computeStats(gaw) {
  const participants = (gaw.entries || []).length;
  let tickets = 0;
  for (const e of (gaw.entries || [])) tickets += e.entryCount || 1;
  return { participants, tickets };
}
function buildEmbed(gaw) {
  const endsAt = Math.floor(gaw.endAt / 1000);
  const embed = new EmbedBuilder()
    .setTitle(gaw.flash ? "⚡ FLASH GIVEAWAY ⚡" : "🎉 GIVEAWAY")
    .setColor(gaw.flash ? 0xffff66 : 0x00ff99)
    .setThumbnail(gaw.botAvatar || null)
    .addFields(
      { name: "Prize", value: gaw.prize.toString(), inline: false },
      { name: "Winners", value: `${gaw.winnerCount}`, inline: true },
      { name: "Ends", value: `<t:${endsAt}:R>`, inline: true }
    )
    .setFooter({ text: "Giveaway ends at" })
    .setTimestamp(gaw.endAt);
  return embed;
}

// schedule a running giveaway: update embed periodically and schedule finalization
async function scheduleGiveaway(client, msgId) {
  const gaw = GIVEAWAYS[msgId];
  if (!gaw) return;

  // clear existing
  if (SCHEDULES[msgId]) {
    clearInterval(SCHEDULES[msgId].updateInterval);
    clearTimeout(SCHEDULES[msgId].endTimeout);
    delete SCHEDULES[msgId];
  }

  const channel = await client.channels.fetch(gaw.channelId).catch(() => null);
  if (!channel) { cleanupGiveaway(msgId); return; }

  const message = await channel.messages.fetch(msgId).catch(() => null);
  if (!message) { cleanupGiveaway(msgId); return; }

  // immediate update function
  const doUpdate = async () => {
    const now = Date.now();
    if (gaw.paused) return;
    const remaining = gaw.endAt - now;
    if (remaining <= 0) return; // finalization by timeout

    const stats = computeStats(gaw);
    const embed = buildEmbed(gaw)
      .setDescription(
        `${gaw.requiredRoleId ? `🔐 Required role: <@&${gaw.requiredRoleId}>\n` : ""}` +
        `${gaw.extraRoleId ? `🎟 Extra role: <@&${gaw.extraRoleId}> (+${gaw.extraAmount})\n` : ""}\n` +
        `👥 Participants: \`${stats.participants}\` • 🎟 Tickets: \`${stats.tickets}\``
      );

    const joinBtn = new ButtonBuilder().setCustomId("give_join").setLabel(`🎉 Join (${stats.participants})`).setStyle(ButtonStyle.Success);
    const leaveBtn = new ButtonBuilder().setCustomId("give_leave").setLabel("🚪 Leave").setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder().addComponents(joinBtn, leaveBtn);

    try { await message.edit({ embeds: [embed], components: [row] }); } catch {}
  };

  await doUpdate();
  const intervalMs = gaw.flash ? 1000 : 5000;
  const updateInterval = setInterval(doUpdate, intervalMs);

  const endTimeout = setTimeout(async () => {
    await endGiveaway(client, msgId);
  }, Math.max(0, gaw.endAt - Date.now()));

  SCHEDULES[msgId] = { updateInterval, endTimeout };
}

// finalize giveaway
async function endGiveaway(client, msgId) {
  const gaw = GIVEAWAYS[msgId];
  if (!gaw) return;

  if (SCHEDULES[msgId]) {
    clearInterval(SCHEDULES[msgId].updateInterval);
    clearTimeout(SCHEDULES[msgId].endTimeout);
    delete SCHEDULES[msgId];
  }

  const channel = await client.channels.fetch(gaw.channelId).catch(() => null);
  if (!channel) { delete GIVEAWAYS[msgId]; saveData(GIVEAWAYS); return; }
  const message = await channel.messages.fetch(msgId).catch(() => null);
  if (!message) { delete GIVEAWAYS[msgId]; saveData(GIVEAWAYS); return; }

  if (gaw.paused) {
    // if paused, don't end now; schedule will be restarted on resume
    return;
  }

  // build pool (weighted)
  const pool = [];
  for (const e of (gaw.entries || [])) {
    for (let i = 0; i < (e.entryCount || 1); i++) pool.push(e.userId);
  }

  if (pool.length === 0) {
    const embed = new EmbedBuilder().setTitle("Giveaway Ended").setDescription(`No participants for **${gaw.prize}**.`).setColor("Red");
    try { await message.edit({ embeds: [embed], components: [] }); } catch {}
    delete GIVEAWAYS[msgId]; saveData(GIVEAWAYS);
    return;
  }

  const winners = [];
  for (let i = 0; i < Math.max(1, gaw.winnerCount); i++) {
    if (pool.length === 0) break;
    const idx = Math.floor(Math.random() * pool.length);
    const winnerId = pool.splice(idx, 1)[0];
    if (!winners.includes(winnerId)) winners.push(winnerId);
    // remove remaining occurrences to avoid duplicates
    for (let j = pool.length - 1; j >= 0; j--) if (pool[j] === winnerId) pool.splice(j, 1);
  }

  // DM winners best-effort
  for (const w of winners) {
    try {
      const member = await channel.guild.members.fetch(w).catch(() => null);
      if (member) await member.send(`🎉 Congratulations! You won **${gaw.prize}**!`).catch(()=>{});
    } catch {}
  }

  const embed = new EmbedBuilder()
    .setTitle("🎉 GIVEAWAY ENDED")
    .setColor("#00ff99")
    .setDescription(`**${gaw.prize}**\n\nWinners:\n${winners.map(id => `<@${id}>`).join("\n")}`);

  try { await message.edit({ embeds: [embed], components: [] }); } catch {}

  delete GIVEAWAYS[msgId];
  saveData(GIVEAWAYS);
}

function cleanupGiveaway(msgId) {
  if (SCHEDULES[msgId]) {
    clearInterval(SCHEDULES[msgId].updateInterval);
    clearTimeout(SCHEDULES[msgId].endTimeout);
    delete SCHEDULES[msgId];
  }
  if (GIVEAWAYS[msgId]) {
    delete GIVEAWAYS[msgId];
    saveData(GIVEAWAYS);
  }
}

// restore all schedules when bot starts
async function restoreSchedules(client) {
  for (const id of Object.keys(GIVEAWAYS)) {
    const gaw = GIVEAWAYS[id];
    // populate botAvatar if missing
    if (!gaw.botAvatar && client.user) gaw.botAvatar = client.user.displayAvatarURL();
    // if ended and not paused -> finalize
    if (gaw.endAt <= Date.now() && !gaw.paused) {
      setImmediate(() => endGiveaway(client, id));
      continue;
    }
    await scheduleGiveaway(client, id);
  }
}

// exported command + helpers
module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Complete giveaway system")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(s => s.setName("start").setDescription("Start a giveaway")
      .addStringOption(o => o.setName("prize").setDescription("Prize text").setRequired(true))
      .addStringOption(o => o.setName("duration").setDescription("e.g. 10m, 1h, 1d").setRequired(true))
      .addIntegerOption(o => o.setName("winners").setDescription("Number of winners").setRequired(true))
      .addRoleOption(o => o.setName("required_role").setDescription("Required role to join"))
      .addRoleOption(o => o.setName("extra_role").setDescription("Role that gives extra entries"))
      .addIntegerOption(o => o.setName("extra_amount").setDescription("Extra entry amount (ex:5)")))
    .addSubcommand(s => s.setName("end").setDescription("End giveaway now").addStringOption(o => o.setName("message_id").setRequired(true)))
    .addSubcommand(s => s.setName("pause").setDescription("Pause giveaway").addStringOption(o => o.setName("message_id").setRequired(true)))
    .addSubcommand(s => s.setName("resume").setDescription("Resume giveaway").addStringOption(o => o.setName("message_id").setRequired(true)))
    .addSubcommand(s => s.setName("reroll").setDescription("Reroll winners").addStringOption(o => o.setName("message_id").setRequired(true))),
  
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const client = interaction.client;

    // START
    if (sub === "start") {
      const prize = interaction.options.getString("prize");
      const durationStr = interaction.options.getString("duration");
      const winnerCount = interaction.options.getInteger("winners");
      const requiredRole = interaction.options.getRole("required_role");
      const extraRole = interaction.options.getRole("extra_role");
      const extraAmount = interaction.options.getInteger("extra_amount") || 0;

      const durationMs = ms(durationStr);
      if (!durationMs || durationMs < 5000) return interaction.reply({ content: "❌ Invalid duration (min 5s).", ephemeral: true });
      if (winnerCount < 1) return interaction.reply({ content: "❌ Winners must be at least 1.", ephemeral: true });

      const flash = durationMs < 30000;
      const endAt = Date.now() + durationMs;

      const embed = new EmbedBuilder()
        .setTitle(flash ? "⚡ FLASH GIVEAWAY ⚡" : "🎉 GIVEAWAY")
        .setColor(flash ? 0xffff66 : 0x00ff99)
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: "Prize", value: prize, inline: false },
          { name: "Winners", value: `${winnerCount}`, inline: true },
          { name: "Ends", value: `<t:${Math.floor(endAt / 1000)}:R>`, inline: true }
        )
        .setDescription(`${requiredRole ? `🔐 Required role: ${requiredRole}\n` : ""}${extraRole ? `🎟 Extra role: ${extraRole} (+${extraAmount})\n` : ""}\n👥 Participants: \`0\` • 🎟 Tickets: \`0\``)
        .setTimestamp(endAt);

      const joinBtn = new ButtonBuilder().setCustomId("give_join").setLabel("🎉 Join (0)").setStyle(ButtonStyle.Success);
      const leaveBtn = new ButtonBuilder().setCustomId("give_leave").setLabel("🚪 Leave").setStyle(ButtonStyle.Secondary);
      const row = new ActionRowBuilder().addComponents(joinBtn, leaveBtn);

      // send message first, then SAVE using the message id (important)
      const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

      const gaw = {
        channelId: msg.channel.id,
        messageId: msg.id,
        prize,
        winnerCount,
        requiredRoleId: requiredRole ? requiredRole.id : null,
        extraRoleId: extraRole ? extraRole.id : null,
        extraAmount: extraAmount || 0,
        entries: [], // array { userId, entryCount }
        flash,
        paused: false,
        endAt,
        botAvatar: client.user.displayAvatarURL()
      };

      // save and schedule
      GIVEAWAYS[msg.id] = gaw;
      saveData(GIVEAWAYS);
      await scheduleGiveaway(client, msg.id);

      return interaction.followUp({ content: `✅ Giveaway created. Message ID: ${msg.id}`, ephemeral: true });
    }

    // END
    if (sub === "end") {
      const id = interaction.options.getString("message_id");
      await endGiveaway(client, id);
      return interaction.reply({ content: "🏁 Giveaway ended (if existed).", ephemeral: true });
    }

    // PAUSE
    if (sub === "pause") {
      const id = interaction.options.getString("message_id");
      const gaw = GIVEAWAYS[id];
      if (!gaw) return interaction.reply({ content: "Giveaway not found.", ephemeral: true });
      if (gaw.paused) return interaction.reply({ content: "Already paused.", ephemeral: true });

      gaw.paused = true;
      gaw.remaining = gaw.endAt - Date.now();
      if (SCHEDULES[id]) {
        clearInterval(SCHEDULES[id].updateInterval);
        clearTimeout(SCHEDULES[id].endTimeout);
        delete SCHEDULES[id];
      }
      saveData(GIVEAWAYS);
      return interaction.reply({ content: `⏸ Giveaway paused. Remaining ~${Math.ceil(gaw.remaining/1000)}s`, ephemeral: true });
    }

    // RESUME
    if (sub === "resume") {
      const id = interaction.options.getString("message_id");
      const gaw = GIVEAWAYS[id];
      if (!gaw) return interaction.reply({ content: "Giveaway not found.", ephemeral: true });
      if (!gaw.paused) return interaction.reply({ content: "Giveaway is not paused.", ephemeral: true });

      gaw.paused = false;
      gaw.endAt = Date.now() + (gaw.remaining || 0);
      delete gaw.remaining;
      saveData(GIVEAWAYS);
      await scheduleGiveaway(client, id);
      return interaction.reply({ content: `▶ Giveaway resumed. Ends in ~${Math.ceil((gaw.endAt - Date.now())/1000)}s`, ephemeral: true });
    }

    // REROLL
    if (sub === "reroll") {
      const id = interaction.options.getString("message_id");
      const gaw = GIVEAWAYS[id];
      if (!gaw || !gaw.entries || gaw.entries.length === 0) return interaction.reply({ content: "Giveaway not found or no entries.", ephemeral: true });

      const pool = [];
      for (const e of gaw.entries) for (let i=0;i<(e.entryCount||1);i++) pool.push(e.userId);
      if (pool.length === 0) return interaction.reply({ content: "No valid tickets.", ephemeral: true });

      const win = pool[Math.floor(Math.random() * pool.length)];
      try { const member = await interaction.guild.members.fetch(win); if (member) await member.send(`🎉 You won in a reroll for **${gaw.prize}**!`).catch(()=>{}); } catch {}
      return interaction.reply({ content: `🔁 Reroll winner: <@${win}>`, ephemeral: false });
    }
  },

  // Button handler
  buttonHandler: async (interaction, client) => {
    if (!interaction.isButton()) return;
    const id = interaction.message.id;
    const gaw = GIVEAWAYS[id];
    if (!gaw) return interaction.reply({ content: "This giveaway is no longer active.", ephemeral: true });

    const userId = interaction.user.id;
    const guild = interaction.guild;

    if (interaction.user.bot) return interaction.reply({ content: "Bots cannot join giveaways.", ephemeral: true });

    // LEAVE
    if (interaction.customId === "give_leave") {
      const idx = (gaw.entries || []).findIndex(e => e.userId === userId);
      if (idx === -1) return interaction.reply({ content: "You are not in the giveaway.", ephemeral: true });
      gaw.entries.splice(idx, 1);
      saveData(GIVEAWAYS);
      // update immediately
      try {
        const channel = await guild.channels.fetch(gaw.channelId).catch(()=>null);
        if (channel) {
          const message = await channel.messages.fetch(id).catch(()=>null);
          if (message) {
            const stats = computeStats(gaw);
            const embed = buildEmbed(gaw).setDescription(`${gaw.requiredRoleId ? `🔐 Required role: <@&${gaw.requiredRoleId}>\n` : ""}${gaw.extraRoleId ? `🎟 Extra role: <@&${gaw.extraRoleId}> (+${gaw.extraAmount})\n` : ""}\n👥 Participants: \`${stats.participants}\` • 🎟 Tickets: \`${stats.tickets}\``);
            const joinBtn = new ButtonBuilder().setCustomId("give_join").setLabel(`🎉 Join (${stats.participants})`).setStyle(ButtonStyle.Success);
            const leaveBtn = new ButtonBuilder().setCustomId("give_leave").setLabel("🚪 Leave").setStyle(ButtonStyle.Secondary);
            await message.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(joinBtn, leaveBtn)] }).catch(()=>{});
          }
        }
      } catch {}
      return interaction.reply({ content: "🚪 You left the giveaway.", ephemeral: true });
    }

    // JOIN
    if (interaction.customId === "give_join") {
      if (gaw.paused) return interaction.reply({ content: "This giveaway is paused.", ephemeral: true });

      if (gaw.requiredRoleId) {
        const member = await guild.members.fetch(userId).catch(()=>null);
        if (!member || !member.roles.cache.has(gaw.requiredRoleId)) {
          return interaction.reply({ content: "❌ You do not have the required role to join.", ephemeral: true });
        }
      }

      if ((gaw.entries || []).some(e => e.userId === userId)) {
        return interaction.reply({ content: "You already joined.", ephemeral: true });
      }

      let entryCount = 1;
      if (gaw.extraRoleId) {
        const member = await guild.members.fetch(userId).catch(()=>null);
        if (member && member.roles.cache.has(gaw.extraRoleId)) entryCount += (gaw.extraAmount || 0);
      }

      gaw.entries.push({ userId, entryCount });
      saveData(GIVEAWAYS);

      // immediate update
      try {
        const channel = await guild.channels.fetch(gaw.channelId).catch(()=>null);
        if (channel) {
          const message = await channel.messages.fetch(id).catch(()=>null);
          if (message) {
            const stats = computeStats(gaw);
            const embed = buildEmbed(gaw).setDescription(`${gaw.requiredRoleId ? `🔐 Required role: <@&${gaw.requiredRoleId}>\n` : ""}${gaw.extraRoleId ? `🎟 Extra role: <@&${gaw.extraRoleId}> (+${gaw.extraAmount})\n` : ""}\n👥 Participants: \`${stats.participants}\` • 🎟 Tickets: \`${stats.tickets}\``);
            const joinBtn = new ButtonBuilder().setCustomId("give_join").setLabel(`🎉 Join (${stats.participants})`).setStyle(ButtonStyle.Success);
            const leaveBtn = new ButtonBuilder().setCustomId("give_leave").setLabel("🚪 Leave").setStyle(ButtonStyle.Secondary);
            await message.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(joinBtn, leaveBtn)] }).catch(()=>{});
          }
        }
      } catch (e) {}

      return interaction.reply({ content: `🎉 You joined! Entries: ${entryCount}`, ephemeral: true });
    }
  },

  // restore to be called on client ready
  restore: async (client) => {
    GIVEAWAYS = loadData();
    for (const id of Object.keys(GIVEAWAYS)) {
      if (!GIVEAWAYS[id].botAvatar && client.user) GIVEAWAYS[id].botAvatar = client.user.displayAvatarURL();
    }
    await restoreSchedules(client);
    saveData(GIVEAWAYS);
    console.log("Giveaway: restored", Object.keys(GIVEAWAYS).length, "giveaways");
  }
};
