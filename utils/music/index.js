// utils/music/index.js
const { QueryType } = require("discord-player");
module.exports.search = async (client, query) => {
    const res = await client.player.search(query, { requestedBy: null, searchEngine: QueryType.AUTO });
    return res;
};
