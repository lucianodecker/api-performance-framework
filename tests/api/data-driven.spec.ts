import { test, expect } from '@playwright/test';
import { createBookingData } from '../../src/helpers/booking.factory';

test.describe('Data Driven Tests', () => {
    test.describe('String Boundaries', () => {
        const standardStringCases = [
            { name: "standard booking", data: createBookingData() },
            { name: 'special characters', data: createBookingData({ firstname: "José-Maria", lastname: "O'Brian"}) },
            { name: "empty firstname", data: createBookingData({ firstname: "" }) },
            { name: "single char", data: createBookingData({ firstname: "A" }) },
            { name: "very long name", data: createBookingData({ firstname: "A".repeat(1000) }) },
            { name: "name with spaces", data: createBookingData({ firstname: "Anna Maria" }) },
            { name: "hyphenated name", data: createBookingData({ firstname: "Hans-Peter" }) },
            { name: "name with apostrophe", data: createBookingData({ firstname: "O'Connor" }) },
            { name: "german umlauts", data: createBookingData({ firstname: "Müller", lastname: "Größe" }) },
            { name: "accented characters", data: createBookingData({ firstname: "José-María", lastname: "García" }) },
            { name: "unicode CJK", data: createBookingData({ firstname: "田中", lastname: "太郎" }) },
            { name: "arabic script", data: createBookingData({ firstname: "محمد", lastname: "علي" }) },
            { name: "numeric name", data: createBookingData({ firstname: "12345" }) },
        ];

        const sanitizedStringCases = [
            { name: "whitespace only", data: createBookingData({ firstname: "   " }), expected: { firstname: "" } },
            { name: "leading/trailing spaces", data: createBookingData({ firstname: "  Erika  " }), expected: { firstname: "Erika" } },
        ];

        for (const testCase of standardStringCases) {
            test(`should create booking with ${testCase.name}`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                const body = await create.json();
                expect(create.status()).toBe(200);
                expect(body.booking.firstname).toBe(testCase.data.firstname);
                expect(body.booking.lastname).toBe(testCase.data.lastname);
            });
        }

        for (const testCase of sanitizedStringCases) {
            test(`should sanitize ${testCase.name}`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                const body = await create.json();
                expect(create.status()).toBe(200);
                expect(body.booking.firstname).toBe(testCase.expected.firstname);
            });
        }
    });

    test.describe('Numeric Boundaries', () => {
        const standardNumericCases = [
            { name: "zero price", data: createBookingData({ totalprice: 0 }) },
        ];

        const transformedNumericCases = [
            { name: "decimal price (dot)", data: createBookingData({ totalprice: 99.99 }), expected: { totalprice: 99 } },
            { name: "decimal price (comma as string)", data: createBookingData({ totalprice: "99,99" as any }), expected: { totalprice: 99 } },
            { name: "string as price", data: createBookingData({ totalprice: "expensive" as any }), expected: { totalprice: null } },
        ];

        // API accepts values that should be rejected in a production system
        const acceptedNumericButQuestionable = [
            { name: "negative price", data: createBookingData({ totalprice: -50 }) },
            { name: "extreme price", data: createBookingData({ totalprice: Number.MAX_SAFE_INTEGER }) },
        ];
        
        // API crashes instead of returning 400 for invalid input
        const errorNumericServerCrashCases  = [
            { name: "NaN price", data: createBookingData({ totalprice: NaN as any }) },
            { name: "null price", data: createBookingData({ totalprice: null as any }) },
        ];

        for (const testCase of standardNumericCases) {
            test(`should create booking with ${testCase.name}`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                const body = await create.json();
                expect(create.status()).toBe(200);
                expect(body.booking.totalprice).toBe(testCase.data.totalprice);
            }); 
        }

        for (const testCase of transformedNumericCases) {
            test(`should transform ${testCase.name}`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                const body = await create.json();
                expect(create.status()).toBe(200);
                expect(body.booking.totalprice).toBe(testCase.expected.totalprice);
            }); 
        }

        for (const testCase of acceptedNumericButQuestionable) {
            test(`should accept ${testCase.name} (missing validation)`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                const body = await create.json();
                expect(create.status()).toBe(200);
                expect(body.booking.totalprice).toBe(testCase.data.totalprice);
            }); 
        }

        for (const testCase of errorNumericServerCrashCases) {
            test(`should crash on ${testCase.name}`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                expect(create.status()).toBe(500);
            }); 
        }
    });

    test.describe('Date Edge Cases', () => {
        const standardDateCases = [
            { name: "leap year", data: createBookingData({ bookingdates: { checkin: "2028-02-29", checkout: "2028-03-01" } }) },
            { name: "year boundary", data: createBookingData({ bookingdates: { checkin: "2026-12-31", checkout: "2027-01-01" } }) },   
        ];

        const transformedDateCases = [
            { name: "invalid leap year", data: createBookingData({ bookingdates: { checkin: "2027-02-29", checkout: "2027-03-01" } }), expected: { bookingdates: { checkin: "2027-03-01", checkout: "2027-03-01" } } },
            { name: "invalid date format", data: createBookingData({ bookingdates: { checkin: "01-01-2026", checkout: "02-01-2026" } }), expected: { bookingdates: { checkin: "2026-01-01", checkout: "2026-02-01" } } },
            { name: "german date format", data: createBookingData({ bookingdates: { checkin: "01.01.2026", checkout: "02.01.2026" } }), expected: { bookingdates: { checkin: "2026-01-01", checkout: "2026-02-01" } } },
        ];

        const acceptedDateButQuestionable = [
            { name: "same checkin checkout", data: createBookingData({ bookingdates: { checkin: "2026-01-01", checkout: "2026-01-01" } }) },
            { name: "checkout before checkin", data: createBookingData({ bookingdates: { checkin: "2026-12-01", checkout: "2026-01-01" } }) },
            { name: "past dates", data: createBookingData({ bookingdates: { checkin: "2020-01-01", checkout: "2020-01-02" } }) },
            { name: "far future", data: createBookingData({ bookingdates: { checkin: "2099-01-01", checkout: "2099-12-31" } }) },
        ];

        const corruptedDateCases = [
            { name: "empty dates", data: createBookingData({ bookingdates: { checkin: "", checkout: "" } }), expected: { bookingdates: { checkin: "0NaN-aN-aN", checkout: "0NaN-aN-aN" } } },
        ];

        const errorDateServerCrashCases = [
            { name: "null dates", data: createBookingData({ bookingdates: { checkin: null as any, checkout: null as any } }) },
        ];

        for (const testCase of standardDateCases) {
        test(`should create booking with ${testCase.name}`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                const body = await create.json();
                expect(create.status()).toBe(200);
                expect(body.booking.bookingdates.checkin).toEqual(testCase.data.bookingdates.checkin);
                expect(body.booking.bookingdates.checkout).toEqual(testCase.data.bookingdates.checkout);
            }); 
        };

        // API parses DD-MM-YYYY and DD.MM.YYYY as MM-DD-YYYY (US format) - critical in EU systems
        for (const testCase of transformedDateCases) {
            test(`should transform ${testCase.name}`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                const body = await create.json();
                expect(create.status()).toBe(200);
                expect(body.booking.bookingdates).toEqual(testCase.expected.bookingdates);
            }); 
        }

        for (const testCase of acceptedDateButQuestionable) {
            test(`should accept ${testCase.name} (missing validation)`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                const body = await create.json();
                expect(create.status()).toBe(200);
                expect(body.booking.bookingdates).toEqual(testCase.data.bookingdates);
            }); 
        }

        // API returns 200 with corrupted data instead of rejecting invalid input
        for (const testCase of corruptedDateCases) {
            test(`should return corrupted data for ${testCase.name}`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                const body = await create.json();
                expect(create.status()).toBe(200);
                expect(body.booking.bookingdates.checkin).toEqual(testCase.expected.bookingdates.checkin);
                expect(body.booking.bookingdates.checkout).toEqual(testCase.expected.bookingdates.checkout);
            }); 
        }

        for (const testCase of errorDateServerCrashCases) {
            test(`should crash on ${testCase.name}`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                expect(create.status()).toBe(500);
            }); 
        }
    });

    test.describe('Boolean Edge Cases', () => {
            const transformedBooleanCases = [
            { name: "deposit string true", data: createBookingData({ depositpaid: "true" as any }), expected: { depositpaid: true } },
            { name: "deposit string yes", data: createBookingData({ depositpaid: "yes" as any }), expected: { depositpaid: true } },
            { name: "deposit number 1", data: createBookingData({ depositpaid: 1 as any }), expected: { depositpaid: true } },
            { name: "deposit number 0", data: createBookingData({ depositpaid: 0 as any }), expected: { depositpaid: false } },
            { name: "deposit empty string", data: createBookingData({ depositpaid: "" as any }), expected: { depositpaid: false } },
        ];

        const bugBooleanCases = [
            { name: "deposit string false", data: createBookingData({ depositpaid: "false" as any }), expected: { depositpaid: true } },
            { name: "deposit string no", data: createBookingData({ depositpaid: "no" as any }), expected: { depositpaid: true } },
        ];

        const errorBooleanServerCrashCases = [
            { name: "deposit null", data: createBookingData({ depositpaid: null as any }) },
            { name: "deposit undefined", data: createBookingData({ depositpaid: undefined as any }) },
        ];

        for (const testCase of transformedBooleanCases) {
        test(`should create booking with ${testCase.name}`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                const body = await create.json();
                expect(create.status()).toBe(200);
                expect(body.booking.depositpaid).toBe(testCase.expected.depositpaid);
            });
        };

        // BUG: API coerces any non-empty string to true via JavaScript truthy evaluation
        for (const testCase of bugBooleanCases) {
        test(`should expose boolean coercion bug with ${testCase.name}`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                const body = await create.json();
                expect(create.status()).toBe(200);
                expect(body.booking.depositpaid).toBe(testCase.expected.depositpaid);
            });
        };

        // API crashes instead of returning 400 for invalid input
        for (const testCase of errorBooleanServerCrashCases) {
        test(`should crash on ${testCase.name}`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                expect(create.status()).toBe(500);
            });
        };
    });

    test.describe('Security Inputs', () => {
        // SECURITY FINDING: API stores all payloads without sanitization or escaping
        // Risk: Stored XSS if data is rendered in any UI (e.g. admin dashboard)
        // Expected behavior: API should reject or sanitize HTML/script content
        // Severity: High (OWASP A03:2021 - Injection)

        const securityCases = [
            // Additional XSS vectors
            { name: "XSS event handler", data: createBookingData({ firstname: '" onmouseover="alert(1)"' }) },
            { name: "XSS SVG", data: createBookingData({ firstname: '<svg onload=alert(1)>' }) },
            { name: "XSS encoded", data: createBookingData({ firstname: '&lt;script&gt;alert(1)&lt;/script&gt;' }) },
            { name: "XSS script tag", data: createBookingData({ firstname: "<script>alert('xss')</script>" }) },
            { name: "XSS img tag", data: createBookingData({ firstname: '<img src=x onerror=alert(1)>' }) },

            // Additional SQL injection vectors
            { name: "SQL tautology", data: createBookingData({ firstname: "' OR '1'='1" }) },
            { name: "SQL comment", data: createBookingData({ firstname: "admin'--" }) },
            { name: "SQL injection", data: createBookingData({ firstname: "'; DROP TABLE bookings; --" }) },
            { name: "SQL union", data: createBookingData({ firstname: "' UNION SELECT * FROM users --" }) },

            // NoSQL injection (relevant for MongoDB-based APIs)
            { name: "NoSQL injection", data: createBookingData({ firstname: '{"$gt": ""}' }) },

            // Header/Log injection
            { name: "CRLF injection", data: createBookingData({ firstname: "test\r\nX-Injected: header" }) },
            { name: "log injection", data: createBookingData({ firstname: "test\n[ERROR] Fake log entry" }) },

            // Template injection
            { name: "template injection", data: createBookingData({ firstname: "{{7*7}}" }) },
            { name: "SSTI", data: createBookingData({ firstname: "${7*7}" }) },

            // Other injection types
            { name: "path traversal", data: createBookingData({ firstname: "../../etc/passwd" }) },
            { name: "null byte", data: createBookingData({ firstname: "test\0injection" }) },
        ];

        for (const testCase of securityCases) {
            test(`should store unsanitized input for ${testCase.name}`, async ({ request }) => {
                const create = await request.post('/booking', { data: testCase.data });
                const body = await create.json();
                expect(create.status()).toBe(200);
                expect(body.booking.firstname).toBe(testCase.data.firstname);
            });
        };
    });
})