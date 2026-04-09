import { crudFlow } from './helpers/crud-flow.js';

export const options = {
    stages: [
        { duration: '5s', target: 150 },
        { duration: '30s', target: 150 },
        { duration: '5s', target: 0 },
    ],
    userAgent: 'k6-performance-test/1.0',
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.1'],
    },
};

export default function () {
    crudFlow();
}