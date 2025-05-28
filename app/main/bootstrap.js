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

    if (result.error) {
        console.error(`❌ Falha ao carregar variáveis de ambiente de ${path}`);
    } else if (environment === 'development') {
        console.log(`✅ Variáveis carregadas de ${path}`, result.parsed);
    }
};

export default bootstrap;
