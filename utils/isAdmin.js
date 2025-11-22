const fs = require("fs");
const path = require("path");

function isAdmin(userId) {
    if (userId === process.env.OWNER_ID) return true; // owner selalu admin
    const filePath = path.join(__dirname, "..", "data", "admins.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return data.admins.includes(userId);
}

module.exports = isAdmin;
