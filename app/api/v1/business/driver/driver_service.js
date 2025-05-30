import BaseService from '../../base/base_service.js';
import Driver from './driver_model.js';
import ValidateCode from '../validateCode/validateCode_model.js';
import FinancialStatements from '../financialStatements/financialStatements_model.js';
import validateCpf from '../../../../utils/validateCpf.js';

import { createExpirationDateFromNow } from '../../../../utils/date.js';
import { Op, literal } from 'sequelize';
import { generateDriverToken } from '../../../../utils/jwt.js';
import { sendSMS } from '../../../../providers/aws/index.js';
import { generateRandomCode } from '../../../../utils/crypto.js';

class DriverService extends BaseService {
    constructor() {
        super();
        this._driverModel = Driver;
        this._validateCodeModel = ValidateCode;
        this._financialStatementsModel = FinancialStatements;
    }

    async signin(body) {
        const { cpf, password } = body;

        const driver = await Driver.findOne({
            where: { cpf: cpf }
        });

        if (!driver) {
            const err = new Error('DRIVER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!(driver.dataValues.type_positions === 'COLLABORATOR')) {
            const err = new Error('INSUFFICIENT_PERMISSIONS');
            err.status = 403;
            throw err;
        }

        if (!(await driver.checkPassword(password))) {
            const err = new Error('INVALID_DRIVER_PASSWORD');
            err.status = 401;
            throw err;
        }

        const {
            id,
            credit,
            value_fix,
            percentage,
            type_positions,
            status,
            external_user_id,
            player_id,
            name
        } = driver;

        const token = generateDriverToken({
            id,
            cpf,
            type_positions,
            external_user_id,
            player_id,
            status,
            credit,
            value_fix,
            percentage,
            name
        });

        return { token };
    }

    async profile(id) {
        const driver = await this._driverModel.findByPk(id, {
            attributes: [
                'id',
                'name',
                'number_cnh',
                'valid_cnh',
                'date_valid_mopp',
                'date_valid_nr20',
                'date_valid_nr35',
                'cpf',
                'date_admission',
                'date_birthday',
                'credit',
                'value_fix',
                'percentage',
                'daily'
            ]
        });

        if (!driver) {
            const err = new Error('DRIVER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        return driver.toJSON();
    }

    async update(id, body) {
        const { oldPassword, cpf, ...updateData } = body;

        const driver = await this._driverModel.findByPk(id);

        if (!driver) {
            const err = new Error('DRIVER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (oldPassword && !(await driver.checkPassword(oldPassword))) {
            const err = new Error('PASSWORDS_NOT_MATCHED');
            err.status = 400;
            throw err;
        }

        await driver.update(updateData);

        return await this._driverModel.findByPk(id);
    }

    async requestCodeValidation({ phone }) {
        try {
            const user = await this._driverModel.findOne({
                where: {
                    phone: phone
                }
            });

            if (!user || !user.phone) {
                const err = new Error('CELL_PHONE_DOES_NOT_EXIST');
                err.status = 404;
                throw err;
            }

            const verificationCode = generateRandomCode();
            const expirationDate = createExpirationDateFromNow(30);

            await this._validateCodeModel.update(
                { status: 'EXPIRED' },
                {
                    where: {
                        cpf: user.cpf,
                        status: 'AVAILABLE'
                    }
                }
            );

            const code = await this._validateCodeModel.create({
                cpf: user.cpf,
                expiration_date: expirationDate,
                code: verificationCode,
                status: 'AVAILABLE'
            });

            const message =
                'Olá,\n\n' +
                'Você solicitou uma redefinição de senha em LOGBOOK. Use o código de verificação abaixo para prosseguir com a redefinição:\n\n' +
                `*Código de Verificação*: *${code.code}*\n\n` +
                'Por questões de segurança, este código é válido por apenas 15 minutos. Não compartilhe este código com ninguém.\n\n' +
                'Se você não solicitou uma redefinição de senha, por favor ignore esta mensagem.';

            let resultSendSMS = await sendSMS({
                phoneNumber: phone,
                message
            });

            resultSendSMS.cpf = user.cpf;
            resultSendSMS.code = verificationCode;

            return { token: generateDriverToken(resultSendSMS) };
        } catch (error) {
            if (['CELL_PHONE_DOES_NOT_EXIST', 'ERROR_SENDING_CODE'].includes(error.message)) {
                throw new Error(`${error.message}`);
            } else {
                throw error;
            }
        }
    }

    async validCodeForgotPassword({ code, cpf }) {
        const validCode = await this._validateCodeModel.findOne({
            where: {
                cpf,
                code,
                status: 'AVAILABLE'
            }
        });

        let valid = true;

        if (!validCode) {
            // O código não foi encontrado ou não está disponível
            valid = false;
            const err = new Error('VERIFICATION_CODE_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        // Verificar se o código expirou
        const expirationTime = new Date(validCode.expiration_date.getTime() + 15 * 60000);
        const now = new Date();

        if (expirationTime < now) {
            valid = false;

            await this._validateCodeModel.update(
                { status: 'EXPIRED' },
                {
                    where: {
                        cpf: validCode.cpf,
                        code
                    }
                }
            );

            throw Error('CODE_IS_ALREADY_EXPIRED');
        }

        const [upValidOk] = await this._validateCodeModel.update(
            { status: 'USED' },
            {
                where: {
                    cpf: validCode.cpf,
                    code,
                    status: 'AVAILABLE'
                }
            }
        );

        const driver = await this._driverModel.findOne({
            where: { cpf }
        });

        if (!driver) {
            const err = new Error('DRIVER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (upValidOk) {
            return {
                token: generateDriverToken({
                    valid,
                    name: driver.name,
                    phone: driver.phone,
                    cpf: driver.cpf
                })
            };
        } else {
            return { valid: false, mgs: 'Erro no validar Código' };
        }
    }

    async forgotPassword(body) {
        try {
            const { password, cpf } = body;

            const driver = await this._driverModel.findOne({ where: { cpf } });

            if (password && (await driver.checkPassword(password))) {
                const err = new Error('NEW_PASSWORD_SAME_AS_OLD');
                err.status = 400;
                throw err;
            }

            await driver.update({ password });

            return { msg: 'Password updated successfully' };
        } catch (error) {
            throw error;
        }
    }

    async create(body) {
        const cpf = body.cpf.replace(/\D/g, '');
        const validCpf = validateCpf(cpf);

        if (!body.value_fix && !body.percentage) {
            const err = new Error('NEED_SOME_PAYMENT');
            err.status = 400;
            throw err;
        }

        const data = {
            cpf: validCpf,
            password: body.password,
            name: body.name,
            phone: `+55${body.phone}`,
            email: body.email,
            type_position: 'COLLABORATOR',
            value_fix: body.value_fix,
            percentage: body.percentage,
            daily: body.daily
        };

        // doing name user verification
        const driverExist = await this._driverModel.findOne({
            where: { cpf: validCpf }
        });

        if (driverExist) {
            const err = new Error('THIS_CPF_ALREADY_EXISTS');
            err.status = 400;
            throw err;
        }

        await this._driverModel.create(data);

        return { msg: 'Driver created successfully' };
    }

    async resetPassword({ cpf }) {
        try {
            const driver = await this._driverModel.findOne({ where: { cpf } });
            if (!driver) {
                const err = new Error('DRIVER_NOT_FOUND');
                err.status = 404;
                throw err;
            }

            const newToke = generateDriverToken({ cpf: cpf });
            const resetUrl = `${
                process.env.FRONT_URL || 'http://localhost:3000'
            }/driver/forgot-password?token=${newToke}`;

            const message = `Gerenciador fez uma redefinição da sua senha. Clique no link abaixo para criar uma nova senha. Atenção: este link é válido por apenas 2 horas: ${resetUrl}`;

            await sendSMS({
                phoneNumber: driver.phone,
                message: message
            });

            return resetUrl;
        } catch (error) {
            this.logger.error(error);
            throw Error(error);
        }
    }

    async getAllSelect() {
        const select = await this._driverModel.findAll({
            where: {
                id: {
                    [Op.notIn]: literal('(SELECT "driver_id" FROM "financial_statements")')
                }
            },
            attributes: ['id', 'name'],
            raw: true
        });

        const selectFinancial = await this._driverModel.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: this._financialStatementsModel,
                    as: 'financialStatements',
                    required: true,
                    where: { status: false },
                    attributes: ['id', 'driver_id', 'driver_name']
                }
            ],
            raw: true,
            nest: true
        });

        return [...select, ...selectFinancial];
    }

    async getAllManagerDriver(query) {
        const { page = 1, limit = 100, sort_order = 'ASC', sort_field = 'id', search } = query;

        const where = {};
        // if (id) where.id = id;
        /* eslint-disable indent */
        const drivers = await this._driverModel.findAll({
            where: search
                ? {
                      [Op.or]: [
                          // { id: search },
                          { truck: { [Op.iLike]: `%${search}%` } },
                          { name: { [Op.iLike]: `%${search}%` } }
                      ]
                  }
                : where,
            order: [[sort_field, sort_order]],
            limit: limit,
            offset: page - 1 ? (page - 1) * limit : 0,
            attributes: [
                'id',
                'name',
                'cpf',
                'credit',
                'value_fix',
                'percentage',
                'daily',
                'cart',
                'truck'
            ]
        });

        const total = await this._driverModel.count();
        const totalPages = Math.ceil(total / limit);

        const currentPage = Number(page);

        return {
            docs: drivers.map((driver) => driver.toJSON()),
            total,
            totalPages,
            currentPage
        };
    }

    async getIdManagerDriver(id) {
        const driver = await this._driverModel.findByPk(id, {
            attributes: [
                'id',
                'name',
                'number_cnh',
                'valid_cnh',
                'date_valid_mopp',
                'date_valid_nr20',
                'date_valid_nr35',
                'cpf',
                'date_admission',
                'date_birthday',
                'credit',
                'value_fix',
                'percentage',
                'daily',
                'transactions'
            ]
        });

        if (!driver) {
            const err = new Error('DRIVER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        return driver.toJSON();
    }

    async updateManagerDriver(body, id) {
        const driver = await this._driverModel.findByPk(id);

        if (!driver) {
            const err = new Error('DRIVER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const { cpf, phone, password, ...allowedUpdates } = body;

        await driver.update(allowedUpdates);

        const driverResult = await this._driverModel.findByPk(id, {
            attributes: [
                'id',
                'name',
                'cpf',
                'number_cnh',
                'valid_cnh',
                'date_valid_mopp',
                'date_valid_nr20',
                'date_valid_nr35',
                'date_admission',
                'date_birthday',
                'credit',
                'value_fix',
                'percentage',
                'daily'
            ]
        });

        return driverResult.toJSON();
    }

    async deleteManagerDriver(id) {
        const driver = await this._driverModel.findByPk(id);

        if (!driver) {
            const err = new Error('DRIVER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        // Verifica se existe ficha financeira ativa
        const activeFinancial = await this._financialStatementsModel.findOne({
            where: {
                driver_id: id,
                status: true
            }
        });

        if (activeFinancial) {
            const err = new Error('DRIVER_HAS_ACTIVE_FINANCIAL');
            err.status = 400;
            throw err;
        }

        await driver.destroy();

        return { msg: 'Deleted driver' };
    }
}

export default DriverService;
