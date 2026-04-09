# API & Performance Test Framework

![GitHub Actions](https://github.com/lucianodecker/api-performance-framework/actions/workflows/api-tests.yml/badge.svg)

REST API test automation and performance testing framework built with **Playwright** and **k6**. Covers CRUD operations, authentication flows, schema validation, boundary analysis, security input testing, and load/stress/spike performance scenarios.

**System Under Test:** [Restful Booker](https://restful-booker.herokuapp.com) — a booking API simulating appointment and transaction management.

---

## ✨ Highlights

- **Full CRUD test coverage** with auth token management and lifecycle validation
- **JSON Schema Validation** using ajv for response structure integrity
- **Data-driven testing** with typed BookingFactory and 45+ boundary/edge case scenarios
- **Negative testing** for invalid IDs, missing auth, and malformed request bodies
- **Security input testing** with XSS, SQL injection, and OWASP A03:2021 classification
- **API request/response logger** with sensitive data masking (GDPR/HIPAA compliance)
- **k6 performance testing** with load, stress, and spike scenarios up to 150 VUs
- **SLA thresholds** — automated pass/fail on p(95) response time and error rate
- **CI/CD pipeline** with GitHub Actions running API and load tests on every push

---

## 🛠️ Tech Stack

![Playwright](https://img.shields.io/badge/-Playwright-%232EAD33?style=flat-square&logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-%233178C6?style=flat-square&logo=typescript&logoColor=white)
![k6](https://img.shields.io/badge/-k6-%237160E8?style=flat-square&logo=k6&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/-GitHub_Actions-%232088FF?style=flat-square&logo=github-actions&logoColor=white)
![ajv](https://img.shields.io/badge/-ajv-%23006CB4?style=flat-square&logoColor=white)
![dotenv](https://img.shields.io/badge/-dotenv-%23ECD53F?style=flat-square&logo=dotenv&logoColor=black)

---

## 📁 Project Structure

```
├── .github/workflows/
│   └── api-tests.yml               # CI/CD pipeline (Playwright + k6)
├── src/
│   ├── helpers/
│   │   ├── api-logger.ts            # Request/response logger with data masking
│   │   └── booking.factory.ts       # Typed test data factory
│   └── schemas/
│       └── booking.schema.ts        # JSON Schema for response validation
├── tests/
│   ├── api/
│   │   ├── auth.spec.ts             # Authentication token tests
│   │   ├── booking.spec.ts          # CRUD lifecycle tests
│   │   ├── data-driven.spec.ts      # Boundary, type coercion, security tests
│   │   ├── health.spec.ts           # API health check
│   │   ├── negative.spec.ts         # Error handling and edge cases
│   │   └── schema.spec.ts           # JSON Schema validation
│   └── performance/
│       ├── helpers/
│       │   └── crud-flow.js         # Shared CRUD flow for k6 tests
│       ├── load-test.js             # GET endpoint load test (30 VUs)
│       ├── load-test-crud.js        # Full CRUD load test (30 VUs)
│       ├── stress-test.js           # Ramp to 150 VUs over 5 stages
│       └── spike-test.js            # Instant 150 VUs spike
├── .env.example
└── playwright.config.ts
```

---

## 🏗️ Architecture Decisions

### Typed Test Data Factory

A `BookingFactory` with TypeScript's `Partial<T>` pattern generates test data with sensible defaults. Override only what matters per test case:

```typescript
export function createBookingData(overrides: Partial<BookingData> = {}): BookingData {
    return { firstname: "Default", lastname: "User", totalprice: 100, ...overrides };
}
```

This eliminates hardcoded test data across 45+ scenarios while maintaining type safety.

### API Request Logger with Sensitive Data Masking

Every API call is logged with timestamp, method, URL, request/response body, status code, and duration. Passwords and tokens are automatically masked in log output — critical for GDPR and HIPAA audit compliance.

```json
{
    "requestBody": { "username": "admin", "password": "***MASKED***" },
    "responseBody": { "token": "***MASKED***" }
}
```

### Data-Driven Test Categorization

Edge case results are categorized by API behavior rather than lumped into pass/fail:

| Category | Meaning | Example |
|---|---|---|
| Standard | Input returned unchanged | Unicode names, valid dates |
| Transformed | API modifies input silently | `99.99` → `99`, date format normalization |
| Accepted but questionable | Missing validation | Negative prices, checkout before checkin |
| Corrupted | 200 response with invalid data | Empty dates → `"0NaN-aN-aN"` |
| Server crash | 500 on invalid input | `null` values, `NaN` |
| Bug | Incorrect behavior | `"false"` → `true` (truthy coercion) |

### Shared k6 CRUD Flow

Performance tests share a single CRUD flow definition. Each test type (load, stress, spike) only defines its own stages and thresholds — no code duplication.

---

## 📋 Test Coverage

### API Tests (Playwright)

| Suite | Tests | Scope |
|---|---|---|
| Auth | 3 | Valid/invalid credentials, empty body |
| CRUD | 5 | Create, read, update, partial update, delete |
| Schema | 1 | JSON Schema validation with ajv |
| Health | 1 | API availability check |
| Negative | 6 | Invalid IDs, missing auth, malformed bodies |
| Data-Driven | 45+ | String boundaries, numeric limits, date edge cases, boolean coercion, security inputs |

### Performance Tests (k6)

| Test | VUs | Duration | Purpose |
|---|---|---|---|
| Load (GET) | 30 | 60s | Baseline read performance |
| Load (CRUD) | 30 | 60s | Full booking flow under normal load |
| Stress | 10→150 | 105s | Find capacity limits |
| Spike | 0→150 | 40s | Sudden traffic burst resilience |

### SLA Thresholds

| Metric | Threshold | Purpose |
|---|---|---|
| `http_req_duration p(95)` | < 500ms | 95% of requests must respond within 500ms |
| `http_req_failed` | < 10% | Less than 10% error rate allowed |

---

## 🔍 API Findings

Testing revealed several behaviors worth documenting:

**Design Flaws:**
- Auth endpoint returns 200 instead of 401 for invalid credentials
- POST /booking returns 500 instead of 400 for malformed request bodies
- Negative prices and extreme values accepted without validation

**Type Coercion Issues:**
- `totalprice: 99.99` silently truncated to `99` (critical for FinTech)
- `depositpaid: "false"` coerced to `true` via JavaScript truthy evaluation
- Date format `DD.MM.YYYY` parsed as `MM-DD-YYYY` (critical for EU healthcare systems)

**Data Corruption:**
- Empty date strings produce `"0NaN-aN-aN"` with status 200
- `null` values crash the server (500) instead of returning validation errors

**Security:**
- All XSS/SQL injection payloads stored without sanitization (OWASP A03:2021)

---

## 🚀 CI/CD Pipeline

The GitHub Actions pipeline runs on every push and pull request to `main`:

1. **Install** — deterministic `npm ci` from lockfile
2. **Playwright Tests** — full API test suite
3. **k6 Load Tests** — GET and CRUD load tests with SLA thresholds
4. **Artifacts** — Playwright HTML report + API logs (60-day retention)

> **Note:** Stress and spike tests run locally only — running 150 VUs against an external API in CI would be excessive and could trigger rate limiting.

---

## 🚦 Getting Started

### Prerequisites

- Node.js (LTS)
- npm
- [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) (for performance tests)

### Installation

```bash
git clone https://github.com/lucianodecker/api-performance-framework.git
cd api-performance-framework
npm ci
npx playwright install --with-deps
```

### Environment Setup

```bash
cp .env.example .env
```

Fill in the values in `.env`:

```
BASE_URL=https://restful-booker.herokuapp.com
API_USERNAME=<your_username>
API_PASSWORD=<your_password>
```

Credentials are available in the [Restful Booker API documentation](https://restful-booker.herokuapp.com/apidoc/index.html).

### Run Tests

```bash
# Run all API tests
npx playwright test

# Run specific test suite
npx playwright test tests/api/auth.spec.ts
npx playwright test tests/api/data-driven.spec.ts

# Run with HTML report
npx playwright test --reporter=html

# k6 load tests
k6 run tests/performance/load-test.js
k6 run tests/performance/load-test-crud.js

# k6 stress and spike tests (local only)
k6 run tests/performance/stress-test.js
k6 run tests/performance/spike-test.js
```
