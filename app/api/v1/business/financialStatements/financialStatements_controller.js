const BaseResourceController = require('../../base/base_resource_controller');
const FinancialStatementService = require('./financialStatements_service');
const HttpStatus = require('http-status');

class FinancialStatementController extends BaseResourceController {
    constructor() {
        super();
        this._financialStatementService = new FinancialStatementService();
    }

    async findAll(req, res, next) {
        try {
            const statements = await this._financialStatementService.findAll(req.query);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: statements }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async findById(req, res, next) {
        try {
            const statement = await this._financialStatementService.findById(req.params.id);
            if (!statement) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'Extrato financeiro não encontrado' });
            }
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: statement }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async create(req, res, next) {
        try {
            const statement = await this._financialStatementService.create(req.body);
            res.status(HttpStatus.CREATED).json(this.parseKeysToCamelcase({ data: statement }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async update(req, res, next) {
        try {
            const statement = await this._financialStatementService.update(req.params.id, req.body);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: statement }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async delete(req, res, next) {
        try {
            await this._financialStatementService.delete(req.params.id);
            res.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { status } = req.body;
            if (!status) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Status é obrigatório' });
            }
            const statement = await this._financialStatementService.updateStatus(req.params.id, status);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: statement }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getBalance(req, res, next) {
        try {
            const { userId, startDate, endDate } = req.query;
            if (!userId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'ID do usuário é obrigatório' });
            }
            const balance = await this._financialStatementService.getBalance(userId, startDate, endDate);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: { balance } }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

module.exports = FinancialStatementController; 