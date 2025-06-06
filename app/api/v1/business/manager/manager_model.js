import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class Users extends Model {
    static init(sequelize) {
        super.init(
            {
                name: Sequelize.STRING,
                email: Sequelize.STRING,
                phone: Sequelize.STRING,
                cpf: Sequelize.STRING,
                gender: Sequelize.STRING,
                password: Sequelize.VIRTUAL,
                password_hash: Sequelize.STRING,
                avatar: {
                    type: Sequelize.JSONB,
                    allowNull: true,
                    defaultValue: {}
                },
                type_role: {
                    type: Sequelize.ENUM,
                    values: ['MASTER', 'USER', 'MANAGER', 'DIRECTOR', 'COLLABORATOR'],
                    defaultValue: 'USER'
                },
                permission_id: Sequelize.INTEGER
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
        this.belongsTo(models.Permission, { foreignKey: 'permission_id', as: 'permissions' });
    }

    checkPassword(password) {
        return bcrypt.compare(password, this.password_hash);
    }
}

export default Users;
