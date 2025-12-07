// commands/moderation/automod.js
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "../../utils/automodConfig.json");

function loadConfig() {
    if (!fs.existsSync(CONFIG_PATH)) fs.writeFileSync(CONFIG_PATH, JSON.stringify({
        linkAutomod: false,
        allowedRoles: ["@Moderation","@Owner"],
        whitelistDomains: [],
        spam: { enabled: false, messagesWindow: 5000, messageThreshold: 5, muteMinutes: 10 },
        logChannel: null
    }, null, 2));
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function saveConfig(cfg) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("automod")
        .setDescription("Automod configuration")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(s => s.setName("link")
            .setDescription("Toggle link automod on/off")
            .addStringOption(o => o.setName("action").setDescription("on/off/show").setRequired(true)))
        .addSubcommand(s => s.setName("whitelist")
            .setDescription("Add or remove domain whitelist")
            .addStringOption(o => o.setName("action").setDescription("add/remove/list").setRequired(true))
            .addStringOption(o => o.setName("domain").setDescription("domain (example: youtube.com)")))
        .addSubcommand(s => s.setName("allowrole")
            .setDescription("Manage roles that are allowed to post links")
            .addStringOption(o => o.setName("action").setDescription("add/remove/list").setRequired(true))
            .addRoleOption(o => o.setName("role").setDescription("role to add/remove")))
        .addSubcommand(s => s.setName("logchannel")
            .setDescription("Set mod log channel")
            .addChannelOption(o => o.setName("channel").setDescription("channel for logs (or 'none')"))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const cfg = loadConfig();

        if (sub === "link") {
            const action = interaction.options.getString("action");
            if (action === "on") cfg.linkAutomod = true;
            else if (action === "off") cfg.linkAutomod = false;
            else if (action === "show") return interaction.reply({ content: `Link automod is ${cfg.linkAutomod ? "ON" : "OFF"}. Allowed roles: ${cfg.allowedRoles.join(", ")}. Whitelist: ${cfg.whitelistDomains.join(", ") || "none"}`, ephemeral: true });
            saveConfig(cfg);
            return interaction.reply({ content: `Link automod set to ${cfg.linkAutomod}`, ephemeral: true });
        }

        if (sub === "whitelist") {
            const action = interaction.options.getString("action");
            if (action === "list") return interaction.reply({ content: `Whitelist: ${cfg.whitelistDomains.join(", ") || "none"}`, ephemeral: true });
            const domain = interaction.options.getString("domain");
            if (!domain) return interaction.reply({ content: "Please provide domain", ephemeral: true });
            if (action === "add") {
                if (!cfg.whitelistDomains.includes(domain)) cfg.whitelistDomains.push(domain);
                saveConfig(cfg);
                return interaction.reply({ content: `Added ${domain} to whitelist`, ephemeral: true });
            } else if (action === "remove") {
                cfg.whitelistDomains = cfg.whitelistDomains.filter(d => d !== domain);
                saveConfig(cfg);
                return interaction.reply({ content: `Removed ${domain} from whitelist`, ephemeral: true });
            }
        }

        if (sub === "allowrole") {
            const action = interaction.options.getString("action");
            if (action === "list") return interaction.reply({ content: `Allowed roles: ${cfg.allowedRoles.join(", ")}`, ephemeral: true });
            const role = interaction.options.getRole("role");
            if (!role) return interaction.reply({ content: "Pick a role", ephemeral: true });
            const name = `@${role.name}`;
            if (action === "add") {
                if (!cfg.allowedRoles.includes(name)) cfg.allowedRoles.push(name);
                saveConfig(cfg);
                return interaction.reply({ content: `Role ${name} added to allowed list`, ephemeral: true });
            } else if (action === "remove") {
                cfg.allowedRoles = cfg.allowedRoles.filter(r => r !== name);
                saveConfig(cfg);
                return interaction.reply({ content: `Role ${name} removed`, ephemeral: true });
            }
        }

        if (sub === "logchannel") {
            const channel = interaction.options.getChannel("channel");
            if (!channel) {
                cfg.logChannel = null;
                saveConfig(cfg);
                return interaction.reply({ content: "Log channel cleared", ephemeral: true });
            }
            cfg.logChannel = channel.id;
            saveConfig(cfg);
            return interaction.reply({ content: `Log channel set to ${channel}`, ephemeral: true });
        }
    }
};
