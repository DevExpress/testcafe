const expect               = require('chai').expect;
const extractNodeArguments = require('../../lib/cli/node-arguments-filter');

const FLAGS = [
    'debug',
    '--debug',
    '--debug-brk',
    '--inspect',
    '--inspect-brk=1234',
    '--expose-gc',
    '--gc-global',
    '--es_staging',
    '--no-deprecation',
    '--prof',
    '--log-timer-events',
    '--throw-deprecation',
    '--trace-deprecation',
    '--use_strict',
    '--allow-natives-syntax',
    '--perf-basic-prof',
    '--experimental-repl-await'
];

const FLAG_PREFIXES = [
    '--harmony',
    '--trace',
    '--icu-data-dir',
    '--max-old-space-size=1234',
    '--preserve-symlinks'
];

describe('Node arguments filter', function () {
    it('Should extract v8args and other args', function () {
        const result = extractNodeArguments(['1', 'chrome', '--inspect-brk', 'test', 'argument']);

        expect(result.args).to.deep.equal(['1', 'chrome', 'test', 'argument']);
        expect(result.v8Flags).to.deep.equal(['--inspect-brk']);
    });

    it('v8args should be \'undefined\' if empty', function () {
        const result = extractNodeArguments(['1', 'chrome', 'test', 'argument']);

        expect(result.v8Flags).equal(void 0);
    });

    it('Should extract all described v8args', function () {
        const flags = FLAGS.concat(FLAG_PREFIXES);
        const result = extractNodeArguments(flags);

        expect(result.args).to.deep.equal([]);
        expect(result.v8Flags).to.deep.equal(flags);
    });
});

