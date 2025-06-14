import BaseResourceController from '../../base/base_resource_controller.js';
import NotificationService from './notification_service.js';
import HttpStatus from 'http-status';

class NotificationController extends BaseResourceController {
    constructor() {
        super();
        this._notificationService = new NotificationService();
    }

    async getAll(req, res, next) {
        try {
            const data = await this._notificationService.getAll(req.driver, req.query);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async activatePushReceiveNotifications(req, res, next) {
        try {
            const data = await this._notificationService.activatePushReceiveNotifications(
                req.body,
                req.driver
            );
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async updateReadDriver(req, res, next) {
        try {
            const data = await this._notificationService.updateReadDriver(
                req.driver,
                req.params.id
            );
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async markAllRead(req, res, next) {
        try {
            const data = await this._notificationService.markAllRead(req.driver);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getAllUserNotifications(req, res, next) {
        try {
            const data = await this._notificationService.getAllUserNotifications(
                req.manager,
                req.query
            );
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async updateReadManager(req, res, next) {
        try {
            const data = await this._notificationService.updateReadManager(
                req.manager,
                req.params.id
            );
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async createNotification(req, res, next) {
        try {
            const data = await this._notificationService.createNotification(req.body);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

export default NotificationController;
