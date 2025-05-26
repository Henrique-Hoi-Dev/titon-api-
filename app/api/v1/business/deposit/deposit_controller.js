import BaseResourceController from '../../base/base_resource_controller.js';
import DepositMoneyService from './deposit_service.js';
import HttpStatus from 'http-status';

class DepositMoneyController extends BaseResourceController {
    constructor() {
        super();
        this._depositService = new DepositMoneyService();
    }

    async create(req, res, next) {
        try {
            const data = await this._depositService.create(req.user, req.body);
            res.status(HttpStatus.CREATED).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async uploadDocuments(req, res, next) {
        try {
            const data = await this._depositService.uploadDocuments(req, req.params);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async deleteFile(req, res, next) {
        try {
            const data = await this._depositService.deleteFile(req.params);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getAll(req, res, next) {
        try {
            const data = await this._depositService.getAll(req.query);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getId(req, res, next) {
        try {
            const data = await this._depositService.getId(req.params.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

export default new DepositMoneyController();
