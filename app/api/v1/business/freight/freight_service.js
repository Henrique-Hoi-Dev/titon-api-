import Freight from './freight_model.js';
import BaseService from '../../base/base_service.js';
import ApiGoogle from '../../../../providers/router_map_google.js';
import FinancialStatements from '../financialStatements/financialStatements_model.js';
import Driver from '../driver/driver_model.js';
import Restock from '../restock/restock_model.js';
import TravelExpenses from '../travelExpenses/travelExpenses_model.js';
import DepositMoney from '../depositMoney/depositMoney_model.js';
import Notification from '../notification/notification_model.js';
import OneSignalProvider from '../../../../providers/oneSignal/index.js';
import Manager from '../manager/manager_model.js';
import FinancialService from '../financialStatements/financialStatements_service.js';

import { formatWithTimezone } from '../../../../utils/formatTimeZone.js';
import { deleteFile, getFile, sendFile } from '../../../../providers/aws/index.js';
import { generateRandomCode } from '../../../../utils/crypto.js';

class FreightService extends BaseService {
    constructor() {
        super();
        this._freightModel = Freight;
        this._financialStatementModel = FinancialStatements;
        this._driverModel = Driver;
        this._restockModel = Restock;
        this._travelExpensesModel = TravelExpenses;
        this._depositMoneyModel = DepositMoney;
        this._notificationModel = Notification;
        this._oneSignalProvider = OneSignalProvider;
        this._managerModel = Manager;
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
        const fuelValueReal = fuelValue / 100;

        const calculate = totalLiters * fuelValueReal;

        return this._formatRealValue(calculate.toFixed(2));
    }

    _valueTotalTonne(tonne, valueTonne) {
        const valueTonneReal = valueTonne / 100;
        const tonneDiv = tonne / 1000;

        const calculate = tonneDiv * valueTonneReal;

        return this._formatRealValue(calculate.toFixed(2));
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
            const freightReal = totalFreight / 100;

            const calculate = freightReal * percentageReal;

            return this._formatRealValue(calculate.toFixed(2));
        } else {
            return this._formatRealValue(fixedValue / 100);
        }
    }

    async create(body) {
        let result = {};
        let freightBody = req;

        const financial = await this._financialStatementModel.findByPk(freightBody.financial_statements_id);
        if (!financial) {
            result = {
                httpStatus: httpStatus.BAD_REQUEST,
                msg: 'Financial not found'
            };
            return result;
        }

        const userFinancial = await this._managerModel.findByPk(financial.creator_user_id);
        if (!userFinancial) {
            result = { httpStatus: httpStatus.BAD_REQUEST, msg: 'USER_NOT_FOUND' };
            return result;
        }

        await this._freightModel.create(body);

        await this._notificationModel.create({
            content: `${userFinancial.name}, Requisitou Um Novo Frete Para Você!`,
            driver_id: financial.driver_id
        });

        result = {
            httpStatus: httpStatus.CREATED,
            status: 'First check order successful!'
        };
        return result;
    }

    async getId(freightId) {
        const freight = await this._freightModel.findByPk(freightId);

        if (!freight) throw Error('FREIGHT_NOT_FOUND');

        const financial = await this._financialStatementModel.findByPk(freight.financial_statements_id);

        if (!financial) throw Error('FINANCIAL_NOT_FOUND');

        const driver = await this._driverModel.findByPk(financial.driver_id);

        const restock = await this._restockModel.findAll({
            where: { freight_id: freightId }
        });

        if (!restock) throw Error('RESTOCK_NOT_FOUND');

        const travelExpenses = await this._travelExpensesModel.findAll({
            where: { freight_id: freightId }
        });

        if (!travelExpenses) throw Error('TRAVEL_EXPENSES_NOT_FOUND');

        const depositMoney = await this._depositMoneyModel.findAll({
            where: { freight_id: freightId }
        });

        if (!depositMoney) throw Error('DEPOSIT_MONEY_NOT_FOUND');

        const kmTravel = await this._googleQuery(freight.start_freight_city, freight.final_freight_city);

        const totalFreight = this._valueTotalTonne(freight.preview_tonne, freight.value_tonne);

        const totalLiters = this._calculatesLiters(kmTravel.distance.value, freight.liter_of_fuel_per_km);

        const totalAmountSpent = this._valueTotalGasto(totalLiters, freight.preview_value_diesel);

        const totalDriver = this._valueDriver(driver.percentage, driver.value_fix, this._unmaskMoney(totalFreight));

        const totalNetFreight = this._valueNetFreight(
            this._unmaskMoney(totalDriver),
            this._unmaskMoney(totalFreight),
            this._unmaskMoney(totalAmountSpent)
        );

        return {
            dataResult: {
                status: freight.status,
                freightTotal: totalFreight,
                totalDriver: totalDriver,
                fuelValueTotal: totalAmountSpent,
                totalNetFreight: totalNetFreight,
                expenses: 0,
                totalLiters: totalLiters,
                driverCommission: driver.percentage > 0 ? driver.percentage : driver.value_fix,
                startCity: freight.start_freight_city,
                finalCity: freight.final_freight_city,
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
            }
        };
    }

    _unmaskMoney(string) {
        return Number(string.toString().replace('.', '').replace('.', '').replace(/\D/g, ''));
    }

    async firstCheckId(id) {
        const freight = await this._freightModel.findByPk(id);

        const formatter = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        if (!freight) throw Error('FREIGHT_NOT_FOUND');

        const driver = await this._financialStatementModel.findByPk(freight.financial_statements_id);

        if (!driver) throw Error('DRIVER_NOT_FOUND');

        const kmTravel = await this._googleQuery(freight.start_freight_city, freight.final_freight_city);

        if (!kmTravel) throw Error('Erro api google');

        function valuePerKm(distance, totalLiters, fuelValue) {
            const distanceInKm = distance / 1000;
            const fuelValueReal = fuelValue / 100;

            const calculate = (totalLiters * fuelValueReal) / distanceInKm;

            return formatter.format(calculate.toFixed(2));
        }

        const totalLiters = this._calculatesLiters(kmTravel.distance.value, freight.liter_of_fuel_per_km);

        const totalValuePerKm = valuePerKm(kmTravel.distance.value, totalLiters, freight.preview_value_diesel);

        const totalAmountSpent = this._valueTotalGasto(totalLiters, freight.preview_value_diesel);

        const totalFreight = this._valueTotalTonne(freight.preview_tonne, freight.value_tonne);

        const totalDriver = this._valueDriver(
            driver.percentage_commission,
            driver.fixed_commission,
            this._unmaskMoney(totalFreight)
        );

        const totalNetFreight = this._valueNetFreight(
            this._unmaskMoney(totalDriver),
            this._unmaskMoney(totalFreight),
            this._unmaskMoney(totalAmountSpent)
        );

        const totalleftoverLiquid = this._leftoverLiquid(
            this._unmaskMoney(totalFreight),
            this._unmaskMoney(totalAmountSpent)
        );

        return {
            responseData: {
                status: freight.status,
                start_freight_city: freight.start_freight_city,
                final_freight_city: freight.final_freight_city,
                previous_average: `${freight.liter_of_fuel_per_km / 100} M`,
                distance: kmTravel.distance.text,
                consumption: `${totalLiters} L`,
                KM_price: totalValuePerKm,
                fuel_estimate: totalAmountSpent,
                full_freight: totalFreight,
                driver_commission: totalDriver,
                net_freight: totalNetFreight,
                leftover_liquid: totalleftoverLiquid
            }
        };
    }

    async update(user, body, id) {
        const [freight, driver] = await Promise.all([
            this._freightModel.findByPk(id),
            this._driverModel.findByPk(body.driver_id)
        ]);

        if (!user.type_role === 'MASTER') throw Error('THIS_USER_IS_NOT_MASTER');
        if (!freight) throw Error('FREIGHT_NOT_FOUND');
        if (!driver) throw Error('DRIVER_NOT_FOUND');

        if (freight.status === 'PENDING') {
            const result = await freight.update({
                status: body.status
            });

            const financial = await this._financialStatementModel.findOne({
                where: { driver_id: driver.id, status: true }
            });

            if (!financial) throw Error('FINANCIAL_NOT_FOUND');

            if (result.status === 'APPROVED') {
                await this._notificationModel.create({
                    content: `${
                        user.name
                    }, Aceitou Seu Check Frete, DE ${freight.start_freight_city.toUpperCase()} PARA ${freight.final_freight_city.toUpperCase()} Tenha uma BOA VIAGEM`,
                    driver_id: driver.id,
                    financial_statements_id: financial.id
                });

                if (driver.player_id) {
                    await this._oneSignalProvider.sendToUsers({
                        externalUserIds: [driver.player_id],
                        title: 'Gerenciador',
                        message: 'Aceitou Seu Check Frete'
                    });
                    const mobilesids = await this._oneSignalProvider.getPlayers();
                    console.log('log de test para pegar usuarios', mobilesids);
                }
                return { status: 'APPROVED' };
            }
        }

        return {};
    }

    async delete(id) {
        const freight = await this._freightModel.destroy({
            where: {
                id: id
            }
        });

        if (!freight) throw Error('FREIGHT_NOT_FOUND');

        return { msg: 'Deleted freight' };
    }

    async _financialDriver(id) {
        const financial = await this._financialService.getFinancialCurrent(id);
        if (!financial) {
            throw Error('FINANCIAL_IN_PROGRESS');
        }
        return financial;
    }

    async create(driverId, body) {
        const financial = await this._financialDriver(driverId);

        const result = await Freight.create({
            ...body,
            status: 'DRAFT',
            financial_statements_id: financial.id
        });

        if (!result) {
            throw Error('ERRO_CREATE_FREIGHT');
        }

        return await this.getId(result.id, { driverId });
    }

    async _googleQuery(startCity, finalCity) {
        const kmTravel = await ApiGoogle.getRoute(startCity, finalCity, 'driving');

        return kmTravel;
    }

    async getId(id, { driverId, changedDestiny = false }, financialId) {
        let financial = await this._financialDriver(driverId);

        if (!financial && financialId) {
            financial = await this._financialStatementModel.findByPk(financialId);
        }

        let freight = await this._freightModel.findOne({
            where: { id: id, financial_statements_id: financial.id },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            rejectOnEmpty: true,
            include: [
                {
                    model: Restock,
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
                    model: TravelExpenses,
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
                    model: DepositMoney,
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

        if (!freight) throw Error('FREIGHT_NOT_FOUND');

        if (!financialId && changedDestiny) {
            const origin = freight.start_freight_city;
            const destination = freight.final_freight_city;

            const googleTravel = await this._googleQuery(origin, destination);

            const seconds = googleTravel.duration.value;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);

            await freight.update({
                distance: googleTravel.distance.text,
                duration: `${hours} horas e ${minutes} minutos`
            });
        }

        return freight;
    }

    async _calculate(values) {
        let initialValue = 0;
        let total = values.reduce((accumulator, currentValue) => accumulator + currentValue, initialValue);
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

        console.log('totalvalueDeposit:', totalvalueRestock, totalvalueTravel);

        await financial.update({
            total_value: (await this._calculate([totalvalueTravel, totalvalueRestock])) - totalvalueDeposit
        });
    }

    async update(body, id, { user, driverId }) {
        let changedDestiny = false;
        const financial = await this._financialDriver(driverId);

        const freight = await this._freightModel.findOne({
            where: { id: id, financial_statements_id: financial.id }
        });
        if (!freight) throw Error('FREIGHT_NOT_FOUND');

        const normalize = (s) => s.toLowerCase().trim();

        const originUI = normalize(body.start_freight_city || '');
        const destinationUI = normalize(body.final_freight_city || '');
        const originDB = normalize(freight.start_freight_city || '');
        const destinationDB = normalize(freight.final_freight_city || '');

        const precisaDeRota =
            !freight.distance || // falta distância
            !freight.duration || // ou falta duração
            (originUI && originUI !== originDB) || // ou origem mudou
            (destinationUI && destinationUI !== destinationDB); // ou destino mudou

        if (precisaDeRota) {
            changedDestiny = true;
        }

        await freight.update(body);

        if (body.status === 'PENDING') {
            await Notification.create({
                content: `${user.name}, Requisitou um novo check frete!`,
                user_id: financial.creator_user_id,
                freight_id: id,
                driver_id: driverId,
                financial_statements_id: financial.id
            });
        }

        if (freight.status === 'STARTING_TRIP') {
            const result = await freight.update({
                tons_loaded: body.tons_loaded,
                toll_value: body.toll_value,
                truck_km_completed_trip: body.truck_km_completed_trip,
                discharge: body.discharge,
                img_proof_cte: body.img_proof_cte,
                img_proof_ticket: body.img_proof_ticket,
                img_proof_freight_letter: body.img_proof_freight_letter
            });

            await this._updateValorFinancial(result);

            return result;
        }

        return await this.getId(id, {
            driverId,
            changedDestiny
        });
    }

    async uploadDocuments(payload, { id }) {
        const { file, body } = payload;
        if (!file) throw Error('FILE_NOT_FOUND');

        const freight = await this._freightModel.findByPk(id);
        if (!freight) throw Error('FREIGHT_NOT_FOUND');

        if (!body.category || !body.typeImg) throw Error('IMAGE_CATEGORY_OR_TYPE_NOT_FOUND');

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

        return infoFreight;
    }

    async getDocuments({ filename, category }) {
        try {
            const { Body, ContentType } = await getFile({ filename, category });
            const fileData = Buffer.from(Body);
            return { contentType: ContentType, fileData };
        } catch (error) {
            throw error;
        }
    }

    async deleteFile({ id }, { typeImg }) {
        const freight = await this._freightModel.findByPk(id);
        if (!freight) throw Error('FREIGHT_NOT_FOUND');

        if (!typeImg) throw Error('IMAGE_TYPE_NOT_FOUND');

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

            return infoFreight;
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

    async startingTrip({ freight_id, truck_current_km }, { name, id }) {
        const financial = await this._financialService.getFinancialCurrent(id);

        const freighStartTrip = financial.freight.find((item) => item.status === 'STARTING_TRIP');
        if (freighStartTrip) throw Error('THERE_IS_ALREADY_A_TRIP_IN_PROGRESS');

        const freight = await this._freightModel.findByPk(freight_id);
        if (!freight) throw Error('FREIGHT_NOT_FOUND');

        if (freight.status === 'APPROVED') {
            await freight.update({
                status: 'STARTING_TRIP',
                truck_current_km: truck_current_km
            });

            await financial.update({
                start_km: truck_current_km
            });

            await this._notificationModel.create({
                content: `${name}, Inicio a viagem!`,
                user_id: financial.creator_user_id,
                financial_statements_id: freight.financial_statements_id
            });

            return { data: { msg: 'Starting Trip' } };
        } else {
            throw Error('SHIPPING_WAS_NOT_APPROVED');
        }
    }

    async finishedTrip({ freight_id, truck_km_completed_trip }, { name, id }) {
        const financial = await this._financialService.getFinancialCurrent(id);

        const freight = await Freight.findByPk(freight_id);
        if (!freight) throw Error('FREIGHT_NOT_FOUND');

        if (freight.status !== 'STARTING_TRIP') throw Error('THIS_TRIP_IS_NOT_IN_PROGRESS_TO_FINALIZE');

        if (freight.status === 'STARTING_TRIP') {
            await freight.update({
                status: 'FINISHED',
                truck_km_completed_trip: truck_km_completed_trip
            });

            await financial.update({
                final_km: truck_km_completed_trip
            });

            await Notification.create({
                content: `${name}, Finalizou a viagem!`,
                user_id: financial.creator_user_id,
                financial_statements_id: freight.financial_statements_id
            });
        }
        return { data: { msg: 'Finished Trip' } };
    }

    async delete(id, { driverId }) {
        financial = await this._financialDriver(driverId);

        const freight = await this._freightModel.destroy({
            where: {
                id: id,
                financial_statements_id: financial.id
            }
        });
        if (!freight) throw Error('FREIGHT_NOT_FOUND');

        return { data: { msg: 'Deleted freight' } };
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

export default FreightService;
