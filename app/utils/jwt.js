import jwt from 'jsonwebtoken';

const generateManagerToken = (payload = {}) => {
    if (!process.env.MANAGER_JWT_SECRET) {
        const error = new Error('MANAGER_JWT_SECRET_NOT_FOUND');
        error.status = 401;
        throw error;
    }

    if (!process.env.MANAGER_JWT_EXPIRES_IN) {
        const error = new Error('MANAGER_JWT_EXPIRES_IN_NOT_FOUND');
        error.status = 401;
        throw error;
    }

    const token = jwt.sign(payload, process.env.MANAGER_JWT_SECRET, {
        expiresIn: process.env.MANAGER_JWT_EXPIRES_IN
    });

    return token;
};

const generateDriverToken = (payload = {}) => {
    if (!process.env.DRIVER_JWT_SECRET) {
        const error = new Error('DRIVER_JWT_SECRET_NOT_FOUND');
        error.status = 401;
        throw error;
    }

    if (!process.env.DRIVER_JWT_EXPIRES_IN) {
        const error = new Error('DRIVER_JWT_EXPIRES_IN_NOT_FOUND');
        error.status = 401;
        throw error;
    }

    const token = jwt.sign(payload, process.env.DRIVER_JWT_SECRET, {
        expiresIn: process.env.DRIVER_JWT_EXPIRES_IN
    });

    return token;
};

const verifyManagerTokenApi = (token = '') => {
    token = token.replace('Bearer ', '');

    if (!token) {
        const error = new Error('TOKEN_NOT_FOUND');
        error.status = 401;
        throw error;
    }

    if (!process.env.MANAGER_JWT_SECRET) {
        const error = new Error('MANAGER_JWT_SECRET_NOT_FOUND');
        error.status = 401;
        throw error;
    }

    return jwt.verify(token, process.env.MANAGER_JWT_SECRET);
};

const verifyDriverTokenApi = (token = '') => {
    token = token.replace('Bearer ', '');

    if (!token) {
        const error = new Error('TOKEN_NOT_FOUND');
        error.status = 401;
        throw error;
    }

    if (!process.env.DRIVER_JWT_SECRET) {
        const error = new Error('DRIVER_JWT_SECRET_NOT_FOUND');
        error.status = 401;
        throw error;
    }

    return jwt.verify(token, process.env.DRIVER_JWT_SECRET);
};

export { generateManagerToken, generateDriverToken, verifyManagerTokenApi, verifyDriverTokenApi };
