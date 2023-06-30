const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "help",
  description: "Affiche les commandes du bot",
  aliases: [],
  permissions: [PermissionsBitField.Flags.ViewChannel],
  async executeSlash(client, interaction) {

    let admin = false
    let djrole = false
    let ephemeral = true

    if (client.db.get(`notephemeral_${interaction.guild.id}_autres`) === true) ephemeral = false

    if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) admin = true
    if (admin === true && client.db.get(`notephemeral_${interaction.guild.id}_admin`) === true) ephemeral = false

    interaction.member.roles.cache.forEach(r => {
      if (client.db.get(`notephemeral_${interaction.guild.id}_dj`) !== true) return
      if (client.db.get(`dj_${interaction.guild.id}_${r.id}`) !== true) return
      djrole = true
      ephemeral = false
    })

    let roles = await client.db.all().filter(data => data.ID.startsWith(`dj_${interaction.guild.id}`)).sort((a, b) => b.data - a.data) || []

    const embed = new EmbedBuilder()
    embed.setTitle("Liste des commandes disponibles")
    embed.setColor(0xFF0000)
    if (roles.length > 0 && djrole || admin) embed.addFields({name: "`/join [salon]`", value: "Me fait rejoindre un salon"})
    if (roles.length > 0 && djrole || admin) embed.addFields({name: "`/leave`", value: "Me fait quitter mon salon actuel"})
    if (roles.length > 0 && djrole || admin) embed.addFields({name: "`/mode <automatic/manual>`", value: "En mode automatique, je rejoins automatiquement quand quelqu'un va dans mon salon, en mode manuel je ne rejoins que quand quelqu'un utilise la commande `/join`"})
    if (roles.length > 0 && djrole || admin) embed.addFields({name: "`/ephemeral <admin/dj/other> <on/off>`", value: "Configure les messages invisibles pour certains membres du serveur"})
    if (roles.length > 0 && djrole || admin) embed.addFields({name: "`/dj <add/del> <role>`", value: "Ajoute ou supprime un rôle DJ"})
    if (roles.length > 0 && djrole || admin) embed.addFields({name: "`/settings`", value: "Affiche les paramètres du bot"})
    embed.addFields({name: "`/crowbots`", value: "Affiche une invitation pour rejoindre le serveur de support du bot"})
    embed.setFooter({text: "ζ͜͡Crow Bots"})
    interaction.reply({embeds: [embed], ephemeral: ephemeral})
  },
  get data() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
  }
}