import bootstrap from './app/main/bootstrap.js';
import app from './app/main/app.js';
import database from './database/sequelize.js';
import logger from './app/utils/logger.js';

let server;

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        bootstrap();
        await database.authenticate();
        await database.sync();

        logger.info('✅ Database connected and models synced.');
        logger.info('✅ NODE_ENV: ', process.env.NODE_ENV);

        // Evita subir o servidor nos testes
        if (process.env.NODE_ENV !== 'test') {
            server = app.listen(PORT, () => {
                logger.info(`🚀 App running at port ${PORT} on ${process.env.NODE_ENV}.`);
            });
        }
    } catch (error) {
        logger.error(`❌ Failed to connect to the database: ${error}`);

        // Evita matar a pipeline se for ambiente de teste
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
    }
};

startServer();

const closeServer = async () => {
    if (server) {
        await server.close();
    }

    await database.close();

    logger.warn('🛑 All requests stopped, shutting down');
};

const gracefulShutdownHandler = function gracefulShutdownHandler(signal) {
    logger.warn(`🛑 Caught ${signal}, gracefully shutting down`);

    setTimeout(() => {
        closeServer();
    }, 0);
};

process.on('SIGINT', gracefulShutdownHandler);
process.on('SIGTERM', gracefulShutdownHandler);
process.on('SIGQUIT', gracefulShutdownHandler);

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`❗ Unhandled promise: ${promise}, reason: ${reason}`);
    throw reason;
});

process.on('uncaughtException', (error) => {
    logger.error(`❗ Uncaught exception: ${error}`);
    process.exit(1);
});

export { app, server, closeServer };
