import { Sequelize } from 'sequelize';
import Models from './models/index.js';
import databaseConfig from '../config/config.cjs';

const env = process.env.NODE_ENV || 'development';
const config = databaseConfig[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false,
    define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true
    }
});

// Inicializa os modelos
Models.forEach((model) => {
    if (model.initModel) {
        model.initModel(sequelize);
    }
});

// Associa os modelos
Models.forEach((model) => {
    if (model.associate) {
        model.associate(sequelize.models);
    }
});

export default sequelize;
