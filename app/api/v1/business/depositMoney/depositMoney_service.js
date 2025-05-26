const DepositMoney = require('./depositMoney_model');
const BaseService = require('../../base/base_service');
const { Op } = require('sequelize');

class DepositMoneyService extends BaseService {
    constructor() {
        super();
        this._depositMoneyModel = DepositMoney;
    }

    async findAll(query = {}) {
        try {
            const where = {};
            
            if (query.userId) {
                where.userId = query.userId;
            }

            if (query.driverId) {
                where.driverId = query.driverId;
            }

            if (query.status) {
                where.status = query.status;
            }

            if (query.minAmount) {
                where.amount = {
                    [Op.gte]: query.minAmount
                };
            }

            if (query.maxAmount) {
                where.amount = {
                    ...where.amount,
                    [Op.lte]: query.maxAmount
                };
            }

            if (query.startDate) {
                where.transactionDate = {
                    [Op.gte]: query.startDate
                };
            }

            if (query.endDate) {
                where.transactionDate = {
                    ...where.transactionDate,
                    [Op.lte]: query.endDate
                };
            }

            return await this._depositMoneyModel.findAll({
                where,
                order: [['transactionDate', 'DESC']]
            });
        } catch (error) {
            this._handleError(error);
        }
    }

    async findById(id) {
        try {
            return await this._depositMoneyModel.findByPk(id);
        } catch (error) {
            this._handleError(error);
        }
    }

    async create(data) {
        try {
            data.transactionDate = new Date();
            return await this._depositMoneyModel.create(data);
        } catch (error) {
            this._handleError(error);
        }
    }

    async update(id, data) {
        try {
            const deposit = await this._depositMoneyModel.findByPk(id);
            if (!deposit) {
                throw new Error('Depósito não encontrado');
            }
            return await deposit.update(data);
        } catch (error) {
            this._handleError(error);
        }
    }

    async delete(id) {
        try {
            const deposit = await this._depositMoneyModel.findByPk(id);
            if (!deposit) {
                throw new Error('Depósito não encontrado');
            }
            await deposit.destroy();
            return true;
        } catch (error) {
            this._handleError(error);
        }
    }

    async updateStatus(id, status) {
        try {
            const deposit = await this._depositMoneyModel.findByPk(id);
            if (!deposit) {
                throw new Error('Depósito não encontrado');
            }
            return await deposit.update({ status });
        } catch (error) {
            this._handleError(error);
        }
    }

    _handleError(error) {
        if (error.name === 'SequelizeValidationError') {
            const err = new Error(error.errors[0].message);
            err.field = error.errors[0].path;
            err.status = 400;
            throw err;
        }
        throw error;
    }
}

module.exports = DepositMoneyService; 