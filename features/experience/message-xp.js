const { Events } = require('discord.js');
const User = require('../../database/models/User');
const path = require('node:path');
const { AttachmentBuilder } = require('discord.js');

module.exports = (client) => {
    client.on(Events.MessageCreate, async (message) => {
        // Empêche le bot de répondre à ses propres messages
        if (message.author.bot) return;

        // Ajouter des points d'expérience à l'utilisateur
        const id = message.author.id;
        const username = message.author.username;

        let user = await User.findOne({ where: { id } });

        if (!user) {
            user = await User.create({ id, username, xp: 0 });
        }

        user.xp += 5;
        await user.save();
    });
};
