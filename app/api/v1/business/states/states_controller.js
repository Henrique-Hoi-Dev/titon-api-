const BaseResourceController = require('../../base/base_resource_controller');
const BaseService = require('./base_service');
const HttpStatus = require('http-status');

class UsersController extends BaseResourceController {
    constructor() {
        super();
        this._baseService = new BaseService();
    }

    async searchUserVtex(req, res, next) {
        try {
            const data = await this._baseService.baseFunciton(req.body, req.query);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

module.exports = UsersController;
