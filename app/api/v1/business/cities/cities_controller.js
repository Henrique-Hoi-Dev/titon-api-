import BaseResourceController from '../../base/base_resource_controller.js';
import CitiesService from './cities_service.js';
import HttpStatus from 'http-status';

class CitiesController extends BaseResourceController {
    constructor() {
        super();
        this._citiesService = new CitiesService();
    }

    async allCities(req, res, next) {
        try {
            const data = await this._citiesService.allCities(req.query);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

export default CitiesController;
