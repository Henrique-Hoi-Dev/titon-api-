import BaseService from '../../base/base_service.js';
import ApiGoogle from '../../../../providers/google/router_map_google.js';
import OneSignalProvider from '../../../../providers/oneSignal/index.js';

import FreightModel from './freight_model.js';
import FinancialStatementsModel from '../financialStatements/financialStatements_model.js';
import DriverModel from '../driver/driver_model.js';
import RestockModel from '../restock/restock_model.js';
import TravelExpensesModel from '../travelExpenses/travelExpenses_model.js';
import DepositMoneyModel from '../depositMoney/depositMoney_model.js';
import NotificationService from '../notification/notification_service.js';
import ManagerModel from '../manager/manager_model.js';
import FinancialService from '../financialStatements/financialStatements_service.js';
import * as XLSX from 'xlsx';

import { XMLParser } from 'fast-xml-parser';
import { formatWithTimezone } from '../../../../utils/formatTimeZone.js';
import { deleteFile, getFile, sendFile } from '../../../../providers/aws/index.js';
import { generateRandomCode } from '../../../../utils/crypto.js';

class FreightService extends BaseService {
    constructor() {
        super();
        this._freightModel = FreightModel;
        this._financialStatementModel = FinancialStatementsModel;
        this._driverModel = DriverModel;
        this._restockModel = RestockModel;
        this._travelExpensesModel = TravelExpensesModel;
        this._depositMoneyModel = DepositMoneyModel;
        this._notificationService = new NotificationService();
        this._oneSignalProvider = OneSignalProvider;
        this._managerModel = ManagerModel;
        this._financialService = new FinancialService();
    }

    async _googleQuery(startCity, finalCity) {
        const kmTravel = await ApiGoogle.getRoute(startCity, finalCity, 'driving');

        return kmTravel;
    }

    _formatRealValue(value) {
        const formatter = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        return formatter.format(value);
    }

    _calculatesLiters(distance, consumption) {
        const distanceInKm = distance / 1000;
        const consumptionLt = consumption / 100;

        const calculate = distanceInKm / consumptionLt;
        return Number(calculate.toFixed(0));
    }

    _valueTotalGasto(totalLiters, fuelValue) {
        const calculate = totalLiters * fuelValue;

        return this._formatRealValue(calculate / 100);
    }

    _valueTotalTonne(tonne, valueTonne) {
        const tonneDiv = tonne / 1000;
        const calculate = tonneDiv * valueTonne;

        return this._formatRealValue(calculate / 100);
    }

    _valueNetFreight(totalDriver, totalFreight, totalAmountSpent) {
        const totalDiscount = totalDriver + totalAmountSpent;
        const calculate = totalFreight - totalDiscount;

        return this._formatRealValue(calculate / 100);
    }

    _leftoverLiquid(totalFreight, totalAmountSpent) {
        const calculate = totalFreight - totalAmountSpent;

        return this._formatRealValue(calculate / 100);
    }

    _valueDriver(percentage, fixedValue, totalFreight) {
        if (percentage > 0) {
            const percentageReal = percentage / 100;
            const calculate = totalFreight * percentageReal;

            return this._formatRealValue(calculate / 100);
        } else {
            return this._formatRealValue(fixedValue / 100);
        }
    }

    _unmaskMoney(string) {
        if (typeof string === 'string') {
            const cleanString = string.replace(/[^\d,.-]/g, '');
            const numberString = cleanString.replace(',', '.');
            return Math.round(parseFloat(numberString) * 100);
        }
        return Number(string);
    }

    _getValueInCents(formattedValue) {
        if (typeof formattedValue === 'string') {
            return this._unmaskMoney(formattedValue);
        }
        return formattedValue;
    }

    async createFreightDriver(driver, body) {
        const financial = await this._financialDriver({ driverId: driver.id });

        if (!financial) {
            const err = new Error('FINANCIAL_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const result = await this._freightModel.create({
            ...body,
            status: 'DRAFT',
            financial_statements_id: financial.id
        });

        if (!result) {
            const err = new Error('ERRO_CREATE_FREIGHT');
            err.status = 400;
            throw err;
        }

        const data = await this.getId({ freight_id: result.id }, { id: driver.id });

        return data;
    }

    async createFreightManager(manager, body, financialId) {
        const financial = await this._financialStatementModel.findByPk(financialId);

        if (!financial.dataValues.id) {
            const err = new Error('FINANCIAL_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!manager.id) {
            const err = new Error('MANAGER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const existingFreightInTrip = await this._freightModel.findOne({
            where: {
                financial_statements_id: financial.dataValues.id,
                status: 'STARTING_TRIP'
            }
        });

        if (existingFreightInTrip) {
            const err = new Error('FREIGHT_IN_TRIP');
            err.status = 400;
            throw err;
        }

        const origin = body.start_freight_city;
        const destination = body.end_freight_city;

        const googleTravel = await this._googleQuery(origin, destination);

        const seconds = googleTravel.duration.value;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const routeDuration = `${hours} horas e ${minutes} minutos`;

        const freight = await this._freightModel.create({
            ...body,
            financial_statements_id: financial.id,
            route_distance_km: googleTravel.distance.text,
            route_duration: routeDuration
        });

        await this._notificationService.createNotification({
            title: 'Indicou um frete!',
            content: `${manager.name} está indicando um novo frete!`,
            driver_id: financial.driver_id,
            financial_id: financial.id
        });

        return freight.toJSON();
    }

    async getIdManagerFreight(freightId) {
        const freight = await this._freightModel.findByPk(freightId);

        if (!freight) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const financial = await this._financialStatementModel.findOne({
            where: { id: freight.financial_statements_id },
            include: [
                {
                    model: this._driverModel,
                    as: 'driver',
                    attributes: ['id', 'name', 'percentage', 'value_fix']
                }
            ]
        });

        let driver = null;

        if (financial.dataValues.driver) {
            driver = financial.dataValues.driver.dataValues;
        } else {
            const err = new Error('DRIVER_NOT_FOUND_IN_FINANCIAL');
            err.status = 404;
            throw err;
        }

        const [restock, travelExpenses, depositMoney] = await Promise.all([
            this._restockModel.findAll({
                where: { freight_id: freightId }
            }),
            this._travelExpensesModel.findAll({
                where: { freight_id: freightId }
            }),
            this._depositMoneyModel.findAll({
                where: { freight_id: freightId }
            })
        ]);

        if (!restock) {
            const err = new Error('RESTOCK_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!travelExpenses) {
            const err = new Error('TRAVEL_EXPENSES_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!depositMoney) {
            const err = new Error('DEPOSIT_MONEY_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        // Verifica se o frete já tem informações de rota no banco
        let kmTravel = null;

        if (!freight.dataValues.route_distance_km || !freight.dataValues.route_duration) {
            // Se não tem informações de rota, consulta o Google Maps
            kmTravel = await this._googleQuery(
                freight.dataValues.start_freight_city,
                freight.dataValues.end_freight_city
            );

            if (!kmTravel) {
                const err = new Error('INVALID_ROUTE_GOOGLE_MAPS');
                err.status = 400;
                throw err;
            }

            // Atualiza o frete com as informações da rota
            const seconds = kmTravel.duration.value;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);

            await freight.update({
                route_distance_km: kmTravel.distance.text,
                route_duration: `${hours} horas e ${minutes} minutos`
            });
        } else {
            // Se já tem informações de rota, usa as existentes
            kmTravel = {
                distance: {
                    text: freight.dataValues.route_distance_km,
                    value:
                        parseInt(freight.dataValues.route_distance_km.replace(/[^\d]/g, '')) * 1000
                },
                duration: {
                    text: freight.dataValues.route_duration,
                    value: this._parseDurationToSeconds(freight.dataValues.route_duration)
                }
            };
        }

        // Calcula o valor total do frete em centavos
        const totalFreightInCents =
            (freight.dataValues.estimated_tonnage / 1000) * freight.dataValues.ton_value;
        const totalFreight = this._formatRealValue(totalFreightInCents / 100);

        const totalLiters = this._calculatesLiters(
            kmTravel.distance.value,
            freight.dataValues.fuel_avg_per_km
        );

        // Calcula o valor total gasto em centavos
        const totalAmountSpentInCents = totalLiters * freight.dataValues.estimated_fuel_cost;
        const totalAmountSpent = this._formatRealValue(totalAmountSpentInCents / 100);

        // Calcula o valor do motorista em centavos
        let totalDriverInCents;
        if (driver.percentage > 0) {
            totalDriverInCents = totalFreightInCents * (driver.percentage / 100);
        } else {
            totalDriverInCents = driver.value_fix;
        }
        const totalDriver = this._formatRealValue(totalDriverInCents / 100);

        // Calcula o valor líquido do frete em centavos
        const totalNetFreightInCents =
            totalFreightInCents - totalDriverInCents - totalAmountSpentInCents;
        const totalNetFreight = this._formatRealValue(totalNetFreightInCents / 100);

        return {
            status: freight.status,
            freightTotal: totalFreight,
            totalDriver: totalDriver,
            fuelValueTotal: totalAmountSpent,
            totalNetFreight: totalNetFreight,
            expenses: 0,
            totalLiters: totalLiters,
            driverCommission: driver.percentage > 0 ? driver.percentage : driver.value_fix,
            startCity: freight.start_freight_city,
            finalCity: freight.end_freight_city,
            restock: restock
                .sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date))
                .map((res) => ({
                    date: formatWithTimezone(res.registration_date, 'yyyy-MM-dd'),
                    time: formatWithTimezone(res.registration_date, 'HH:mm'),
                    local: res.city,
                    liters_fuel: res.liters_fuel,
                    value_fuel: this._formatRealValue(res.value_fuel / 100),
                    payment: {
                        flag: res.payment.flag,
                        modo: res.payment.modo,
                        value: this._formatRealValue(res.payment.value / 100),
                        parcels: res.payment.parcels
                    }
                })),
            travelExpenses: travelExpenses
                .sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date))
                .map((res) => ({
                    date: formatWithTimezone(res.registration_date, 'yyyy-MM-dd'),
                    time: formatWithTimezone(res.registration_date, 'HH:mm'),
                    local: res.city,
                    expenseDescription: res.expense_description,
                    payment: {
                        flag: res.payment.flag,
                        modo: res.payment.modo,
                        value: this._formatRealValue(res.payment.value / 100),
                        parcels: res.payment.parcels
                    }
                })),
            depositMoney: depositMoney
                .sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date))
                .map((res) => ({
                    date: formatWithTimezone(res.registration_date, 'yyyy-MM-dd'),
                    time: formatWithTimezone(res.registration_date, 'HH:mm'),
                    local: res.local,
                    typeBank: res.type_bank,
                    payment: {
                        flag: res.payment.flag,
                        modo: res.payment.modo,
                        value: this._formatRealValue(res.payment.value / 100),
                        parcels: res.payment.parcels
                    }
                }))
        };
    }

    async firstCheckId(id) {
        const freight = await this._freightModel.findByPk(id);

        const formatter = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        if (!freight) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const financial = await this._financialStatementModel.findOne({
            where: { id: freight.financial_statements_id },
            include: [
                {
                    model: this._driverModel,
                    as: 'driver',
                    attributes: ['id', 'name', 'percentage', 'value_fix']
                }
            ]
        });

        let driver = null;

        if (financial.dataValues.driver) {
            driver = financial.dataValues.driver.dataValues;
        } else {
            const err = new Error('DRIVER_NOT_FOUND_IN_FINANCIAL');
            err.status = 404;
            throw err;
        }

        // Verifica se o frete já tem informações de rota no banco
        let kmTravel = null;

        if (!freight.dataValues.route_distance_km || !freight.dataValues.route_duration) {
            // Se não tem informações de rota, consulta o Google Maps
            kmTravel = await this._googleQuery(
                freight.dataValues.start_freight_city,
                freight.dataValues.end_freight_city
            );

            if (!kmTravel) {
                const err = new Error('INVALID_ROUTE_GOOGLE_MAPS');
                err.status = 400;
                throw err;
            }

            // Atualiza o frete com as informações da rota
            const seconds = kmTravel.duration.value;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);

            await freight.update({
                route_distance_km: kmTravel.distance.text,
                route_duration: `${hours} horas e ${minutes} minutos`
            });
        } else {
            // Se já tem informações de rota, usa as existentes
            kmTravel = {
                distance: {
                    text: freight.dataValues.route_distance_km,
                    value:
                        parseInt(freight.dataValues.route_distance_km.replace(/[^\d]/g, '')) * 1000
                },
                duration: {
                    text: freight.dataValues.route_duration,
                    value: this._parseDurationToSeconds(freight.dataValues.route_duration)
                }
            };
        }

        if (!kmTravel) {
            const err = new Error('INVALID_ROUTE_GOOGLE_MAPS');
            err.status = 400;
            throw err;
        }

        function valuePerKm(distance, totalLiters, fuelValue) {
            const distanceInKm = distance / 1000;
            const fuelValueReal = fuelValue / 100;

            const calculate = (totalLiters * fuelValueReal) / distanceInKm;

            return formatter.format(calculate.toFixed(2));
        }

        const totalLiters = this._calculatesLiters(
            kmTravel.distance.value,
            freight.dataValues.fuel_avg_per_km
        );

        const totalValuePerKm = valuePerKm(
            kmTravel.distance.value,
            totalLiters,
            freight.dataValues.estimated_fuel_cost
        );

        const totalAmountSpentInCents = totalLiters * freight.dataValues.estimated_fuel_cost;
        const totalAmountSpent = this._formatRealValue(totalAmountSpentInCents / 100);

        const totalFreightInCents =
            (freight.dataValues.estimated_tonnage / 1000) * freight.dataValues.ton_value;
        const totalFreight = this._formatRealValue(totalFreightInCents / 100);

        let totalDriverInCents;
        if (driver.percentage > 0) {
            totalDriverInCents = totalFreightInCents * (driver.percentage / 100);
        } else {
            totalDriverInCents = driver.value_fix;
        }
        const totalDriver = this._formatRealValue(totalDriverInCents / 100);

        const totalNetFreightInCents =
            totalFreightInCents - totalDriverInCents - totalAmountSpentInCents;
        const totalNetFreight = this._formatRealValue(totalNetFreightInCents / 100);

        const totalleftoverLiquidInCents = totalFreightInCents - totalAmountSpentInCents;
        const totalleftoverLiquid = this._formatRealValue(totalleftoverLiquidInCents / 100);

        return {
            status: freight.status,
            start_freight_city: freight.start_freight_city,
            end_freight_city: freight.end_freight_city,
            previous_average: `${freight.fuel_avg_per_km / 100} KM/L`,
            route_distance_km: kmTravel.distance.text,
            consumption: `${totalLiters} L`,
            distance: kmTravel.distance.text,
            KM_price: totalValuePerKm,
            fuel_estimate: totalAmountSpent,
            full_freight: totalFreight,
            driver_commission: totalDriver,
            net_freight: totalNetFreight,
            leftover_liquid: totalleftoverLiquid
        };
    }

    async approveFreightManager(manager, id, financialId) {
        const [freight, financial] = await Promise.all([
            this._freightModel.findByPk(id),
            this._financialStatementModel.findOne({
                where: { id: financialId, status: true }
            })
        ]);

        if (!freight) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }
        if (!financial) {
            const err = new Error('FINANCIAL_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (freight.dataValues.status === 'PENDING') {
            await freight.update({
                status: 'APPROVED'
            });

            await this._notificationService.createNotification({
                title: 'Aprovou seu check frete',
                content: `${
                    manager.name
                }, Aprovou seu check frete, de ${freight.dataValues.start_freight_city.toUpperCase()} para ${freight.dataValues.end_freight_city.toUpperCase()}!`,
                driver_id: financial.dataValues.driver_id,
                financial_id: financial.dataValues.id
            });
        }

        return { msg: 'check frete aprovado' };
    }

    async rejectFreightManager(manager, id, financialId) {
        const [freight, financial] = await Promise.all([
            this._freightModel.findByPk(id),
            this._financialStatementModel.findOne({
                where: { id: financialId, status: true }
            })
        ]);

        if (!freight) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }
        if (!financial) {
            const err = new Error('FINANCIAL_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (freight.status === 'PENDING') {
            await freight.update({
                status: 'DENIED'
            });

            await this._notificationService.createNotification({
                title: 'Rejeitou seu check frete',
                content: `${
                    manager.name
                }, Rejeitou seu check frete, de ${freight.dataValues.start_freight_city.toUpperCase()} para ${freight.dataValues.end_freight_city.toUpperCase()}!`,
                driver_id: financial.dataValues.driver_id,
                financial_id: financial.dataValues.id
            });
        }

        return { msg: 'check frete reprovado' };
    }

    async deleteFreightManager(id) {
        const freight = await this._freightModel.findByPk(id);

        if (freight.dataValues.status === 'STARTING_TRIP') {
            const err = new Error('TRIP_IN_PROGRESS');
            err.status = 400;
            throw err;
        }

        if (!freight) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        await freight.destroy();

        return { msg: 'Deleted freight' };
    }

    async _financialDriver({ driverId }) {
        const financial = await this._financialService.getFinancialCurrent({ id: driverId });
        if (!financial) {
            const err = new Error('FINANCIAL_IN_PROGRESS');
            err.status = 400;
            throw err;
        }
        return financial;
    }

    async getId({ freight_id, financial_id }, { id, changedDestiny = false }) {
        let financial = null;
        if (freight_id && financial_id) {
            const result = await this._financialStatementModel.findOne({
                where: { id: financial_id, driver_id: id }
            });
            if (!result) {
                const err = new Error('FINANCIAL_NOT_FOUND_NO_FREIGHT_ID_OR_FINANCIAL_ID');
                err.status = 404;
                throw err;
            }

            financial = result.dataValues;
        } else {
            financial = await this._financialDriver({ driverId: id });
        }

        if (!financial) {
            const err = new Error('FINANCIAL_NOT_FOUND_NO_FREIGHT_ID_OR_FINANCIAL_ID');
            err.status = 404;
            throw err;
        }

        let freight = await this._freightModel.findOne({
            where: { id: freight_id, financial_statements_id: financial?.id },
            include: [
                {
                    model: this._restockModel,
                    as: 'restock',
                    attributes: [
                        'id',
                        'name_establishment',
                        'city',
                        'value_fuel',
                        'img_receipt',
                        'total_nota_value',
                        'liters_fuel',
                        'registration_date',
                        'payment'
                    ]
                },
                {
                    model: this._travelExpensesModel,
                    as: 'travel_expense',
                    attributes: [
                        'id',
                        'name_establishment',
                        'type_establishment',
                        'expense_description',
                        'value',
                        'img_receipt',
                        'registration_date',
                        'payment'
                    ]
                },
                {
                    model: this._depositMoneyModel,
                    as: 'deposit_money',
                    attributes: [
                        'id',
                        'type_transaction',
                        'local',
                        'type_bank',
                        'value',
                        'img_receipt',
                        'registration_date',
                        'payment'
                    ]
                }
            ]
        });

        if (!freight) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!financial_id && changedDestiny) {
            const origin = freight.dataValues.start_freight_city;
            const destination = freight.dataValues.end_freight_city;

            const googleTravel = await this._googleQuery(origin, destination);

            const seconds = googleTravel.duration.value;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);

            await freight.update({
                route_distance_km: googleTravel.distance.text,
                route_duration: `${hours} horas e ${minutes} minutos`
            });
        }

        return freight.toJSON();
    }

    async _calculate(values) {
        let initialValue = 0;
        let total = values.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            initialValue
        );
        return total;
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

    async updateFreightDriver(body, freightId, { id, name }) {
        let changedDestiny = false;
        const financial = await this._financialDriver({ driverId: id });

        if (!financial) {
            const err = new Error('FINANCIAL_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const freight = await this._freightModel.findOne({
            where: { id: freightId, financial_statements_id: financial.id }
        });

        if (!freight) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!financial.dataValues.startKm) {
            await financial.update({
                startKm: body.truck_current_km
            });
        }

        const normalize = (s) => s.toLowerCase().trim();

        const originUI = normalize(body.start_freight_city || '');
        const destinationUI = normalize(body.end_freight_city || '');
        const originDB = normalize(freight.dataValues.start_freight_city || '');
        const destinationDB = normalize(freight.dataValues.end_freight_city || '');

        const precisaDeRota =
            !freight.dataValues.route_distance_km ||
            !freight.dataValues.route_duration ||
            (originUI && originUI !== originDB) ||
            (destinationUI && destinationUI !== destinationDB);

        if (precisaDeRota) {
            changedDestiny = true;
        }

        await freight.update(body);

        if (body.status === 'PENDING') {
            await this._notificationService.createNotification({
                title: 'Requisitou um novo check frete',
                content: `${name}, Requisitou um novo check frete!`,
                manager_id: financial.creator_user_id,
                freight_id: freightId,
                driver_id: id,
                financial_id: financial.id
            });
        }

        if (freight.dataValues.status === 'STARTING_TRIP') {
            const result = await freight.update({
                tons_loaded: body.tons_loaded,
                toll_cost: body.toll_cost,
                truck_km_end_trip: body.truck_km_end_trip,
                discharge: body.discharge,
                img_proof_cte: body.img_proof_cte,
                img_proof_ticket: body.img_proof_ticket,
                img_proof_freight_letter: body.img_proof_freight_letter
            });

            await this._updateValorFinancial(result);

            return result;
        }

        const data = await this.getId(
            { freight_id: freightId },
            {
                id,
                changedDestiny
            }
        );

        return data;
    }

    async uploadDocuments(payload, { id }) {
        const { file, body } = payload;
        if (!file) {
            const err = new Error('FILE_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        const freight = await this._freightModel.findByPk(id);
        if (!freight) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!body.category || !body.typeImg) {
            const err = new Error('IMAGE_CATEGORY_OR_TYPE_NOT_FOUND');
            err.status = 400;
            throw err;
        }

        // Valida se o arquivo tem as propriedades necessárias
        if (!file.name || !file.data) {
            const err = new Error('INVALID_FILE_FORMAT');
            err.status = 400;
            throw err;
        }

        // Valida se o arquivo tem dados válidos
        if (!Buffer.isBuffer(file.data) && !(file.data instanceof Uint8Array)) {
            const err = new Error('INVALID_FILE_DATA');
            err.status = 400;
            throw err;
        }

        const originalFilename = file.originalname;

        const code = generateRandomCode(9);

        file.name = code;

        await sendFile(payload);

        let infoFreight;

        if (body.typeImg === 'freight_letter') {
            if (freight.img_proof_freight_letter && freight.img_proof_freight_letter.uuid) {
                await this.deleteFile({ id }, { typeImg: 'freight_letter' });
            }

            infoFreight = await freight.update({
                img_proof_freight_letter: {
                    uuid: file.name,
                    name: originalFilename,
                    mimetype: file.mimetype,
                    category: body.category
                }
            });
        }

        if (body.typeImg === 'ticket') {
            if (freight.img_proof_ticket && freight.img_proof_ticket.uuid) {
                await this.deleteFile({ id }, { typeImg: 'ticket' });
            }

            infoFreight = await freight.update({
                img_proof_ticket: {
                    uuid: file.name,
                    name: originalFilename,
                    mimetype: file.mimetype,
                    category: body.category
                }
            });
        }

        if (body.typeImg === 'cte') {
            if (freight.img_proof_cte && freight.img_proof_cte.uuid) {
                await this.deleteFile({ id }, { typeImg: 'cte' });
            }

            infoFreight = await freight.update({
                img_proof_cte: {
                    uuid: file.name,
                    name: originalFilename,
                    mimetype: file.mimetype,
                    category: body.category
                }
            });
        }

        return infoFreight.toJSON();
    }

    async getDocuments({ filename, category }) {
        try {
            const { Body, ContentType } = await getFile({ filename, category });
            const fileData = Buffer.from(Body);
            return { contentType: ContentType, fileData };
        } catch {
            const err = new Error('FILE_NOT_FOUND');
            err.status = 404;
            throw err;
        }
    }

    async deleteFile({ id }, { typeImg }) {
        const freight = await this._freightModel.findByPk(id);
        if (!freight) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!typeImg) {
            const err = new Error('IMAGE_TYPE_NOT_FOUND');
            err.status = 400;
            throw err;
        }

        let infoFreight;

        try {
            if (typeImg === 'freight_letter') {
                await this._deleteFileIntegration({
                    filename: freight.img_proof_freight_letter.uuid,
                    category: freight.img_proof_freight_letter.category
                });

                infoFreight = await freight.update({
                    img_proof_freight_letter: {}
                });
            }

            if (typeImg === 'ticket') {
                await this._deleteFileIntegration({
                    filename: freight.img_proof_ticket.uuid,
                    category: freight.img_proof_ticket.category
                });

                infoFreight = await freight.update({
                    img_proof_ticket: {}
                });
            }

            if (typeImg === 'cte') {
                await this._deleteFileIntegration({
                    filename: freight.img_proof_cte.uuid,
                    category: freight.img_proof_cte.category
                });

                infoFreight = await freight.update({
                    img_proof_cte: {}
                });
            }

            return infoFreight.toJSON();
        } catch {
            const err = new Error('FILE_NOT_FOUND');
            err.status = 404;
            throw err;
        }
    }

    async _deleteFileIntegration({ filename, category }) {
        try {
            return await deleteFile({ filename, category });
        } catch {
            const err = new Error('FILE_NOT_FOUND');
            err.status = 404;
            throw err;
        }
    }

    async startingTrip({ freight_id }, { truck_current_km }, { name, id }) {
        const [financial, freight] = await Promise.all([
            this._financialService.getFinancialCurrent({ driver_id: id }),
            this._freightModel.findByPk(freight_id)
        ]);

        const freighStartTrip = financial.freight.find((item) => item.status === 'STARTING_TRIP');
        if (freighStartTrip) {
            const err = new Error('THERE_IS_ALREADY_A_STARTING_TRIP');
            err.status = 400;
            throw err;
        }

        if (!freight) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (freight.dataValues.status === 'APPROVED') {
            await freight.update({
                status: 'STARTING_TRIP',
                truck_current_km: truck_current_km
            });

            if (!financial.start_km) {
                await financial.update({
                    start_km: truck_current_km
                });
            }

            await this._notificationModel.create({
                title: 'Iniciou a viagem!',
                content: `${name} está iniciando a viagem de ${freight.dataValues.start_freight_city} para ${freight.dataValues.end_freight_city}`,
                manager_id: financial.creator_user_id,
                financial_id: financial.id
            });
        }
        return { msg: 'Starting Trip' };
    }

    async finishedTrip({ freight_id }, { truck_km_end_trip }, { name, id }) {
        const [financial, freight] = await Promise.all([
            this._financialService.getFinancialCurrent({ driver_id: id }),
            this._freightModel.findByPk(freight_id)
        ]);

        if (freight.dataValues.status !== 'STARTING_TRIP') {
            const err = new Error('THIS_TRIP_IS_NOT_IN_STARTING_TRIP');
            err.status = 400;
            throw err;
        }

        if (!freight) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (freight.dataValues.status === 'STARTING_TRIP') {
            await freight.update({
                status: 'FINISHED',
                truck_km_end_trip: truck_km_end_trip
            });

            if (!financial.end_km) {
                await financial.update({
                    end_km: truck_km_end_trip
                });
            }

            await this._notificationService.createNotification({
                title: 'Finalizou a viagem',
                content: `${name} finalizou a viagem de ${freight.dataValues.start_freight_city} para ${freight.dataValues.end_freight_city}`,
                manager_id: financial.creator_user_id,
                financial_id: financial.id
            });
        }
        return { msg: 'Finished Trip' };
    }

    async deleteFreightDriver(freightId) {
        const freight = await this._freightModel.findByPk(freightId);

        if (!freight) {
            const err = new Error('FREIGHT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (freight.dataValues.status === 'STARTING_TRIP') {
            const err = new Error('THIS_TRIP_IS_NOT_IN_PROGRESS_TO_FINALIZE');
            err.status = 400;
            throw err;
        }

        await freight.destroy();

        return { msg: 'Freight deleted' };
    }

    async _processExcelFile(fileBuffer) {
        try {
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const dataRows = jsonData.slice(1);

            if (dataRows.length === 0) {
                const err = new Error('NO_DATA_FOUND_IN_EXCEL');
                err.status = 400;
                throw err;
            }

            const row = dataRows[0];

            if (row.length < 8) {
                const err = new Error('INSUFFICIENT_DATA_IN_EXCEL');
                err.status = 400;
                throw err;
            }

            const freight = {
                start_freight_city: row[0]?.toString().trim(),
                end_freight_city: row[1]?.toString().trim(),
                contractor_name: row[2]?.toString().trim(),
                estimated_tonnage: this._parseNumber(row[3]) * 1000,
                ton_value: this._parseMoneyToCents(row[4]),
                estimated_fuel_cost: this._parseMoneyToCents(row[5]),
                fuel_avg_per_km: this._parseNumber(row[6]) * 100,
                truck_current_km: this._parseNumber(row[7])
            };

            if (!freight.start_freight_city || !freight.end_freight_city) {
                const err = new Error('ORIGIN_AND_DESTINATION_CITIES_ARE_REQUIRED');
                err.status = 400;
                throw err;
            }

            return freight;
        } catch {
            const err = new Error('ERRO_PROCESSAR_EXCEL');
            err.status = 400;
            throw err;
        }
    }

    async _processXmlFile(fileBuffer) {
        try {
            const xmlContent = fileBuffer.toString('utf-8');
            const parser = new XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: '@_'
            });

            const result = parser.parse(xmlContent);

            let freightData = null;

            if (result.fretes && result.fretes.frete) {
                freightData = result.fretes.frete;
            } else if (result.frete) {
                freightData = result.frete;
            } else if (result.data && result.data.frete) {
                freightData = result.data.frete;
            } else {
                const err = new Error('UNRECOGNIZED_XML_STRUCTURE');
                err.status = 400;
                err.details = 'UNRECOGNIZED_XML_STRUCTURE';
                throw err;
            }

            const freight = {
                start_freight_city:
                    freightData.cidade_origem || freightData.origem || freightData.start_city,
                end_freight_city:
                    freightData.cidade_destino || freightData.destino || freightData.end_city,
                contractor_name:
                    freightData.contratante || freightData.empresa || freightData.contractor,
                estimated_tonnage:
                    this._parseNumber(freightData.toneladas || freightData.tonnage) * 1000,
                ton_value: this._parseMoneyToCents(
                    freightData.valor_tonelada || freightData.ton_value
                ),
                estimated_fuel_cost: this._parseMoneyToCents(
                    freightData.custo_combustivel || freightData.fuel_cost
                ),
                fuel_avg_per_km:
                    this._parseNumber(freightData.media_consumo || freightData.fuel_avg) * 100,
                truck_current_km: this._parseNumber(freightData.km_atual || freightData.current_km)
            };

            // Valida dados obrigatórios
            if (!freight.start_freight_city || !freight.end_freight_city) {
                throw new Error('ORIGIN_AND_DESTINATION_CITIES_ARE_REQUIRED');
            }

            return freight;
        } catch (error) {
            const err = new Error('ERROR_PROCESSING_XML');
            err.status = 400;
            err.details = error.message;
            throw err;
        }
    }

    _parseNumber(value) {
        if (value === null || value === undefined || value === '') {
            return 0;
        }

        const num = parseFloat(
            value
                .toString()
                .replace(/[^\d.,]/g, '')
                .replace(',', '.')
        );
        return isNaN(num) ? 0 : num;
    }

    _parseMoneyToCents(value) {
        if (value === null || value === undefined || value === '') {
            return 0;
        }

        const cleanValue = value.toString().replace(/[R$\s]/g, '');

        const num = parseFloat(cleanValue.replace(',', '.'));

        if (isNaN(num)) {
            return 0;
        }

        return Math.round(num * 100);
    }

    /**
     * Converte duração de texto para segundos
     * @param {string} durationText - Texto da duração (ex: "5 horas e 30 minutos")
     * @returns {number} - Duração em segundos
     */
    _parseDurationToSeconds(durationText) {
        if (!durationText) return 0;

        const hoursMatch = durationText.match(/(\d+)\s*hora/);
        const minutesMatch = durationText.match(/(\d+)\s*minuto/);

        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

        return hours * 3600 + minutes * 60;
    }

    async createFreightFromFile(manager, { file }, financialId) {
        if (!file) {
            const err = new Error('NO_FILE_FOUND');
            err.status = 400;
            throw err;
        }

        if (!file.fieldname || !file.buffer) {
            const err = new Error('INVALID_FILE_FORMAT');
            err.status = 400;
            throw err;
        }

        if (!Buffer.isBuffer(file.buffer) && !(file.buffer instanceof Uint8Array)) {
            const err = new Error('INVALID_FILE_DATA');
            err.status = 400;
            throw err;
        }

        const financial = await this._financialStatementModel.findByPk(financialId);

        if (!financial || !financial.dataValues.id) {
            const err = new Error('FINANCIAL_STATEMENT_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        if (!manager.id) {
            const err = new Error('MANAGER_NOT_FOUND');
            err.status = 404;
            throw err;
        }

        let freightData = null;
        const fileExtension = file.fieldname.toLowerCase().split('.').pop();

        try {
            switch (fileExtension) {
                case 'xlsx':
                case 'xls': {
                    freightData = await this._processExcelFile(file.buffer);
                    break;
                }
                case 'xml': {
                    freightData = await this._processXmlFile(file.buffer);
                    break;
                }
                default: {
                    const err = new Error('FILE_FORMAT_NOT_SUPPORTED');
                    err.status = 400;
                    throw err;
                }
            }

            if (!freightData) {
                const err = new Error('NO_FREIGHT_FOUND');
                err.status = 400;
                throw err;
            }

            const kmTravel = await this._googleQuery(
                freightData.start_freight_city,
                freightData.end_freight_city
            );

            const result = await this._freightModel.create({
                ...freightData,
                financial_statements_id: financial.dataValues.id,
                route_distance_km: kmTravel.distance.text,
                route_duration: `${Math.floor(kmTravel.duration.value / 3600)}h ${Math.floor((kmTravel.duration.value % 3600) / 60)}min`,
                status: 'APPROVED'
            });

            await this._notificationService.createNotification({
                title: 'Indicou um frete!',
                content: `${manager.name} está indicando um novo frete de ${freightData.start_freight_city} para ${freightData.end_freight_city}!`,
                driver_id: financial.dataValues.driver_id,
                financial_id: financial.dataValues.id
            });

            return {
                success: true,
                freight: result.toJSON(),
                fileInfo: {
                    name: file.originalname || file.name,
                    size: file.size || 0
                }
            };
        } catch (error) {
            const err = new Error(error);
            err.status = 400;
            throw err;
        }
    }
}

export default FreightService;
