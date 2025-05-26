import Sequelize, { Model } from 'sequelize';

class Notification extends Model {
    static init(sequelize) {
        super.init(
            {
                content: Sequelize.STRING,
                driver_id: Sequelize.INTEGER,
                user_id: Sequelize.INTEGER,
                freight_id: Sequelize.INTEGER,
                financial_statements_id: Sequelize.INTEGER,
                read: {
                    type: Boolean,
                    defaultValue: false
                }
            },
            {
                sequelize,
                timestamps: true
            }
        );
        return this;
    }
}

export default Notification;
