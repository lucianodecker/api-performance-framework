import Ajv from 'ajv';
import { bookingSchema } from '../../src/schemas/booking.schema';
import { test, expect } from '@playwright/test';

test.describe('API Response Schema', () => {
    test('GET /booking/:id response should match booking schema', async ({ request }) => {
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
        const post = await request.post('/booking', { data: bookingData });
        const bodyPost = await post.json();
        const get = await request.get(`/booking/${bodyPost.bookingid}`);
        const bodyGet = await get.json();
        const ajv = new Ajv();
        const validate = ajv.compile(bookingSchema);
        const valid = validate(bodyGet);
        
        if (!valid) console.log(validate.errors);
        expect(valid).toBe(true);
    });
})