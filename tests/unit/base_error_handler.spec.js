/* eslint-disable no-undef */
/* eslint-env jest */
import BaseErrorHandler from '../../app/api/v1/base/base_error_handler.js';
const baseErrorHandler = new BaseErrorHandler();

describe('Test UNIT BaseErrorHandler', () => {
    it('default errrorResponse', async () => {
        expect(baseErrorHandler.errorResponse()).toEqual({
            errors: [
                {
                    error_code: 1,
                    message: 'VALIDATION_ERROR'
                }
            ],
            status: 422
        });
    });

    it('errorResponse to match VALIDATION_ERROR', async () => {
        expect(baseErrorHandler.errorResponse({ status: 422, key: 'VALIDATION_ERROR' })).toEqual({
            errors: [
                {
                    error_code: 1,
                    message: 'VALIDATION_ERROR'
                }
            ],
            status: 422
        });
    });
    it('errorResponse to match CONFLICT_DUPLICATE_KEY_ERROR', async () => {
        expect(
            baseErrorHandler.errorResponse({ status: 409, key: 'CONFLICT_DUPLICATE_KEY_ERROR' })
        ).toEqual({
            errors: [
                {
                    error_code: 8,
                    message: 'CONFLICT_DUPLICATE_KEY_ERROR'
                }
            ],
            status: 409
        });
    });
});
