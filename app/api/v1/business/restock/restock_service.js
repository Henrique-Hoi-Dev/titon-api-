import { deleteFile, sendFile } from '../../../../providers/aws/index.js';
import { generateRandomCode } from '../../../../utils/crypto.js';
import { updateHours } from '../../../../utils/updateHours.js';

import RestockModel from './restock_model.js';
import FreightModel from '../freight/freight_model.js';
import FinancialStatements from '../financialStatements/financialStatements_model.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import BaseService from '../../base/base_service.js';
import Tesseract from 'tesseract.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Sao_Paulo');

class RestockService extends BaseService {
    constructor() {
        super();
        this._restockModel = RestockModel;
        this._financialStatementsModel = FinancialStatements;
        this._freightModel = FreightModel;
    }
    async create(driver, body) {
        let { freight_id, value_fuel, liters_fuel } = body;

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
            const total_value_fuel = value_fuel * liters_fuel;

            const now = updateHours(dayjs().tz('America/Sao_Paulo').utcOffset() / 60);

            const result = await this._restockModel.create({
                ...body,
                total_value_fuel,
                registration_date: now,
                financial_statements_id: financial.id
            });

            return result;
        }

        const err = new Error('TRIP_NOT_STARTED');
        err.status = 400;
        throw err;
    }

    async uploadDocuments(payload, { id }) {
        const { file, body } = payload;

        const restock = await this._restockModel.findByPk(id);
        if (!restock) {
            const err = new Error('RESTOCK_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (restock.img_receipt && restock.img_receipt.uuid) {
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

        const infoRestock = await restock.update({
            img_receipt: {
                uuid: file.name,
                name: originalFilename,
                mimetype: file.mimetype,
                category: body.category
            }
        });

        let extractedText = '';
        try {
            const {
                data: { text }
            } = await Tesseract.recognize(file.buffer, 'eng');
            extractedText = text;
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('Erro ao extrair texto do comprovante:', err.message);
        }

        return { extractedText, infoRestock };
    }

    async deleteFile({ id }) {
        const restock = await this._restockModel.findByPk(id);
        if (!restock) {
            const err = new Error('RESTOCK_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        try {
            await this._deleteFileIntegration({
                filename: restock.img_receipt.uuid,
                category: restock.img_receipt.category
            });

            const infoRestock = await restock.update({
                img_receipt: {}
            });

            return infoRestock.toJSON();
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

        const totalItems = (await this._restockModel.findAll()).length;
        const totalPages = Math.ceil(totalItems / limit);

        const where = {};
        if (freight_id) {
            where.freight_id = freight_id;
        }

        const restocks = await this._restockModel.findAll({
            where,
            order: [[sort_field, sort_order]],
            limit: limit,
            offset: page - 1 ? (page - 1) * limit : 0
        });

        const currentPage = Number(page);

        return {
            docs: restocks.map((res) => res.toJSON()),
            totalItems,
            totalPages,
            currentPage
        };
    }

    async getId(id) {
        const restock = await this._restockModel.findByPk(id);
        if (!restock) {
            const err = new Error('RESTOCK_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        return restock.toJSON();
    }
}

export default RestockService;
