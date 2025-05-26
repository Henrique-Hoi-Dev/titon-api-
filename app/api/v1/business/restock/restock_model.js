import Sequelize, { DataTypes, Model } from 'sequelize';

class Restock extends Model {
    static init(sequelize) {
        super.init(
            {
                financial_statements_id: Sequelize.INTEGER,
                freight_id: Sequelize.INTEGER,
                name_establishment: Sequelize.STRING,
                city: Sequelize.STRING,
                registration_date: Sequelize.DATE,
                value_fuel: Sequelize.INTEGER,
                liters_fuel: Sequelize.INTEGER,
                total_value_fuel: Sequelize.INTEGER,
                total_nota_value: Sequelize.INTEGER,
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

export default Restock;
