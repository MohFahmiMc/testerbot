const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botrestart')
    .setDescription('Restart bot via Railway (owner/admin only)'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const OWNER_ID = process.env.OWNER_ID;
    if (userId !== OWNER_ID) {
      return interaction.reply({ content: '❌ Forbidden.', ephemeral: true });
    }

    await interaction.reply({ content: '🔄 Initiating restart...', ephemeral: true });

    const PROJECT_ID = process.env.RAILWAY_PROJECT_ID;
    const SERVICE_ID = process.env.RAILWAY_SERVICE_ID;
    const DEPLOY_ID = process.env.RAILWAY_DEPLOYMENT_ID;
    const TOKEN = process.env.RAILWAY_TOKEN;

    if (!PROJECT_ID || !SERVICE_ID || !DEPLOY_ID || !TOKEN) {
      return interaction.editReply({ content: '❌ env vars missing.' });
    }

    const embed = new EmbedBuilder()
      .setTitle('🔧 Restarting Bot')
      .setColor('Yellow')
      .setDescription('Sending restart request to Railway...');

    const msg = await interaction.editReply({ embeds: [embed], fetchReply: true });

    // Kirim mutation ke API
    const query = `
      mutation {
        deploymentRestart(id: "${DEPLOY_ID}") {
          id
          status
        }
      }
    `;
    const response = await fetch('https://backboard.railway.app/graphql/v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    if (data.errors) {
      return interaction.editReply({ content: '❌ API error: ' + JSON.stringify(data.errors) });
    }

    // Monitoring progress (~example)
    let status = data.data.deploymentRestart.status;
    // … you can poll deployment status endpoint …

    embed
      .setTitle('✅ Restart Requested')
      .setColor('Green')
      .setDescription('Deployment restart requested.\nStatus: ' + status);

    await interaction.editReply({ embeds: [embed] });
  }
};
