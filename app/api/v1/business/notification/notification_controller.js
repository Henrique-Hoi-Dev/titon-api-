import BaseResourceController from '../../base/base_resource_controller';
import NotificationService from './notification_service';
import HttpStatus from 'http-status';

class NotificationController extends BaseResourceController {
    constructor() {
        super();
        this._notificationService = new NotificationService();
    }

    async getAll(req, res, next) {
        try {
            const data = await this._notificationService.getAll(req.driverId, req.query);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async activateReceiveNotifications(req, res, next) {
        try {
            const data = await this._notificationService.activateReceiveNotifications(req.body, req.driverId);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async update(req, res, next) {
        try {
            const data = await this._notificationService.update(req.params.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async markAllRead(req, res, next) {
        try {
            const data = await this._notificationService.markAllRead(req.driverId);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async getAllUserNotifications(req, res, next) {
        try {
            const data = await this._notificationService.getAllUserNotifications(req, res);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }

    async updateRead(req, res, next) {
        try {
            const data = await this._notificationService.updateRead(req.params.id);
            res.status(HttpStatus.OK).json(this.parseKeysToCamelcase({ data }));
        } catch (error) {
            next(this.handleError(error));
        }
    }
}

export default NotificationController;
