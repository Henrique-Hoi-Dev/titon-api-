import Permission from './permission_model.js';
import BaseService from '../../base/base_service.js';

class PermissionService extends BaseService {
    constructor() {
        super();
        this._permissionModel = Permission;
    }

    async createPermission(req, res) {
        let result = {};
        let permission = req;

        const permissionExist = await this._permissionModel.findOne({ where: { role: permission.role } });

        if (permissionExist) {
            result = { httpStatus: httpStatus.CONFLICT, msg: 'This permission role already exists.' };
            return result;
        }

        const resultPermission = await this._permissionModel.create(permission);

        result = { httpStatus: HttpStatus.OK, status: 'successful', dataResult: resultPermission };
        return result;
    }

    async updatePermission(req, res) {
        let result = {};

        const permission = await this._permissionModel.findByPk(req.params.id);

        if (!permission) {
            result = { httpStatus: httpStatus.CONFLICT, msg: 'This permission role already exists.' };
            return result;
        }

        const resultPermission = await permission.update(req);

        result = { httpStatus: httpStatus.OK, status: 'successful', dataResult: resultPermission };
        return result;
    }

    async getAllPermission() {
        let result = {};

        const permissao = await this._permissionModel.findAll({
            attributes: ['id', 'role', 'actions']
        });

        result = { httpStatus: httpStatus.OK, status: 'successful', dataResult: permissao };

        return result;
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
