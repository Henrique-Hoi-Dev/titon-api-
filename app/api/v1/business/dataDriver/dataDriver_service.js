import DataDriverModel from './dataDriver_model.js';
import BaseService from '../../base/base_service.js';

class DataDriverService extends BaseService {
    constructor() {
        super();
        this._dataDriverModel = DataDriverModel;
    }

    _handleError(error) {
        if (error.name === 'SequelizeValidationError') {
            const err = new Error(error.errors[0].message);
            err.field = error.errors[0].path;
            err.status = 400;
            throw err;
        }
        throw error;
    }
}

export default DataDriverService;
