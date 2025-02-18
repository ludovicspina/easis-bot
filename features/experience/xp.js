const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Affiche votre nombre de points d\'expérience.'),
    async execute(interaction) {
        try {
            const id = interaction.user.id;
            const user = await User.findOne({ where: { id } });

            if (user) {
                await interaction.reply(`Vous avez ${user.xp} points d'expérience.`);
            } else {
                await interaction.reply(`Vous n'avez pas encore de points d'expérience.`);
            }
        } catch (error) {
            console.error(error);
            await interaction.reply('Une erreur est survenue lors de la récupération de vos points d\'expérience.');
        }
    },
};
