import { DashboardAuthenticationToken } from './interfaces';
import getDashboardUrl from './get-dashboard-url';

function decodeAuthenticationToken (token: string): DashboardAuthenticationToken | undefined {
    let tokenData;

    try {
        tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
    }
    catch (e) {} // eslint-disable-line no-empty

    if (tokenData && tokenData.projectId && tokenData.tokenSecret)
        return tokenData;

    return void 0;
}

export default function getDefaultProjectLink (token: string): string {
    const tokenData = decodeAuthenticationToken(token) as DashboardAuthenticationToken;

    return new URL(`/runs/${tokenData.projectId}`, getDashboardUrl()).toString();
}
