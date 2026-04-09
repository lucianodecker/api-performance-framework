import fs from 'fs';
import path from 'path';

const LOG_DIR = 'test-results/api-logs';
const LOG_FILE = path.join(LOG_DIR, `api-log-${new Date().toLocaleString('de-DE', { 
    timeZone: 'Europe/Berlin',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
}).replace(/[:.\/\s,]/g, '-')}.json`);

let initialized = false;

function maskSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    const masked = { ...data };
    const sensitiveKeys = ['password', 'token', 'authorization'];
    for (const key of Object.keys(masked)) {
        if (sensitiveKeys.includes(key.toLowerCase())) {
            masked[key] = '***MASKED***';
        }
    }
    return masked;
}

function getLocalTimestamp(): string {
    return new Date().toLocaleString('de-DE', { 
        timeZone: 'Europe/Berlin',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}

function appendToLog(entry: any): void {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    let entries: any[] = [];
    if (fs.existsSync(LOG_FILE)) {
        entries = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
    }
    entries.push(entry);
    fs.writeFileSync(LOG_FILE, JSON.stringify(entries, null, 2));
}

export async function logApiCall(request: any, method: string, url: string, options?: any): Promise<any> {
    const timestamp = getLocalTimestamp();
    const startTime = Date.now();

    const response = await request[method.toLowerCase()](url, options);
    const duration = Date.now() - startTime;

    let responseBody;
    try {
        responseBody = await response.json();
    } catch {
        responseBody = null;
    }

    appendToLog({
        timestamp,
        method: method.toUpperCase(),
        url,
        requestBody: maskSensitiveData(options?.data) || null,
        status: response.status(),
        responseBody: maskSensitiveData(responseBody),
        duration: `${duration}ms`,
    });

    return { response, body: responseBody };
}