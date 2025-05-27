import BaseResourceController from '../../base/base_resource_controller.js';
import ManagerService from './manager_service.js';
import HttpStatus from 'http-status';

class ManagerController extends BaseResourceController {
    constructor() {
        super();
        this._managerService = new ManagerService();
    }

    signin = async (req, res, next) => {
        try {
            const data = await this._managerService.signin(req.body);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            return next(this.handleError(error));
        }
    };

    signup = async (req, res, next) => {
        try {
            const data = await this._managerService.signup(req.body);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            return next(this.handleError(error));
        }
    };

    getAll = async (req, res, next) => {
        try {
            const data = await this._managerService.getAll(req.query);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            return next(this.handleError(error));
        }
    };

    getId = async (req, res, next) => {
        try {
            const data = await this._managerService.getId(req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            return next(this.handleError(error));
        }
    };

    update = async (req, res, next) => {
        try {
            const data = await this._managerService.update(req.body, req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            return next(this.handleError(error));
        }
    };

    addRole = async (req, res, next) => {
        try {
            const data = await this._managerService.addRole(req.body, req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            return next(this.handleError(error));
        }
    };

    delete = async (req, res, next) => {
        try {
            const data = await this._managerService.delete(req.params.id);
            return res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            return next(this.handleError(error));
        }
    };
}

export default ManagerController;
