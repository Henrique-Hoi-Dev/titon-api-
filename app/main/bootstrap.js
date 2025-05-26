import dotenv from 'dotenv';

const bootstrap = (environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'development') => {
    let environmentVariables = {};

    if (environment === 'production') {
        const result = dotenv.config();
        if (result.parsed) {
            environmentVariables = result.parsed;
        }
    }
    if (environment === 'test') {
        const result = dotenv.config({ path: '.env.test' });
        if (result.parsed) {
            environmentVariables = result.parsed;
        }
    }
    if (environment === 'development') {
        const result = dotenv.config({ path: '.env.development' });
        if (result.parsed) {
            environmentVariables = result.parsed;
        }
    }

    // Carrega as variáveis no process.env
    for (const key in environmentVariables) {
        process.env[key] = environmentVariables[key];
    }

    // Log para debug
    // eslint-disable-next-line no-console
    console.log(`Ambiente: ${environment}`);
    // eslint-disable-next-line no-console
    if (environment === 'test' || environment === 'development') {
        // eslint-disable-next-line no-console
        console.log('Variáveis carregadas:', environmentVariables);
    }
};

export default bootstrap;
