const BrowserConnectionGateway = require('../../lib/browser/connection/gateway');
const { expect }               = require('chai');
const { proxyMock }            = require('./helpers/mocks');

describe('BrowserConnectionGateway', function () {
    it('Should not raise an error on multiple initialization (GH-7711)', function () {
        const gateway           = new BrowserConnectionGateway(proxyMock);
        let errorIsRaised       = false;
        let initializationCount = 0;

        gateway.on('initialized', () => {
            initializationCount++;
        });

        try {
            gateway.initialize();
            gateway.initialize();
            gateway.initialize();
        }
        catch (e) {
            errorIsRaised = true;
        }

        expect(errorIsRaised).to.be.false;
        expect(initializationCount).eql(1);
    });
});
