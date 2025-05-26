import HttpStatus from 'http-status';
import BaseResourceController from '../../base/base_resource_controller.js';
import FreightService from './freight_service.js';

class FreightController extends BaseResourceController {
    constructor() {
        super();
        this._freightService = new FreightService();
    }

    async findAll(req, res, next) {
        try {
            const freights = await this._freightService.findAll(req.query);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: freights }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async findById(req, res, next) {
        try {
            const freight = await this._freightService.findById(req.params.id);
            if (!freight) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'Frete não encontrado' });
            }
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: freight }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async create(req, res, next) {
        try {
            const freight = await this._freightService.create(req.body);
            res.status(HttpStatus.CREATED).json(this.parseKeysToCamelcase({ data: freight }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async update(req, res, next) {
        try {
            const freight = await this._freightService.update(req.params.id, req.body);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: freight }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async delete(req, res, next) {
        try {
            await this._freightService.delete(req.params.id);
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
            const freight = await this._freightService.updateStatus(req.params.id, status);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: freight }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async assignDriver(req, res, next) {
        try {
            const { driverId } = req.body;
            if (!driverId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'ID do motorista é obrigatório' });
            }
            const freight = await this._freightService.assignDriver(req.params.id, driverId);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: freight }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async completeFreight(req, res, next) {
        try {
            const freight = await this._freightService.completeFreight(req.params.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data: freight }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

export default FreightController; 