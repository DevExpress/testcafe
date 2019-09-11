const expect               = require('chai').expect;
const createCallsiteRecord = require('callsite-record');

const showDeprecationMessage = require('../../lib/notifications/deprecation-message');

function getCallsite () {
    function myFunc () {
        throw new Error('Yo!');
    }

    try {
        myFunc();
    }
    catch (err) {
        return createCallsiteRecord({ forError: err });
    }

    return null;
}

describe('showDeprecationMessage', () => {
    it('should not raise error if file does not exists', () => {
        const callsite = getCallsite();
        const info     = { what: 'OLD', useInstead: 'NEW' };
        let warningMsg = '';
        let err        = null;

        callsite.filename += '[JS code]\n';

        const initialWrite = process.stderr.write;

        process.stderr.write = chunk => {
            warningMsg += chunk.toString();
        };

        try {
            showDeprecationMessage(callsite, info);
        }
        catch (e) {
            err = e;
        }

        process.stderr.write = initialWrite;

        expect(err).eql(null);
        expect(warningMsg).contains('DEPRECATION-WARNING: OLD was deprecated and will be removed in future releases.');
        expect(warningMsg).contains('Use NEW instead.');
        expect(warningMsg).contains('See https://devexpress.github.io/testcafe/documentation for more info.');
    });
});
