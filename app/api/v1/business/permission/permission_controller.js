import BaseResourceController from '../../base/base_resource_controller.js';
import PermissionService from './permission_service.js';
import HttpStatus from 'http-status';

class PermissionController extends BaseResourceController {
    constructor() {
        super();
        this._permissionService = new PermissionService();
    }

    createPermission = async (req, res, next) => {
        try {
            const data = await this._permissionService.createPermission(req.body);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    updatePermission = async (req, res, next) => {
        try {
            const data = await this._permissionService.updatePermission(req.body, req.params.role);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    getAllPermission = async (req, res, next) => {
        try {
            const data = await this._permissionService.getAllPermission();
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };
}

export default PermissionController;
