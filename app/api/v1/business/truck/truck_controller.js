import validateAndReturn from '../../../../utils/validFile.js';
import BaseResourceController from '../../base/base_resource_controller.js';
import TruckService from './truck_service.js';
import HttpStatus from 'http-status';

class TruckController extends BaseResourceController {
    constructor() {
        super();
        this._truckService = new TruckService();
    }

    async create(req, res, next) {
        try {
            const data = await this._truckService.create(req.body);
            return res.status(HttpStatus.CREATED).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getAll(req, res, next) {
        try {
            const data = await this._truckService.getAll(req.query);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getAllSelect(req, res, next) {
        try {
            const data = await this._truckService.getAllSelect();
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getIdAvatar(req, res, next) {
        try {
            const data = await this._truckService.getIdAvatar(req.params.id);
            res.set('Content-Type', validateAndReturn(data.contentType));
            return res.send(data.fileData);
        } catch (error) {
            next(this.handleError(error));
        }
    }
    async getId(req, res, next) {
        try {
            const data = await this._truckService.getId(req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async update(req, res, next) {
        try {
            const data = await this._truckService.update(req.body, req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async uploadImage(req, res, next) {
        try {
            const data = await this._truckService.uploadImage(req, req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async delete(req, res, next) {
        try {
            const data = await this._truckService.delete(req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

export default TruckController;
