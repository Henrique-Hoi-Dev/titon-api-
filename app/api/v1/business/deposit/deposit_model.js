import Sequelize, { Model } from 'sequelize';
import { BRAZILIANBANKSENUM, DEPOSITMONEYENUM } from '../../../../utils/enums_deposit.js';

class DepositMoney extends Model {
    static init(sequelize) {
        super.init(
            {
                financial_statements_id: Sequelize.INTEGER,
                freight_id: Sequelize.INTEGER,
                registration_date: Sequelize.DATE,
                type_transaction: {
                    type: Sequelize.ENUM,
                    values: DEPOSITMONEYENUM
                },
                local: Sequelize.STRING,
                type_bank: {
                    type: Sequelize.ENUM,
                    values: BRAZILIANBANKSENUM
                },
                value: Sequelize.INTEGER,
                img_receipt: {
                    type: Sequelize.JSONB,
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
        this.belongsTo(models.FinancialStatements, {
            foreignKey: 'financial_statements_id',
            as: 'financialStatements'
        });
        this.belongsTo(models.Freight, {
            foreignKey: 'freight_id',
            as: 'freights'
        });
    }
}

export default DepositMoney;
