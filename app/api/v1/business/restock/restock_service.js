import { deleteFile, sendFile } from '../../../../providers/aws';
import { generateRandomCode } from '../utils/crypto';

import RestockModel from './restock_model';
import FreightModel from '../freight/freight_model';
import FinancialStatements from '../financial_statements/financial_statements_model';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import CustomError from '../../../../utils/custom_error';
import BaseService from '../../base/base_service';

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
    async create(driverId, body) {
        let { freight_id, value_fuel, liters_fuel } = body;

        const financial = await this._financialStatementsModel.findOne({
            where: { driver_id: driverId, status: true }
        });
        if (!financial) throw new CustomError('FINANCIAL_NOT_FOUND', 404);

        const freight = await this._freightModel.findByPk(freight_id);
        if (!freight) throw new CustomError('FREIGHT_NOT_FOUND', 404);

        if (freight.status === 'STARTING_TRIP') {
            const total_value_fuel = value_fuel * liters_fuel;

            const now = this._updateHours(dayjs().tz('America/Sao_Paulo').utcOffset() / 60);

            const result = await Restock.create({
                ...body,
                total_value_fuel,
                registration_date: now,
                financial_statements_id: financial.id
            });

            return { data: result };
        }

        throw new CustomError('This front is not traveling', 404);
    }

    async uploadDocuments(payload, { id }) {
        const { file, body } = payload;

        const restock = await this._restockModel.findByPk(id);
        if (!restock) throw Error('RESTOCK_NOT_FOUND');

        if (restock.img_receipt && restock.img_receipt.uuid) {
            await this.deleteFile({ id });
        }

        if (!body.category) throw Error('CATEGORY_OR_TYPE_NOT_FOUND');

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
            console.warn('Erro ao extrair texto do comprovante:', err.message);
        }

        return { extractedText, infoRestock };
    }

    async deleteFile({ id }) {
        const restock = await this._restockModel.findByPk(id);
        if (!restock) throw Error('FREIGHT_NOT_FOUND');

        try {
            await this._deleteFileIntegration({
                filename: restock.img_receipt.uuid,
                category: restock.img_receipt.category
            });

            const infoRestock = await restock.update({
                img_receipt: {}
            });

            return infoRestock;
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

        const totalItems = (await this._restockModel.findAll()).length;
        const totalPages = Math.ceil(totalItems / limit);

        const restocks = await this._restockModel.findAll({
            order: [[sort_field, sort_order]],
            limit: limit,
            offset: page - 1 ? (page - 1) * limit : 0
        });

        const currentPage = Number(page);

        return {
            data: restocks,
            totalItems,
            totalPages,
            currentPage
        };
    }

    async getId(id) {
        const restock = await this._restockModel.findByPk(id);
        if (!restock) throw Error('RESTOCK_NOT_FOUND');

        return {
            data: restock
        };
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

export default RestockService;
