import { validate } from 'express-validation';

export const validator = (schema) =>
    validate(schema, { context: true, statusCode: 422, keyByField: false }, { abortEarly: false });
