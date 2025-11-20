module.exports = {
    name: 'clear',
    description: 'Hapus pesan',
    async execute(message, args){
        if(!message.member.permissions.has("ManageMessages")) return message.reply("Kamu tidak punya izin!");
        const amount = parseInt(args[0]);
        if(isNaN(amount)) return message.reply("Masukkan angka yang valid!");
        message.channel.bulkDelete(amount).then(() => {
            message.channel.send(`${amount} pesan dihapus!`).then(msg => setTimeout(() => msg.delete(), 5000));
        });
    }
};
