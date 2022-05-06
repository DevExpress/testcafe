/* eslint-disable no-console */

const { expect }            = require('chai');
const { noop }              = require('lodash');
const chalk                 = require('chalk');
const { prompts }           = require('prompts');
const sinon                 = require('sinon');
const proxyquire            = require('proxyquire');
const messages              = require('../../lib/dashboard/messages');
const https                 = require('https');
const express               = require('express');
const bodyParser            = require('body-parser');
const selfSignedSertificate = require('openssl-self-signed-certificate');
const DashboardConnector    = require('../../lib/dashboard/connector');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let routeForImitateDashboardError = null;
let routeForImitateNetworkError   = null;
let sentEmail                     = null;
let sentToken                     = null;
let savedOptions                  = null;

const TEST_SERVER_PORT = 4000;

const TEST_TOKEN = Buffer.from(
    JSON.stringify({
        projectId:   'test-project',
        tokenSecret: 'test-token-secret',
    })
).toString('base64');

const TEST_EMAIL = 'test@test.com';

function cleanUpFlagsAndRecordedData () {
    routeForImitateDashboardError = null;
    routeForImitateNetworkError   = null;
    sentEmail                     = null;
    sentToken                     = null;
    savedOptions                  = null;
}

function stubPrompts ({ textValues = [], confirmValues = [] } = {}) {
    sinon.stub(prompts, 'text').callsFake(() => {
        return Promise.resolve(textValues.shift());
    });

    sinon.stub(prompts, 'confirm').callsFake(() => {
        return Promise.resolve(confirmValues.shift());
    });
}

const createDashboardIntegrationMock = () => {
    const dashboardConnector = new DashboardConnector(`https://localhost:${TEST_SERVER_PORT}`);

    const configStorageMock = {
        options: {},
        load:    noop,

        save: () => {
            savedOptions = configStorageMock.options;
        },
        testInit: () => {
            configStorageMock.options = {
                token:      TEST_TOKEN,
                sendReport: true,
            };
        },
    };

    const dashboardIntegration = proxyquire('../../lib/dashboard', {
        './connector': function () {
            return dashboardConnector;
        },
        '../dashboard/config-storage': function () {
            return configStorageMock;
        },
    });

    dashboardIntegration._storageMock = configStorageMock;

    return dashboardIntegration;
};

const createTestHttpsServer = () => {
    const app = express();

    app.use(bodyParser.json());

    app.post(`${DashboardConnector.API_URLS.sendMagicLinkMail}`, (req, res) => {
        sentEmail = req.body.email;

        if (routeForImitateDashboardError === req.url) {
            res.status(500);
            res.end('Dashboard error on sending email');
        }
        else if (routeForImitateNetworkError === req.url)
            res.destroy();
        else
            res.end();
    });

    app.post(`${DashboardConnector.API_URLS.validateToken}`, (req, res) => {
        sentToken = req.body.token;

        if (routeForImitateDashboardError === req.url) {
            res.status(500);
            res.end('Dashboard error on validating token');
        }
        else if (routeForImitateNetworkError === req.url)
            res.destroy();
        else
            res.end();
    });

    const server = https.createServer(selfSignedSertificate, app);

    server.listen(TEST_SERVER_PORT);

    return server;
};

describe('Dashboard integration', () => {
    let testServer           = null;
    let dashboardIntegration = null;

    before(() => {
        testServer = createTestHttpsServer();
    });

    after(() => {
        testServer.close();
    });

    beforeEach(() => {
        sinon.spy(console, 'log');

        dashboardIntegration = createDashboardIntegrationMock();

        cleanUpFlagsAndRecordedData();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Registration', async () => {
        it('Cancel on entering email', async () => {
            stubPrompts();

            await dashboardIntegration();

            expect(console.log.callCount).eql(2);
            expect(console.log.firstCall.args[0]).eql(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
            expect(console.log.secondCall.args[0]).eql(messages.REGISTRATION_CANCELLED);
        });

        it('Dashboard error on sending email', async () => {
            routeForImitateDashboardError = DashboardConnector.API_URLS.sendMagicLinkMail;

            stubPrompts({ textValues: [TEST_EMAIL] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(2);
            expect(console.log.firstCall.args[0]).eql(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
            expect(console.log.secondCall.args[0]).eql(chalk.red('Dashboard error on sending email'));
            expect(sentEmail).eql(TEST_EMAIL);
        });

        it('Network error on sending email', async () => {
            routeForImitateNetworkError = DashboardConnector.API_URLS.sendMagicLinkMail;

            stubPrompts( { textValues: [TEST_EMAIL] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(2);
            expect(console.log.firstCall.args[0]).eql(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
            expect(console.log.secondCall.args[0]).eql(chalk.red(messages.REGISTRATION_EMAIL_SENDING_NETWORK_ERROR));
            expect(sentEmail).eql(TEST_EMAIL);
        });

        it('Cancel on entering token', async () => {
            stubPrompts({ textValues: [TEST_EMAIL] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(3);
            expect(console.log.firstCall.args[0]).eql(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
            expect(console.log.secondCall.args[0]).eql(messages.REGISTRATION_EMAIL_SENT);
            expect(console.log.thirdCall.args[0]).eql(messages.REGISTRATION_CANCELLED);
            expect(sentEmail).eql(TEST_EMAIL);
        });

        it('Invalid token', async () => {
            routeForImitateDashboardError = DashboardConnector.API_URLS.validateToken;

            stubPrompts({ textValues: [TEST_EMAIL, 'invalid token'] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(3);
            expect(console.log.firstCall.args[0]).eql(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
            expect(console.log.secondCall.args[0]).eql(messages.REGISTRATION_EMAIL_SENT);
            expect(console.log.thirdCall.args[0]).eql(chalk.red('Dashboard error on validating token'));
            expect(sentEmail).eql(TEST_EMAIL);
            expect(sentToken).eql('invalid token');
        });

        it('Network error on validating token', async () => {
            routeForImitateNetworkError = DashboardConnector.API_URLS.validateToken;

            stubPrompts({ textValues: [TEST_EMAIL, TEST_TOKEN] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(3);
            expect(console.log.firstCall.args[0]).eql(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
            expect(console.log.secondCall.args[0]).eql(messages.REGISTRATION_EMAIL_SENT);
            expect(console.log.thirdCall.args[0]).eql(chalk.red(messages.TOKEN_VALIDATION_NETWORK_ERROR));
            expect(sentEmail).eql(TEST_EMAIL);
            expect(sentToken).eql(TEST_TOKEN);
        });

        it('Full flow', async function () {
            stubPrompts({ textValues: [TEST_EMAIL, TEST_TOKEN] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(3);
            expect(console.log.firstCall.args[0]).eql(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
            expect(console.log.secondCall.args[0]).eql(messages.REGISTRATION_EMAIL_SENT);

            expect(console.log.thirdCall.args[0]).eql(
                chalk.green('You have successfully configured the TestCafe Dashboard reporter.\n' +
                    'The next time you launch TestCafe, the framework will share test run data with TestCafe Dashboard.\n' +
                    'View test results at https://dashboard.testcafe.io/runs/test-project.\n' +
                    'Run "testcafe dashboard off" to disable this behavior.\n' +
                    'Learn more at https://testcafe.io/dashboard-alpha.')
            );

            expect(sentEmail).eql(TEST_EMAIL);
            expect(sentToken).eql(TEST_TOKEN);
        });
    });

    describe('Update default token', () => {
        beforeEach(() => {
            dashboardIntegration._storageMock.testInit();
        });

        it('Cancel on update confirmation', async function () {
            stubPrompts();

            await dashboardIntegration();

            expect(console.log.callCount).eql(1);
            expect(console.log.firstCall.args[0]).eql(messages.TOKEN_UPDATE_CANCELLED);
        });

        it('Cancel on new token entering', async function () {
            stubPrompts({ confirmValues: [true] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(1);
            expect(console.log.firstCall.args[0]).eql(messages.TOKEN_UPDATE_CANCELLED);
        });

        it('Invalid token', async () => {
            routeForImitateDashboardError = DashboardConnector.API_URLS.validateToken;

            stubPrompts({ textValues: ['invalid token'], confirmValues: [true] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(1);
            expect(console.log.firstCall.args[0]).eql(chalk.red('Dashboard error on validating token'));
            expect(sentToken).eql('invalid token');
        });

        it('Full flow', async function () {
            stubPrompts({ textValues: [TEST_TOKEN], confirmValues: [true] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(1);
            expect(console.log.firstCall.args[0]).eql(chalk.green(messages.TOKEN_UPDATED));
        });

        it('Full flow (without report sending)', async function () {
            stubPrompts({ textValues: [TEST_TOKEN], confirmValues: [true] });
            dashboardIntegration._storageMock.options.sendReport = false;

            await dashboardIntegration();

            expect(console.log.callCount).eql(2);
            expect(console.log.firstCall.args[0]).eql(messages.TOKEN_UPDATING_NOT_SEND_REPORT);
            expect(console.log.secondCall.args[0]).eql(chalk.green(messages.TOKEN_UPDATED));
        });
    });

    describe('On/off', () => {
        it('On', async function () {
            await dashboardIntegration('on');

            expect(savedOptions.sendReport).eql(true);
            expect(console.log.callCount).eql(1);
            expect(console.log.firstCall.args[0]).eql(chalk.green(messages.SEND_REPORT_STATE_ON));

        });

        it('Off', async function () {
            await dashboardIntegration('off');

            expect(savedOptions.sendReport).eql(false);
            expect(console.log.callCount).eql(1);
            expect(console.log.firstCall.args[0]).eql(chalk.green(messages.SEND_REPORT_STATE_OFF));
        });
    });
});

