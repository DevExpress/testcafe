const { expect } = require('chai');

const {
    extractNodeProcessArguments,
    V8_FLAGS, V8_FLAG_PREFIXES,
} = require('../../lib/cli/node-arguments-filter');

describe('Node arguments filter', function () {
    it('Should extract v8args and other args', function () {
        const result = extractNodeProcessArguments(['1', 'chrome', '--inspect-brk', 'test', 'argument']);

        expect(result.args).to.deep.equal(['1', 'chrome', 'test', 'argument']);
        expect(result.v8Flags).to.deep.equal(['--inspect-brk']);
    });

    it('v8args should be \'undefined\' if empty', function () {
        const result = extractNodeProcessArguments(['1', 'chrome', 'test', 'argument']);

        expect(result.v8Flags).equal(void 0);
    });

    it('Should extract all described v8args', function () {
        const flags = V8_FLAGS.concat(V8_FLAG_PREFIXES);
        const result = extractNodeProcessArguments(flags);

        expect(result.args).to.deep.equal([]);
        expect(result.v8Flags).to.deep.equal(flags);
    });
});
