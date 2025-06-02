import BaseResourceController from '../../base/base_resource_controller.js';
import HttpStatus from 'http-status';
import CartService from './cart_service.js';
import validateAndReturn from '../../../../utils/validFile.js';

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
            const data = await this._cartService.getAllSelect();
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getId(req, res, next) {
        try {
            const data = await this._cartService.getId(req.params.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getIdAvatar(req, res, next) {
        try {
            const data = await this._cartService.getIdAvatar(req.params.id);
            res.set('Content-Type', validateAndReturn(data.contentType));
            return res.send(data.fileData);
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async update(req, res, next) {
        try {
            const data = await this._cartService.update(req.body, req.params.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async uploadImage(req, res, next) {
        try {
            const data = await this._cartService.uploadImage(req, req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
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

export default CartController;
