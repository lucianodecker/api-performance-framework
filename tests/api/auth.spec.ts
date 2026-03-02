import { test, expect } from '@playwright/test';

test.describe('Auth - POST /auth', () => {
    test('should create auth token with valid credentials', async ({ request }) => {
        const response = await request.post('/auth', { data: { username: process.env.API_USERNAME, password: process.env.API_PASSWORD } });
        const body = await response.json();
        expect(response.status()).toBe(200);
        expect(body.token).toBeDefined();
        expect(typeof body.token).toBe('string');
        expect(body.token.length).toBeGreaterThan(0);
    });

    test('should reject invalid credentials', async ({ request }) => {
        const response = await request.post('/auth', { data: { username: 'dummy_user', password: 'dummy_password' } });
        const body = await response.json();
       
        // API returns 200 instead of 401 for invalid credentials (design flaw)

        expect(body.reason).toBe('Bad credentials');
        expect(body.token).toBeUndefined();
    });

    test('should reject empty body', async ({ request }) => {
        const response = await request.post('/auth', { data: {} });
        const body = await response.json();
       
        // API returns 200 instead of 401 for invalid credentials (design flaw)
        
        expect(body.reason).toBe('Bad credentials');
        expect(body.token).toBeUndefined();
    });
})