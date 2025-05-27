import ManagerModel from './manager_model.js';
import BaseService from '../../base/base_service.js';
import Permission from '../permission/permission_model.js';
import Yup from 'yup';

class ManagerService extends BaseService {
    constructor() {
        super();
        this._managerModel = ManagerModel;
        this._permissionModel = Permission;
    }

    async signin(body) {
        const { email, password } = body;

        const user = await this._managerModel.findOne({ where: { email } });

        if (!user) throw Error('USER_NOT_FOUND');

        if (!(await user.checkPassword(password))) throw Error('INVALID_USER_PASSWORD');

        const { id, name, type_role, permission_id } = user;

        const permissions = await Permission.findByPk(permission_id, {
            attributes: ['role', 'actions']
        });

        const token = jwt.sign({ id, name, email, type_role, permissions }, process.env.TOKEN_KEY, {
            expiresIn: process.env.TOKEN_EXP
        });

        return { token };
    }

    async signup(body) {
        let { email, name, password } = body;

        // doing email verification
        const userExist = await this._managerModel.findOne({ where: { email: email } });

        if (userExist) throw Error('This user email already exists.');

        const resultUser = await this._managerModel.create({
            name,
            email,
            password
        });

        const addPermissions = await this._permissionModel.findOne({
            where: { role: resultUser.type_role }
        });

        await resultUser.update({
            permission_id: addPermissions.id
        });

        return { msg: 'Registered User Successful!' };
    }

    async getAll(query) {
        const { page = 1, limit = 100, sort_order = 'ASC', sort_field = 'name', name, id } = query;

        const where = {};
        if (name) where.name = { [Op.iLike]: '%' + name + '%' };
        if (id) where.id = id;

        const users = await this._managerModel.findAll({
            where: where,
            order: [[sort_field, sort_order]],
            limit: limit,
            offset: page - 1 ? (page - 1) * limit : 0,
            attributes: ['id', 'name', 'email', 'type_role'],
            include: {
                model: Permission,
                as: 'permissions',
                attributes: ['id', 'role', 'actions']
            }
        });

        const total = await this._managerModel.count();
        const totalPages = Math.ceil(total / limit);

        const currentPage = Number(page);

        return {
            dataResult: users,
            total,
            totalPages,
            currentPage
        };
    }

    async getId(id) {
        const user = await this._managerModel.findByPk(id, {
            attributes: ['id', 'name', 'email', 'type_role'],
            include: {
                model: Permission,
                as: 'permissions',
                attributes: ['id', 'role', 'actions']
            }
        });

        if (!user) throw Error('User not found');

        return { dataResult: user };
    }

    async update(body, id) {
        const { email, oldPassword } = body;

        const user = await this._managerModel.findByPk(id);

        if (email !== user.email) {
            const userExist = await this._managerModel.findOne({ where: { email } });

            if (userExist) throw Error('This user email already exists.');
        }

        if (oldPassword && !(await user.checkPassword(oldPassword))) throw Error('Password does not match!');

        await user.update({
            name: body.name,
            password: body.password,
            confirmPassword: body.confirmPassword
        });

        const userResult = await this._managerModel.findByPk(id, {
            attributes: ['id', 'name', 'email', 'type_role']
        });

        return { dataResult: userResult };
    }

    async addRole(body, id) {
        const user = await this._managerModel.findByPk(id);

        if (!user) throw Error('User not found');

        await user.update({
            type_role: body.role.toUpperCase()
        });

        const addPermissions = await this._permissionModel.findOne({
            where: { role: user.type_role }
        });

        await user.update({
            permission_id: addPermissions.id
        });

        return { msg: 'successful' };
    }

    async delete(id) {
        const user = await this._managerModel.destroy({
            where: {
                id: id
            }
        });

        if (!user) throw Error('User not found');

        return { msg: 'Deleted user' };
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

export default ManagerService;
