import Sequelize, { DataTypes, Model } from 'sequelize';

class Freight extends Model {
    static init(sequelize) {
        super.init(
            {
                financial_statements_id: Sequelize.INTEGER,
                start_freight_city: Sequelize.STRING, // cidade iniciar do frete
                final_freight_city: Sequelize.STRING, // cidade final do frete
                location_of_the_truck: Sequelize.STRING, // local atual do caminhão
                contractor: Sequelize.STRING, // empresa que foi pego o frete
                truck_current_km: Sequelize.INTEGER, // km atual registrado no caminhão
                liter_of_fuel_per_km: Sequelize.INTEGER, // media do caminhão
                preview_tonne: Sequelize.INTEGER, // previa de tonelada
                preview_value_diesel: Sequelize.INTEGER, // previa de valor de combustivel
                value_tonne: Sequelize.INTEGER, // valor por tonelada

                status: Sequelize.ENUM({
                    values: ['DRAFT', 'PENDING', 'APPROVED', 'STARTING_TRIP', 'DENIED', 'FINISHED'],
                    defaultValue: 'DRAFT'
                }),

                // level two
                tons_loaded: Sequelize.INTEGER, // total da tonelada carregada
                toll_value: Sequelize.INTEGER, // valor do pedagio
                truck_km_completed_trip: Sequelize.INTEGER, // km do caminhão do final da viagem
                discharge: Sequelize.INTEGER,

                img_proof_cte: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                    defaultValue: {}
                },
                img_proof_ticket: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                    defaultValue: {}
                },
                img_proof_freight_letter: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                    defaultValue: {}
                }
            },
            {
                sequelize,
                timestamps: true
            }
        );
        return this;
    }

    static associate(models) {
        this.belongsTo(models.FinancialStatements, {
            foreignKey: 'financial_statements_id',
            as: 'financialStatements'
        });
        this.hasMany(models.DepositMoney, {
            foreignKey: 'freight_id',
            as: 'deposit_money'
        });
        this.hasMany(models.Restock, { foreignKey: 'freight_id', as: 'restock' });
        this.hasMany(models.TravelExpenses, {
            foreignKey: 'freight_id',
            as: 'travel_expense'
        });
    }
}

export default Freight;
