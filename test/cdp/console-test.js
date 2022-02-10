const { expect } = require('chai');
const clientsManager   = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/clients-manager');
const ConsoleCollector = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/console-collector');
const utils = require('./utils');


describe('console collector', () => {
    before(utils.before);
    after(utils.after);

    it('different types', async () => {
        const messageCollector = new ConsoleCollector(['log', 'warning', 'error', 'info']);
        const RuntimeApi = clientsManager.getClient().Runtime;

        messageCollector.initialize(RuntimeApi);

        expect(JSON.stringify(messageCollector.read())).eql('{"log":[],"warning":[],"error":[],"info":[]}');

        await RuntimeApi.evaluate({ expression: 'console.log(true);' });
        await RuntimeApi.evaluate({ expression: 'console.warn(null);' });
        await RuntimeApi.evaluate({ expression: 'console.error(42);' });
        await RuntimeApi.evaluate({ expression: 'console.info("just string");' });
        await RuntimeApi.evaluate({ expression: 'console.log([]);' });
        await RuntimeApi.evaluate({ expression: 'console.warn({});' });
        await RuntimeApi.evaluate({ expression: 'console.error(void 0);' });
        await RuntimeApi.evaluate({ expression: `console.info({
            toString: function () {
                return Object.create(null);
            }
        });` });

        const messages = messageCollector.read();

        expect(messages.log.length).eql(2);
        expect(messages.log[0]).eql('true');
        expect(messages.log[1]).eql('Array(0)');

        expect(messages.warning.length).eql(2);
        expect(messages.warning[0]).eql('null');
        expect(messages.warning[1]).eql('Object');

        expect(messages.error.length).eql(2);
        expect(messages.error[0]).eql('42');
        expect(messages.error[1]).eql('undefined');

        expect(messages.info.length).eql(2);
        expect(messages.info[0]).eql('just string');
        expect(messages.info[1]).eql('Object');

        expect(JSON.stringify(messageCollector.read())).eql('{"log":[],"warning":[],"error":[],"info":[]}');
    });
});
