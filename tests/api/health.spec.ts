import { test, expect } from '@playwright/test';
import { logApiCall } from '../../src/helpers/api-logger';

test.describe('Health Check - /ping', () => {
    test('should confirm whether the API is up and running', async ({ request }) => {
        const { response: ping } = await logApiCall(request, 'get', '/ping');
        expect(ping.status()).toBe(201);
    });
})