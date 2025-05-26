import BaseResourceController from '../../base/base_resource_controller.js';
import DataDriverService from './dataDriver_service.js';
// import HttpStatus from 'http-status';

class DataDriverController extends BaseResourceController {
    constructor() {
        super();
        this._dataDriverService = new DataDriverService();
    }
}

export default new DataDriverController();
