import BaseResourceController from '../../base/base_resource_controller.js';
import PermissionService from './permission_service.js';
import HttpStatus from 'http-status';

class UsersController extends BaseResourceController {
    constructor() {
        super();
        this._permissionService = new PermissionService();
    }

    async createPermission(req, res) {
        try {
            const data = await this._permissionService.createPermission(req.body);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async updatePermission(req, res) {
        try {
            const data = await this._permissionService.updatePermission(req.body, req.params);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getAllPermission(req, res) {
        try {
            const data = await this._permissionService.getAllPermission();
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

export default UsersController;
