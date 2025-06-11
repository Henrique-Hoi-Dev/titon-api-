import validateAndReturn from '../../../../utils/validFile.js';
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

    updateManagerDriver = async (req, res, next) => {
        try {
            const data = await this._driverService.updateManagerDriver(req.body, req.params.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    getIdAvatar = async (req, res, next) => {
        try {
            const data = await this._driverService.getIdAvatar(req.driver.id);
            res.set('Content-Type', validateAndReturn(data.contentType));
            return res.send(data.fileData);
        } catch (error) {
            next(this.handleError(error));
        }
    };

    uploadImage = async (req, res, next) => {
        try {
            const data = await this._driverService.uploadImage(req.driver.id, req);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    update = async (req, res, next) => {
        try {
            const data = await this._driverService.update(req.body, req.params.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    requestCodeValidationForgotPassword = async (req, res, next) => {
        try {
            const data = await this._driverService.requestCodeValidationForgotPassword(req.body);
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

    getAllManagerDriver = async (req, res, next) => {
        try {
            const data = await this._driverService.getAllManagerDriver(req.query);
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

    getIdManagerDriver = async (req, res, next) => {
        try {
            const data = await this._driverService.getIdManagerDriver(req.params.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };

    deleteManagerDriver = async (req, res, next) => {
        try {
            const data = await this._driverService.deleteManagerDriver(req.params.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    };
}

export default DriverController;
