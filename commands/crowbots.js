const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "crowbots",
  description: "Affiche une invitation pour rejoindre le serveur de support du bot",
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

    const embed = new EmbedBuilder()
    .setDescription("[Cliquez pour rejoindre le support ζ͜͡Crow Bots](https://discord.gg/uzE3GP3MTc)")
    .setColor(0xFF0000)
    interaction.reply({embeds: [embed], ephemeral: ephemeral})
  },
  get data() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
  }
}