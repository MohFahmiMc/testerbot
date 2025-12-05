const fs = require("fs");
const path = require("path");

module.exports = (client) => {
    client.commands = new Map();

    const commandsPath = path.join(__dirname, "../commands");

    function loadCommands(folder) {
        const files = fs.readdirSync(folder);

        for (const file of files) {
            const filePath = path.join(folder, file);

            if (fs.lstatSync(filePath).isDirectory()) {
                loadCommands(filePath);
            } else if (file.endsWith(".js")) {
                const command = require(filePath);
                if (command.data && command.execute) {
                    client.commands.set(command.data.name, command);
                }
            }
        }
    }

    loadCommands(commandsPath);
    console.log("✅ Commands Loaded");
};
