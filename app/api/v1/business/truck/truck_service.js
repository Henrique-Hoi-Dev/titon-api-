const baseModel = require('./base_model');
const BaseService = require('../../base/base_service');

class UsersService extends BaseService {
    constructor() {
        super();
        this._usersModel = baseModel;
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

module.exports = UsersService;
