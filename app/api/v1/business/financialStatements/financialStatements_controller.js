import BaseResourceController from '../../base/base_resource_controller.js';
import FinancialStatementService from './financialStatements_service.js';
import HttpStatus from 'http-status';

class FinancialStatementController extends BaseResourceController {
    constructor() {
        super();
        this._financialStatementService = new FinancialStatementService();
    }

    async create(req, res, next) {
        try {
            const data = await this._financialStatementService.create(req.manager, req.body);
            return res.status(HttpStatus.CREATED).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getAll(req, res, next) {
        try {
            const data = await this._financialStatementService.getAll(req.query);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getId(req, res, next) {
        try {
            const data = await this._financialStatementService.getId(req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async updateFinancial(req, res, next) {
        try {
            const data = await this._financialStatementService.updateFinancial(
                req.body,
                req.params.id
            );
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async finishingFinancial(req, res, next) {
        try {
            const data = await this._financialStatementService.finishingFinancial(
                req.body,
                req.params.id
            );
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async delete(req, res, next) {
        try {
            const data = await this._financialStatementService.delete(req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getFinancialCurrent(req, res, next) {
        try {
            const data = await this._financialStatementService.getFinancialCurrent(req.driver);
            return res.status(HttpStatus.OK).json(JSON.parse(JSON.stringify({ data })));
        } catch (error) {
            next(res.status(HttpStatus.BAD_REQUEST).json({ mgs: error.message }));
        }
    }

    async getAllFinished(req, res, next) {
        try {
            const data = await this._financialStatementService.getAllFinished(
                req.driver,
                req.query
            );
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

export default FinancialStatementController;
