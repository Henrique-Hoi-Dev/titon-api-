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

    async create(body) {
        let { email, name, password } = body;

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            password: Yup.string().required().min(8)
        });

        if (!(await schema.isValid(body))) throw Error('Validation failed!');

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
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            oldPassword: Yup.string().min(8),
            password: Yup.string()
                .min(8)
                .when('oldPassword', (oldPassword, field) => (oldPassword ? field.required() : field)),
            confirmPassword: Yup.string().when('password', (password, field) =>
                password ? field.required().oneOf([Yup.ref('password')]) : field
            )
        });

        if (!(await schema.isValid(body))) throw Error('Validation failed!');

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
