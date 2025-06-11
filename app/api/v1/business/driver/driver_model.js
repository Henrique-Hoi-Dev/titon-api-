import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

class Driver extends Model {
    static init(sequelize) {
        super.init(
            {
                // Informações básicas
                name: { type: DataTypes.STRING, allowNull: false },
                phone: { type: DataTypes.STRING, allowNull: false, unique: true },
                email: { type: DataTypes.STRING, allowNull: false, unique: true },
                cpf: { type: DataTypes.STRING, allowNull: false, unique: true },
                avatar: { type: DataTypes.JSONB, allowNull: true, defaultValue: {} },
                gender: { type: DataTypes.STRING, defaultValue: null },
                date_birthday: { type: DataTypes.DATE, allowNull: true },

                password: DataTypes.VIRTUAL,
                password_hash: DataTypes.STRING,

                status: {
                    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'INCOMPLETE'),
                    defaultValue: 'INCOMPLETE'
                },
                type_positions: {
                    type: DataTypes.STRING,
                    defaultValue: 'COLLABORATOR'
                },
                permission_id: DataTypes.INTEGER,

                // Notificações push
                external_user_id: DataTypes.STRING,
                player_id: DataTypes.STRING,

                // CNH e datas
                number_cnh: DataTypes.STRING,
                valid_cnh: DataTypes.DATE,
                date_valid_mopp: DataTypes.DATE,
                date_valid_nr20: DataTypes.DATE,
                date_valid_nr35: DataTypes.DATE,
                date_admission: DataTypes.DATE,

                // Financeiro
                credit: { type: DataTypes.INTEGER, defaultValue: 0 },
                transactions: {
                    type: DataTypes.JSONB,
                    defaultValue: []
                },
                value_fix: { type: DataTypes.INTEGER, defaultValue: 0 },
                percentage: { type: DataTypes.INTEGER, defaultValue: 0 },
                daily: { type: DataTypes.INTEGER, defaultValue: 0 },

                // Endereço
                address: {
                    type: DataTypes.JSONB,
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

        // Hook para gerar hash da senha
        this.addHook('beforeSave', async (driver) => {
            if (driver.password) {
                driver.password_hash = await bcrypt.hash(driver.password, 8);
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

    // Verifica senha
    checkPassword(password) {
        return bcrypt.compare(password, this.password_hash);
    }

    // Adiciona transação
    addTransaction(transaction) {
        if (!Array.isArray(this.transactions)) {
            this.transactions = [];
        }
        this.transactions.push(transaction);
    }

    // Remove transação
    removeTransaction(index) {
        if (Array.isArray(this.transactions) && index >= 0 && index < this.transactions.length) {
            this.transactions.splice(index, 1);
        }
    }
}

export default Driver;
