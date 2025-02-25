const cron = require('node-cron');
const { Events } = require('discord.js');

// ID du salon vocal
const channelId = '1297657784116183061';

// Fonction pour renommer le salon vocal
async function renameChannel(client) {
    const channel = client.channels.cache.get(channelId);
    if (!channel) return;

    const now = new Date();
    const hours = now.getHours();
    const members = channel.members.size;

    if ((hours >= 23 || hours < 7) && members < 5) {
        await channel.setName('🍺│PMU');
    } else {
        await channel.setName('🚪│Le Hall');
    }
}

module.exports = (client) => {
    // Écouter les changements de statut vocal
    client.on('voiceStateUpdate', (oldState, newState) => {
        if (newState.channelId === channelId || oldState.channelId === channelId) {
            renameChannel(client);
        }
    });

    // Planifier une tâche toutes les heures pour vérifier l'heure
    cron.schedule('0 * * * *', () => renameChannel(client));

    // Appeler la fonction une fois au démarrage pour s'assurer que le nom est correct
    client.once(Events.ClientReady, () => {
        renameChannel(client);
    });
};
