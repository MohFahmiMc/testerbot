const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../commands/data/commandLogs.json");

// Pastikan file log ada
function initLogFile() {
    if (!fs.existsSync(path.dirname(logFile))) {
        fs.mkdirSync(path.dirname(logFile), { recursive: true });
    }

    if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, JSON.stringify([]));
    }
}

initLogFile();

module.exports = {
    logCommand(commandName, userId) {
        const logs = JSON.parse(fs.readFileSync(logFile));
        logs.push({
            command: commandName,
            user: userId,
            timestamp: Date.now()
        });
        fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    }
};
