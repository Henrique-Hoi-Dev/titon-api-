import BaseResourceController from '../../base/base_resource_controller.js';
import HttpStatus from 'http-status';
import CartService from './cart_service.js';

class CartController extends BaseResourceController {
    constructor() {
        super();
        this._cartService = new CartService();
    }

    async create(req, res, next) {
        try {
            const data = await this._cartService.create(req.body);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getAll(req, res, next) {
        try {
            const data = await this._cartService.getAll(req.query);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getAllSelect(req, res, next) {
        try {
            const data = await this._cartService.getAllSelect(req.query);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getId(req, res, next) {
        try {
            const data = await CartService.getId(req.params.id);
            return res.status(HttpStatus.OK).json(JSON.parse(JSON.stringify(data)));
        } catch (error) {
            next(res.status(HttpStatus.BAD_REQUEST).json({ mgs: error.message }));
        }
    }

    async update(req, res, next) {
        try {
            const data = await CartService.update(req.body, req.params.id);
            return res.status(HttpStatus.OK).json(JSON.parse(JSON.stringify(data)));
        } catch (error) {
            next(res.status(HttpStatus.BAD_REQUEST).json({ mgs: error.message }));
        }
    }

    async delete(req, res, next) {
        try {
            const data = await this._cartService.delete(req.params.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

export default new CartController();
