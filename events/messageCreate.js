module.exports = {
    name: "messageCreate",
    async execute(client, message) {
        if (message.channel.isDMBased() || message.author.bot) return;
        if (message.content === `<@${client.user.id}>`) return message.channel.send("J'utilise maintenant les commandes slash, faites `/help` pour voir mes nouvelles fonctionnalités")
    }
}