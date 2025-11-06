/* eslint-disable no-console */
import '../config/config.mjs';
import Models from './models/index.js';
import databaseConfig from '../config/config.mjs';

import { Sequelize } from 'sequelize';

const env = process.env.NODE_ENV || 'development';
const config = databaseConfig[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true
    }
});

// Inicializa os modelos
for (const model of Object.values(Models)) {
    if (model.init) model.init(sequelize);
}

// Associa os modelos
for (const model of Object.values(Models)) {
    if (model.associate) model.associate(sequelize.models);
}

export default sequelize;
