import ev from 'express-validation';
import _ from 'lodash';
import ValidationsErrorHandler from './validations_error_handler.js';
import keys from '../utils/error_mapping.js';
import logger from '../utils/logger.js';
import { verifyDriverTokenApi, verifyManagerTokenApi } from '../utils/jwt.js';
import { JWT_ERROR_MAPPING } from '../utils/enum.js';

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

async function verifyManagerToken(req, res, next) {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            const error = new Error('VERIFY_TOKEN_ERROR_MANAGER_INVALID_TOKEN');
            error.status = 401;
            return next(error);
        }

        const decodedToken = verifyManagerTokenApi(token);
        req.manager = decodedToken;
        next();
    } catch (jwtError) {
        const errorKey = JWT_ERROR_MAPPING[jwtError.message] || 'VERIFY_TOKEN_ERROR_INVALID_TOKEN';
        const error = new Error(errorKey);
        error.status = 401;
        return next(error);
    }
}

async function verifyDriverToken(req, res, next) {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            const error = new Error('VERIFY_TOKEN_ERROR_DRIVER_INVALID_TOKEN');
            error.status = 401;
            return next(error);
        }

        const decodedToken = verifyDriverTokenApi(token);
        req.driver = decodedToken;

        next();
    } catch (jwtError) {
        const errorKey = JWT_ERROR_MAPPING[jwtError.message] || 'VERIFY_TOKEN_ERROR_INVALID_TOKEN';
        const error = new Error(errorKey);
        error.status = 401;
        return next(error);
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

export default {
    logError,
    handleError,
    throw404,
    ensureAuthorization,
    verifyManagerToken,
    verifyDriverToken
};
