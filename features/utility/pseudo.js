const cron = require('node-cron');

// Structure de données pour stocker les pseudonymes et les horaires
const userPseudos = [
    {
        userId: '117411845966397445',
        defaultPseudo: '🐗Tetsel🐗',
        timeBasedPseudo: {
            startHour: 23,
            endHour: 7,
            pseudo: 'Dédé',
        },
    },
    {
        userId: '977565278730870814',
        defaultPseudo: '131',
        timeBasedPseudo: {
            startHour: 23,
            endHour: 7,
            pseudo: 'Bèbèr',
        },
    },
    // Ajoutez d'autres utilisateurs ici avec leurs pseudonymes et horaires
];

// Fonction pour changer les pseudonymes des utilisateurs
async function updateUserNicknames(client) {
    const now = new Date();
    const currentHour = now.getHours();

    for (const user of userPseudos) {
        const member = await client.guilds.cache.first()?.members.fetch(user.userId).catch(console.error);
        if (!member) continue;

        const { startHour, endHour, pseudo } = user.timeBasedPseudo;
        if ((currentHour >= startHour || currentHour < endHour)) {
            await member.setNickname(pseudo).catch(console.error);
        } else {
            await member.setNickname(user.defaultPseudo).catch(console.error);
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
