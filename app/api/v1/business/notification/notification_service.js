import BaseService from '../../base/base_service.js';
import Notification from './notification_model.js';
import Driver from '../driver/driver_model.js';
import Manager from '../manager/manager_model.js';
import OneSignalProvider from '../../../../providers/oneSignal/index.js';

class NotificationService extends BaseService {
    constructor() {
        super();
        this._notificationModel = Notification;
        this._driverModel = Driver;
        this._managerModel = Manager;
        this._oneSignalProvider = new OneSignalProvider();
    }

    async createNotification(user, user_id, body) {
        const driver = await this._driverModel.findByPk(user_id);
        if (!driver) {
            const err = new Error('DRIVER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const notification = await this._notificationModel.create({
            driver_id: user_id,
            user_id: user.id,
            content: body.message,
            read: false
        });

        if (!driver.player_id) {
            const err = new Error('DRIVER_NOT_HAS_PLAYER_ID');
            err.status = 404;
            throw err;
        }

        // const getPlayerId = await this._oneSignalProvider.getPlayerId(driver.player_id);
        // console.log('🚀 ~ NotificationService ~ getAll ~ getPlayerId:', getPlayerId);
        // if (!getPlayerId.external_user_id) {
        const bindExternalUserId = await this._oneSignalProvider.bindExternalUserId(
            driver.player_id,
            driver.cpf
        );
        console.log('🚀 ~ NotificationService ~ getAll ~ bindExternalUserId:', bindExternalUserId);
        // }

        const sendToAllOneSignal = await this._oneSignalProvider.sendToUsers({
            title: body.title,
            message: body.message,
            externalUserIds: [driver.cpf]
        });

        return { notification: notification.toJSON(), sendToAllOneSignal };
    }

    async getAll(driver, { page = 1, limit = 10 }) {
        const checkIsDriver = await this._driverModel.findOne({
            where: { id: driver.id, type_positions: 'COLLABORATOR' }
        });
        if (!checkIsDriver) {
            const err = new Error('USER_NOT_IS_DRIVER');
            err.status = 400;
            throw err;
        }
        // const listOneSignal = await this._oneSignalProvider.listNotifications();
        // const oneSignalList = listOneSignal.notifications.map((item) => ({
        //     title: item.headings,
        //     name: item.name,
        //     text: item.contents
        // }));

        // // eslint-disable-next-line no-console
        // console.log('OneSignal notifications:', oneSignalList);

        // Busca notificações locais do banco com paginação
        const notifications = await this._notificationModel.findAll({
            where: { driver_id: driver.id },
            order: [['created_at', 'DESC']],
            limit,
            offset: page - 1 ? (page - 1) * limit : 0,
            attributes: ['id', 'content', 'read', 'created_at', 'driver_id']
        });

        // Conta o total de notificações para calcular as páginas
        const totalNotifications = await this._notificationModel.count({
            where: { driver_id: driver.id }
        });
        const totalPages = Math.ceil(totalNotifications / limit);

        return {
            total: totalNotifications,
            totalPages,
            currentPage: Number(page),
            docs: notifications.map((res) => res.toJSON())
        };
    }

    async updateReadDriver(driver, id) {
        const notification = await this._notificationModel.findOne({
            where: { id, driver_id: driver.id, read: false }
        });

        if (!notification) {
            const err = new Error('NOTIFICATION_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        await notification.update({ read: true });

        return { msg: 'READ NOTIFICATION SUCCESS' };
    }

    async markAllRead(driver) {
        const notifications = await this._notificationModel.findAll({
            where: { driver_id: driver.id, read: false }
        });

        if (!notifications || !notifications.length) {
            const err = new Error('NO_NOTIFICATION_TO_MARK_AS_READ');
            err.status = 404;
            throw err;
        }

        await this._notificationModel.update({ read: true }, { where: { driver_id: driver.id } });

        return { msg: 'MARK ALL READ NOTIFICATION SUCCESS' };
    }

    async activatePushReceiveNotifications(body, driver) {
        const driverData = await this._driverModel.findByPk(driver.id);
        if (!driverData) {
            const err = new Error('DRIVER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const data = {
            player_id: body.player_id
        };

        await driverData.update(data);

        return { msg: 'ACTIVATE RECEIVE PUSH NOTIFICATIONS SUCCESS' };
    }

    async getAllUserNotifications(user) {
        const checkIsMaster = await this._managerModel.findOne({
            where: { id: user.id, type_role: 'MASTER' }
        });

        if (!checkIsMaster) {
            const err = new Error('USER_NOT_IS_MASTER');
            err.status = 400;
            throw err;
        }

        const notifications = await this._notificationModel.findAll({
            where: { user_id: user.id, read: false },
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
            where: { user_id: user.id, read: true },
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

        return {
            notifications: notifications.map((res) => res.toJSON()),
            history: history.map((res) => res.toJSON())
        };
    }

    async updateReadManager(user, id) {
        const notification = await this._notificationModel.findOne({
            where: { id, user_id: user.id, read: false }
        });

        if (!notification) {
            const err = new Error('NOTIFICATION_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        await notification.update({ read: true });

        return await this._notificationModel
            .findByPk(id, {
                attributes: ['id', 'content', 'read', 'freight_id', 'driver_id', 'user_id']
            })
            .then((res) => res.toJSON());
    }
}

export default NotificationService;
