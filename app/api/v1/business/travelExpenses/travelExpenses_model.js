import Sequelize, { DataTypes, Model } from 'sequelize';

class TravelExpenses extends Model {
    static init(sequelize) {
        super.init(
            {
                financial_statements_id: Sequelize.INTEGER,
                freight_id: Sequelize.INTEGER,
                city: Sequelize.STRING,
                registration_date: Sequelize.DATE,
                type_establishment: Sequelize.STRING,
                name_establishment: Sequelize.STRING,
                expense_description: Sequelize.STRING,
                dfe: Sequelize.STRING,
                value: Sequelize.INTEGER,
                img_receipt: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                    defaultValue: {}
                },
                payment: {
                    type: Sequelize.JSONB,
                    allowNull: false,
                    defaultValue: {
                        modo: '',
                        value: 0,
                        parcels: 0,
                        flag: ''
                    },
                    validate: {
                        notEmpty: true
                    }
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
        this.belongsTo(models.Freight, {
            foreignKey: 'freight_id',
            as: 'freights'
        });
        this.belongsTo(models.FinancialStatements, {
            foreignKey: 'financial_statements_id',
            as: 'financialStatements'
        });
    }
}

export default TravelExpenses;
