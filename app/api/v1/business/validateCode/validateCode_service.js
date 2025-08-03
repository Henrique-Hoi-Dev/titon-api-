import BaseService from '../../base/base_service.js';
import ValidateCodeModel from './validateCode_model.js';

class ValidateCodeService extends BaseService {
    constructor() {
        super();
        this._validateCodeModel = ValidateCodeModel;
    }

    async baseFunciton() {}

    _handleMongoError(error) {
        const keys = Object.keys(error.errors);
        const err = new Error(error.errors[keys[0]].message);
        err.field = keys[0];
        err.status = 409;
        throw err;
    }
}

export default ValidateCodeService;
