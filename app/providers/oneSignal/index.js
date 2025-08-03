/* eslint-disable no-console */
import BaseIntegration from '../../api/v1/base/base_integration.js';

class OneSignal extends BaseIntegration {
    constructor() {
        super('oneSignal');
    }

    /**
     * Envia notificação push para um ou mais usuários específicos
     */
    async sendToUsers({ externalUserIds, title, message }) {
        try {
            const notification = {
                app_id: process.env.ONESIGNAL_APP_ID,
                contents: { en: message },
                headings: { en: title },
                include_external_user_ids: externalUserIds
            };

            const response = await this.httpClient.post('/notifications', notification, {
                headers: {
                    Authorization: `${process.env.ONESIGNAL_API_KEY}`
                }
            });
            this.logger?.info?.('Notificação enviada:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erro ao enviar notificação:', error.response?.data || error);
            throw error;
        }
    }

    /**
     * Envia notificação push para um playerId específico
     */
    async sendToAll({ title, message, playerId }) {
        try {
            const notification = {
                app_id: process.env.ONESIGNAL_APP_ID,
                include_player_ids: [playerId],
                headings: { pt: title },
                contents: { pt: message }
            };

            const response = await this.httpClient.post('/notifications', notification, {
                headers: {
                    Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao enviar notificação para all:', error.response?.data || error);
            const err = new Error('ERROR_SEND_NOTIFICATION_TO_ALL');
            err.status = 400;
            throw err;
        }
    }

    async getPlayers(limit = 50, offset = 0) {
        try {
            const response = await this.httpClient.get('/players', {
                headers: {
                    Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`
                },
                params: {
                    app_id: process.env.ONESIGNAL_APP_ID,
                    limit,
                    offset
                }
            });

            const subscribedPlayers = response.data.players;

            return subscribedPlayers;
        } catch (error) {
            console.error('Erro ao buscar players:', error.response?.data || error);
            throw error;
        }
    }

    async getPlayerId(playerId) {
        try {
            const response = await this.httpClient.get(`/players/${playerId}`, {
                headers: {
                    Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`
                },
                params: {
                    app_id: process.env.ONESIGNAL_APP_ID
                }
            });

            return response.data;
        } catch (error) {
            console.error('Erro ao buscar players:', error.response?.data || error);
            throw error;
        }
    }

    async bindExternalUserId(playerId, externalUserId) {
        try {
            const response = await this.httpClient.put(
                `/players/${playerId}`,
                {
                    app_id: process.env.ONESIGNAL_APP_ID,
                    external_user_id: externalUserId,
                    external_user_id_auth_hash:
                        'byxz07tft1p20cm2fmmct6i8uiswcwoa@templates.onesignal.email'
                },
                {
                    headers: {
                        Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`
                    }
                }
            );

            if (process.env.NODE_ENV === 'development') {
                console.log('✅ External ID vinculado com sucesso:', response.data);
            }
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao vincular external ID:', error.response?.data || error);
            throw error;
        }
    }

    async listNotifications(limit = 50, offset = 0) {
        try {
            const response = await this.httpClient.get('/notifications', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`
                },
                params: {
                    app_id: process.env.ONESIGNAL_APP_ID,
                    limit,
                    offset
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar notificações:', error.response?.data || error);
            const err = new Error('ERROR_GET_NOTIFICATIONS_PROVIDER');
            err.status = 400;
            throw err;
        }
    }
}

export default OneSignal;
