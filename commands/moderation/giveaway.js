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

// --- Helper persistence ---
function loadData() {
  try {
    if (!fs.existsSync(DATA_PATH)) return {};
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    console.error("Failed to load giveaways.json", e);
    return {};
  }
}
function saveData(obj) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(obj, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to save giveaways.json", e);
  }
}

// In-memory store (mirrors file)
let GIVEAWAYS = loadData(); // keyed by messageId

// schedule map to hold intervals/timeouts per running giveaway (not persisted)
const SCHEDULES = {}; // msgId -> { updateInterval, endTimeout }

// utility: compute tickets and participants
function computeStats(gaw, client) {
  // gaw.entries is array of { userId, entryCount }
  const participants = (gaw.entries || []).length;
  let tickets = 0;
  for (const e of (gaw.entries || [])) tickets += e.entryCount || 1;
  return { participants, tickets };
}

// utility: build embed for a giveaway
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

// schedule update (edit embed & button label) and final end
async function scheduleGiveaway(client, msgId) {
  const gaw = GIVEAWAYS[msgId];
  if (!gaw) return;

  // Clear previous if exists
  if (SCHEDULES[msgId]) {
    clearInterval(SCHEDULES[msgId].updateInterval);
    clearTimeout(SCHEDULES[msgId].endTimeout);
    delete SCHEDULES[msgId];
  }

  const channel = await client.channels.fetch(gaw.channelId).catch(() => null);
  if (!channel) return cleanupGiveaway(msgId);

  const message = await channel.messages.fetch(msgId).catch(() => null);
  if (!message) return cleanupGiveaway(msgId);

  // update function
  const doUpdate = async () => {
    const now = Date.now();
    if (gaw.paused) return; // skip update while paused

    const remaining = gaw.endAt - now;
    if (remaining <= 0) {
      // ensure finalization handled by timeout as well
      return;
    }

    const stats = computeStats(gaw);
    const embed = buildEmbed(gaw)
      .setDescription(
        `${gaw.requiredRoleId ? `🔐 Required role: <@&${gaw.requiredRoleId}>\n` : ""}` +
        `${gaw.extraRoleId ? `🎟 Extra role: <@&${gaw.extraRoleId}> (+${gaw.extraAmount})\n` : ""}\n` +
        `👥 Participants: \`${stats.participants}\` • 🎟 Tickets: \`${stats.tickets}\``
      );

    // update button label with participant count
    const join = new ButtonBuilder()
      .setCustomId("give_join")
      .setLabel(`🎉 Join (${stats.participants})`)
      .setStyle(ButtonStyle.Success);

    const leave = new ButtonBuilder()
      .setCustomId("give_leave")
      .setLabel("🚪 Leave")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(join, leave);

    try {
      await message.edit({ embeds: [embed], components: [row] });
    } catch (err) {
      /* ignore edit failures (message deleted, etc) */
    }
  };

  // initial update now
  await doUpdate();

  // update frequency
  const intervalMs = gaw.flash ? 1000 : 5000; // faster for flash
  const updateInterval = setInterval(doUpdate, intervalMs);

  // end timeout
  const endTimeout = setTimeout(async () => {
    // finalize giveaway
    await endGiveaway(client, msgId);
  }, Math.max(0, gaw.endAt - Date.now()));

  SCHEDULES[msgId] = { updateInterval, endTimeout };
}

// finalize & pick winners
async function endGiveaway(client, msgId) {
  const gaw = GIVEAWAYS[msgId];
  if (!gaw) return;

  // clear schedules
  if (SCHEDULES[msgId]) {
    clearInterval(SCHEDULES[msgId].updateInterval);
    clearTimeout(SCHEDULES[msgId].endTimeout);
    delete SCHEDULES[msgId];
  }

  // fetch channel/message
  const channel = await client.channels.fetch(gaw.channelId).catch(() => null);
  if (!channel) {
    delete GIVEAWAYS[msgId]; saveData(GIVEAWAYS); return;
  }
  const message = await channel.messages.fetch(msgId).catch(() => null);
  if (!message) {
    delete GIVEAWAYS[msgId]; saveData(GIVEAWAYS); return;
  }

  // if paused, respect pause (do nothing)
  if (gaw.paused) {
    // schedule again when resumed
    return;
  }

  // build ticket pool (weighted)
  const pool = [];
  for (const e of gaw.entries || []) {
    const userId = e.userId;
    const base = e.entryCount || 1;
    for (let i = 0; i < base; i++) pool.push(userId);
  }

  if (pool.length === 0) {
    const embed = new EmbedBuilder()
      .setTitle("Giveaway Ended")
      .setDescription(`No participants for **${gaw.prize}**.`)
      .setColor("Red");
    try { await message.edit({ embeds: [embed], components: [] }); } catch {}
    delete GIVEAWAYS[msgId]; saveData(GIVEAWAYS);
    return;
  }

  // pick winners unique
  const winners = [];
  for (let i = 0; i < Math.max(1, gaw.winnerCount); i++) {
    if (pool.length === 0) break;
    const idx = Math.floor(Math.random() * pool.length);
    const winnerId = pool.splice(idx, 1)[0];
    if (!winners.includes(winnerId)) winners.push(winnerId);
    // remove any leftover occurrences to avoid duplicate winners
    for (let j = pool.length - 1; j >= 0; j--) if (pool[j] === winnerId) pool.splice(j, 1);
  }

  // DM winners (best-effort)
  for (const w of winners) {
    try {
      const member = await channel.guild.members.fetch(w).catch(() => null);
      if (member) await member.send(`🎉 Congratulations! You won **${gaw.prize}**!`);
    } catch (e) { /* ignore */ }
  }

  // final embed
  const embed = new EmbedBuilder()
    .setTitle("🎉 GIVEAWAY ENDED")
    .setColor("#00ff99")
    .setDescription(`**${gaw.prize}**\n\nWinners:\n${winners.map(id => `<@${id}>`).join("\n")}`);

  try { await message.edit({ embeds: [embed], components: [] }); } catch (e) {}

  // remove giveaway
  delete GIVEAWAYS[msgId];
  saveData(GIVEAWAYS);
}

// cleanup helper
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

// When bot starts, restore schedules for active giveaways
async function restoreSchedules(client) {
  for (const msgId of Object.keys(GIVEAWAYS)) {
    const gaw = GIVEAWAYS[msgId];
    // if ended already, skip and cleanup
    if (gaw.endAt <= Date.now() && !gaw.paused) {
      // finalize immediately
      setImmediate(() => endGiveaway(client, msgId));
      continue;
    }
    // set botAvatar if missing
    if (!gaw.botAvatar && client.user) gaw.botAvatar = client.user.displayAvatarURL();
    // schedule
    await scheduleGiveaway(client, msgId);
  }
}

// ---------- Slash command registration + execution ----------
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
    .addSubcommand(s => s.setName("reroll").setDescription("Reroll winners").addStringOption(o => o.setName("message_id").setRequired(true)))
  ,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const client = interaction.client;

    // ensure entries array exists
    if (!GIVEAWAYS) GIVEAWAYS = {};

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

      // Build initial embed + buttons
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
        .setDescription(
          `${requiredRole ? `🔐 Required role: ${requiredRole}\n` : ""}${extraRole ? `🎟 Extra role: ${extraRole} (+${extraAmount})\n` : ""}\n` +
          `👥 Participants: \`0\` • 🎟 Tickets: \`0\``
        )
        .setTimestamp(endAt);

      const joinBtn = new ButtonBuilder().setCustomId("give_join").setLabel("🎉 Join (0)").setStyle(ButtonStyle.Success);
      const leaveBtn = new ButtonBuilder().setCustomId("give_leave").setLabel("🚪 Leave").setStyle(ButtonStyle.Secondary);
      const row = new ActionRowBuilder().addComponents(joinBtn, leaveBtn);

      const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

      // Prepare giveaway object
      const gaw = {
        channelId: msg.channel.id,
        messageId: msg.id,
        prize,
        winnerCount,
        requiredRoleId: requiredRole ? requiredRole.id : null,
        extraRoleId: extraRole ? extraRole.id : null,
        extraAmount: extraAmount || 0,
        entries: [], // array of { userId, entryCount }
        flash,
        paused: false,
        endAt,
        botAvatar: client.user.displayAvatarURL()
      };

      GIVEAWAYS[msg.id] = gaw;
      saveData(GIVEAWAYS);

      // schedule
      await scheduleGiveaway(client, msg.id);

      return interaction.followUp({ content: `✅ Giveaway created (message id: ${msg.id})`, ephemeral: true });
    }

    // END
    if (sub === "end") {
      const id = interaction.options.getString("message_id");
      await endGiveaway(client, id);
      return interaction.reply({ content: "🏁 Giveaway ended (if exists).", ephemeral: true });
    }

    // PAUSE
    if (sub === "pause") {
      const id = interaction.options.getString("message_id");
      const gaw = GIVEAWAYS[id];
      if (!gaw) return interaction.reply({ content: "Giveaway not found.", ephemeral: true });
      if (gaw.paused) return interaction.reply({ content: "Already paused.", ephemeral: true });

      gaw.paused = true;
      gaw.remaining = gaw.endAt - Date.now();
      // clear schedules
      if (SCHEDULES[id]) {
        clearInterval(SCHEDULES[id].updateInterval);
        clearTimeout(SCHEDULES[id].endTimeout);
        delete SCHEDULES[id];
      }
      saveData(GIVEAWAYS);
      return interaction.reply({ content: `⏸ Giveaway paused. Remaining: ${Math.ceil(gaw.remaining / 1000)}s`, ephemeral: true });
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
      return interaction.reply({ content: `▶ Giveaway resumed. It will end in ~${Math.ceil((gaw.endAt - Date.now()) / 1000)}s`, ephemeral: true });
    }

    // REROLL
    if (sub === "reroll") {
      const id = interaction.options.getString("message_id");
      const gaw = GIVEAWAYS[id];
      if (!gaw) return interaction.reply({ content: "Giveaway not found or data lost.", ephemeral: true });

      if (!gaw.entries || gaw.entries.length === 0) return interaction.reply({ content: "No entries to reroll.", ephemeral: true });

      // build ticket pool
      const pool = [];
      for (const e of gaw.entries) {
        for (let i = 0; i < e.entryCount; i++) pool.push(e.userId);
      }

      if (pool.length === 0) return interaction.reply({ content: "No valid tickets.", ephemeral: true });

      const win = pool[Math.floor(Math.random() * pool.length)];
      try {
        const member = await interaction.guild.members.fetch(win);
        await member.send(`🎉 You won in a reroll for **${gaw.prize}**!`).catch(()=>{});
      } catch {}
      return interaction.reply({ content: `🔁 Reroll winner: <@${win}>`, ephemeral: false });
    }
  },

  // Button handler (exported so events/interactionCreate can call it)
  buttonHandler: async (interaction) => {
    if (!interaction.isButton()) return;
    const id = interaction.message.id;
    const gaw = GIVEAWAYS[id];
    if (!gaw) return interaction.reply({ content: "This giveaway is no longer active.", ephemeral: true });

    const userId = interaction.user.id;
    const guild = interaction.guild;

    // anti-bot
    if (interaction.user.bot) return interaction.reply({ content: "Bots cannot join giveaways.", ephemeral: true });

    // leave
    if (interaction.customId === "give_leave") {
      const idx = (gaw.entries || []).findIndex(e => e.userId === userId);
      if (idx === -1) return interaction.reply({ content: "You are not in the giveaway.", ephemeral: true });
      gaw.entries.splice(idx, 1);
      saveData(GIVEAWAYS);
      return interaction.reply({ content: "🚪 You left the giveaway.", ephemeral: true });
    }

    // join
    if (interaction.customId === "give_join") {
      // paused?
      if (gaw.paused) return interaction.reply({ content: "This giveaway is paused.", ephemeral: true });

      // required role check
      if (gaw.requiredRoleId) {
        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member || !member.roles.cache.has(gaw.requiredRoleId)) {
          return interaction.reply({ content: "❌ You do not have the required role to join.", ephemeral: true });
        }
      }

      // already joined?
      if ((gaw.entries || []).some(e => e.userId === userId)) {
        return interaction.reply({ content: "You already joined.", ephemeral: true });
      }

      // compute entryCount (1 base + extra if has role)
      let entryCount = 1;
      if (gaw.extraRoleId) {
        const member = await guild.members.fetch(userId).catch(() => null);
        if (member && member.roles.cache.has(gaw.extraRoleId)) entryCount += (gaw.extraAmount || 0);
      }

      gaw.entries.push({ userId, entryCount });
      saveData(GIVEAWAYS);

      // update embed + button label immediately (best-effort)
      try {
        const channel = await guild.channels.fetch(gaw.channelId).catch(() => null);
        if (channel) {
          const message = await channel.messages.fetch(id).catch(() => null);
          if (message) {
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
            await message.edit({ embeds: [embed], components: [row] }).catch(()=>{});
          }
        }
      } catch(e){}

      return interaction.reply({ content: `🎉 You joined! Entries: ${entryCount}`, ephemeral: true });
    }
  },

  // restore function to be called on client ready
  restore: async (client) => {
    // ensure map is loaded
    GIVEAWAYS = loadData();
    // set bot avatar in each if missing
    for (const id of Object.keys(GIVEAWAYS)) {
      if (!GIVEAWAYS[id].botAvatar && client.user) GIVEAWAYS[id].botAvatar = client.user.displayAvatarURL();
    }
    // schedule all active giveaways
    await restoreSchedules(client);
    // save after restore to ensure file is clean
    saveData(GIVEAWAYS);
    console.log("Giveaway: restored", Object.keys(GIVEAWAYS).length, "giveaways");
  }
};
