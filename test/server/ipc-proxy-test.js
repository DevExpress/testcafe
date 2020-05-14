const { expect }   = require('chai');
const ServiceHost = require('./data/ipc-proxy/host');


describe('IPC Proxy', () => {
    let serviceHost = null;

    afterEach(() => {
        if (serviceHost)
            serviceHost.close();
    });

    it('Should call remote functions asynchronously', async () => {
        serviceHost = new ServiceHost(require.resolve('./data/ipc-proxy/async-service'));

        const result = await serviceHost.remoteMethod('yo');

        expect(result).deep.equal(['yo', 42, 'ok']);
    });

    it('Should call remote functions synchronously', async () => {
        serviceHost = new ServiceHost(require.resolve('./data/ipc-proxy/sync-service'));

        const result = await serviceHost.remoteMethod('yo');

        expect(result).deep.equal(['yo', 42, 'ok']);
    });

    it('Should preserve generic error information', async () => {
        serviceHost = new ServiceHost(require.resolve('./data/ipc-proxy/async-service'));

        try {
            await serviceHost.throwError('yo');

            throw new Error('Promise rejection expected');
        }
        catch (err) {
            expect(err.name).equal('MyError');
            expect(err.message).equal('yo');
            expect(err.stack).contain('Error: yo\n    at AsyncService.throwError');
        }
    });
});
