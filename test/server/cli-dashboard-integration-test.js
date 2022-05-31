/* eslint-disable no-console */

const { expect }                  = require('chai');
const chalk                       = require('chalk');
const { prompts }                 = require('prompts');
const sinon                       = require('sinon');
const proxyquire                  = require('proxyquire');
const messages                    = require('../../lib/dashboard/messages');
const https                       = require('https');
const express                     = require('express');
const bodyParser                  = require('body-parser');
const selfSignedSertificate       = require('openssl-self-signed-certificate');
const DashboardConnector          = require('../../lib/dashboard/connector');
const DASHBOARD_DOCUMENTATION_URL = require('../../lib/dashboard/documentation-url');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let routeForImitateDashboardError = null;
let routeForImitateNetworkError   = null;
let sentEmail                     = null;
let sentToken                     = null;
let savedOptions                  = null;
let storageExists                 = true;

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
    storageExists                 = true;
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
        load:    () => storageExists,

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
            expect(console.log.firstCall.args[0]).contains(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
            expect(console.log.secondCall.args[0]).contains(messages.REGISTRATION_CANCELLED);
        });

        it('Dashboard error on sending email', async () => {
            routeForImitateDashboardError = DashboardConnector.API_URLS.sendMagicLinkMail;

            stubPrompts({ textValues: [TEST_EMAIL] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(2);
            expect(console.log.firstCall.args[0]).contains(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
            expect(console.log.secondCall.args[0]).contains('Dashboard error on sending email');
            expect(sentEmail).eql(TEST_EMAIL);
        });

        it('Network error on sending email', async () => {
            routeForImitateNetworkError = DashboardConnector.API_URLS.sendMagicLinkMail;

            stubPrompts( { textValues: [TEST_EMAIL] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(2);
            expect(console.log.firstCall.args[0]).contains(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
            expect(console.log.secondCall.args[0]).contains(messages.REGISTRATION_EMAIL_SENDING_NETWORK_ERROR);
            expect(sentEmail).eql(TEST_EMAIL);
        });

        it('Cancel on entering token', async () => {
            stubPrompts({ textValues: [TEST_EMAIL] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(3);
            expect(console.log.firstCall.args[0]).contains(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
            expect(console.log.secondCall.args[0]).contains(messages.REGISTRATION_EMAIL_SENT);
            expect(console.log.thirdCall.args[0]).contains(messages.REGISTRATION_CANCELLED);
            expect(sentEmail).eql(TEST_EMAIL);
        });

        it('Invalid token', async () => {
            routeForImitateDashboardError = DashboardConnector.API_URLS.validateToken;

            stubPrompts({ textValues: [TEST_EMAIL, 'invalid token'] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(3);
            expect(console.log.firstCall.args[0]).contains(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
            expect(console.log.secondCall.args[0]).contains(messages.REGISTRATION_EMAIL_SENT);
            expect(console.log.thirdCall.args[0]).contains('Dashboard error on validating token');
            expect(sentEmail).eql(TEST_EMAIL);
            expect(sentToken).eql('invalid token');
        });

        it('Network error on validating token', async () => {
            routeForImitateNetworkError = DashboardConnector.API_URLS.validateToken;

            stubPrompts({ textValues: [TEST_EMAIL, TEST_TOKEN] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(3);
            expect(console.log.firstCall.args[0]).contains(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
            expect(console.log.secondCall.args[0]).contains(messages.REGISTRATION_EMAIL_SENT);
            expect(console.log.thirdCall.args[0]).contains(messages.TOKEN_VALIDATION_NETWORK_ERROR);
            expect(sentEmail).eql(TEST_EMAIL);
            expect(sentToken).eql(TEST_TOKEN);
        });

        it('Full flow', async function () {
            stubPrompts({ textValues: [TEST_EMAIL, TEST_TOKEN] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(5);
            expect(console.log.firstCall.args[0]).contains(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
            expect(console.log.secondCall.args[0]).contains(messages.REGISTRATION_EMAIL_SENT);
            expect(console.log.thirdCall.args[0]).contains(messages.REGISTRATION_FINISHED.split('\n')[0]);
            expect(console.log.getCall(3).args[0]).contains('View test results at:\n');
            expect(console.log.getCall(3).args[0]).contains(`${chalk.underline.blueBright('https://dashboard.testcafe.io/runs/test-project')}`);
            expect(console.log.getCall(4).args[0]).contains(`Run ${chalk.black.bgWhiteBright('testcafe dashboard off')} to disable this behavior.`);
            expect(console.log.getCall(4).args[0]).contains(`Learn more at:\n${chalk.underline.blueBright(DASHBOARD_DOCUMENTATION_URL)}`);
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

            expect(console.log.callCount).eql(2);
            expect(console.log.firstCall.args[0]).eql('\n');
            expect(console.log.secondCall.args[0]).contains(messages.TOKEN_UPDATE_CANCELLED);
        });

        it('Cancel on new token entering', async function () {
            stubPrompts({ confirmValues: [true] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(3);
            expect(console.log.firstCall.args[0]).eql('\n');
            expect(console.log.secondCall.args[0]).eql('\n');
            expect(console.log.thirdCall.args[0]).contains(messages.TOKEN_UPDATE_CANCELLED);
        });

        it('Invalid token', async () => {
            routeForImitateDashboardError = DashboardConnector.API_URLS.validateToken;

            stubPrompts({ textValues: ['invalid token'], confirmValues: [true] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(3);
            expect(console.log.firstCall.args[0]).eql('\n');
            expect(console.log.secondCall.args[0]).eql('\n');
            expect(console.log.thirdCall.args[0]).contains('Dashboard error on validating token');
            expect(sentToken).eql('invalid token');
        });

        it('Full flow', async function () {
            stubPrompts({ textValues: [TEST_TOKEN], confirmValues: [true] });

            await dashboardIntegration();

            expect(console.log.callCount).eql(3);
            expect(console.log.firstCall.args[0]).eql('\n');
            expect(console.log.secondCall.args[0]).eql('\n');
            expect(console.log.thirdCall.args[0]).contains(messages.TOKEN_UPDATED);
        });

        it('Full flow (without report sending)', async function () {
            stubPrompts({ textValues: [TEST_TOKEN], confirmValues: [true] });
            dashboardIntegration._storageMock.options.sendReport = false;

            await dashboardIntegration();

            expect(console.log.callCount).eql(4);
            expect(console.log.firstCall.args[0]).contains(messages.TOKEN_UPDATING_NOT_SEND_REPORT);
            expect(console.log.secondCall.args[0]).eql('\n');
            expect(console.log.thirdCall.args[0]).eql('\n');
            expect(console.log.getCall(3).args[0]).contains(messages.TOKEN_UPDATED);
        });
    });

    describe('On/off', () => {
        describe('Token exists', () => {
            it('On', async () => {
                await dashboardIntegration('on');

                expect(savedOptions.sendReport).eql(true);
                expect(console.log.callCount).eql(1);
                expect(console.log.firstCall.args[0]).contains(messages.SEND_REPORT_STATE_ON);
            });

            it('Off', async () => {
                await dashboardIntegration('off');

                expect(savedOptions.sendReport).eql(false);
                expect(console.log.callCount).eql(1);
                expect(console.log.firstCall.args[0]).contains(messages.SEND_REPORT_STATE_OFF);
            });
        });

        describe('Token not exists', () => {
            beforeEach(() => {
                storageExists = false;
            });

            it('Cancel on launch the configuration wizard', async () => {
                stubPrompts();

                await dashboardIntegration('on');

                expect(console.log.callCount).eql(2);
                expect(console.log.firstCall.args[0]).contains(messages.TOKEN_NO_DEFAULT_FOUND);
                expect(console.log.secondCall.args[0]).contains(messages.REGISTRATION_CANCELLED);
            });

            it('Full flow', async () => {
                stubPrompts({ textValues: [TEST_EMAIL, TEST_TOKEN], confirmValues: [true, true] });

                await dashboardIntegration('on');

                expect(console.log.callCount).eql(6);
                expect(console.log.firstCall.args[0]).contains(messages.TOKEN_NO_DEFAULT_FOUND);
                expect(console.log.secondCall.args[0]).contains(messages.REGISTRATION_ENTER_EMAIL_INVITATION);
                expect(console.log.thirdCall.args[0]).contains(messages.REGISTRATION_EMAIL_SENT);
                expect(console.log.getCall(3).args[0]).contains(messages.REGISTRATION_FINISHED.split('\n')[0]);
                expect(console.log.getCall(4).args[0]).contains('View test results at:\n');
                expect(console.log.getCall(4).args[0]).contains(`${chalk.underline.blueBright('https://dashboard.testcafe.io/runs/test-project')}`);
                expect(console.log.getCall(5).args[0]).contains(`Run ${chalk.black.bgWhiteBright('testcafe dashboard off')} to disable this behavior.`);
                expect(console.log.getCall(5).args[0]).contains(`Learn more at:\n${chalk.underline.blueBright(DASHBOARD_DOCUMENTATION_URL)}`);
            });
        });
    });
});

