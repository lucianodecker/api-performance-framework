import { test, expect } from '@playwright/test';

test.describe('Health Check - /ping', () => {
    test('should confirm whether the API is up and running', async ({ request }) => {
        const ping = await request.get('/ping');
        expect(ping.status()).toBe(201);
    });
})