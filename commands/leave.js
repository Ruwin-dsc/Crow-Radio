const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const { getVoiceConnection } = require('@discordjs/voice')

module.exports = {
  name: "leave",
  description: "Me fait quitter mon salon actuel",
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
    if (roles.length > 0 && !djrole && !admin) return interaction.reply({content: "Vous ne pouvez pas utiliser cette commande", ephemeral: ephemeral})

    const connection = getVoiceConnection(interaction.guild.id)
    if (!connection) return interaction.reply({content: "Je ne suis connecté à aucun salon vocal", ephemeral: ephemeral})

    connection.destroy()
    interaction.reply({content: "Je quitte", ephemeral: ephemeral})
  },
  get data() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
  }
}