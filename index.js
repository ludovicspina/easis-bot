const fs = require('node:fs');
const path = require('node:path');
const {Client, Events, GatewayIntentBits, Collection, AttachmentBuilder} = require('discord.js');
const sequelize = require('./database/database');
const User = require('./database/models/User');
const foldersPath = path.join(__dirname, 'features');
const commandFolders = fs.readdirSync(foldersPath);
const Guild = require('./database/models/Guild');

require("dotenv").config();

// Intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,  // Si vous voulez traiter le contenu des messages
        GatewayIntentBits.GuildMembers,  // Si vous avez besoin d'accéder aux membres
        GatewayIntentBits.GuildVoiceStates,
    ],

});

// Syncro DB
sequelize.sync().then(() => {
    console.log('Base de données synchronisée');
}).catch(err => {
    console.error('Erreur lors de la synchronisation de la base de données :', err);
});

// Initialisation des commandes
client.commands = new Collection();
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Vérification des interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
        }
    }
});


// Importer le module pmu et initialiser le module pmu avec le client
const setupPmu = require('./features/throne/pmu');
setupPmu(client);

// Importer le module pseudo et initialiser le module pseudo avec le client
const setupPseudo = require('./features/utility/pseudo');
setupPseudo(client);


client.on('messageCreate', async (message) => {
    // Empêche le bot de répondre à ses propres messages
    if (message.author.bot) return;

    // Vérifie si le message mentionne le bot
    if (message.mentions.has(client.user)) {
        // Crée une pièce jointe avec le GIF local
        const gifPath = path.join(__dirname, 'images/ooze.gif'); // Remplacez 'monGif.gif' par le nom de votre fichier
        const attachment = new AttachmentBuilder(gifPath);

        await message.reply({ files: [attachment] });
    }
});


// Ready up
client.once(Events.ClientReady, readyClient => {
    console.log(`Up as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);