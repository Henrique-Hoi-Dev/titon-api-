import axios from 'axios';
import { Client } from 'onesignal-node';
import dotenv from 'dotenv';

dotenv.config();

const oneSignalClient = new Client(process.env.ONESIGNAL_APP_ID, process.env.ONESIGNAL_API_KEY);

export default {
    /**
     * Envia notificação push para um ou mais usuários específicos
     * @param {Array<string>} externalUserIds Lista de IDs únicos que você cadastrou na OneSignal
     * @param {string} title Título da notificação
     * @param {string} message Conteúdo da notificação
     * @returns {Promise<any>} Retorno da API da OneSignal
     */
    async sendToUsers({ externalUserIds, title, message }) {
        try {
            const notification = {
                include_external_user_ids: externalUserIds,
                name: 'Gerenciador',
                headings: {
                    en: title
                },
                contents: {
                    en: message
                },
                app_id: process.env.ONESIGNAL_APP_ID
                // data: {
                //     foo: 'bar',
                // },
            };

            const response = await oneSignalClient.createNotification(notification);
            this.logger.info('notifica::::::::::::', response.body);
            return response.body;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erro ao enviar notificação:', error);
            throw error;
        }
    },

    /**
     * Envia notificação push para todos os usuários (segmento "All")
     */
    async sendToAll({ title, message }) {
        try {
            const notification = {
                included_segments: ['All'],
                headings: { pt: title },
                contents: { pt: message },
                app_id: process.env.ONESIGNAL_APP_ID
            };

            const response = await oneSignalClient.createNotification(notification);
            return response.body;
        } catch {
            const err = new Error('ERROR_SEND_NOTIFICATION_TO_ALL');
            err.status = 400;
            throw err;
        }
    },

    async getPlayers(limit = 50, offset = 0) {
        try {
            const response = await axios.get('https://onesignal.com/api/v1/players', {
                params: {
                    app_id: process.env.ONESIGNAL_APP_ID,
                    limit,
                    offset
                },
                headers: {
                    Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`
                }
            });
            return response.data;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erro ao buscar players:', error);
            throw error;
        }
    },

    async listNotifications(limit = 50, offset = 0) {
        try {
            const response = await axios.get('https://onesignal.com/api/v1/notifications', {
                params: {
                    app_id: process.env.ONESIGNAL_APP_ID,
                    limit,
                    offset
                },
                headers: {
                    Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`
                }
            });
            return response.data;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erro ao buscar notificações:', error);
            const err = new Error('ERROR_GET_NOTIFICATIONS');
            err.status = 400;
            throw err;
        }
    }
};
