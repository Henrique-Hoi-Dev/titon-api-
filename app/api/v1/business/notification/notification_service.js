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

    async createNotification({
        driver_id = null,
        manager_id = null,
        financial_id = null,
        freight_id = null,
        title,
        content,
        titlePush,
        messagePush
    }) {
        const notification = await this._notificationModel.create({
            driver_id: driver_id,
            user_id: manager_id,
            freight_id: freight_id,
            financial_statements_id: financial_id,
            title: title,
            content: content
        });

        // Envia notificação push para o driver
        if (driver_id) {
            const driver = await this._driverModel.findByPk(driver_id);
            if (!driver) {
                const err = new Error('DRIVER_NOT_FOUND');
                err.status = 404;
                throw err;
            }

            if (!driver.player_id) {
                const sendToAllOneSignal = await this._oneSignalProvider.sendToUsers({
                    title: titlePush,
                    message: messagePush,
                    externalUserIds: [driver.cpf]
                });

                this.logger?.info?.('Notificação enviada push:', sendToAllOneSignal);
            }
            this.logger?.info?.('Notificação nao enviada push:', driver.cpf);
        }

        return notification.toJSON();
    }

    async getAllManagerFinancialStatement({ financial_id, user_id }) {
        const notification = await this._notificationModel.findAll({
            where: { financial_statements_id: financial_id, user_id: user_id },
            attributes: ['id', 'title', 'content', 'createdAt', 'driver_id', 'freight_id']
        });

        return notification.map((res) => res.toJSON());
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
            player_id: body.player_id,
            external_user_id: body.external_user_id
        };

        await driverData.update(data);

        return { msg: 'ACTIVATE RECEIVE PUSH NOTIFICATIONS SUCCESS' };
    }

    async getAllUserNotifications(user, query) {
        const { page = 1, limit = 10 } = query;

        const checkIsMaster = await this._managerModel.findOne({
            where: { id: user.id }
        });

        if (!checkIsMaster) {
            const err = new Error('USER_NOT_IS_MASTER');
            err.status = 400;
            throw err;
        }

        const where = { user_id: user.id };

        const totalItems = await this._notificationModel.count({
            where
        });

        // Conta total de mensagens não lidas
        const totalUnread = await this._notificationModel.count({
            where: {
                ...where,
                read: false
            }
        });

        const totalPages = Math.ceil(totalItems / limit);
        const offset = (page - 1) * limit;

        const notifications = await this._notificationModel.findAll({
            where,
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
            ],
            limit: Number(limit),
            offset: Number(offset)
        });

        return {
            docs: notifications.map((res) => res.toJSON()),
            totalItems,
            totalPages,
            currentPage: Number(page),
            totalUnread
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
                attributes: [
                    'id',
                    'content',
                    'read',
                    'freight_id',
                    'driver_id',
                    'user_id',
                    'created_at',
                    'financial_statements_id'
                ]
            })
            .then((res) => res.toJSON());
    }
}

export default NotificationService;
