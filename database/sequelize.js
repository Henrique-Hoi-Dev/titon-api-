import 'dotenv/config';
import '../config/config.mjs';
import Models from './models/index.js';

import { Sequelize } from 'sequelize';

const isSSL = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(process.env.DATABASE_URL_DB, {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: isSSL
        ? {
              ssl: {
                  require: true,
                  rejectUnauthorized: false
              }
          }
        : {},
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
