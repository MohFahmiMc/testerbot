module.exports = {
    name: "ready",
    once: true,
    execute(client) {
        console.log(`${client.user.tag} is online!`);

        const statuses = [
            "ScarilyId Group",
            "ScarilyId Hosting",
            "ScarilyId SMP"
        ];
        let i = 0;

        setInterval(() => {
            client.user.setActivity(statuses[i % statuses.length], { type: "PLAYING" });
            i++;
        }, 3000);
    }
};
