const cron = require('node-cron');

// Structure de données pour stocker les pseudonymes et les horaires
const userPseudos = [
    {
        userName: 'NomUtilisateur1234', // Remplacez par le nom d'utilisateur complet
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
            const members = await guild.members.search({ query: user.userName, limit: 1 });
            const member = members.first();
            if (!member) {
                console.warn(`Member with name ${user.userName} not found in the guild.`);
                continue;
            }

            const { startHour, endHour, pseudo } = user.timeBasedPseudo;
            if ((currentHour >= startHour || currentHour < endHour)) {
                await member.setNickname(pseudo).catch(console.error);
            } else {
                await member.setNickname(user.defaultPseudo).catch(console.error);
            }
        } catch (error) {
            console.error(`Error updating nickname for user ${user.userName}:`, error);
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
