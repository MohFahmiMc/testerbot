// commands/giveaway.js
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const ms = require("ms");

/**
 * NOTE:
 * - Place this file in your commands folder and register it with your deploy script.
 * - Requires Gateway Intent "Guild Members" if you want reliable flash selection from members.
 * - This implementation uses in-memory storage (interaction.client.giveaways).
 *   For persistence across restarts use a DB (Mongo/JSON etc).
 */

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Complete giveaway system")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages) // admin/mod only by default
    .addSubcommand((s) =>
      s
        .setName("start")
        .setDescription("Start a giveaway")
        .addStringOption((o) =>
          o.setName("prize").setDescription("Prize (text)").setRequired(true)
        )
        .addStringOption((o) =>
          o
            .setName("duration")
            .setDescription("Duration (e.g. 1m, 5m, 1h, 2d)")
            .setRequired(true)
        )
        .addIntegerOption((o) =>
          o
            .setName("winners")
            .setDescription("Number of winners")
            .setRequired(true)
        )
        .addRoleOption((o) =>
          o.setName("required_role").setDescription("Role required to join")
        )
        .addRoleOption((o) =>
          o
            .setName("extra_role")
            .setDescription("Role that gives extra entries (example: @active)")
        )
        .addIntegerOption((o) =>
          o
            .setName("extra_amount")
            .setDescription("Extra entries amount for extra_role (e.g. 5)")
        )
        .addBooleanOption((o) =>
          o.setName("flash").setDescription("Flash giveaway: pick winner now")
        )
    )
    .addSubcommand((s) =>
      s
        .setName("reroll")
        .setDescription("Reroll an ended giveaway by message ID")
        .addStringOption((o) =>
          o
            .setName("messageid")
            .setDescription("Giveaway message ID to reroll")
            .setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s
        .setName("pause")
        .setDescription("Pause a running giveaway (by message ID)")
        .addStringOption((o) =>
          o.setName("messageid").setDescription("Giveaway message ID").setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s
        .setName("resume")
        .setDescription("Resume a paused giveaway (by message ID)")
        .addStringOption((o) =>
          o.setName("messageid").setDescription("Giveaway message ID").setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    // ensure we have memory store
    if (!interaction.client.giveaways) interaction.client.giveaways = new Map();

    // helper: format remaining time nicely
    const formatRemaining = (msLeft) => {
      if (msLeft <= 0) return "0s";
      const s = Math.floor(msLeft / 1000) % 60;
      const m = Math.floor(msLeft / (1000 * 60)) % 60;
      const h = Math.floor(msLeft / (1000 * 60 * 60)) % 24;
      const d = Math.floor(msLeft / (1000 * 60 * 60 * 24));
      const parts = [];
      if (d) parts.push(`${d}d`);
      if (h) parts.push(`${h}h`);
      if (m) parts.push(`${m}m`);
      if (s) parts.push(`${s}s`);
      return parts.join(" ") || "0s";
    };

    // ---------- START ----------
    if (sub === "start") {
      const prize = interaction.options.getString("prize");
      const durationStr = interaction.options.getString("duration");
      const winnersCount = interaction.options.getInteger("winners");
      const reqRole = interaction.options.getRole("required_role");
      const extraRole = interaction.options.getRole("extra_role");
      const extraAmount = interaction.options.getInteger("extra_amount") || 0;
      const flash = interaction.options.getBoolean("flash") || false;

      const durationMs = ms(durationStr);
      if (!durationMs || durationMs <= 0)
        return interaction.reply({ content: "❌ Invalid duration.", ephemeral: true });
      if (winnersCount <= 0)
        return interaction.reply({ content: "❌ Winners must be >= 1", ephemeral: true });

      // FLASH: pick randomly NOW from guild members who meet role requirement
      if (flash) {
        // require guild members intent for reliability
        await interaction.deferReply({ ephemeral: true });
        // build candidate list
        let candidates = interaction.guild.members.cache.filter((m) => !m.user.bot);
        if (reqRole) candidates = candidates.filter((m) => m.roles.cache.has(reqRole.id));
        const arr = Array.from(candidates.keys());
        if (arr.length === 0) return interaction.editReply("No eligible members to pick from.");
        const winners = [];
        while (winners.length < winnersCount && arr.length > 0) {
          const idx = Math.floor(Math.random() * arr.length);
          winners.push(arr.splice(idx, 1)[0]);
        }
        return interaction.editReply(
          `⚡ Flash giveaway winners for **${prize}**:\n${winners.map((id) => `<@${id}>`).join("\n")}`
        );
      }

      // build embed
      const endAt = Date.now() + durationMs;
      const embed = new EmbedBuilder()
        .setTitle("🎉 GIVEAWAY STARTED")
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setColor("#2b2d31")
        .addFields(
          { name: "Prize", value: `${prize}`, inline: false },
          { name: "Winners", value: `${winnersCount}`, inline: true },
          { name: "Ends in", value: formatRemaining(durationMs), inline: true }
        )
        .setDescription(
          `${reqRole ? `🔐 Required role: ${reqRole}\n` : ""}${
            extraRole ? `🎟 Extra role: ${extraRole} (+${extraAmount})\n` : ""
          }\nClick **Join** to enter!\n\n👥 Entries: 0`
        )
        .setFooter({ text: `Ends at` })
        .setTimestamp(endAt);

      const joinBtn = new ButtonBuilder()
        .setCustomId("give_join")
        .setLabel("Join Giveaway 🎉")
        .setStyle(ButtonStyle.Success);

      const leaveBtn = new ButtonBuilder()
        .setCustomId("give_leave")
        .setLabel("Leave")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(joinBtn, leaveBtn);

      // send
      const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

      // create giveaway data
      const giveaway = {
        guildId: interaction.guild.id,
        channelId: interaction.channel.id,
        messageId: msg.id,
        prize,
        winnersCount,
        reqRoleId: reqRole ? reqRole.id : null,
        extraRoleId: extraRole ? extraRole.id : null,
        extraAmount,
        endAt,
        entries: new Map(), // userId -> entryCount (1 + extras)
        paused: false,
        remaining: durationMs,
        interval: null,
        timeout: null,
      };

      // store
      interaction.client.giveaways.set(msg.id, giveaway);

      // update embed countdown every 10s (light)
      const updateEmbed = async () => {
        const g = interaction.client.giveaways.get(msg.id);
        if (!g) return;
        const msLeft = g.endAt - Date.now();
        const baseEmbed = EmbedBuilder.from(embed);
        baseEmbed.data.fields = [
          { name: "Prize", value: `${g.prize}`, inline: false },
          { name: "Winners", value: `${g.winnersCount}`, inline: true },
          { name: "Ends in", value: formatRemaining(msLeft > 0 ? msLeft : 0), inline: true },
        ];
        baseEmbed.setDescription(
          `${g.reqRoleId ? `🔐 Required role: <@&${g.reqRoleId}>\n` : ""}${
            g.extraRoleId ? `🎟 Extra role: <@&${g.extraRoleId}> (+${g.extraAmount})\n` : ""
          }\nClick **Join** to enter!\n\n👥 Entries: ${g.entries.size}`
        );
        try {
          await msg.edit({ embeds: [baseEmbed] });
        } catch {}
      };

      // Collector for button clicks
      const collector = msg.createMessageComponentCollector({ time: durationMs });

      collector.on("collect", async (i) => {
        if (!i.isButton()) return;
        if (i.customId !== "give_join" && i.customId !== "give_leave") return;

        // anti-bot
        if (i.user.bot) return i.reply({ content: "Bots cannot join giveaways.", ephemeral: true });

        const g = interaction.client.giveaways.get(msg.id);
        if (!g) return i.reply({ content: "Giveaway not found.", ephemeral: true });

        // check paused
        if (g.paused) return i.reply({ content: "This giveaway is paused.", ephemeral: true });

        // leave
        if (i.customId === "give_leave") {
          if (!g.entries.has(i.user.id)) return i.reply({ content: "You are not in the giveaway.", ephemeral: true });
          g.entries.delete(i.user.id);
          await i.reply({ content: "You left the giveaway.", ephemeral: true });
          await updateEmbed();
          return;
        }

        // join flow
        // required role check
        if (g.reqRoleId) {
          const member = await interaction.guild.members.fetch(i.user.id).catch(() => null);
          if (!member || !member.roles.cache.has(g.reqRoleId)) {
            return i.reply({ content: "You don't have the required role to join.", ephemeral: true });
          }
        }

        // if already joined, show message
        if (g.entries.has(i.user.id)) {
          return i.reply({ content: "You already joined.", ephemeral: true });
        }

        // calculate entries (1 base + extra if has extra role)
        let entryCount = 1;
        if (g.extraRoleId) {
          const member = await interaction.guild.members.fetch(i.user.id).catch(() => null);
          if (member && member.roles.cache.has(g.extraRoleId)) entryCount += g.extraAmount;
        }

        g.entries.set(i.user.id, entryCount);

        await i.reply({ content: `You joined! Entries: ${entryCount}`, ephemeral: true });
        await updateEmbed();
      });

      collector.on("end", async () => {
        // finalize giveaway
        const g = interaction.client.giveaways.get(msg.id);
        if (!g) return;
        if (g.entries.size === 0) {
          const e = new EmbedBuilder()
            .setTitle("Giveaway Ended")
            .setDescription(`No participants for **${g.prize}**.`)
            .setColor("Red");
          await msg.edit({ embeds: [e], components: [] }).catch(() => {});
          interaction.client.giveaways.delete(msg.id);
          return;
        }

        // build ticket pool
        let pool = [];
        for (const [userId, count] of g.entries) {
          for (let i = 0; i < count; i++) pool.push(userId);
        }

        const winners = [];
        for (let i = 0; i < g.winnersCount; i++) {
          if (pool.length === 0) break;
          const idx = Math.floor(Math.random() * pool.length);
          const winnerId = pool.splice(idx, 1)[0];
          if (!winners.includes(winnerId)) winners.push(winnerId);
        }

        // DM winners (best-effort)
        for (const w of winners) {
          try {
            const member = await interaction.guild.members.fetch(w);
            await member.send(`🎉 Congratulations! You won **${g.prize}** in **${interaction.guild.name}**'s giveaway!`);
          } catch {}
        }

        const e = new EmbedBuilder()
          .setTitle("🎉 GIVEAWAY ENDED")
          .setDescription(`**${g.prize}**\n\nWinners:\n${winners.map((id) => `<@${id}>`).join("\n")}`)
          .setColor("#00ff99");
        await msg.edit({ embeds: [e], components: [] }).catch(() => {});
        interaction.client.giveaways.delete(msg.id);
      });

      // periodic update interval every 10 seconds
      giveaway.interval = setInterval(async () => {
        const g = interaction.client.giveaways.get(msg.id);
        if (!g) return clearInterval(g.interval);
        const msLeft = g.endAt - Date.now();
        if (msLeft <= 0) {
          // do nothing; collector end will handle finalization
          clearInterval(g.interval);
        } else {
          // update embed
          const baseEmbed = EmbedBuilder.from(embed);
          baseEmbed.data.fields = [
            { name: "Prize", value: `${g.prize}`, inline: false },
            { name: "Winners", value: `${g.winnersCount}`, inline: true },
            { name: "Ends in", value: formatRemaining(msLeft), inline: true },
          ];
          baseEmbed.setDescription(
            `${g.reqRoleId ? `🔐 Required role: <@&${g.reqRoleId}>\n` : ""}${
              g.extraRoleId ? `🎟 Extra role: <@&${g.extraRoleId}> (+${g.extraAmount})\n` : ""
            }\nClick **Join** to enter!\n\n👥 Entries: ${g.entries.size}`
          );
          try {
            await msg.edit({ embeds: [baseEmbed] });
          } catch {}
        }
      }, 10000);

      // done starting
      return; // start sub finished
    } // end start

    // ---------- REROLL ----------
    if (sub === "reroll") {
      const messageId = interaction.options.getString("messageid");
      const data = interaction.client.giveaways.get(messageId);
      if (!data) return interaction.reply({ content: "Giveaway not found (or data lost).", ephemeral: true });
      if (data.entries.size === 0) return interaction.reply({ content: "No entries to choose from.", ephemeral: true });

      // build pool
      let pool = [];
      for (const [userId, count] of data.entries) for (let i = 0; i < count; i++) pool.push(userId);
      const winnerId = pool[Math.floor(Math.random() * pool.length)];
      await interaction.reply({ content: `🔁 Reroll winner: <@${winnerId}>`, ephemeral: false });
      try {
        const member = await interaction.guild.members.fetch(winnerId);
        await member.send(`🎉 You won in a reroll for **${data.prize}**!`);
      } catch {}
      return;
    }

    // ---------- PAUSE ----------
    if (sub === "pause") {
      const messageId = interaction.options.getString("messageid");
      const data = interaction.client.giveaways.get(messageId);
      if (!data) return interaction.reply({ content: "Giveaway not found.", ephemeral: true });
      if (data.paused) return interaction.reply({ content: "Already paused.", ephemeral: true });

      // stop collector by marking paused and adjust remaining
      data.paused = true;
      data.remaining = data.endAt - Date.now();
      // Note: collector can't be stopped easily here without reference; but we use paused flag to block joins
      return interaction.reply({ content: `⏸ Giveaway paused with ${formatRemaining(data.remaining)} remaining.`, ephemeral: true });
    }

    // ---------- RESUME ----------
    if (sub === "resume") {
      const messageId = interaction.options.getString("messageid");
      const data = interaction.client.giveaways.get(messageId);
      if (!data) return interaction.reply({ content: "Giveaway not found.", ephemeral: true });
      if (!data.paused) return interaction.reply({ content: "Giveaway is not paused.", ephemeral: true });

      // resume by setting new endAt and clearing paused flag
      data.paused = false;
      data.endAt = Date.now() + data.remaining;

      // we can't easily restart original collector after a full stop; easiest approach:
      // re-run a short helper that will create a new timeout to end the giveaway in memory.
      // We'll create a timed function that will finalize when time is up (best-effort).
      setTimeout(async () => {
        // finalize similar to collector end
        const g = interaction.client.giveaways.get(messageId);
        if (!g) return;
        if (g.entries.size === 0) {
          try {
            const msg = await interaction.channel.messages.fetch(messageId);
            await msg.edit({ embeds: [new EmbedBuilder().setTitle("Giveaway Ended").setDescription("No participants").setColor("Red")], components: [] });
          } catch {}
          interaction.client.giveaways.delete(messageId);
          return;
        }
        // pick winners
        let pool = [];
        for (const [userId, count] of g.entries) for (let i = 0; i < count; i++) pool.push(userId);
        const winners = [];
        for (let i = 0; i < g.winnersCount; i++) {
          if (pool.length === 0) break;
          const idx = Math.floor(Math.random() * pool.length);
          const winner = pool.splice(idx, 1)[0];
          winners.push(winner);
        }
        try {
          const msg = await interaction.channel.messages.fetch(messageId);
          await msg.edit({
            embeds: [new EmbedBuilder().setTitle("🎉 GIVEAWAY ENDED!").setDescription(`**${g.prize}**\n\nWinners:\n${winners.map((w) => `<@${w}>`).join("\n")}`).setColor("#00ff99")],
            components: [],
          });
        } catch {}
        // DM winners
        for (const w of winners) {
          try {
            const member = await interaction.guild.members.fetch(w);
            await member.send(`🎉 You won **${g.prize}**!`);
          } catch {}
        }
        interaction.client.giveaways.delete(messageId);
      }, data.remaining);

      return interaction.reply({ content: `▶ Giveaway resumed. It will end in ${formatRemaining(data.remaining)}.`, ephemeral: true });
    }
  },
};
