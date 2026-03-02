import { test, expect } from '@playwright/test';

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
        const create = await request.post('/booking', { data: bookingData });
        const body = await create.json();
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
        const create = await request.post('/booking', { data: bookingData });
        const bodyCreate = await create.json();
        const get = await request.get(`/booking/${bodyCreate.bookingid}`);
        const bodyGet = await get.json();
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
        const create = await request.post('/booking', { data: bookingData });
        const bodyCreate = await create.json();
        const auth = await request.post('/auth', { data: { username: process.env.API_USERNAME, password: process.env.API_PASSWORD } });
        const bodyAuth = await auth.json();
        const put = await request.put(`/booking/${bodyCreate.bookingid}`, { 
            headers: { Cookie: `token=${bodyAuth.token}` },
            data: putData, 
        });
        const bodyPut = await put.json();
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
        const create = await request.post('/booking', { data: bookingData });
        const bodyCreate = await create.json();
        const auth = await request.post('/auth', { data: { username: process.env.API_USERNAME, password: process.env.API_PASSWORD } });
        const bodyAuth = await auth.json();
        const patch = await request.patch(`/booking/${bodyCreate.bookingid}`, { 
            headers: { Cookie: `token=${bodyAuth.token}` },
            data: {firstname: 'Claudia'}, 
        });
        const bodyPatch = await patch.json();
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

        const create = await request.post('/booking', { data: bookingData });
        const bodyCreate = await create.json();
        const auth = await request.post('/auth', { data: { username: process.env.API_USERNAME, password: process.env.API_PASSWORD } });
        const bodyAuth = await auth.json();
        const deleteBooking = await request.delete(`/booking/${bodyCreate.bookingid}`, { 
            headers: { Cookie: `token=${bodyAuth.token}` },
        });
        const get = await request.get(`/booking/${bodyCreate.bookingid}`);
        expect(deleteBooking.status()).toBe(201);
        expect(get.status()).toBe(404);
    });
})