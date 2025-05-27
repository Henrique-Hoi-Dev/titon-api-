import ManagerModel from './manager_model.js';
import BaseService from '../../base/base_service.js';
import Permission from '../permission/permission_model.js';
import { generateManagerToken } from '../../../../utils/jwt.js';

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
        let { email, name, password, typeRole } = body;

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
            type_role: typeRole
        });

        const addPermissions = await this._permissionModel
            .findOne({
                where: { role: typeRole }
            })
            .then((permission) => permission.toJSON());

        await resultUser.update({
            permission_id: addPermissions.id
        });

        const { type_role, id } = resultUser?.toJSON();

        const userData = {
            id,
            name,
            email,
            type_role
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

        if (!user) {
            const error = new Error('USER_NOT_FOUND');
            error.status = 404;
            throw error;
        }

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
