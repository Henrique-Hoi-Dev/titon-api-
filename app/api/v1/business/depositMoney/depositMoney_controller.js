const BaseResourceController = require('../../base/base_resource_controller');
const DepositMoneyService = require('./depositMoney_service');
const HttpStatus = require('http-status');

class DepositMoneyController extends BaseResourceController {
    constructor() {
        super();
        this._depositMoneyService = new DepositMoneyService();
    }

    async findAll(req, res, next) {
        try {
            const deposits = await this._depositMoneyService.findAll(req.query);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: deposits }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async findById(req, res, next) {
        try {
            const deposit = await this._depositMoneyService.findById(req.params.id);
            if (!deposit) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'Depósito não encontrado' });
            }
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: deposit }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async create(req, res, next) {
        try {
            const deposit = await this._depositMoneyService.create(req.body);
            res.status(HttpStatus.CREATED).json(this.parseKeysToCamelcase({ data: deposit }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async update(req, res, next) {
        try {
            const deposit = await this._depositMoneyService.update(req.params.id, req.body);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: deposit }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async delete(req, res, next) {
        try {
            await this._depositMoneyService.delete(req.params.id);
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
            const deposit = await this._depositMoneyService.updateStatus(req.params.id, status);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: deposit }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

module.exports = DepositMoneyController; 