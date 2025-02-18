const { Sequelize } = require('sequelize');
require('dotenv').config();

const { DATABASE_NAME } = process.env.DATABASE_NAME;
const { DATABASE_PASSWORD } = process.env.DATABASE_PASSWORD;
const { DATABASE_USER } = process.env.DATABASE_USER;

const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, {
    host: '192.168.1.116',  // Votre Raspberry Pi
    dialect: 'mysql',
    logging: false,  // Désactive les logs SQL
});

module.exports = sequelize;
