import errorMapping from '../../../utils/error_mapping.js';

class BaseErrorHandler {
    errorResponse(data) {
        const defaultMessage = 'VALIDATION_ERROR';
        const status = data?.status ?? 422;
        const message = data?.key ?? defaultMessage;
        const error_code = errorMapping[message];

        return {
            status,
            errors: [{ error_code, message }]
        };
    }
}

export default BaseErrorHandler;
