import ManagerModel from './manager_model.js';
import BaseService from '../../base/base_service.js';
import Permission from '../permission/permission_model.js';
import { generateManagerToken } from '../../../../utils/jwt.js';
import { Op } from 'sequelize';

class ManagerService extends BaseService {
    constructor() {
        super();
        this._managerModel = ManagerModel;
        this._permissionModel = Permission;
    }

    async signin(body) {
        const { email, password } = body;

        const user = await this._managerModel.findOne({ where: { email } });

        if (!user) {
            const error = new Error('USER_NOT_FOUND');
            error.status = 404;
            throw error;
        }

        if (!(await user.checkPassword(password))) {
            const error = new Error('INVALID_USER_PASSWORD');
            error.status = 401;
            throw error;
        }

        const { permission_id, name, type_role, id } = user.toJSON();

        const permissions = await Permission.findByPk(permission_id, {
            attributes: ['role', 'actions']
        });

        const userData = {
            id,
            name,
            email,
            type_role,
            permissions: permissions.toJSON()
        };

        const token = this._generateToken(userData);

        return { token };
    }

    async signup(body) {
        let { email, name, password, type_role } = body;

        const userExist = await this._managerModel.findOne({ where: { email: email } });

        if (userExist?.toJSON()?.email) {
            const error = new Error('THIS_USER_EMAIL_ALREADY_EXISTS');
            error.status = 409;
            throw error;
        }

        const resultUser = await this._managerModel.create({
            name,
            email,
            password,
            type_role: type_role
        });

        const addPermissions = await this._permissionModel
            .findOne({
                where: { role: type_role }
            })
            .then((permission) => permission.toJSON());

        await resultUser.update({
            permission_id: addPermissions.id
        });

        if (!resultUser) {
            const err = new Error('ERRO_EDIT_USER_PERMISSION');
            err.status = 404;
            throw err;
        }
        const { id } = resultUser.toJSON();

        const userData = {
            id,
            name,
            email,
            type_role: resultUser.dataValues.type_role
        };
        const token = this._generateToken(userData);

        return { token };
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
            include: [
                {
                    model: this._permissionModel,
                    as: 'permissions',
                    attributes: ['id', 'role', 'actions']
                }
            ]
        });

        const total = await this._managerModel.count();
        const totalPages = Math.ceil(total / limit);
        const currentPage = Number(page);

        const serializedUsers = users.map((user) => ({
            ...user.toJSON(),
            permissions: user.permissions ? user.permissions.toJSON() : null
        }));

        return {
            docs: serializedUsers,
            total,
            totalPages,
            currentPage
        };
    }

    async getId(id) {
        const user = await this._managerModel.findByPk(id, {
            attributes: ['id', 'name', 'email', 'type_role'],
            include: [
                {
                    model: this._permissionModel,
                    as: 'permissions',
                    attributes: ['id', 'role', 'actions']
                }
            ]
        });

        if (!user) {
            const err = new Error('USER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const userResult = {
            ...user.toJSON(),
            permissions: user.permissions ? user.permissions.toJSON() : null
        };

        return userResult;
    }

    async update(body, id) {
        const { email, name } = body;

        const user = await this._managerModel.findByPk(id);

        if (email !== user.email) {
            const userExist = await this._managerModel.findOne({ where: { email } });

            if (userExist) {
                const err = new Error('THIS_USER_EMAIL_ALREADY_EXISTS');
                err.status = 400;
                throw err;
            }
        }

        await user.update({
            name: name
        });

        const userResult = await this._managerModel.findByPk(id, {
            attributes: ['id', 'name', 'email', 'type_role']
        });

        return userResult.toJSON();
    }

    async addRole(body, id) {
        const user = await this._managerModel.findByPk(id);

        if (!user) {
            const err = new Error('USER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const permission = await this._permissionModel.findOne({
            where: { role: body.role.toUpperCase() }
        });

        if (!permission) {
            const err = new Error('ROLE_PERMISSION_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        await user.update({
            type_role: body.role.toUpperCase(),
            permission_id: permission.id
        });

        const { type_role, name, email, permission_id } = user.toJSON();

        return { id: user.id, type_role, name, email, permission_id };
    }

    async delete(id) {
        const user = await this._managerModel.findByPk(id);

        if (!user) {
            const error = new Error('USER_NOT_FOUND');
            error.status = 404;
            throw error;
        }

        await user.destroy();

        return { msg: 'Deleted user' };
    }

    _generateToken(user) {
        if (!user) {
            const error = new Error('USER_NOT_FOUND');
            error.status = 404;
            throw error;
        }

        const token = generateManagerToken(user);
        return token;
    }
}

export default ManagerService;
