import HttpStatus from 'http-status';
import BaseResourceController from '../../base/base_resource_controller.js';
import FreightService from './freight_service.js';
import validateAndReturn from '../../../../utils/validFile.js';

class FreightController extends BaseResourceController {
    constructor() {
        super();
        this._freightService = new FreightService();
    }

    async createFreightDriver(req, res, next) {
        try {
            const data = await this._freightService.createFreightDriver(req.driver, req.body);
            return res.status(HttpStatus.CREATED).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async create(req, res, next) {
        try {
            const data = await this._freightService.create(req.body);
            return res.status(HttpStatus.CREATED).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getId(req, res, next) {
        try {
            const data = await this._freightService.getId(
                req.params.id,
                req.driver,
                req.params.financialId
            );
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async updateFreightDriver(req, res, next) {
        try {
            const data = await this._freightService.updateFreightDriver(
                req.body,
                req.params.id,
                req.driver
            );
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async startingTrip(req, res, next) {
        try {
            const data = await this._freightService.startingTrip(req.body, req.user);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async finishedTrip(req, res, next) {
        try {
            const data = await this._freightService.finishedTrip(req.body, req.user);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async uploadDocuments(req, res, next) {
        try {
            const data = await this._freightService.uploadDocuments(req, req.params);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async deleteFile(req, res, next) {
        try {
            const data = await this._freightService.deleteFile(req.params, req.query);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getDocuments(req, res, next) {
        try {
            const { fileData, contentType } = await this._freightService.getDocuments(req.query);
            res.set('Content-Type', validateAndReturn(contentType));
            return res.send(fileData);
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async deleteFreightDriver(req, res, next) {
        try {
            const data = await this._freightService.deleteFreightDriver(req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getIdManagerFreight(req, res, next) {
        try {
            const data = await this._freightService.getIdManagerFreight(req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async firstCheckId(req, res, next) {
        try {
            const data = await this._freightService.firstCheckId(req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async approveFreightManager(req, res, next) {
        try {
            const data = await this._freightService.approveFreightManager(
                req.user,
                req.body,
                req.params.id
            );
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async deleteFreightManager(req, res, next) {
        try {
            const data = await this._freightService.deleteFreightManager(req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

export default FreightController;
