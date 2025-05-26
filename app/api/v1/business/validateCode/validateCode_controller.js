import BaseResourceController from '../../base/base_resource_controller.js';
import ValidateCodeService from './validateCode_service.js';
import HttpStatus from 'http-status';

class ValidateCodeController extends BaseResourceController {
    constructor() {
        super();
        this._validateCodeService = new ValidateCodeService();
    }

    async searchUserVtex(req, res, next) {
        try {
            const data = await this._validateCodeService.baseFunciton(req.body, req.query);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

export default ValidateCodeController;
