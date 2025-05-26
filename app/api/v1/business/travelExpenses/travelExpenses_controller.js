const BaseResourceController = require('../../base/base_resource_controller');
const TravelExpensesService = require('./travelExpenses_service');
const HttpStatus = require('http-status');

class TravelExpensesController extends BaseResourceController {
    constructor() {
        super();
        this._travelExpensesService = new TravelExpensesService();
    }

    async create(req, res, next) {
        try {
            const data = await this._travelExpensesService.create(req.driverId, req.body);
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
