import { crudFlow } from './helpers/crud-flow.js';

export const options = {
    stages: [
        { duration: '15s', target: 30 },
        { duration: '30s', target: 30 },
        { duration: '15s', target: 0 },
    ],
    userAgent: 'k6-performance-test/1.0',
};

export default function () {
    crudFlow();
}