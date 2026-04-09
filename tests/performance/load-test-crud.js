import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = 'https://restful-booker.herokuapp.com';

export const options = {
    stages: [
        { duration: '15s', target: 30 },
        { duration: '30s', target: 30 },
        { duration: '15s', target: 0 },
    ],
    userAgent: 'k6-performance-test/1.0',
};

export default function () {
    let token;
    let bookingId;

    group('Authenticate', function () {
        const res = http.post(`${BASE_URL}/auth`,
            JSON.stringify({ username: 'admin', password: 'password123' }),
            { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
        );

        const success = check(res, {
            'auth status is 200': (r) => r.status === 200,
        });

        if (success) {
            token = JSON.parse(res.body).token;
        }
    });

    sleep(1);

    group('Create Booking', function () {
        const res = http.post(`${BASE_URL}/booking`,
            JSON.stringify({
                firstname: 'John',
                lastname: 'Doe',
                totalprice: 100,
                depositpaid: true,
                bookingdates: {
                    checkin: '2026-01-01',
                    checkout: '2026-01-02'
                },
                additionalneeds: 'Breakfast'
            }),
            { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
        );

        const success = check(res, {
            'create booking status is 200': (r) => r.status === 200,
            'booking ID is present': (r) => r.status === 200 && JSON.parse(r.body).bookingid !== undefined,
        });

        if (success) {
            bookingId = JSON.parse(res.body).bookingid;
        }
    });

    sleep(1);

    // Skip remaining steps if create failed
    if (bookingId) {

        group('Get Booking', function () {
            const res = http.get(`${BASE_URL}/booking/${bookingId}`, {
                headers: { 'Accept': 'application/json' }
            });
            check(res, {
                'get booking status is 200': (r) => r.status === 200,
                'firstname exists': (r) => r.status === 200 && JSON.parse(r.body).firstname !== undefined,
            });
        });

        sleep(1);

        group('Update Booking', function () {
            const res = http.put(`${BASE_URL}/booking/${bookingId}`,
                JSON.stringify({
                    firstname: 'Jane',
                    lastname: 'Doe',
                    totalprice: 150,
                    depositpaid: true,
                    bookingdates: {
                        checkin: '2026-02-01',
                        checkout: '2026-02-02'
                    },
                    additionalneeds: 'Lunch'
                }),
                { headers: { 'Content-Type': 'application/json', 'Cookie': `token=${token}`, 'Accept': 'application/json' } }
            );
            check(res, {
                'update booking status is 200': (r) => r.status === 200,
            });
        });

        sleep(1);

        group('Delete Booking', function () {
            const res = http.del(`${BASE_URL}/booking/${bookingId}`,
                null,
                { headers: { 'Cookie': `token=${token}`, 'Accept': 'application/json' } }
            );
            check(res, {
                'delete booking status is 201': (r) => r.status === 201,
            });
        });

        sleep(1);
    }
}