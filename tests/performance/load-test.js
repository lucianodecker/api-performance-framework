import http, { head } from 'k6/http';
import { check } from 'k6';

export const options = {
    stages: [
        { duration: '15s', target: 30 },   // Ramp up to 30 users
        { duration: '30s', target: 30 },   // Stay at 30 users
        { duration: '15s', target: 0 },    // Ramp down to 0 users
    ],
    userAgent: 'k6-performance-test/1.0',
};

export default function () {
    const res = http.get('https://restful-booker.herokuapp.com/booking', { headers: { 'Accept': 'application/json' } });
    check(res, {
        'status is 200': (r) => r.status === 200,
    });
}