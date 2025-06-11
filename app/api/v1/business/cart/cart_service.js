import CartModel from './cart_model.js';
import BaseService from '../../base/base_service.js';
import FinancialStatements from '../financialStatements/financialStatements_model.js';
import { literal, Op } from 'sequelize';
import { generateRandomCode } from '../../../../utils/crypto.js';
import { deleteFile, getFile, sendFilePublic } from '../../../../providers/aws/index.js';

class CartService extends BaseService {
    constructor() {
        super();
        this._cartModel = CartModel;
        this._financialStatementsModel = FinancialStatements;
    }

    async create(body) {
        const [chassisExist, boardExist] = await Promise.all([
            this._cartModel.findOne({ where: { cart_chassis: body.cart_chassis } }),
            this._cartModel.findOne({ where: { cart_board: body.cart_board } })
        ]);

        if (chassisExist) {
            const err = new Error('CHASSIS_CART_ALREADY_EXISTS');
            err.status = 400;
            throw err;
        }

        if (boardExist) {
            const err = new Error('BOARD_CART_ALREADY_EXISTS');
            err.status = 400;
            throw err;
        }

        const cart = await this._cartModel.create(body);

        return cart.toJSON();
    }

    async getAll(query) {
        const { page = 1, limit = 10, sort_order = 'ASC', sort_field = 'id', search } = query;

        const where = {};
        /* eslint-disable indent */
        const carts = await this._cartModel.findAll({
            where: search
                ? {
                      [Op.or]: [
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
                'cart_board',
                'image_cart'
            ]
        });
        /* eslint-enable indent */

        const total = await this._cartModel.count();
        const totalPages = Math.ceil(total / limit);

        const currentPage = Number(page);

        return {
            docs: carts.map((cart) => cart.toJSON()),
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
            attributes: ['id', 'cart_models', 'cart_board'],
            raw: true
        });

        const selectFinancial = await this._cartModel.findAll({
            attributes: ['id', 'cart_models', 'cart_board'],
            include: [
                {
                    model: this._financialStatementsModel,
                    as: 'financialStatements',
                    required: true,
                    where: {
                        status: false
                    },
                    attributes: []
                }
            ],
            raw: true,
            nest: true
        });

        return [...select, ...selectFinancial];
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
                'cart_board',
                'image_cart'
            ]
        });

        if (!cart) {
            const err = new Error('CART_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        return cart.toJSON();
    }

    async getIdAvatar(id) {
        const cart = await this._cartModel.findByPk(id, {
            attributes: ['image_cart']
        });

        if (!cart) {
            const err = new Error('CART_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const { Body, ContentType } = await getFile({
            filename: cart.image_cart.uuid,
            category: cart.image_cart.category
        });
        const fileData = Buffer.from(Body);
        return { contentType: ContentType, fileData };
    }

    async update(body, id) {
        const cart = await this._cartModel.findByPk(id);

        if (!cart) {
            const err = new Error('CART_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        await cart.update(body);

        return cart.toJSON();
    }

    async uploadImage(payload, id) {
        const { file, body } = payload;

        if (!file || !body.category) {
            const err = new Error('INVALID_PAYLOAD');
            err.status = 400;
            throw err;
        }

        const cart = await this._cartModel.findByPk(id);
        if (!cart) {
            const err = new Error('CART_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (cart.image_cart && cart.image_cart.uuid) {
            await this.deleteFile({ id });
        }

        const originalFilename = file.originalname;

        const code = generateRandomCode(9);

        file.name = code;

        await sendFilePublic(payload);

        const infoCart = await cart.update({
            image_cart: {
                uuid: file.name,
                name: originalFilename,
                mimetype: file.mimetype,
                category: body.category
            }
        });

        return infoCart.toJSON();
    }

    async deleteFile({ id }) {
        const cart = await this._cartModel.findByPk(id);
        if (!cart) {
            const err = new Error('CART_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        try {
            await this._deleteFileIntegration({
                filename: cart.image_cart.uuid,
                category: cart.image_cart.category
            });

            const infoCart = await cart.update({
                image_cart: {}
            });

            return infoCart;
        } catch {
            const err = new Error('ERROR_DELETE_FILE');
            err.status = 400;
            throw err;
        }
    }

    async _deleteFileIntegration({ filename, category }) {
        try {
            return await deleteFile({ filename, category });
        } catch {
            const err = new Error('ERROR_DELETE_FILE');
            err.status = 400;
            throw err;
        }
    }

    async delete(id) {
        const cart = await this._cartModel.findByPk(id);
        if (!cart) {
            const err = new Error('CART_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const isInUse = await this._financialStatementsModel.findAll({
            where: {
                cart_id: cart.id,
                status: true
            }
        });

        if (isInUse?.length > 0) {
            const err = new Error('CANNOT_DELETE_CART_IN_USE');
            err.status = 400;
            throw err;
        }

        await this._cartModel.destroy({
            where: {
                id: id
            }
        });
        return { msg: 'Cart deleted successfully' };
    }
}

export default CartService;
