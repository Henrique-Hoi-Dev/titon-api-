import BaseResourceController from '../../base/base_resource_controller.js';
import DriverService from './driver_service.js';
import HttpStatus from 'http-status';

class DriverController extends BaseResourceController {
    constructor() {
        super();
        this._driverService = new DriverService();
    }

    signin = async (req, res, next) => {
        try {
            const data = await this._driverService.signin(req.body);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    profile = async (req, res, next) => {
        try {
            const data = await this._driverService.profile(req.driver.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    update = async (req, res, next) => {
        try {
            const data = await this._driverService.updateDriver(req.body, req.params.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    requestCodeValidation = async (req, res, next) => {
        try {
            const data = await this._driverService.requestCodeValidation(req.body);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    validCodeForgotPassword = async (req, res, next) => {
        try {
            const data = await this._driverService.validCodeForgotPassword(req.body);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    forgotPassword = async (req, res, next) => {
        try {
            const data = await this._driverService.forgotPassword(req.body);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    create = async (req, res, next) => {
        try {
            const data = await this._driverService.create(req.body);
            res.status(HttpStatus.CREATED).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    resetPassword = async (req, res, next) => {
        try {
            const data = await this._driverService.resetPassword(req.params);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    getAll = async (req, res, next) => {
        try {
            const data = await this._driverService.getAll(req.query);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    getAllSelect = async (req, res, next) => {
        try {
            const data = await this._driverService.getAllSelect(req.query);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    getId = async (req, res, next) => {
        try {
            const data = await this._driverService.getId(req.params.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    delete = async (req, res, next) => {
        try {
            const data = await this._driverService.delete(req.params.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };
}

export default DriverController;
