import Sequelize, { Model } from 'sequelize';

class Cart extends Model {
    static init(sequelize) {
        super.init(
            {
                cart_models: Sequelize.STRING,
                cart_brand: Sequelize.STRING,
                cart_tara: Sequelize.STRING,
                cart_color: Sequelize.STRING,
                cart_bodyworks: Sequelize.ENUM({
                    values: ['TANK', 'BULKCARRIER', 'SIDER', 'CHEST', 'BUCKET']
                }),
                cart_year: Sequelize.STRING,
                cart_chassis: Sequelize.DOUBLE,
                cart_liter_capacity: Sequelize.DOUBLE,
                cart_ton_capacity: Sequelize.DOUBLE,
                cart_board: Sequelize.STRING
            },
            {
                sequelize,
                timestamps: true
            }
        );
        return this;
    }

    static associate(models) {
        this.hasMany(models.FinancialStatements, { foreignKey: 'cart_id', as: 'financialStatements' });
    }
}

export default Cart;
