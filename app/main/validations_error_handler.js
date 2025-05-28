import BaseErrorHandler from '../api/v1/base/base_error_handler.js';
import errorMapping from '../utils/error_mapping.js';
import { readFile } from 'fs/promises';
const data = await readFile(new URL('../../locale/error/en.json', import.meta.url), 'utf-8');
const message = JSON.parse(data);

class ValidationsErrorHandler extends BaseErrorHandler {
    errorResponse(data) {
        if (data.details) {
            const status = data.status || data.statusCode;
            const keys = Object.keys(data.details);
            const errors = [];
            keys.forEach((key) => {
                const err =
                    data.details[key] &&
                    data.details[key].map((d) => {
                        return { message: d.message, key: d.context.key, local: key };
                    });

                if (err) errors.push(...err);
            });

            const errorName = data.name === 'ValidationError' ? 'VALIDATION_ERROR' : data.name;
            return {
                message: message[errorName],
                key: errorName,
                errorCode: errorMapping[errorName],
                status,
                errors
            };
        }

        return super.errorResponse(data);
    }
}

export default ValidationsErrorHandler;
