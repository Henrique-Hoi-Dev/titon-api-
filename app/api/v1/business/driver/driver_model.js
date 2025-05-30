import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class Driver extends Model {
    static init(sequelize) {
        super.init(
            {
                // info base
                name: Sequelize.STRING,
                phone: { type: Sequelize.STRING, unique: true },
                email: {
                    type: Sequelize.STRING,
                    unique: true
                },
                cpf: {
                    type: Sequelize.STRING,
                    unique: true
                },
                password: Sequelize.VIRTUAL,
                password_hash: Sequelize.STRING,
                status: {
                    type: Sequelize.ENUM,
                    values: ['ACTIVE', 'INACTIVE', 'INCOMPLETE'],
                    defaultValue: 'INCOMPLETE'
                },
                type_positions: {
                    type: Sequelize.STRING,
                    defaultValue: 'COLLABORATOR'
                },
                permission_id: Sequelize.INTEGER,

                // notification ids
                external_user_id: Sequelize.STRING,
                player_id: Sequelize.STRING,

                // driver personal data
                number_cnh: Sequelize.STRING,
                valid_cnh: Sequelize.DATE,
                date_valid_mopp: Sequelize.DATE,
                date_valid_nr20: Sequelize.DATE,
                date_valid_nr35: Sequelize.DATE,
                date_admission: Sequelize.DATE,
                date_birthday: Sequelize.DATE,

                // financial data
                credit: { type: Sequelize.INTEGER, defaultValue: 0 },
                transactions: {
                    type: Sequelize.ARRAY(
                        Sequelize.JSONB({
                            typeTransactions: Sequelize.STRING,
                            value: Sequelize.INTEGER,
                            date: Sequelize.DATE
                        })
                    ),
                    defaultValue: null
                },
                value_fix: { type: Sequelize.INTEGER, defaultValue: 0 },
                percentage: { type: Sequelize.INTEGER, defaultValue: 0 },
                daily: { type: Sequelize.INTEGER, defaultValue: 0 }
            },
            {
                sequelize,
                timestamps: true
            }
        );

        this.addHook('beforeSave', async (user) => {
            if (user.password) {
                user.password_hash = await bcrypt.hash(user.password, 8);
            }
        });

        return this;
    }

    static associate(models) {
        this.hasMany(models.FinancialStatements, {
            foreignKey: 'driver_id',
            as: 'financialStatements'
        });
        this.hasMany(models.Credit, {
            foreignKey: 'driver_id',
            as: 'credits'
        });
    }

    checkPassword(password) {
        return bcrypt.compare(password, this.password_hash);
    }

    addTransaction(transaction) {
        const transactions = this.transactions || [];
        transactions.push(transaction);
        this.transactions = transactions;
    }

    removeTransaction(index) {
        const transactions = this.transactions || [];
        transactions.splice(index, 1);
        this.transactions = transactions;
    }
}

export default Driver;
