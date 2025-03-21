const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Joue un fichier MP3 dans le salon vocal')
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('Le fichier MP3 à jouer')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply(); // Informe Discord que la réponse va prendre plus de temps

        const attachment = interaction.options.getAttachment('file');

        if (!attachment.contentType.startsWith('audio/mpeg')) {
            return interaction.followUp({ content: 'Veuillez télécharger un fichier MP3 valide.', ephemeral: true });
        }

        // Vérifier si l'utilisateur est dans un salon vocal
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.followUp({ content: 'Vous devez être dans un salon vocal pour utiliser cette commande.', ephemeral: true });
        }

        // Télécharger le fichier MP3
        const response = await axios({
            url: attachment.url,
            method: 'GET',
            responseType: 'stream',
        });

        const musicDir = path.join(__dirname, '..', '..', 'music');
        if (!fs.existsSync(musicDir)) {
            fs.mkdirSync(musicDir, { recursive: true });
        }

        const filePath = path.join(musicDir, attachment.name);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Vérifier si le fichier a été correctement téléchargé
        if (!fs.existsSync(filePath)) {
            return interaction.followUp({ content: 'Erreur lors du téléchargement du fichier MP3.', ephemeral: true });
        }

        // Rejoindre le salon vocal
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        // Créer un lecteur audio
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        // Créer une ressource audio à partir du fichier MP3
        const resource = createAudioResource(filePath);

        // Jouer le fichier audio
        player.play(resource);
        connection.subscribe(player);

        await interaction.followUp({ content: `Joue le fichier : ${attachment.name}` , ephemeral: true });

        // Quitter le salon vocal après la lecture
        player.on('stateChange', (oldState, newState) => {
            if (newState.status === 'idle') {
                connection.destroy();
                fs.unlinkSync(filePath); // Supprimer le fichier après lecture
            }
        });
    },
};
