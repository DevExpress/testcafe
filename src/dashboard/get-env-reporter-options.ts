import { DasboardReporterOptions } from './interfaces';

function parseBooleanVariable (value: string | undefined): boolean {
    return value === 'false' || value === '0' ? false : !!value;
}

function parseNumber (value: string | undefined): number | null {
    const parsed = value === void 0 ? Number.NaN : Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) return null;

    return parsed;
}

export default function getEnvReporterOptions (): DasboardReporterOptions {
    return {
        url:                process.env.TESTCAFE_DASHBOARD_URL || 'https://dashboard.testcafe.io',
        token:              process.env.TESTCAFE_DASHBOARD_TOKEN,
        buildId:            process.env.TESTCAFE_DASHBOARD_BUILD_ID,
        isLogEnabled:       parseBooleanVariable(process.env.TESTCAFE_DASHBOARD_ENABLE_LOG),
        noScreenshotUpload: parseBooleanVariable(process.env.TESTCAFE_DASHBOARD_NO_SCREENSHOT_UPLOAD),
        noVideoUpload:      parseBooleanVariable(process.env.TESTCAFE_DASHBOARD_NO_VIDEO_UPLOAD),
        responseTimeout:    parseNumber(process.env.TESTCAFE_DASHBOARD_RESPONSE_TIMEOUT) || 30 * 1000,
        requestRetryCount:  parseNumber(process.env.TESTCAFE_DASHBOARD_REQUEST_RETRY_COUNT) || 20,
    };
}
