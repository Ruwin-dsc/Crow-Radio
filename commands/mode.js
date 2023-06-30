const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const { getVoiceConnection } = require('@discordjs/voice')

module.exports = {
  name: "mode",
  description: "Modifie mon mode de fonctionnement",
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

    let roles = await client.db.all().filter(data => data.ID.startsWith(`dj_${interaction.guild.id}`)).sort((a, b) => b.data - a.data) || []
    if (roles.length > 0 && !djrole && !admin) return interaction.reply({content: "Vous ne pouvez pas utiliser cette commande", ephemeral: ephemeral})

    switch(interaction.options.get("mode").value){
      case "manu":
        client.db.set(`manuel_${interaction.guild.id}`, true)
        interaction.reply({content: "Je ne rejoindrait plus les salons automatiquement", ephemeral: ephemeral})
        break

      case "auto":
        client.db.delete(`manuel_${interaction.guild.id}`)
        interaction.reply({content: "Vous pouvez maintenant configurer un salon que je rejoindrait automatiquement quand des membres iront dedans", ephemeral: ephemeral})
        break
    }
  },
  get data() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => 
        o.setName("mode")
        .setDescription("Le nouveau mode")
        .setRequired(true)
        .addChoices(
          {name: "automatic", value: "auto"},
          {name: "manual", value: "manu"}
        ))
  }
}