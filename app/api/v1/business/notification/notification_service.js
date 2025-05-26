import BaseService from '../../base/base_service';
import Notification from './notification_model';
import Driver from '../driver/driver_model';
import OneSignalProvider from '../../../../providers/oneSignal/index';

class NotificationService extends BaseService {
    constructor() {
        super();
        this._notificationModel = Notification;
        this._driverModel = Driver;
        this._oneSignalProvider = OneSignalProvider;
    }

    async getAll(driverId, { page = 1, limit = 10 }) {
        const checkIsDriver = await this._driverModel.findOne({
            where: { id: driverId, type_positions: 'COLLABORATOR' }
        });
        if (!checkIsDriver) throw Error('User not is Driver');

        const listOneSignal = await this._oneSignalProvider.listNotifications();
        const oneSignalList = listOneSignal.notifications.map((item) => ({
            title: item.headings,
            name: item.name,
            text: item.contents
        }));
        console.log('OneSignal notifications:', oneSignalList);

        // Busca notificações locais do banco com paginação
        const notifications = await this._notificationModel.findAll({
            where: { driver_id: driverId },
            order: [['created_at', 'DESC']],
            limit,
            offset: page - 1 ? (page - 1) * limit : 0,
            attributes: ['id', 'content', 'read', 'created_at']
        });

        // Conta o total de notificações para calcular as páginas
        const totalNotifications = await this._notificationModel.count({
            where: { driver_id: driverId }
        });
        const totalPages = Math.ceil(totalNotifications / limit);

        return {
            total: totalNotifications,
            totalPages,
            currentPage: Number(page),
            data: notifications
        };
    }

    async update(id) {
        const notification = await this._notificationModel.findByPk(id);
        if (!notification) throw Error('NOTIFICATION_NOT_FOUND');

        if (notification.driver_id === null) throw Error('Do not have permission for this notification');

        if (notification.read === true) throw Error('Has already been read.');

        await notification.update({ read: true });

        return { msg: 'successful' };
    }

    async markAllRead(driverId) {
        try {
            if (!driverId) throw Error('DRIVERID_NOT_FOUND');

            const notifications = await this._notificationModel.findAll({
                where: { driver_id: driverId }
            });

            if (!notifications || notifications.length === 0) return { msg: 'NOTIFICATION_NOT_FOUND' };

            // Atualiza todas as notificações para read: true de uma só vez
            await this._notificationModel.update({ read: true }, { where: { driver_id: driverId } });

            return { msg: 'successful' };
        } catch (error) {
            throw Error(error);
        }
    }

    async activateReceiveNotifications(body, driverId) {
        const driver = await this._driverModel.findByPk(driverId);
        if (!driver) throw Error('DRIVER_NOT_FOUND');

        const data = {
            player_id: body.player_id
        };

        await driver.update(data);

        return { msg: 'successful' };
    }

    async getAllUserNotifications(req) {
        const checkIsMaster = await this._managerModel.findOne({
            where: { id: req.userId, type_role: 'MASTER' }
        });

        if (!checkIsMaster) throw Error('User not is Master');

        const notifications = await Notifications.findAll({
            where: { user_id: req.userId, read: false },
            order: [['created_at', 'DESC']],
            attributes: [
                'id',
                'content',
                'read',
                'created_at',
                'freight_id',
                'driver_id',
                'user_id',
                'financial_statements_id'
            ]
        });

        const history = await this._notificationModel.findAll({
            where: { user_id: req.userId, read: true },
            order: [['created_at', 'DESC']],
            attributes: [
                'id',
                'content',
                'read',
                'created_at',
                'freight_id',
                'driver_id',
                'user_id',
                'financial_statements_id'
            ]
        });

        return { notifications, history };
    }

    async updateRead(id) {
        const notification = await this._notificationModel.findByPk(id);

        if (!notification) throw Error('Notification not found');
        if (notification.user_id === null) throw Error('Do not have permission for this notification');
        if (notification.read === true) throw Error('Has already been read.');

        await notification.update({ read: true });

        return await Notifications.findByPk(id, {
            attributes: ['id', 'content', 'read', 'freight_id', 'driver_id']
        });
    }

    _updateHours(numOfHours, date = new Date()) {
        const dateCopy = new Date(date.getTime());

        dateCopy.setHours(dateCopy.getHours() - numOfHours);

        return dateCopy;
    }

    _handleMongoError(error) {
        const keys = Object.keys(error.errors);
        const err = new Error(error.errors[keys[0]].message);
        err.field = keys[0];
        err.status = 409;
        throw err;
    }
}

export default NotificationService;
