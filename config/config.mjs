/* eslint-disable no-console */
import dotenv from 'dotenv';

// Carrega o arquivo .env baseado no ambiente
if (process.env.NODE_ENV) {
    const result = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
    if (result.error) {
        console.error('Erro ao carregar .env:', result.error);
    } else {
        console.log('✅ Arquivo .env carregado:', `.env.${process.env.NODE_ENV}`);
    }
}

// Verificação para debug apenas em desenvolvimento
if (process.env.NODE_ENV === 'development') {
    console.log('🌍 ENV NODE_ENV =', process.env.NODE_ENV);
    console.log('📦 DATABASE =', process.env.DB_DATABASE);
    console.log('🔗 DATABASE_URL_DB =', process.env.DATABASE_URL_DB);
    console.log('🏠 DB_HOST =', process.env.DB_HOST);
    console.log('👤 DB_USER =', process.env.DB_USER);
}

const config = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    },

    test: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        dialectOptions: {
            ssl: false
        }
    },

    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
};

export default config;
