import getTestcafeVersion from '../utils/get-testcafe-version';
import getDashboardUrl from './get-dashboard-url';
import https from 'https';
import debug from 'debug';

const DEBUG_LOGGER = debug('testcafe:dashboard:connector');

export default class DashboardConnector {
    private readonly baseUrl: string;

    public static API_URLS = {
        sendMagicLinkMail: '/api/sendMagicLinkMail',
        validateToken:     '/api/validateAuthToken',
    };

    public constructor (baseUrl = getDashboardUrl()) {
        this.baseUrl = baseUrl;
    }

    private async _sendPostJsonRequest (relativeUrl: string, body: object): Promise<any> {
        const url      = new URL(relativeUrl, this.baseUrl);
        const postData = JSON.stringify(body);

        const options = {
            method:  'POST',
            headers: {
                'Content-Type':   'application/json',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        return new Promise((resolve, reject) => {
            const req = https.request(url, options, res => {
                res.setEncoding('utf8');

                let responseBody = '';

                res.on('data', chunk => {
                    responseBody += chunk.toString();
                });
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers:    res.headers,
                        body:       responseBody,
                    });
                });
            });

            req.on('error', reject);

            req.write(postData);
            req.end();
        });
    }

    private async _postRequest (relativeUrl: string, body: any): Promise<any> {
        try {
            const response = await this._sendPostJsonRequest(relativeUrl, body);

            if (response.statusCode >= 200 && response.statusCode <= 299)
                return { success: true };

            return {
                success:          false,
                errorMessage:     response.body,
                isDashboardError: true,
            };
        }
        catch (err: any) {
            DEBUG_LOGGER(err);

            return {
                success:          false,
                errorMessage:     err.message,
                isDashboardError: false,
            };
        }
    }

    public async sendEmail (email: string): Promise<any> {
        return this._postRequest(DashboardConnector.API_URLS.sendMagicLinkMail, {
            email,
            thirdPartyRegistration: true,
        });
    }

    public async validateToken (token: string): Promise<any> {
        return this._postRequest(DashboardConnector.API_URLS.validateToken, {
            token,
            testcafeVersion: getTestcafeVersion(),
        });
    }
}
