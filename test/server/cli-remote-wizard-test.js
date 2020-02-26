const EventEmitter           = require('events');
const { expect }             = require('chai');
const proxyquire             = require('proxyquire');
const sinon                  = require('sinon');
const { constructor: Chalk } = require('chalk');


describe('[CLI] Remote wizard', () => {
    it('Should log the connection url', async () => {
        const log = {
            write:       sinon.stub(),
            hideSpinner: sinon.stub(),
            showSpinner: sinon.stub()
        };

        const testCafe = {
            browserConnectionGateway: {
                connectUrl: 'http://example.com'
            },

            createBrowserConnection: () => {
                const connection = new EventEmitter();

                connection.userAgent = 'USER-AGENT';

                setTimeout(() => connection.emit('ready'), 200);

                return Promise.resolve(connection);
            }
        };

        const remoteWizard = proxyquire('../../lib/cli/remotes-wizard', {
            './log': log,
            'chalk': new Chalk({ level: 0 })
        });

        await remoteWizard(testCafe, 1, false);

        const output = log.write.args.map(call => call[0]).join('\n');

        expect(output).equal([
            'Connecting 1 remote browser(s)...',
            'Navigate to the following URL from each remote browser.',
            'Connect URL: http://example.com',
            'CONNECTED USER-AGENT'
        ].join('\n'));
    });
});
