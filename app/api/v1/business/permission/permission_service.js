import Permission from './permission_model.js';
import BaseService from '../../base/base_service.js';

class PermissionService extends BaseService {
    constructor() {
        super();
        this._permissionModel = Permission;
    }

    async createPermission(body) {
        let permission = body;

        const permissionExist = await this._permissionModel.findOne({
            where: { role: permission.role }
        });

        if (permissionExist) {
            const err = new Error('PERMISSION_ALREADY_EXISTS');
            err.status = 409;
            throw err;
        }

        const resultPermission = await this._permissionModel.create(permission);

        return resultPermission;
    }

    async updatePermission(body, id) {
        const permission = await this._permissionModel.findByPk(id);

        if (!permission) {
            const err = new Error('PERMISSION_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const resultPermission = await permission.update(body);

        return resultPermission;
    }

    async getAllPermission() {
        const permissao = await this._permissionModel.findAll({
            attributes: ['id', 'role', 'actions']
        });

        return permissao;
    }

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

export default PermissionService;
