import BaseService from '../../base/base_service.js';
import ValidateCode from './validateCode_model.js';

class ValidateCodeService extends BaseService {
    constructor() {
        super();
        this._validateCodeModel = ValidateCode;
    }

    async baseFunciton() {}

    _updateHours(numOfHours, date = new Date()) {
        const dateCopy = new Date(date.getTime());

        dateCopy.setHours(dateCopy.getHours() - numOfHours);

        return dateCopy;
    }

    _handleMongoError(error) {
        const keys = Object.keys(error.errors);
        const err = new Error(error.errors[keys[0]].message);
        err.field = keys[0];
        err.status = 409;
        throw err;
    }
}

export default ValidateCodeService;
