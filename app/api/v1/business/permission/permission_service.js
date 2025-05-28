import Permission from './permission_model.js';
import BaseService from '../../base/base_service.js';

class PermissionService extends BaseService {
    constructor() {
        super();
        this._permissionModel = Permission;
    }

    async createPermission(body) {
        const permissionExist = await this._permissionModel.findOne({
            where: { role: body.role }
        });

        if (permissionExist) {
            const err = new Error('PERMISSION_ALREADY_EXISTS');
            err.status = 409;
            throw err;
        }

        const resultPermission = await this._permissionModel.create(body);

        return resultPermission.toJSON();
    }

    async updatePermission(body, role) {
        const permission = await this._permissionModel.findOne({
            where: { role }
        });

        if (!permission) {
            const err = new Error('PERMISSION_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const resultPermission = await permission.update({ actions: body.actions });

        return resultPermission.toJSON();
    }

    async getAllPermission() {
        const permissions = await this._permissionModel.findAll({
            attributes: ['id', 'role', 'actions']
        });

        return permissions.map((permission) => permission.toJSON());
    }
}

export default PermissionService;
