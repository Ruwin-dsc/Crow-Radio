const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const fs = require('fs');

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`[READY] ${client.user.tag} (${client.user.id}) est prêt | ${client.guilds.cache.size.toLocaleString('fr-FR')} serveurs | ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toLocaleString('fr-FR')} utilisateurs`.green);
    
    const config = require("../config.json");
    const guildId = "id de serveur pour les commandes de serveur";

    const commands = [];

    const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith(".js"));
    commandFiles.forEach(commandFile => {
      const command = require(`../commands/${commandFile}`);
      if (command.data && !command.botOwnerOnly) commands.push(command.data.toJSON());
    });

    const rest = new REST({ version: '10' }).setToken(config.token);

    rest.put(
      // Routes.applicationGuildCommands(clientId, guildId), { body: commands } // Guild commands
      Routes.applicationCommands(Buffer.from(config.token.split(".")[0], "base64").toString()), { body: commands } // Global commands
      )
	    .then((data) => console.log(`[SLASH] ${data.length} slashs enregistrés`.green))
	    .catch(console.error);
  }
}