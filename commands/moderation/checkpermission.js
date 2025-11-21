module.exports = {
    name: "checkpermissions",
    description: "Menampilkan permission member di server",
    execute(message, args) {
        const member = message.mentions.members.first() || message.member;
        const perms = member.permissions.toArray().join(", ");
        message.channel.send(`Permissions ${member.user.tag}: ${perms}`);
    }
};
