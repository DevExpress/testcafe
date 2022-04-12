const PRODUCTION_TESTCAFE_DASHBOARD_URL = 'https://dashboard.testcafe.io';

export default function (): string {
    return process.env.TESTCAFE_DASHBOARD_URL ||
        PRODUCTION_TESTCAFE_DASHBOARD_URL;
}
