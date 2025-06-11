import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class Driver extends Model {
    static init(sequelize) {
        const driver = super.init(
            {
                // info base
                name: { type: Sequelize.STRING, allowNull: false },
                phone: { type: Sequelize.STRING, unique: true, allowNull: false },
                email: {
                    type: Sequelize.STRING,
                    unique: true,
                    allowNull: false
                },
                cpf: {
                    type: Sequelize.STRING,
                    unique: true,
                    allowNull: false
                },
                avatar: {
                    type: Sequelize.JSONB,
                    allowNull: true,
                    defaultValue: {}
                },
                gender: { type: Sequelize.STRING, defaultValue: null },
                password: Sequelize.VIRTUAL,
                password_hash: { type: Sequelize.STRING, allowNull: false },
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
                    type: Sequelize.JSONB,
                    allowNull: false,
                    defaultValue: []
                },
                value_fix: { type: Sequelize.INTEGER, defaultValue: 0 },
                percentage: { type: Sequelize.INTEGER, defaultValue: 0 },
                daily: { type: Sequelize.INTEGER, defaultValue: 0 },

                // address
                address: {
                    type: Sequelize.JSONB,
                    defaultValue: {
                        street: '',
                        number: '',
                        complement: '',
                        state: '',
                        city: ''
                    }
                }
            },
            {
                sequelize,
                modelName: 'Driver',
                timestamps: true
            }
        );

        this.addHook('beforeSave', async (user) => {
            if (user.password) {
                user.password_hash = await bcrypt.hash(user.password, 8);
            }
        });

        this.addHook('beforeCreate', (driver) => {
            if (!driver.transactions) {
                driver.transactions = [];
            }
        });

        return driver;
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
        if (!Array.isArray(this.transactions)) {
            this.transactions = [];
        }

        this.transactions.push(transaction);
    }

    removeTransaction(index) {
        if (!Array.isArray(this.transactions)) {
            this.transactions = [];
            return;
        }

        if (index >= 0 && index < this.transactions.length) {
            this.transactions.splice(index, 1);
        }
    }
}

export default Driver;
