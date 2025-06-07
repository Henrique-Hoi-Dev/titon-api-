import { Sequelize } from 'sequelize';
import Driver from '../../app/api/v1/business/driver/driver_model.js';
import BaseService from '../../app/api/v1/base/base_service.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env.test
dotenv.config({ path: '.env.test' });

// Classe concreta para teste
class TestService extends BaseService {
    constructor() {
        super();
    }
}

describe('Driver Model', () => {
    let sequelize;
    let driver;
    let testService;

    beforeAll(async () => {
        sequelize = new Sequelize({
            dialect: 'postgres',
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            logging: false,
            define: {
                timestamps: true
            }
        });

        // Primeiro, cria o enum
        await sequelize.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."enum_Drivers_status" AS ENUM('ACTIVE', 'INACTIVE', 'INCOMPLETE');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        Driver.init(sequelize);
        await sequelize.sync({ force: true });
        testService = new TestService();
    });

    beforeEach(async () => {
        // Limpa todas as tabelas antes de cada teste
        await sequelize.truncate({ cascade: true });

        const password = '123456';
        const password_hash = await bcrypt.hash(password, 8);

        driver = await Driver.create({
            name: 'Test Driver',
            phone: '1234567890',
            email: 'test@example.com',
            cpf: '12345678900',
            password_hash
        });
    });

    afterEach(async () => {
        if (driver) {
            await driver.destroy();
        }
    });

    afterAll(async () => {
        if (sequelize) {
            await sequelize.close();
        }
    });

    describe('Password Hashing', () => {
        it('should hash password before saving', async () => {
            const password = '123456';
            driver.password = password;

            await driver.save();

            expect(driver.password_hash).toBeDefined();
            expect(driver.password_hash).not.toBe(password);

            const isPasswordValid = await bcrypt.compare(password, driver.password_hash);
            expect(isPasswordValid).toBe(true);
        });
    });

    describe('Transaction Management', () => {
        it('should create transaction', async () => {
            const transaction = {
                typeTransactions: 'CREDIT',
                value: 100,
                date: new Date()
            };

            // Adiciona a transação
            driver.addTransaction(transaction);
            await driver.save();

            expect(driver.transactions).toBeDefined();
            expect(driver.transactions).toHaveLength(1);
            expect(driver.transactions[0]).toMatchObject(transaction);
            expect(driver.transactions[0].typeTransactions).toBe(transaction.typeTransactions);
            expect(driver.transactions[0].value).toBe(transaction.value);
            expect(new Date(driver.transactions[0].date).toISOString()).toBe(
                transaction.date.toISOString()
            );
        });

        it('should delete transaction', async () => {
            const transaction = {
                typeTransactions: 'CREDIT',
                value: 100,
                date: new Date()
            };

            driver.addTransaction(transaction);
            await driver.save();

            driver.removeTransaction(0);
            await driver.save();

            const updatedDriver = await Driver.findByPk(driver.id, {
                raw: false
            });
            expect(updatedDriver.transactions).toBeDefined();
            expect(updatedDriver.transactions).toHaveLength(0);
        });

        it('should get transactions', async () => {
            const transaction = {
                typeTransactions: 'CREDIT',
                value: 100,
                date: new Date()
            };

            driver.addTransaction(transaction);
            await driver.save();

            expect(driver.transactions).toBeDefined();
            expect(driver.transactions).toHaveLength(1);
            expect(driver.transactions[0]).toMatchObject(transaction);
        });
    });

    describe('Default Values', () => {
        it('should have correct default values', async () => {
            const password = '123456';
            const password_hash = await bcrypt.hash(password, 8);

            const newDriver = await Driver.create({
                name: 'New Driver',
                phone: '9876543210',
                email: 'new@example.com',
                cpf: '98765432100',
                password_hash
            });

            expect(newDriver.status).toBe('INCOMPLETE');
            expect(newDriver.type_positions).toBe('COLLABORATOR');
            expect(newDriver.credit).toBe(0);
            expect(newDriver.value_fix).toBe(0);
            expect(newDriver.percentage).toBe(0);
            expect(newDriver.daily).toBe(0);
            expect(newDriver.address).toBeDefined();
            expect(newDriver.address).toEqual({
                street: '',
                number: '',
                complement: '',
                state: '',
                city: ''
            });

            await newDriver.destroy();
        });
    });
});
