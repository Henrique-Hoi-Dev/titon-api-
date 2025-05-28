import 'dotenv/config';
import Models from './models/index.js';
import databaseConfig from '../config/config.cjs';

import { Sequelize } from 'sequelize';

const env = process.env.NODE_ENV;
const config = databaseConfig[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: console.log,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true
    }
});

// Inicializa os modelos
for (const model of Models) {
    if (model.init) {
        model.init(sequelize);
    }
}

// Associa os modelos
for (const model of Models) {
    if (model.associate) {
        model.associate(sequelize.models);
    }
}

// Verifica a conexão
sequelize
    .authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch((err) => console.error('Unable to connect to the database:', err));

export default sequelize;
