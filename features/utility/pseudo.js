const cron = require('node-cron');

// Structure de données pour stocker les pseudonymes et les horaires
const userPseudos = [
    {
        userId: 117411845966397445, // Remplacez par l'ID de l'utilisateur
        defaultPseudo: '🐗Tetsel🐗',
        timeBasedPseudo: {
            startHour: 23,
            endHour: 7,
            pseudo: 'Dédé',
        },
    },
    // Ajoutez d'autres utilisateurs ici avec leurs pseudonymes et horaires
];

// Fonction pour changer les pseudonymes des utilisateurs
async function updateUserNicknames(client) {
    const now = new Date();
    const currentHour = now.getHours();

    const guild = client.guilds.cache.first();
    if (!guild) {
        console.error('Guild not found.');
        return;
    }

    for (const user of userPseudos) {
        try {
            const member = await guild.members.fetch(user.userId).catch(() => null);
            if (!member) {
                console.warn(`Member with ID ${user.userId} not found in the guild.`);
                continue;
            }

            const { startHour, endHour, pseudo } = user.timeBasedPseudo;
            if ((currentHour >= startHour || currentHour < endHour)) {
                await member.setNickname(pseudo).catch(console.error);
            } else {
                await member.setNickname(user.defaultPseudo).catch(console.error);
            }
        } catch (error) {
            console.error(`Error updating nickname for user ${user.userId}:`, error);
        }
    }
}

module.exports = (client) => {
    // Planifier une tâche toutes les heures pour vérifier l'heure
    cron.schedule('0 * * * *', () => updateUserNicknames(client));

    // Appeler la fonction une fois au démarrage pour s'assurer que les pseudos sont corrects
    client.once('ready', () => {
        updateUserNicknames(client);
    });
};
