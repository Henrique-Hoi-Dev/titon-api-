import { Op } from 'sequelize';
import { isAfter, parseISO } from 'date-fns';

import FinancialStatement from './financialStatements_model.js';
import BaseService from '../../base/base_service.js';
import Driver from '../driver/driver_model.js';
import Restock from '../restock/restock_model.js';
import TravelExpenses from '../travelExpenses/travelExpenses_model.js';
import DepositMoney from '../depositMoney/depositMoney_model.js';
import Freight from '../freight/freight_model.js';
import Manager from '../manager/manager_model.js';
import Truck from '../truck/truck_model.js';
import Cart from '../cart/cart_model.js';
import Notification from '../notification/notification_model.js';

class FinancialStatementService extends BaseService {
    constructor() {
        super();
        this._financialStatementModel = FinancialStatement;
        this._driverModel = Driver;
        this._restockModel = Restock;
        this._travelExpensesModel = TravelExpenses;
        this._depositMoneyModel = DepositMoney;
        this._freightModel = Freight;
        this._managerModel = Manager;
        this._truckModel = Truck;
        this._cartModel = Cart;
        this._notificationModel = Notification;
    }

    async getFinancialCurrent(id) {
        const financialStatement = await this._financialStatementModel.findOne({
            where: { driver_id: id, status: true },
            include: {
                model: this._freightModel,
                as: 'freight'
            }
        });

        if (!financialStatement) throw Error('FINANCIAL_NOT_FOUND');
        return financialStatement;
    }

    async getAllFinished(id, query) {
        const { page = 1, limit = 100, sort_order = 'ASC', sort_field = 'id' } = query;

        const totalItems = (
            await this._financialStatementModel.findAll({
                where: { driver_id: id, status: false }
            })
        ).length;

        const totalPages = Math.ceil(totalItems / limit);

        const financialStatements = await this._financialStatementModel.findAll({
            where: { driver_id: id, status: false },
            order: [[sort_field, sort_order]],
            limit: limit,
            offset: page - 1 ? (page - 1) * limit : 0,
            include: {
                model: this._freightModel,
                as: 'freight'
            }
        });

        const currentPage = Number(page);

        return {
            data: financialStatements,
            totalItems,
            totalPages,
            currentPage
        };
    }

    async updateDriverFinancial(body, driverId) {
        const financialStatement = await this._financialStatementModel.findOne({
            where: { driver_id: driverId, status: true }
        });
        if (!financialStatement) throw Error('FINANCIAL_NOT_FOUND');

        const { id, truck_models, total_value, cart_models, driver_id } =
            await financialStatement.update(body);

        const driverFinancial = await this._driverModel.findByPk(driver_id);
        if (!driverFinancial) throw Error('DRIVER_NOT_FOUND');

        await driverFinancial.update({
            credit: total_value,
            truck: truck_models,
            cart: cart_models
        });

        const driver = await this._driverModel.findByPk(driver_id, {
            attributes: ['credit', 'truck', 'cart']
        });

        const financial = await this._financialStatementModel.findByPk(id);

        return { data: driver, financial: financial };
    }

    async updateFinancial(body, id) {
        const financialStatement = await this._financialStatementModel.findByPk(id);

        if (!financialStatement) throw Error('FINANCIAL_NOT_FOUND');

        const result = await financialStatement.update(body);

        const driverFinancial = await Driver.findByPk(result.driver_id);

        const { truck_models, cart_models, total_value } = result;

        await driverFinancial.update({
            credit: total_value,
            truck: truck_models,
            cart: cart_models
        });

        return result;
    }

    async _updateValorFinancial(props) {
        const financial = await this._financialStatementModel.findOne({
            where: { id: props.financial_statements_id, status: true }
        });

        const restock = await this._restockModel.findAll({ where: { freight_id: props.id } });
        const valoresRestock = restock.map((res) => res.total_nota_value);
        const totalvalueRestock = await this._calculate(valoresRestock);

        const travel = await this._travelExpensesModel.findAll({
            where: { freight_id: props.id }
        });
        const valoresTravel = travel.map((res) => res.value);
        const totalvalueTravel = await this._calculate(valoresTravel);

        const deposit = await this._depositMoneyModel.findAll({
            where: { freight_id: props.id }
        });
        const valoresDeposit = deposit.map((res) => res.value);
        const totalvalueDeposit = await this._calculate(valoresDeposit);

        await financial.update({
            total_value:
                (await this._calculate([totalvalueTravel, totalvalueRestock])) - totalvalueDeposit
        });
    }

    async create(user, body) {
        const { driver_id, truck_id, cart_id, start_date } = body;

        const [userAdm, driver, truck, cart] = await Promise.all([
            this._managerModel.findByPk(user.id),
            this._driverModel.findByPk(driver_id),
            this._truckModel.findByPk(truck_id),
            this._cartModel.findByPk(cart_id)
        ]);

        const currentDate = new Date();
        const previousDate = new Date(currentDate.getTime());
        previousDate.setDate(currentDate.getDate() - 1);

        if (!isAfter(parseISO(start_date), previousDate.setDate(currentDate.getDate() - 1)))
            throw Error('CANNOT_CREATE_FIXED_IN_THE_PAST');

        if (!userAdm) throw Error('USER_NOT_FOUND');
        if (!driver) throw Error('DRIVER_NOT_FOUND');
        if (!truck) throw Error('TRUCK_NOT_FOUND');
        if (!cart) throw Error('CART_NOT_FOUND');

        const existFileOpen = await this._financialStatementModel.findAll({
            where: { driver_id: driver_id, status: true }
        });

        if (existFileOpen.length > 0) throw Error('DRIVER_ALREADY_HAS_AN_OPEN_FILE');

        const truckOnSheet = await this._financialStatementModel.findAll({
            where: { truck_id: truck_id, status: true }
        });

        if (truckOnSheet.length > 0) throw Error('TRUCK_ALREADY_HAS_AN_OPEN_FILE');

        const cartOnSheet = await this._financialStatementModel.findAll({
            where: { cart_id: cart_id, status: true }
        });

        if (cartOnSheet.length > 0) throw Error('CART_ALREADY_HAS_AN_OPEN_FILE');

        const { name, value_fix, percentage, daily } = driver.dataValues;
        const { truck_models, truck_board, truck_avatar } = truck.dataValues;
        const { cart_bodyworks, cart_board } = cart.dataValues;

        await this._financialStatementModel.create({
            creator_user_id: user.id,
            driver_id,
            truck_id,
            cart_id,
            start_date,
            percentage_commission: percentage,
            fixed_commission: value_fix,
            daily: daily,
            driver_name: name,
            truck_models,
            truck_board,
            truck_avatar,
            cart_models: cart_bodyworks,
            cart_board
        });

        await this._notificationModel.create({
            content: `${user.name}, Criou Uma Nova Ficha!`,
            driver_id: driver_id
        });

        await driver.update({
            truck: truck_models,
            cart: cart_bodyworks
        });

        return { msg: 'SUCCESSFUL' };
    }

    async getAll(query) {
        const {
            page = 1,
            limit = 100,
            sort_order = 'ASC',
            sort_field = 'id',
            status_check,
            status,
            search
        } = query;

        const where = {};
        if (status) where.status = status;

        const whereStatus = {};
        if (status_check) whereStatus.status = status_check;

        /* eslint-disable indent */
        const financialStatements = await this._financialStatementModel.findAll({
            where: search
                ? {
                      [Op.or]: [
                          { truck_board: { [Op.iLike]: `%${search}%` } },
                          { driver_name: { [Op.iLike]: `%${search}%` } }
                      ]
                  }
                : where,
            order: [[sort_field, sort_order]],
            limit: limit,
            offset: page - 1 ? (page - 1) * limit : 0,
            include: [
                {
                    model: Driver,
                    as: 'driver',
                    attributes: ['credit']
                },
                {
                    model: Freight,
                    where: status_check ? whereStatus : null,
                    as: 'freight'
                }
            ]
        });

        const total = await this._financialStatementModel.count();
        const totalPages = Math.ceil(total / limit);

        const currentPage = Number(page);

        return {
            dataResult: financialStatements,
            total,
            totalPages,
            currentPage
        };
    }

    _valueTotalTonne(tonne, valueTonne) {
        const formatter = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        const valueTonneReal = valueTonne / 100;
        const tonneDiv = tonne / 1000;

        const calculate = tonneDiv * valueTonneReal;

        return formatter.format(calculate.toFixed(2));
    }

    async getId(id) {
        const financial = await this._financialStatementModel.findByPk(id, {
            include: {
                model: this._driverModel,
                as: 'driver',
                attributes: ['credit']
            }
        });

        if (!financial) throw Error('FINANCIAL_NOT_FOUN');

        const freight = await this._freightModel.findAll({
            where: { financial_statements_id: financial.id }
        });
        if (!freight) throw Error('Freight not found');

        const notifications = await this._notificationModel.findAll({
            where: {
                financial_statements_id: financial.id,
                user_id: financial.creator_user_id
            },
            attributes: ['id', 'content', 'createdAt', 'driver_id', 'freight_id']
        });

        return {
            dataResult: {
                ...financial.dataValues,
                freight: freight.map((res) => ({
                    id: res.id,
                    date: res.createdAt,
                    status: res.status,
                    locationTruck: res.location_of_the_truck,
                    finalFreightCity: res.final_freight_city,
                    totalFreight: this._valueTotalTonne(res.preview_tonne, res.value_tonne)
                })),
                notifications: notifications.map((res) => res.dataValues)
            }
        };
    }

    async finishing(body, id) {
        const financialStatement = await this._financialStatementModel.findByPk(id, {
            include: {
                model: this._freightModel,
                as: 'freight'
            }
        });
        if (!financialStatement) throw Error('FINANCIAL_NOT_FOUND');

        for (const item of financialStatement.freight) {
            const freight = await this._freightModel.findByPk(item.id);
            if (freight.status === 'STARTING_TRIP') throw Error('TRIP_IN_PROGRESS');
        }

        const result = await financialStatement.update({
            final_km: body.final_km,
            status: body.status
        });

        return result;
    }

    async delete(id) {
        const financial = await this._financialStatementModel.findByPk(id);
        if (!financial) {
            const err = new Error('FINANCIAL_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const user = await this._managerModel.findByPk(financial.creator_user_id);
        if (!user) {
            const err = new Error('USER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const retult = await this._financialStatementModel.destroy({
            where: {
                id: id
            }
        });

        await this._notificationModel.create({
            content: `${user.name}, Excluio Sua Ficha!`,
            driver_id: financial.driver_id
        });

        return retult;
    }

    async updateDriver(body, driverId) {
        const financialStatement = await this._financialStatementModel.findOne({
            where: { driver_id: driverId, status: true }
        });
        if (!financialStatement) throw Error('FINANCIAL_NOT_FOUND');

        const { id, truck_models, total_value, cart_models, driver_id } =
            await financialStatement.update(body);

        const driverFinancial = await this._driverModel.findByPk(driver_id);
        if (!driverFinancial) throw Error('DRIVER_NOT_FOUND');

        await driverFinancial.update({
            credit: total_value,
            truck: truck_models,
            cart: cart_models
        });

        const driver = await this._driverModel.findByPk(driver_id, {
            attributes: ['credit', 'truck', 'cart']
        });

        const financial = await this._financialStatementModel.findByPk(id);

        return { data: driver, financial: financial };
    }

    _calculate(values) {
        let initialValue = 0;
        let total = values.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            initialValue
        );
        return total;
    }

    async updateValorFinancial(props) {
        const financial = await this._financialStatementModel.findOne({
            where: { id: props.financial_statements_id, status: true }
        });

        const restock = await Restock.findAll({ where: { freight_id: props.id } });
        const valoresRestock = restock.map((res) => res.total_nota_value);
        const totalvalueRestock = await this._calculate(valoresRestock);

        const travel = await TravelExpenses.findAll({
            where: { freight_id: props.id }
        });
        const valoresTravel = travel.map((res) => res.value);
        const totalvalueTravel = await this._calculate(valoresTravel);

        const deposit = await DepositMoney.findAll({
            where: { freight_id: props.id }
        });
        const valoresDeposit = deposit.map((res) => res.value);
        const totalvalueDeposit = await this._calculate(valoresDeposit);

        await financial.update({
            total_value:
                (await this._calculate([totalvalueTravel, totalvalueRestock])) - totalvalueDeposit
        });
    }
}

export default FinancialStatementService;
