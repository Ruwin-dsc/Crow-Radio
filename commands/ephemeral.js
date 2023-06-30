const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ephemeral",
  description: "Configure les messages invisibles pour certains membres du serveur",
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
    switch(interaction.options.getSubcommand()){
      case "admin":
        if (interaction.options.get("valeur").value === "on"){
          client.db.delete(`notephemeral_${interaction.guild.id}_admin`)
          interaction.reply({content: "Les commandes des admin seront maintenant invisible", ephemeral: true})
        }
        else {
          client.db.set(`notephemeral_${interaction.guild.id}_admin`, true)
          interaction.reply({content: "Les commandes des admin seront maintenant visible", ephemeral: true})
        }
        break

      case "dj":
        if (interaction.options.get("valeur").value === "on"){
          client.db.delete(`notephemeral_${interaction.guild.id}_dj`)
          interaction.reply({content: "Les commandes des dj seront maintenant invisible", ephemeral: true})
        }
        else {
          client.db.set(`notephemeral_${interaction.guild.id}_dj`, true)
          interaction.reply({content: "Les commandes des dj seront maintenant visible", ephemeral: true})
        }
        break

      case "other":
        if (interaction.options.get("valeur").value === "on"){
          client.db.delete(`notephemeral_${interaction.guild.id}_autres`)
          interaction.reply({content: "Les commandes des autres membres seront maintenant invisible", ephemeral: true})
        }
        else {
          client.db.set(`notephemeral_${interaction.guild.id}_autres`, true)
          interaction.reply({content: "Les commandes des autres membres seront maintenant visible", ephemeral: true})
        }
    }
  },
  get data() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(sub => 
        sub.setName("dj")
        .setDescription("Modifie la visibilité des commandes DJs")
        .addStringOption(o => 
          o.setName("valeur")
          .setDescription("on ou off")
          .setRequired(true)
          .addChoices(
            {name: "on", value: "on"},
            {name: "off", value: "off"}
          )))
      .addSubcommand(sub => 
        sub.setName("other")
        .setDescription("Modifie la visibilité des commandes autres membres")
        .addStringOption(o =>
          o.setName("valeur")
          .setDescription("on ou off")
          .setRequired(true)
          .addChoices(
            {name: "on", value: "on"},
            {name: "off", value: "off"}
          )))
      .addSubcommand(sub => 
        sub.setName("admin")
        .setDescription("Modifie la visibilité des commandes admins")
        .addStringOption(o => 
          o.setName("valeur")
          .setDescription("on ou off")
          .setRequired(true)
          .addChoices(
            {name: "on", value: "on"},
            {name: "off", value: "off"}
          )))
  }
}