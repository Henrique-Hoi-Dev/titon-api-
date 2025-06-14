import { Op } from 'sequelize';
import { isAfter } from 'date-fns';

import BaseService from '../../base/base_service.js';
import FinancialStatementModel from './financialStatements_model.js';
import DriverModel from '../driver/driver_model.js';
import RestockModel from '../restock/restock_model.js';
import TravelExpensesModel from '../travelExpenses/travelExpenses_model.js';
import DepositMoneyModel from '../depositMoney/depositMoney_model.js';
import FreightModel from '../freight/freight_model.js';
import ManagerModel from '../manager/manager_model.js';
import TruckModel from '../truck/truck_model.js';
import CartModel from '../cart/cart_model.js';
import NotificationService from '../notification/notification_service.js';

class FinancialStatementService extends BaseService {
    constructor() {
        super();
        this._financialStatementModel = FinancialStatementModel;
        this._driverModel = DriverModel;
        this._restockModel = RestockModel;
        this._travelExpensesModel = TravelExpensesModel;
        this._depositMoneyModel = DepositMoneyModel;
        this._freightModel = FreightModel;
        this._managerModel = ManagerModel;
        this._truckModel = TruckModel;
        this._cartModel = CartModel;
        this._notificationService = new NotificationService();
    }

    async getFinancialCurrent(driver) {
        const financialStatement = await this._financialStatementModel.findOne({
            where: { driver_id: driver.id, status: true },
            include: [
                {
                    model: this._freightModel,
                    as: 'freight'
                },
                {
                    model: this._truckModel,
                    as: 'truck',
                    attributes: ['truck_models', 'truck_board', 'image_truck']
                },
                {
                    model: this._cartModel,
                    as: 'cart',
                    attributes: ['cart_models', 'cart_board', 'image_cart']
                },
                {
                    model: this._driverModel,
                    as: 'driver',
                    attributes: [
                        'name',
                        'email',
                        'phone',
                        'credit',
                        'percentage',
                        'daily',
                        'value_fix',
                        'avatar'
                    ]
                }
            ]
        });

        if (!financialStatement) {
            const err = new Error('FINANCIAL_STATEMENT_CURRENT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        return financialStatement.toJSON();
    }

    async getAllFinished(driver, query) {
        const { page = 1, limit = 100, sort_order = 'ASC', sort_field = 'id' } = query;

        const totalItems = await this._financialStatementModel.count({
            where: { driver_id: driver.id, status: false }
        });

        const totalPages = Math.ceil(totalItems / limit);

        const financialStatements = await this._financialStatementModel.findAll({
            where: { driver_id: driver.id, status: false },
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
            docs: financialStatements.map((res) => res.toJSON()),
            totalItems,
            totalPages,
            currentPage
        };
    }

    async updateFinancial(body, id) {
        const financialStatement = await this._financialStatementModel.findByPk(id);

        if (!financialStatement) {
            const err = new Error('FINANCIAL_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const result = await financialStatement.update(body);

        return result.toJSON();
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

    async create(manager, body) {
        const { driver_id, truck_id, cart_id, start_date } = body;

        const [userAdm, driver, truck, cart] = await Promise.all([
            this._managerModel.findByPk(manager.id),
            this._driverModel.findByPk(driver_id),
            this._truckModel.findByPk(truck_id),
            this._cartModel.findByPk(cart_id)
        ]);

        const currentDate = new Date();
        const previousDate = new Date(currentDate.getTime());
        previousDate.setDate(currentDate.getDate() - 1);

        // Converte a data de entrada para Date se for string
        const startDate = typeof start_date === 'string' ? new Date(start_date) : start_date;

        if (!isAfter(startDate, previousDate)) {
            const err = new Error('CANNOT_CREATE_FIXED_IN_THE_PAST');
            err.status = 400;
            throw err;
        }

        if (!userAdm) {
            const err = new Error('USER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!driver) {
            const err = new Error('DRIVER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!truck) {
            const err = new Error('TRUCK_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!cart) {
            const err = new Error('CART_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const existFinancialOpen = await this._financialStatementModel.findAll({
            where: {
                [Op.or]: [
                    { driver_id: driver?.id },
                    { truck_id: truck?.id },
                    { cart_id: cart?.id }
                ],
                status: true
            }
        });

        if (existFinancialOpen.length > 0) {
            const conflictingItem = existFinancialOpen[0];
            let errorMessage = '';

            if (conflictingItem.driver_id === driver?.id) {
                errorMessage = 'DRIVER_ALREADY_HAS_AN_OPEN_FINANCIAL_STATEMENT';
            } else if (conflictingItem.truck_id === truck?.id) {
                errorMessage = 'TRUCK_ALREADY_HAS_AN_OPEN_FINANCIAL_STATEMENT';
            } else if (conflictingItem.cart_id === cart?.id) {
                errorMessage = 'CART_ALREADY_HAS_AN_OPEN_FINANCIAL_STATEMENT';
            }

            const err = new Error(errorMessage);
            err.status = 400;
            throw err;
        }

        const financialStatement = await this._financialStatementModel.create({
            creator_user_id: userAdm.id,
            driver_id: driver?.id,
            truck_id: truck?.id,
            cart_id: cart?.id,
            start_date: startDate
        });

        if (financialStatement.id && driver?.id && truck?.id && cart?.id && userAdm?.id) {
            await this._notificationService.createNotification({
                driver_id: driver?.id,
                financial_id: financialStatement.id,
                title: 'Nova Ficha',
                content: `${userAdm.name}, Criou uma ficha para você ${driver.name}!`,
                titlePush: 'Nova Ficha',
                messagePush: `${userAdm.name}, Criou uma ficha para você ${driver.name}!`
            });
        }

        return { msg: 'SUCCESSFUL CREATED FINANCIAL STATEMENT' };
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
        const whereSearch = search?.trim()
            ? {
                  [Op.or]: [
                      { '$driver.name$': { [Op.iLike]: `%${search}%` } },
                      { '$truck.truck_board$': { [Op.iLike]: `%${search}%` } }
                  ]
              }
            : {};
        /* eslint-enable indent */

        const financialStatements = await this._financialStatementModel.findAll({
            where: search ? whereSearch : where,
            order: [[sort_field, sort_order]],
            limit,
            offset: page - 1 ? (page - 1) * limit : 0,
            include: [
                {
                    model: this._driverModel,
                    as: 'driver',
                    attributes: ['name', 'email', 'credit', 'value_fix', 'percentage', 'daily'],
                    required: !!search
                },
                {
                    model: this._freightModel,
                    as: 'freight',
                    where: status_check ? whereStatus : null
                },
                {
                    model: this._truckModel,
                    as: 'truck',
                    attributes: ['truck_models', 'truck_board', 'image_truck'],
                    required: !!search
                },
                {
                    model: this._cartModel,
                    as: 'cart',
                    attributes: ['cart_models', 'cart_board', 'cart_bodyworks', 'image_cart']
                }
            ]
        });

        const total = await this._financialStatementModel.count();
        const totalPages = Math.ceil(total / limit);

        const currentPage = Number(page);

        return {
            docs: financialStatements.map((res) => res.toJSON()),
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
            include: [
                {
                    model: this._driverModel,
                    as: 'driver',
                    attributes: ['name', 'email', 'credit', 'value_fix', 'percentage', 'daily']
                },
                {
                    model: this._truckModel,
                    as: 'truck',
                    attributes: ['truck_models', 'truck_board', 'image_truck']
                },
                {
                    model: this._cartModel,
                    as: 'cart',
                    attributes: ['cart_models', 'cart_board', 'cart_bodyworks', 'image_cart']
                }
            ]
        });

        if (!financial) {
            const err = new Error('FINANCIAL_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const freight = await this._freightModel.findAll({
            where: { financial_statements_id: financial.id }
        });

        if (!freight) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const notifications = await this._notificationService.getAllManagerFinancialStatement({
            financial_id: financial.id,
            user_id: financial.creator_user_id
        });

        const financialData = financial.get({ plain: true });

        return {
            ...financialData,
            freight: freight.map((res) => ({
                id: res.id,
                status: res.status,
                locationTruck: res.truck_location,
                startFreightCity: res.start_freight_city,
                endFreightCity: res.end_freight_city,
                date: res.createdAt,
                totalFreight: this._valueTotalTonne(res.estimated_tonnage, res.ton_value)
            })),
            notifications
        };
    }

    async finishingFinancial(body, id) {
        const financialStatement = await this._financialStatementModel.findByPk(id, {
            include: {
                model: this._freightModel,
                as: 'freight'
            }
        });
        if (!financialStatement) {
            const err = new Error('FINANCIAL_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        for (const item of financialStatement.freight) {
            const freight = await this._freightModel.findByPk(item.id);
            if (freight.status === 'STARTING_TRIP') {
                const err = new Error('TRIP_IN_PROGRESS');
                err.status = 400;
                throw err;
            }
        }

        const result = await financialStatement.update({
            end_km: body.end_km,
            status: false
        });

        return result.toJSON();
    }

    async delete(id) {
        const financial = await this._financialStatementModel.findByPk(id, {
            include: {
                model: this._freightModel,
                as: 'freight'
            }
        });

        if (!financial) {
            const err = new Error('FINANCIAL_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        // Verifica se existem fretes em andamento
        const hasActiveFreight = financial.freight.some(
            (freight) => freight.status === 'STARTING_TRIP'
        );
        if (hasActiveFreight) {
            const err = new Error('CANNOT_DELETE_FINANCIAL_WITH_ACTIVE_FREIGHT');
            err.status = 400;
            throw err;
        }

        const user = await this._managerModel.findByPk(financial.creator_user_id);
        if (!user) {
            const err = new Error('USER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        await this._financialStatementModel.destroy({
            where: {
                id: id
            }
        });

        await this._notificationModel.create({
            content: `${user.name}, Excluiu Sua Ficha!`,
            driver_id: financial.driver_id
        });

        return { msg: 'SUCCESSFUL DELETED FINANCIAL STATEMENT' };
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
}

export default FinancialStatementService;
