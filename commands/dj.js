const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "dj",
  description: "Ajoute ou supprime un rôle DJ",
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
      case "add":
        const role = interaction.options.getRole("role")
        client.db.set(`dj_${interaction.guild.id}_${role.id}`, true)
        interaction.reply({content: `Le rôle <@&${role.id}> est maintenant un rôle DJ`, ephemeral: ephemeral})
        break

      case "del":
        const role2 = interaction.options.getRole("role")
        client.db.delete(`dj_${interaction.guild.id}_${role2.id}`)
        interaction.reply({content: `Le rôle <@&${role2.id}> n'est plus un rôle DJ`, ephemeral: ephemeral})
        break
    }
  },
  get data() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(sub => 
        sub.setName("add")
        .setDescription("Ajoute un rôle DJ")
        .addRoleOption(o => 
          o.setName("role")
          .setDescription("le rôle à ajouter")
          .setRequired(true)
        ))
      .addSubcommand(sub => 
        sub.setName("del")
        .setDescription("Supprime un rôle DJ")
        .addRoleOption(o =>
          o.setName("role")
          .setDescription("le rôle à supprimer")
          .setRequired(true)
          ))
  }
}