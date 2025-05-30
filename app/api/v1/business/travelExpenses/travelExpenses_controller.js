import BaseResourceController from '../../base/base_resource_controller.js';
import TravelExpensesService from './travelExpenses_service.js';
import HttpStatus from 'http-status';

class TravelExpensesController extends BaseResourceController {
    constructor() {
        super();
        this._travelExpensesService = new TravelExpensesService();
    }

    async create(req, res, next) {
        try {
            const data = await this._travelExpensesService.create(req.driver, req.body);
            return res.status(HttpStatus.CREATED).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async uploadDocuments(req, res, next) {
        try {
            const data = await this._travelExpensesService.uploadDocuments(req, req.params);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async deleteFile(req, res, next) {
        try {
            const data = await this._travelExpensesService.deleteFile(req.params);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getAll(req, res, next) {
        try {
            const data = await this._travelExpensesService.getAll(req.query);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getId(req, res, next) {
        try {
            const data = await this._travelExpensesService.getId(req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

export default TravelExpensesController;
