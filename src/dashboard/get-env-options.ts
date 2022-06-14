import { DasboardOptions } from './interfaces';

function parseBooleanVariable (value?: string): boolean {
    return value === 'false' || value === '0' ? false : !!value;
}

function parseNumber (value?: string): number | undefined {
    const parsed = value === void 0 ? Number.NaN : Number.parseInt(value, 10);

    if (Number.isNaN(parsed))
        return void 0;

    return parsed;
}

export default function getEnvOptions (): DasboardOptions {
    return {
        url:                process.env.TESTCAFE_DASHBOARD_URL,
        token:              process.env.TESTCAFE_DASHBOARD_TOKEN,
        buildId:            process.env.TESTCAFE_DASHBOARD_BUILD_ID,
        isLogEnabled:       parseBooleanVariable(process.env.TESTCAFE_DASHBOARD_ENABLE_LOG),
        noScreenshotUpload: parseBooleanVariable(process.env.TESTCAFE_DASHBOARD_NO_SCREENSHOT_UPLOAD),
        noVideoUpload:      parseBooleanVariable(process.env.TESTCAFE_DASHBOARD_NO_VIDEO_UPLOAD),
        responseTimeout:    parseNumber(process.env.TESTCAFE_DASHBOARD_RESPONSE_TIMEOUT),
        requestRetryCount:  parseNumber(process.env.TESTCAFE_DASHBOARD_REQUEST_RETRY_COUNT),
    };
}
