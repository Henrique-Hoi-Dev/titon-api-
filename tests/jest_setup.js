/* eslint-disable no-undef */
/* eslint-env jest */
import supertest from 'supertest';
import { app, server, closeServer } from '../server.js';
import dotenv from 'dotenv';
import { jest } from '@jest/globals';

dotenv.config({ path: '.env.test' });

jest.setTimeout(30000);

beforeAll(async () => {
    global.testRequest = supertest(app);
});

afterAll(async () => {
    await closeServer(server);
});
