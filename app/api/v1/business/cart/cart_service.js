import CartModel from './cart_model.js';
import BaseService from '../../base/base_service.js';
import { literal, Op } from 'sequelize';
import FinancialStatements from '../financialStatements/financialStatements_model.js';

class CartService extends BaseService {
    constructor() {
        super();
        this._cartModel = CartModel;
        this._financialStatementsModel = FinancialStatements;
    }

    async create(body) {
        const chassisExist = await this._cartModel.findOne({
            where: { cart_chassis: body.cart_chassis }
        });
        if (chassisExist) throw Error('This chassis cart already exists.');

        const boardExist = await this._cartModel.findOne({
            where: { cart_board: body.cart_board }
        });
        if (boardExist) throw Error('This board cart already exists.');

        await this._cartModel.create(body);

        return { msg: 'successful' };
    }

    async getAll(query) {
        const { page = 1, limit = 100, sort_order = 'ASC', sort_field = 'id', search } = query;

        const where = {};
        // if (id) where.id = id;
        /* eslint-disable indent */
        const carts = await this._cartModel.findAll({
            where: search
                ? {
                      [Op.or]: [
                          // { id: search },
                          { cart_color: { [Op.iLike]: `%${search}%` } },
                          { cart_models: { [Op.iLike]: `%${search}%` } },
                          { cart_year: { [Op.iLike]: `%${search}%` } },
                          { cart_brand: { [Op.iLike]: `%${search}%` } }
                      ]
                  }
                : where,
            order: [[sort_field, sort_order]],
            limit: limit,
            offset: page - 1 ? (page - 1) * limit : 0,
            attributes: [
                'id',
                'cart_models',
                'cart_brand',
                'cart_tara',
                'cart_color',
                'cart_bodyworks',
                'cart_year',
                'cart_chassis',
                'cart_liter_capacity',
                'cart_ton_capacity',
                'cart_board'
            ]
        });
        /* eslint-enable indent */

        const total = await this._cartModel.count();
        const totalPages = Math.ceil(total / limit);

        const currentPage = Number(page);

        return {
            dataResult: carts,
            total,
            totalPages,
            currentPage
        };
    }

    async getAllSelect() {
        const select = await this._cartModel.findAll({
            where: {
                id: {
                    [Op.notIn]: literal('(SELECT "cart_id" FROM "financial_statements")')
                }
            },
            attributes: ['id', 'cart_models']
        });

        const selectFinancial = await this._cartModel.findAll({
            attributes: ['id', 'cart_models'],
            include: [
                {
                    model: this._financialStatementsModel,
                    as: 'financialStatements',
                    required: true,
                    where: {
                        status: false
                    },
                    attributes: ['id', 'cart_id', 'cart_models']
                }
            ]
        });

        return {
            dataResult: [...select.concat(...selectFinancial)]
        };
    }

    async getId(id) {
        let cart = await this._cartModel.findByPk(id, {
            attributes: [
                'id',
                'cart_models',
                'cart_brand',
                'cart_tara',
                'cart_color',
                'cart_bodyworks',
                'cart_year',
                'cart_chassis',
                'cart_liter_capacity',
                'cart_ton_capacity',
                'cart_board'
            ]
        });

        if (!cart) throw Error('Cart not found');

        return {
            dataResult: cart
        };
    }

    async update(body, id) {
        const cart = await this._cartModel.findByPk(id);

        await cart.update(body);

        const cartResult = await this._cartModel.findByPk(id, {
            attributes: [
                'id',
                'cart_models',
                'cart_brand',
                'cart_tara',
                'cart_color',
                'cart_bodyworks',
                'cart_year',
                'cart_chassis',
                'cart_liter_capacity',
                'cart_ton_capacity',
                'cart_board'
            ]
        });

        return {
            dataResult: cartResult
        };
    }

    async delete(id) {
        const cart = await this._cartModel.findByPk(id);
        if (!cart) throw Error('CART_NOT_FOUND');

        const isInUse = await FinancialStatements.findAll({
            cart_board: cart.cart_board,
            status: true
        });

        if (isInUse) throw Error('CANNOT_DELETE_CART_IN_USE');

        await this._cartModel.destroy({
            where: {
                id: id
            }
        });
        return {
            responseData: { msg: 'Deleted cart' }
        };
    }
}

export default CartService;
