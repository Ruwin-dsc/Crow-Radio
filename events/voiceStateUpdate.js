const { getVoiceConnection, joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice')

module.exports = {
  name: "voiceStateUpdate",
  async execute(client, oldState, newState) {
    if (oldState){
      if (!oldState.guild.members.me.voice.channel) return;
      if (oldState.channel.id !== oldState.guild.members.me.voice.channel.id) return;
      if (oldState.channel.members.size - 1) return;

      setInterval(() => {
        const c = getVoiceConnection(oldState.guild.id)
          if (c) c.destroy()
      }, 1000 * 60 * 10);
    }

    if (newState){
      if (client.db.get(`manual_${newState.guild.id}`) === true) return;
      
      const channel = await newState.guild.channels.fetch(client.db.get(`autochannel_${newState.guild.id}`)).catch(() => false)
      if (!channel) return;
      if (newState.channel.id !== channel.id) return;

      const VoiceConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
      });
  
      const live = createAudioResource("http://icecast.skyrock.net/s/natio_aac_128k"); 
      const player = createAudioPlayer()
  
      VoiceConnection.subscribe(player)
      player.play(live)
    }
  }
}