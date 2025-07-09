import { deleteFile, sendFile } from '../../../../providers/aws/index.js';
import { generateRandomCode } from '../../../../utils/crypto.js';
import { updateHours } from '../../../../utils/updateHours.js';

import TravelExpensesModel from './travelExpenses_model.js';
import BaseService from '../../base/base_service.js';
import dayjs from 'dayjs';
import FinancialStatements from '../financialStatements/financialStatements_model.js';
import Freight from '../freight/freight_model.js';

import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Sao_Paulo');

class TravelExpensesService extends BaseService {
    constructor() {
        super();
        this._travelExpensesModel = TravelExpensesModel;
        this._financialStatementsModel = FinancialStatements;
        this._freightModel = Freight;
    }

    async create(driver, body) {
        let { freight_id } = body;

        const [financial, freight] = await Promise.all([
            this._financialStatementsModel.findOne({
                where: { driver_id: driver.id, status: true }
            }),
            this._freightModel.findByPk(freight_id)
        ]);

        if (!financial.dataValues) {
            const err = new Error('FINANCIAL_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!freight.dataValues) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (freight.dataValues.status === 'STARTING_TRIP') {
            const now = updateHours(dayjs().tz('America/Sao_Paulo').utcOffset() / 60);

            const result = await this._travelExpensesModel.create({
                ...body,
                registration_date: now,
                financial_statements_id: financial.id
            });

            return result;
        }

        const err = new Error('TRIP_NOT_FOUND');
        err.status = 404;
        throw err;
    }

    async uploadDocuments(payload, { id }) {
        const { file, body } = payload;

        const travelExpenses = await this._travelExpensesModel.findByPk(id);
        if (!travelExpenses.dataValues) {
            const err = new Error('TRAVELEXPENSES_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (travelExpenses.img_receipt && travelExpenses.img_receipt.uuid) {
            await this.deleteFile({ id });
        }

        if (!body.category) {
            const err = new Error('CATEGORY_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const originalFilename = file.originalname;

        const code = generateRandomCode(9);

        file.name = code;

        await sendFile(payload);

        const infoTravelExpenses = await travelExpenses.update({
            img_receipt: {
                uuid: file.name,
                name: originalFilename,
                mimetype: file.mimetype,
                category: body.category
            }
        });

        return infoTravelExpenses;
    }

    async deleteFile({ id }) {
        const travelExpenses = await this._travelExpensesModel.findByPk(id);
        if (!travelExpenses.dataValues) {
            const err = new Error('TRAVELEXPENSES_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        try {
            await this._deleteFileIntegration({
                filename: travelExpenses.img_receipt.uuid,
                category: travelExpenses.img_receipt.category
            });

            const infoTravelExpenses = await travelExpenses.update({
                img_receipt: {}
            });

            return infoTravelExpenses;
        } catch {
            const err = new Error('ERROR_DELETE_FILE');
            err.status = 400;
            throw err;
        }
    }

    async _deleteFileIntegration({ filename, category }) {
        try {
            return await deleteFile({ filename, category });
        } catch {
            const err = new Error('ERROR_DELETE_FILE');
            err.status = 400;
            throw err;
        }
    }

    async getAll(query) {
        const { freight_id, page = 1, limit = 10, sort_order = 'ASC', sort_field = 'id' } = query;

        const totalItems = (await this._travelExpensesModel.findAll()).length;
        const totalPages = Math.ceil(totalItems / limit);

        const where = {};
        if (freight_id) {
            where.freight_id = freight_id;
        }

        const travelExpenses = await this._travelExpensesModel.findAll({
            where,
            order: [[sort_field, sort_order]],
            limit: limit,
            offset: page - 1 ? (page - 1) * limit : 0
        });

        const currentPage = Number(page);

        return {
            docs: travelExpenses.map((travelExpense) => travelExpense.toJSON()),
            totalItems,
            totalPages,
            currentPage
        };
    }

    async getId(id) {
        const travelExpense = await this._travelExpensesModel.findByPk(id);

        if (!travelExpense.dataValues) {
            const err = new Error('TRAVELEXPENSES_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        return travelExpense.toJSON();
    }
}

export default TravelExpensesService;
