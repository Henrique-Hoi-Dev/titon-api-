/* eslint-disable no-undef */
/* eslint-env jest */
import supertest from 'supertest';
import { app, server, closeServer } from '../server.js';

jest.setTimeout(30000);

beforeAll(async () => {
    global.testRequest = supertest(app);
});

afterAll(async () => {
    await closeServer(server);
});
