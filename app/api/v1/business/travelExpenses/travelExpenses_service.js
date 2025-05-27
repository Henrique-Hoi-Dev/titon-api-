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

    async create(driverId, body) {
        let { freight_id } = body;

        const financial = await this._financialStatementsModel.findOne({
            where: { driver_id: driverId, status: true }
        });
        if (!financial) throw new Error('FINANCIAL_NOT_FOUND');

        const freight = await this._freightModel.findByPk(freight_id);
        if (!freight) throw new Error('FREIGHT_NOT_FOUND');

        if (freight.status === 'STARTING_TRIP') {
            const now = updateHours(dayjs().tz('America/Sao_Paulo').utcOffset() / 60);

            const result = await this._travelExpensesModel.create({
                ...body,
                registration_date: now,
                financial_statements_id: financial.id
            });

            return { data: result };
        }

        throw new Error('This front is not traveling');
    }

    async uploadDocuments(payload, { id }) {
        const { file, body } = payload;

        const travelExpenses = await this._travelExpensesModel.findByPk(id);
        if (!travelExpenses) throw Error('TRAVELEXPENSES_NOT_FOUND');

        if (travelExpenses.img_receipt && travelExpenses.img_receipt.uuid) {
            await this.deleteFile({ id });
        }

        if (!body.category) throw Error('CATEGORY_NOT_FOUND');

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
        if (!travelExpenses) throw Error('FREIGHT_NOT_FOUND');

        try {
            await this._deleteFileIntegration({
                filename: travelExpenses.img_receipt.uuid,
                category: travelExpenses.img_receipt.category
            });

            const infoTravelExpenses = await travelExpenses.update({
                img_receipt: {}
            });

            return infoTravelExpenses;
        } catch (error) {
            throw error;
        }
    }

    async _deleteFileIntegration({ filename, category }) {
        try {
            return await deleteFile({ filename, category });
        } catch (error) {
            throw error;
        }
    }

    async getAll(query) {
        const { page = 1, limit = 10, sort_order = 'ASC', sort_field = 'id' } = query;

        const totalItems = (await this._travelExpensesModel.findAll()).length;
        const totalPages = Math.ceil(totalItems / limit);

        const travelExpenses = await this._travelExpensesModel.findAll({
            order: [[sort_field, sort_order]],
            limit: limit,
            offset: page - 1 ? (page - 1) * limit : 0
        });

        const currentPage = Number(page);

        return {
            data: travelExpenses,
            totalItems,
            totalPages,
            currentPage
        };
    }

    async getId(id) {
        const travelExpense = await this._travelExpensesModel.findByPk(id, {});

        if (!travelExpense) throw Error('TRAVEL_NOT_FOUND');

        return {
            data: travelExpense
        };
    }

    _handleMongoError(error) {
        const keys = Object.keys(error.errors);
        const err = new Error(error.errors[keys[0]].message);
        err.field = keys[0];
        err.status = 409;
        throw err;
    }
}

export default TravelExpensesService;
