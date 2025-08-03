/* eslint-disable no-console */
import dotenv from 'dotenv';

const bootstrap = (environment = process.env.NODE_ENV) => {
    let path;

    if (environment === 'production') {
        path = '.env';
    } else if (environment === 'development') {
        path = '.env.development';
    } else if (environment === 'test') {
        path = '.env.test';
    } else {
        console.warn(`⚠️ Ambiente desconhecido: "${environment}", usando .env padrão`);
        path = '.env';
    }

    const result = dotenv.config({ path });

    if (environment === 'development') {
        console.log(`✅ Variáveis carregadas de ${path}`, result.parsed);
    } else if (environment === 'production') {
        console.log(`✅ Variáveis carregadas de ${path}`);
    }
};

export default bootstrap;
