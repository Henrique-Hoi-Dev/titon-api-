import 'dotenv/config';
import bootstrap from './bootstrap.js';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import compress from 'compression';
import cors from 'cors';
import hpp from 'hpp';
import session from 'express-session';
import i18n from 'i18n';
import addRouters from './routers.js';
import csrf from 'csurf';
import middleware from './middleware.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pinoHttp } from 'pino-http';

bootstrap(process.env.NODE_ENV || 'development');

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);

const memoryStore = new session.MemoryStore();
const csrfProtection = csrf({
    cookie: true,
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'DELETE', 'PATCH']
});

const app = express();

app.use(pinoHttp());

i18n.configure({
    locales: ['en'],
    defaultLocale: 'en',
    directory: join(currentDirPath, '../../locale/error'),
    objectNotation: false,
    register: global,
    updateFiles: false,
    syncFiles: false
});

const rawBodySaver = function (req, res, buffer, encoding) {
    if (buffer?.length) {
        req.rawBody = buffer.toString(encoding || 'utf8');
    }
};

app.use(compress());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    })
);
app.use(
    bodyParser.json({
        limit: '50mb',
        verify: rawBodySaver
    })
);
app.use(
    bodyParser.urlencoded({
        verify: rawBodySaver,
        limit: '50mb',
        extended: true
    })
);

app.use(
    hpp({
        whitelist: []
    })
);

const routers = {};
routers.v1 = express.Router();

app.set('port', process.env.PORT_SERVER || 3000);
app.use(i18n.init);

app.disable('x-powered-by');

app.use(helmet.noSniff());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());

app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.set('Content-Security-Policy', "frame-ancestors 'none'");

    return next();
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: memoryStore
    })
);

app.use(cookieParser());

app.use('/v1/', routers.v1);
app.use('/', routers.v1);

addRouters(routers.v1);

app.use(csrfProtection);

app.use(middleware.throw404);
app.use(middleware.logError);
app.use(middleware.handleError);

export default app;
