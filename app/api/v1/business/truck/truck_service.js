import TruckModel from './truck_model.js';
import FinancialStatementsModel from '../financialStatements/financialStatements_model.js';
import BaseService from '../../base/base_service.js';

import { Op, literal } from 'sequelize';
import { generateRandomCode } from '../../../../utils/crypto.js';
import { deleteFile, getFile, sendFilePublic } from '../../../../providers/aws/index.js';

class TruckService extends BaseService {
    constructor() {
        super();
        this._truckModel = TruckModel;
        this._financialStatementsModel = FinancialStatementsModel;
    }

    async create(body) {
        let {
            truck_models,
            truck_name_brand,
            truck_board,
            truck_color,
            truck_km,
            truck_chassis,
            truck_year,
            truck_avatar
        } = body;

        const [chassisExist, boardExist] = await Promise.all([
            this._truckModel.findOne({ where: { truck_chassis: truck_chassis } }),
            this._truckModel.findOne({ where: { truck_board: truck_board } })
        ]);

        if (chassisExist) {
            const err = new Error('CHASSIS_TRUCK_ALREADY_EXISTS');
            err.status = 400;
            throw err;
        }

        if (boardExist) {
            const err = new Error('BOARD_TRUCK_ALREADY_EXISTS');
            err.status = 400;
            throw err;
        }

        const truck = await this._truckModel.create({
            truck_models,
            truck_name_brand,
            truck_board,
            truck_color,
            truck_km,
            truck_chassis,
            truck_year,
            truck_avatar
        });

        return truck.toJSON();
    }

    async uploadImage(payload, id) {
        const { file, body } = payload;

        if (!file) {
            const err = new Error('FILE_NOT_FOUND');
            err.status = 400;
            throw err;
        }

        const truck = await this._truckModel.findByPk(id);
        if (!truck) {
            const err = new Error('TRUCK_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (truck.img_receipt && truck.img_receipt.uuid) {
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

        await sendFilePublic(payload);

        const infoTruck = await truck.update({
            image_truck: {
                uuid: file.name,
                name: originalFilename,
                mimetype: file.mimetype,
                category: body.category
            }
        });

        return infoTruck.toJSON();
    }

    async deleteFile({ id }) {
        const truck = await this._truckModel.findByPk(id);
        if (!truck) {
            const err = new Error('TRUCK_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        try {
            await this._deleteFileIntegration({
                filename: truck.image_truck.uuid,
                category: truck.image_truck.category
            });

            const infoTruck = await truck.update({
                image_truck: {}
            });

            return infoTruck;
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

    async getIdAvatar(id) {
        const truck = await this._truckModel.findByPk(id, {
            attributes: ['image_truck']
        });

        if (!truck) {
            const err = new Error('TRUCK_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const { Body, ContentType } = await getFile({
            filename: truck.image_truck.uuid,
            category: truck.image_truck.category
        });

        return { contentType: ContentType, fileData: Body };
    }

    async getAllSelect() {
        const select = await this._truckModel.findAll({
            where: {
                id: {
                    [Op.notIn]: literal('(SELECT "truck_id" FROM "financial_statements")')
                }
            },
            attributes: ['id', 'truck_models', 'truck_board'],
            raw: true
        });

        const selectFinancial = await this._truckModel.findAll({
            attributes: ['id', 'truck_models', 'truck_board'],
            include: [
                {
                    model: this._financialStatementsModel,
                    as: 'financialStatements',
                    required: true,
                    where: {
                        status: false
                    },
                    attributes: []
                }
            ],
            raw: true,
            nest: true
        });

        return [...select, ...selectFinancial];
    }

    async getAll(query) {
        const { page = 1, limit = 10, sort_order = 'ASC', sort_field = 'id', search } = query;

        const where = {};
        /* eslint-disable indent */
        const trucks = await this._truckModel.findAll({
            where: search
                ? {
                      [Op.or]: [
                          { truck_name_brand: { [Op.iLike]: `%${search}%` } },
                          { truck_year: { [Op.iLike]: `%${search}%` } },
                          { truck_color: { [Op.iLike]: `%${search}%` } },
                          { truck_models: { [Op.iLike]: `%${search}%` } }
                      ]
                  }
                : where,
            order: [[sort_field, sort_order]],
            limit: limit,
            offset: page - 1 ? (page - 1) * limit : 0,
            attributes: [
                'id',
                'truck_models',
                'truck_name_brand',
                'truck_board',
                'truck_km',
                'truck_color',
                'truck_chassis',
                'truck_year',
                'image_truck'
            ]
        });

        const total = await this._truckModel.count();
        const totalPages = Math.ceil(total / limit);

        const currentPage = Number(page);

        return {
            docs: trucks.map((result) => result.toJSON()),
            total,
            totalPages,
            currentPage
        };
    }

    async getId(id) {
        const truck = await this._truckModel.findByPk(id, {
            attributes: [
                'id',
                'truck_models',
                'truck_name_brand',
                'truck_board',
                'truck_km',
                'truck_color',
                'truck_chassis',
                'truck_year',
                'image_truck'
            ]
        });

        if (!truck) {
            const err = new Error('TRUCK_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        return truck.toJSON();
    }

    async update(body, id) {
        const truck = await this._truckModel.findByPk(id);
        await truck.update(body);

        return truck.toJSON();
    }

    async delete(id) {
        const truck = await this._truckModel.findByPk(id);

        if (!truck) {
            const err = new Error('TRUCK_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const isInUse = await this._financialStatementsModel.findAll({
            where: {
                truck_id: truck.id,
                status: true
            }
        });

        if (isInUse?.length > 0) {
            const err = new Error('CANNOT_DELETE_TRUCK_IN_USE');
            err.status = 400;
            throw err;
        }

        await this._truckModel.destroy({
            where: {
                id: id
            }
        });

        return { msg: 'Truck deleted successfully' };
    }
}

export default TruckService;
