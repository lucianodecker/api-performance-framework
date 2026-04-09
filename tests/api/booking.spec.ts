import { test, expect } from '@playwright/test';
import { logApiCall } from '../../src/helpers/api-logger';

test.describe('Booking - CRUD - /booking', () => {
    test('should create (POST) a booking', async ({ request }) => {
        const bookingData = {
            firstname: "Erika",
            lastname: "Mustermann",
            totalprice: 123,
            depositpaid: true,
            bookingdates: {
                checkin: "2026-01-01",
                checkout: "2026-01-02"
            },
            additionalneeds: "Breakfast"
        };
        const { response: create, body } = await logApiCall(request, 'post', '/booking', { data: bookingData });
        expect(create.status()).toBe(200);
        expect(body.bookingid).toBeDefined();
        expect(typeof body.bookingid).toBe('number');
        expect(body.booking.firstname).toBe('Erika');
        expect(body.booking.lastname).toBe('Mustermann');
    });

    test('should get (GET) a booking', async ({ request }) => {
        const bookingData = {
            firstname: "Erika",
            lastname: "Mustermann",
            totalprice: 456,
            depositpaid: true,
            bookingdates: {
                checkin: "2026-01-01",
                checkout: "2026-01-02"
            },
            additionalneeds: "Lunch"
        };

        const { body: bodyCreate } = await logApiCall(request, 'post', '/booking', { data: bookingData });
        const { response: get, body: bodyGet } = await logApiCall(request, 'get', `/booking/${bodyCreate.bookingid}`);
        expect(get.status()).toBe(200);
        expect(bodyGet.firstname).toEqual(bookingData.firstname);
        expect(bodyGet.lastname).toEqual(bookingData.lastname);
        expect(bodyGet.totalprice).toEqual(bookingData.totalprice);
        expect(bodyGet.depositpaid).toEqual(bookingData.depositpaid);
        expect(bodyGet.bookingdates).toEqual(bookingData.bookingdates);
        expect(bodyGet.additionalneeds).toEqual(bookingData.additionalneeds);
    });

    test('should update (PUT) a booking', async ({ request }) => {
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
        const { body: bodyCreate } = await logApiCall(request, 'post', '/booking', { data: bookingData });
        const { body: bodyAuth } = await logApiCall(request, 'post', '/auth', { data: { username: process.env.API_USERNAME, password: process.env.API_PASSWORD } });
        const { response: put, body: bodyPut } = await logApiCall(request, 'put', `/booking/${bodyCreate.bookingid}`, {
            headers: { Cookie: `token=${bodyAuth.token}` },
            data: putData,
        });
        expect(put.status()).toBe(200);
        expect(bodyPut.firstname).toEqual(putData.firstname);
        expect(bodyPut.lastname).toEqual(putData.lastname);
        expect(bodyPut.totalprice).toEqual(putData.totalprice);
        expect(bodyPut.depositpaid).toEqual(putData.depositpaid);
        expect(bodyPut.bookingdates).toEqual(putData.bookingdates);
        expect(bodyPut.additionalneeds).toEqual(putData.additionalneeds);
    });

    test('should partial update (PATCH) a booking', async ({ request }) => {
        const bookingData = {
            firstname: "Erika",
            lastname: "Mustermann",
            totalprice: 444,
            depositpaid: true,
            bookingdates: {
                checkin: "2026-01-01",
                checkout: "2026-01-02"
            },
            additionalneeds: "Dinner"
        };
        const { body: bodyCreate } = await logApiCall(request, 'post', '/booking', { data: bookingData });
        const { body: bodyAuth } = await logApiCall(request, 'post', '/auth', { data: { username: process.env.API_USERNAME, password: process.env.API_PASSWORD } });
        const { response: patch, body: bodyPatch } = await logApiCall(request, 'patch', `/booking/${bodyCreate.bookingid}`, {
            headers: { Cookie: `token=${bodyAuth.token}` },
            data: { firstname: 'Claudia' },
        });
        expect(patch.status()).toBe(200);
        expect(bodyPatch.firstname).toEqual('Claudia');
        expect(bodyPatch.lastname).toEqual(bookingData.lastname);
        expect(bodyPatch.totalprice).toEqual(bookingData.totalprice);
        expect(bodyPatch.depositpaid).toEqual(bookingData.depositpaid);
        expect(bodyPatch.bookingdates).toEqual(bookingData.bookingdates);
        expect(bodyPatch.additionalneeds).toEqual(bookingData.additionalneeds);
    });

    test('should delete (DELETE) a booking', async ({ request }) => {
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

        const { body: bodyCreate } = await logApiCall(request, 'post', '/booking', { data: bookingData });
        const { body: bodyAuth } = await logApiCall(request, 'post', '/auth', { data: { username: process.env.API_USERNAME, password: process.env.API_PASSWORD } });
        const { response: deleteBooking } = await logApiCall(request, 'delete', `/booking/${bodyCreate.bookingid}`, {
            headers: { Cookie: `token=${bodyAuth.token}` },
        });
        const { response: get } = await logApiCall(request, 'get', `/booking/${bodyCreate.bookingid}`);
        expect(deleteBooking.status()).toBe(201);
        expect(get.status()).toBe(404);
    });
})