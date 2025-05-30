import Sequelize, { Model } from 'sequelize';

class FinancialStatements extends Model {
    static init(sequelize) {
        super.init(
            {
                creator_user_id: Sequelize.INTEGER,
                driver_id: Sequelize.INTEGER,
                truck_id: Sequelize.INTEGER,
                cart_id: Sequelize.INTEGER,
                status: {
                    type: Boolean,
                    defaultValue: true
                },
                start_km: Sequelize.INTEGER,
                final_km: Sequelize.INTEGER,
                start_date: Sequelize.DATE,
                final_date: Sequelize.DATE,
                invoicing_all: Sequelize.INTEGER,
                medium_fuel_all: Sequelize.INTEGER,
                total_value: {
                    type: Sequelize.INTEGER,
                    defaultValue: 0
                },
                transactions: {
                    type: Sequelize.ARRAY(
                        Sequelize.JSONB({
                            typeTransactions: Sequelize.STRING,
                            value: Sequelize.INTEGER,
                            date: Sequelize.DATE
                        })
                    ),
                    defaultValue: null
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
        this.belongsTo(models.Driver, { foreignKey: 'driver_id', as: 'driver' });
        this.belongsTo(models.Truck, { foreignKey: 'truck_id', as: 'truck' });
        this.belongsTo(models.Cart, { foreignKey: 'cart_id', as: 'cart' });
        this.hasMany(models.Freight, {
            foreignKey: 'financial_statements_id',
            as: 'freight'
        });
        this.hasMany(models.DepositMoney, {
            foreignKey: 'financial_statements_id',
            as: 'deposit_money'
        });
        this.hasMany(models.Restock, {
            foreignKey: 'financial_statements_id',
            as: 'restock'
        });
        this.hasMany(models.TravelExpenses, {
            foreignKey: 'financial_statements_id',
            as: 'travel_expense'
        });
    }

    addTransaction(transaction) {
        const transactions = this.transactions || [];
        transactions.push(transaction);
        this.transactions = transactions;
    }
}

export default FinancialStatements;
