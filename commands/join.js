const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ChannelType, BaseInteraction, CommandInteraction } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice')

module.exports = {
  name: "join",
  description: "Me fait rejoindre un salon",
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

    const channel = interaction.options.getChannel("channel", false, ChannelType.GuildVoice) || interaction.member.voice.channel
    if (!channel) return interaction.reply({content: "Veuillez spécifier un salon vocal ou en rejoindre un", ephemeral: ephemeral})
    if (!channel.viewable) return interaction.reply({content: "Je n'ai pas les permissions de me connecter dans ce salon", ephemeral: ephemeral})
    if (!channel.joinable) return interaction.reply({content: "Je n'ai pas les permissions de me connecter dans ce salon", ephemeral: ephemeral})

    interaction.reply({content: `Connexion à ${channel.name}`})

    const VoiceConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator
    });

    const live = createAudioResource("http://icecast.skyrock.net/s/natio_aac_128k"); 
    const player = createAudioPlayer()

    VoiceConnection.subscribe(player)
    player.play(live)

    if (client.db.get(`manual_${interaction.guild.id}`) !== true) client.db.set(`autochannel_${interaction.guild.id}`, channel.id)
    
  },
  get data() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addChannelOption(o => o
        .addChannelTypes(ChannelType.GuildVoice)
        .setName("channel")
        .setDescription("Le salon à rejoindre")
        .setRequired(false))
  }
}