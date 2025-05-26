import StatesService from './states_service';
import BaseResourceController from '../../base/base_resource_controller';
import HttpStatus from 'http-status';

class UsersController extends BaseResourceController {
    constructor() {
        super();
        this._statesService = new StatesService();
    }

    async allStates(req, res, next) {
        try {
            const data = await this._statesService.allStates(req.query);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async popularCityStateData(req, res, next) {
        try {
            const data = await this._statesService.popularCityStateData(req);
            res.status(HttpStatus.CREATED).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

module.exports = UsersController;
