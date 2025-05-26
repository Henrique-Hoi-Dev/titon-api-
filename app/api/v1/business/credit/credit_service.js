import Credit from './credit_model.js';
import FinancialStatements from '../financialStatements/financialStatements_model.js';
import Freight from '../freight/freight_model.js';
import Driver from '../driver/driver_model.js';
import Notification from '../notification/notification_model.js';
import BaseService from '../../base/base_service.js';

class CreditService extends BaseService {
    constructor() {
        super();
        this._creditModel = Credit;
        this._financialStatementsModel = FinancialStatements;
        this._freightModel = Freight;
        this._driverModel = Driver;
        this._notificationModel = Notification;
    }
    _formatRealValue(value) {
        const formatter = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        return formatter.format(value);
    }

    async create(body) {
        const financialProps = await this._financialStatementsModel.findOne({
            where: { driver_id: body.driver_id, status: true }
        });

        if (!financialProps) throw Error('Fixa não encontrada.');

        const freight = await Freight.findOne({
            where: {
                financial_statements_id: financialProps.id,
                status: 'STARTING_TRIP'
            }
        });

        if (!freight) throw Error('Não existe frente em viagem!');

        const result = await this._creditModel.create({
            driver_id: body.driver_id,
            freight_id: freight.id,
            financial_statements_id: financialProps.id,
            value: body.value,
            description: body.description,
            type_method: body.type_method
        });

        const driverFind = await this._driverModel.findByPk(result.driver_id);

        driverFind.addTransaction({
            value: result.value,
            typeTransactions: result.description,
            date: new Date(),
            type_method: result.type_method
        });

        await this._notificationModel.create({
            content: `${driverFind.name}, Foi registrado um ${
                result.type_method === 'DEBIT' ? 'Débito' : 'Crédito'
            }! no valor de ${this._formatRealValue(body.value / 100)}`,
            driver_id: body.driver_id
        });

        const driver = await this._driverModel.findByPk(driverFind.id);

        // const values = driverFind.transactions
        //   .map((res) => {
        //     if (res !== null) {
        //       return res.value;
        //     }
        //   })
        //   .filter((value) => typeof value === 'number');

        const { creditTransactions, debitTransactions } = driverFind.transactions.reduce(
            (acc, transaction) => {
                if (transaction !== null) {
                    if (transaction.type_method === 'CREDIT') {
                        acc.creditTransactions.push(transaction.value);
                    } else if (transaction.type_method === 'DEBIT') {
                        acc.debitTransactions.push(transaction.value);
                    }
                }
                return acc;
            },
            { creditTransactions: [], debitTransactions: [] }
        );

        const totalCredit = creditTransactions.reduce((acc, cur) => acc + cur, 0);
        const totalDebit = debitTransactions.reduce((acc, cur) => acc + cur, 0);
        const netAmount = totalCredit - totalDebit;

        const resultF = await driver.update({
            transactions: driverFind.transactions,
            credit: netAmount
        });

        return { resultF, result };
    }

    async getAll(query) {
        const { page = 1, limit = 100, sort_order = 'ASC', sort_field = 'id' } = query;

        const credits = await this._creditModel.findAll({
            order: [[sort_field, sort_order]],
            limit: limit,
            offset: page - 1 ? (page - 1) * limit : 0
        });

        const total = credits.length;
        const totalPages = Math.ceil(total / limit);

        const currentPage = Number(page);

        return {
            dataResult: credits,
            total,
            totalPages,
            currentPage
        };
    }

    async getId(id) {
        let credit = await this._creditModel.findByPk(id);

        if (!credit) throw Error('Credit not found');

        return {
            dataResult: credit
        };
    }

    async delete(id) {
        const credit = await this._creditModel.destroy({
            where: {
                id: id
            }
        });

        if (!credit) throw Error('Credit not found');

        return {
            msg: 'Deleted credit'
        };
    }

    async updateStatus(id, status) {
        try {
            const credit = await this._creditModel.findByPk(id);
            if (!credit) {
                throw new Error('Crédito não encontrado');
            }
            return await credit.update({ status });
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

export default CreditService;
