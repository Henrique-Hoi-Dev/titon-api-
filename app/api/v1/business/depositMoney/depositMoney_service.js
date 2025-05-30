import DepositMoney from './depositMoney_model.js';
import BaseService from '../../base/base_service.js';
import Driver from '../driver/driver_model.js';
import FinancialStatements from '../financialStatements/financialStatements_model.js';
import Freight from '../freight/freight_model.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

import { deleteFile, sendFile } from '../../../../providers/aws/index.js';
import { generateRandomCode } from '../../../../utils/crypto.js';
import { updateHours } from '../../../../utils/updateHours.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Sao_Paulo');

class DepositMoneyService extends BaseService {
    constructor() {
        super();
        this._depositMoneyModel = DepositMoney;
        this._driverModel = Driver;
        this._financialStatementsModel = FinancialStatements;
        this._freightModel = Freight;
    }

    async create(driver, body) {
        const { freight_id } = body;

        const [financial, freight] = await Promise.all([
            this._financialStatementsModel.findOne({
                where: { driver_id: driver.id, status: true }
            }),
            this._freightModel.findByPk(freight_id)
        ]);

        if (!financial) {
            const err = new Error('FINANCIAL_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!freight) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (freight.status === 'STARTING_TRIP') {
            const now = updateHours(dayjs().tz('America/Sao_Paulo').utcOffset() / 60);

            const result = await this._depositMoneyModel.create({
                ...body,
                registration_date: now,
                financial_statements_id: financial.id
            });

            const driverFind = await this._driverModel.findByPk(user.id);
            driverFind.addTransaction({
                value: result.value,
                typeTransactions: result.type_transaction
            });

            const driver = await this._driverModel.findByPk(driverFind.id);
            const values = driverFind.transactions.map((res) => res.value);
            const total = values.reduce((acc, cur) => acc + cur, 0);

            await driver.update({
                transactions: driverFind.transactions,
                credit: total
            });

            return result.toJSON();
        }

        const err = new Error('THIS_FRONT_IS_NOT_TRAVELING');
        err.status = 400;
        throw err;
    }

    async uploadDocuments(payload, { id }) {
        const { file, body } = payload;

        const depositMoney = await this._depositMoneyModel.findByPk(id);
        if (!depositMoney) {
            const err = new Error('DEPOSIT_MONEY_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (depositMoney.img_receipt && depositMoney.img_receipt.uuid) {
            await this.deleteFile({ id });
        }

        if (!body.category) {
            const err = new Error('CATEGORY_OR_TYPE_NOT_FOUND');
            err.status = 400;
            throw err;
        }

        const originalFilename = file.originalname;

        const code = generateRandomCode(9);

        file.name = code;

        await sendFile(payload);

        const infoDepositMoney = await depositMoney.update({
            img_receipt: {
                uuid: file.name,
                name: originalFilename,
                mimetype: file.mimetype,
                category: body.category
            }
        });

        return infoDepositMoney.toJSON();
    }

    async deleteFile({ id }) {
        const depositMoney = await this._depositMoneyModel.findByPk(id);
        if (!depositMoney) {
            const err = new Error('DEPOSIT_MONEY_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!depositMoney.img_receipt) {
            const err = new Error('DEPOSIT_MONEY_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        try {
            await this._deleteFileIntegration({
                filename: depositMoney.img_receipt.uuid,
                category: depositMoney.img_receipt.category
            });

            const infoDepositMoney = await depositMoney.update({
                img_receipt: {}
            });

            return infoDepositMoney.toJSON();
        } catch (error) {
            const err = new Error(error);
            err.status = 400;
            throw err;
        }
    }

    async _deleteFileIntegration({ filename, category }) {
        try {
            return await deleteFile({ filename, category });
        } catch (error) {
            const err = new Error(error);
            err.status = 400;
            throw err;
        }
    }

    async getAll(query) {
        const { page = 1, limit = 10, sort_order = 'ASC', sort_field = 'id' } = query;

        const totalItems = (await this._depositMoneyModel.findAll()).length;
        const totalPages = Math.ceil(totalItems / limit);

        const depositMoney = await this._depositMoneyModel.findAll({
            order: [[sort_field, sort_order]],
            limit: limit,
            offset: page - 1 ? (page - 1) * limit : 0
        });

        const currentPage = Number(page);

        return {
            docs: depositMoney.map((res) => res.toJSON()),
            totalItems,
            totalPages,
            currentPage
        };
    }

    async getId(id) {
        const depositMoney = await this._depositMoneyModel.findByPk(id);

        if (!depositMoney) {
            const err = new Error('DEPOSIT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        return depositMoney.toJSON();
    }
}

export default DepositMoneyService;
