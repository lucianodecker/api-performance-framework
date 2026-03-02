import { test, expect } from '@playwright/test';

test.describe('Negative Tests - /booking', () => {
    test('invalid bookingid - (GET) should get a 404 response', async ({ request }) => {
        const get = await request.get(`/booking/99999`);
        expect(get.status()).toBe(404);
    });

    test('string instead of number for bookingid - (GET) should get a 404 response', async ({ request }) => {
        const get = await request.get(`/booking/abcxyz`);
        expect(get.status()).toBe(404);
    });

    test('No Auth - (PUT) should get a 403 response', async ({ request }) => {
        const bookingData = {
            firstname: "Erika",
            lastname: "Mustermann",
            totalprice: 789,
            depositpaid: true,
            bookingdates: {
                checkin: "2026-01-01",
                checkout: "2026-01-02"
            },
            additionalneeds: "Dinner"
        };
        const putData = {
            firstname: "Max",
            lastname: "Mustermann",
            totalprice: 111,
            depositpaid: false,
            bookingdates: {
                checkin: "2025-11-11",
                checkout: "2025-12-12"
            },
            additionalneeds: "Breakfast"
        };
        const create = await request.post('/booking', { data: bookingData });
        const bodyCreate = await create.json();
        const put = await request.put(`/booking/${bodyCreate.bookingid}`, {
            data: putData, 
        });
        expect(put.status()).toBe(403);
    });

    test('No Auth - (DELETE) should get a 403 response', async ({ request }) => {
        const bookingData = {
            firstname: "Erika",
            lastname: "Mustermann",
            totalprice: 444,
            depositpaid: true,
            bookingdates: {
                checkin: "2026-01-01",
                checkout: "2026-01-02"
            },
            additionalneeds: "Breakfast"
        };
        const create = await request.post('/booking', { data: bookingData });
        const bodyCreate = await create.json();
        const deleteBooking = await request.delete(`/booking/${bodyCreate.bookingid}`);
        expect(deleteBooking.status()).toBe(403);
    });

    test('Empty Body - (POST) should get a 500 response', async ({ request }) => {
        // API returns 500 instead of 400 for invalid request body (design flaw)
        const create = await request.post('/booking', {});
        expect(create.status()).toBe(500);
    });

    test('Incomplete Body - (POST) should get a 500 response', async ({ request }) => {
        // API returns 500 instead of 400 for invalid request body (design flaw)
        const bookingData = {
            firstname: "Erika"
        };
        const create = await request.post('/booking', { data: bookingData });
        expect(create.status()).toBe(500);
    });
})