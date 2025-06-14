import Sequelize, { Model } from 'sequelize';

class Trasactions extends Model {
    static init(sequelize) {
        super.init(
            {
                driver_id: Sequelize.INTEGER,
                financial_statements_id: Sequelize.INTEGER,
                freight_id: Sequelize.INTEGER,
                value: {
                    type: Sequelize.INTEGER,
                    defaultValue: 0
                },
                type_method: Sequelize.ENUM({
                    values: ['DEBIT', 'CREDIT']
                }),
                description: Sequelize.STRING
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
        this.belongsTo(models.Driver, { foreignKey: 'driver_id', as: 'drivers' });
    }
}

export default Trasactions;
