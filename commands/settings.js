const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "settings",
  description: "Affiche les paramètres du bot",
  aliases: [],
  permissions: [PermissionsBitField.Flags.Administrator],
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

    const autochannel = await interaction.guild.channels.fetch(client.db.get(`autochannel_${interaction.guild.id}`)).catch(() => false)
    let roles = await client.db.all().filter(data => data.ID.startsWith(`dj_${interaction.guild.id}`)).sort((a, b) => b.data - a.data) 
    
    const embed = new EmbedBuilder()
    embed.setTitle("Paramètre du serveur")
    embed.setColor(0xFF0000)
    embed.setFooter({text: client.config.footer})
    embed.addFields({name: "Mode", value: `${client.db.get(`manuel_${interaction.guild.id}`) === true ? "Manuel" : "Automatique"}`, inline: true})
    if (!client.db.get(`manuel_${interaction.guild.id}`)) embed.addFields({name: "Salon", value: `${!autochannel.id ? "Aucun" : `<#${autochannel.id}>`}`, inline: true})
    embed.addFields({name: "Ephemeral", value: `DJ : ${client.db.get(`notephemeral_${interaction.guild.id}_dj`) === true ? "❌" : "✅" }\nAdmin : ${client.db.get(`notephemeral_${interaction.guild.id}_admin`) === true ? "❌" : "✅" }\nAutres : ${client.db.get(`notephemeral_${interaction.guild.id}_autres`) === true ? "❌" : "✅" }`, inline: true})
    embed.addFields({name: "Rôles DJ", value: `${!roles || roles.length === 0 ? "Aucun" : roles            
      .filter(x => interaction.guild.roles.cache.get(x.ID.split('_')[2]))
      .map((m, i) => `${interaction.guild.roles.cache.get(m.ID.split('_')[2])}`)
      .slice(0, 15)}`, inline: true}
    )

    interaction.reply({embeds: [embed], ephemeral: ephemeral})
  },
  get data() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
  }
}
