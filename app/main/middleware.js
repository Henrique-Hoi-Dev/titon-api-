import ev from 'express-validation';
import _ from 'lodash';
import ValidationsErrorHandler from './validations_error_handler.js';
import keys from '../utils/error_mapping.js';
import { verifyKeycloackToken, verifyMyCashToken, verifyInternalApiToken } from '../utils/jwt.js';
import { checkUserHasAccess } from '../utils/auth.js';
import logger from '../utils/logger.js';

const validationsErrorHandler = new ValidationsErrorHandler();

function logError(err, req, res, next) {
    try {
        if (err) {
            logger.error('logError');
            logger.error(err);
            logger.error(JSON.stringify(err, null, 2));
            return next(err);
        } else {
            return next();
        }
    } catch (error) {
        logger.error('logError catch');
        logger.error(error);

        if (err) {
            return next(err);
        } else {
            return next();
        }
    }
}

function handleError(err, req, res, next) {
    if (err) {
        if (err.response) res.status(err.response.status).json(err.response.data);
        err.key = err.key ? err.key : err.message;
        err.errorCode = keys[err.key];
        err.message = res.__(err.message);

        if (err instanceof ev.ValidationError || err.error === 'Unprocessable Entity') {
            err = validationsErrorHandler.errorResponse(err);
        } else if (err instanceof Error) {
            err = _.pick(err, [
                'message',
                'status',
                'key',
                'errorCode',
                'local',
                'field',
                'reasons',
                'registered',
                'rejected'
            ]);
        }

        const status = err.status || 422;
        delete err.status;
        res.status(status).json(err);
    } else {
        next();
    }
}

function throw404(req, res, next) {
    let err = new Error();
    err.status = 404;
    err.message = 'API_ENDPOINT_NOT_FOUND';
    next(err);
}

function verifyInternalToken(req, res, next) {
    try {
        const token = req.header('Authorization-internal').replace('Bearer ', '');
        const decodedToken = verifyInternalApiToken(token);

        if (!decodedToken) {
            const error = new Error('INVALID_TOKEN');
            error.status = 401;
            next(error);
        }

        next();
    } catch (err) {
        const error = new Error('INVALID_TOKEN');
        error.status = 401;
        next(error);
    }
}

function verifyIfUserHasAccess(accessArray) {
    return function (req, res, next) {
        try {
            if (!req?.locals?.user?.sub || !req?.locals?.user?.accessControl) {
                const token = req?.header('Authorization')?.replace('Bearer ', '');

                const decodedToken = verifyKeycloackToken(token);
                req.locals = { ...req.locals, user: decodedToken };
            }

            if (!checkUserHasAccess(accessArray, req?.locals?.user)) {
                const err = new Error('INSUFFICIENT_PERMISSIONS');
                err.status = 403;
                throw err;
            }

            next();
        } catch (err) {
            logger.error(err);

            if (err.message === 'INSUFFICIENT_PERMISSIONS') {
                next(err);
            }

            const error = new Error('INVALID_TOKEN');
            error.status = 401;
            next(error);
        }
    };
}

async function verifyMyCashInternalToken(req, res, next) {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        const decodedToken = verifyMyCashToken(token);
        req.locals = { ...req.locals, user: decodedToken };

        next();
    } catch (err) {
        const error = new Error('INVALID_TOKEN');
        error.status = 401;
        next(error);
    }
}

async function verifyKeycloackInternalToken(req, res, next) {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        const decodedToken = verifyKeycloackToken(token);
        req.locals = { ...req.locals, user: decodedToken };

        next();
    } catch (err) {
        const error = new Error('INVALID_TOKEN');
        error.status = 401;
        next(error);
    }
}

async function ensureAuthorization(req, res, next) {
    if (!req.header('Authorization')) {
        const err = new Error('INVALID_TOKEN');
        err.status = 401;
        next(err);
    }
    next();
}

export {
    logError,
    handleError,
    throw404,
    verifyMyCashInternalToken,
    verifyKeycloackInternalToken,
    ensureAuthorization,
    verifyIfUserHasAccess,
    verifyInternalToken
};
