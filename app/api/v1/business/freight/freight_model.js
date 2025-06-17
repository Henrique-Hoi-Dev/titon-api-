import { DataTypes, Model } from 'sequelize';

class Freight extends Model {
    static init(sequelize) {
        super.init(
            {
                financial_statements_id: DataTypes.INTEGER,

                start_freight_city: DataTypes.STRING, // cidade iniciar do frete
                end_freight_city: DataTypes.STRING, // cidade final do frete

                truck_location: DataTypes.STRING, // local atual do caminhão
                contractor_name: DataTypes.STRING, // Nome da empresa contratante

                truck_current_km: DataTypes.INTEGER, // km atual do caminhão
                fuel_avg_per_km: DataTypes.INTEGER, // Média de consumo (ex: litros/100km ou ml/km)

                estimated_tonnage: DataTypes.INTEGER, // Tonelada prevista (ex: 25000 = 25t)
                estimated_fuel_cost: DataTypes.INTEGER, // Valor previsto do diesel em centavos
                ton_value: DataTypes.INTEGER, // Valor por tonelada em centavos

                route_distance_km: DataTypes.STRING, // Distância da rota (ex: "523 km")
                route_duration: DataTypes.STRING, // Duração (ex: "5h 30min")

                status: DataTypes.ENUM({
                    values: ['DRAFT', 'PENDING', 'APPROVED', 'STARTING_TRIP', 'DENIED', 'FINISHED'],
                    defaultValue: 'DRAFT'
                }),

                // level two
                tons_loaded: DataTypes.INTEGER, // Tonelada carregada real
                toll_cost: DataTypes.INTEGER, // Valor do pedágio em centavos
                truck_km_end_trip: DataTypes.INTEGER, // KM final da viagem
                discharge: DataTypes.INTEGER,

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
