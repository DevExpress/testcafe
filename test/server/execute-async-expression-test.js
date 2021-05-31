const proxyquire = require('proxyquire');
const { noop }   = require('lodash');
const nanoid     = require('nanoid');
const expect     = require('chai').expect;

const SessionControllerStub = { getSession: () => {
    return { id: nanoid(7) };
} };

const TestRun        = proxyquire('../../lib/test-run/index', { './session-controller': SessionControllerStub });
const TestController = require('../../lib/api/test-controller');
const COMMAND_TYPE   = require('../../lib/test-run/commands/type');
const markerSymbol   = require('../../lib/test-run/marker-symbol');

const assertTestRunError         = require('./helpers/assert-test-run-error');
const { createSimpleTestStream } = require('../functional/utils/stream');

let callsite = 0;

class TestRunMock extends TestRun {
    _addInjectables () {}

    _initRequestHooks () {}

    get id () {
        return 'test-run-id';
    }

    constructor () {
        super({
            test:               { name: 'Test', testFile: { filename: __filename } },
            browserConnection:  {},
            screenshotCapturer: {},
            globalWarningLog:   {},
            opts:               {}
        });

        this.debugLog        = { command: noop };
        this.controller      = new TestController(this);
        this.driverTaskQueue = [];
        this.emit            = noop;
        this.stubStream      = createSimpleTestStream();

        const stubModule = require('log-update-async-hook').create(this.stubStream);

        this.debugLogger = proxyquire('../../lib/notifications/debug-logger', { 'log-update-async-hook': stubModule } );

        this.debugLogger._overrideStream(this.stubStream);
        this.debugLogger.streamsOverridden = true;

        this[markerSymbol] = true;

        this.browserConnection = {
            isHeadlessBrowser: () => false,
            userAgent:         'Chrome',
            provider:          {
                hasCustomActionForBrowser () {
                }
            }
        };
    }
}

async function executeAsyncExpression (expression, testRun = new TestRunMock()) {
    callsite++;

    return await testRun.executeCommand({
        type: COMMAND_TYPE.executeAsyncExpression,
        expression
    }, callsite.toString());
}

async function executeExpression (expression, customVarName, testRun = new TestRunMock()) {
    return testRun.executeCommand({
        type:               COMMAND_TYPE.executeExpression,
        resultVariableName: customVarName,
        expression
    });
}

async function assertError (expression, expectedMessage, expectedLine, expectedColumn) {
    let catched = false;

    try {
        await executeAsyncExpression(expression);
    }
    catch (err) {
        catched = true;

        expect(err.errMsg).eql(expectedMessage);
        expect(err.line).eql(expectedLine);
        expect(err.column).eql(expectedColumn);
        expect(err.callsite).eql(callsite.toString());
        expect(err.expression).eql(expression);
    }

    expect(catched).eql(true);
}

async function assertTestCafeError (expression, expectedFileName) {
    let catched = false;

    try {
        await executeAsyncExpression(expression);
    }
    catch (err) {
        catched = true;

        assertTestRunError(err, expectedFileName, false);
    }

    expect(catched).eql(true);
}

describe('Code steps', () => {
    beforeEach(() => {
        callsite = 0;
    });

    it('basic', async () => {
        const res = await executeAsyncExpression('return 1+1;');

        expect(res).eql(2);
    });

    it('error', async () => {
        await assertError('u=void 0;u.t=5;', 'Cannot set property \'t\' of undefined', 1, 13, '1');

        await assertError(
            'let q = void 0;\n' +
            '        q.t = 5;'
            , 'Cannot set property \'t\' of undefined', 2, 13, '2');

        await assertError(
            'let q = 3;\n' +
            'q = 4;\n' +
            'throw new Error(\'custom error\')'
            , 'custom error', 3, 7, '3');
    });

    describe('TestCafe errors', () => {
        it('Test run error', async () => {
            await assertTestCafeError("await t.wait('10');", '../data/execute-async-expression/test-run-error');
        });

        it('Runtime run error', async () => {
            await assertTestCafeError('const s = Selector();', '../data/execute-async-expression/runtime-error');
        });
    });

    it('sync expression does not spoil global context', async () => {
        const testRun = new TestRunMock();

        await executeExpression('1+1', 'myCustomVar1', testRun);
        await executeExpression('1+myCustomVar1', 'myCustomVar2', testRun);

        expect(typeof myCustomVar1).eql('undefined');
        expect(typeof myCustomVar2).eql('undefined');

        expect(await executeExpression('myCustomVar1', void 0, testRun)).eql(2);
        expect(await executeExpression('myCustomVar2', void 0, testRun)).eql(3);
    });

    it('shared context with global variables', async () => {
        const testRun = new TestRunMock();

        await executeAsyncExpression('result = 10;', testRun);

        const res = await executeAsyncExpression('return result + 3', testRun);

        expect(res).eql(13);
        expect(typeof result).eql('undefined');
    });

    it('shared context with local variables', async () => {
        const testRun = new TestRunMock();

        await executeAsyncExpression('const result = 10;', testRun);

        try {
            await executeAsyncExpression('return result + 3', testRun);
        }
        catch (err) {
            expect(err.code).eql('E66');
            expect(err.errMsg).eql('result is not defined');
        }
    });

    it('different context', async () => {
        await executeAsyncExpression('result = 10;');

        try {
            await executeAsyncExpression('result + 3');
        }
        catch (err) {
            expect(err.code).eql('E66');
            expect(err.errMsg).eql('result is not defined');
        }
    });

    it('promises', () => {
        return executeAsyncExpression(`
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve('hooray!');
                }, 20);
            });
        `)
            .then(result => {
                expect(result).eql('hooray!');
            });
    });

    it('async/await', () => {
        return executeAsyncExpression(`
            const promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve('hooray!');
                }, 20);
            });

            const result = await promise;

            return result;
        `)
            .then(result => {
                expect(result).eql('hooray!');
            });
    });

    it('require - absolute', async () => {
        await executeAsyncExpression(`
            return require('testcafe-hammerhead');
        `)
            .then(result => {
                expect(result).eql(require('testcafe-hammerhead'));
            });
    });

    it('require - relative', async () => {
        await executeAsyncExpression(`
            return require('./helpers/console-wrapper');
        `)
            .then(result => {
                expect(result).eql(require('./helpers/console-wrapper'));
            });
    });

    it('globals', async () => {
        const result = await executeAsyncExpression(`
            Buffer.from('test');

            const timeout   = setTimeout(function () {});
            const immediate = setImmediate(function () {});
            const interval  = setInterval(function () {});

            clearTimeout(timeout);
            clearImmediate(immediate);
            clearInterval(interval);

            return { __dirname, __filename };
        `);

        expect(result.__dirname).eql(__dirname);
        expect(result.__filename).eql(__filename);
    });

    it('Selector/ClientFunction/Role/RequestMock/RequestHook/RequestLogger', async () => {
        await executeAsyncExpression(`
            const selector       = Selector('button');
            const clientFunction = ClientFunction(() => {});
            const role           = Role('http://example.com', () => {});
            const mock           = RequestMock();
            const logger         = RequestLogger();
            const hook           = new RequestHook();
        `);
    });

    describe('test controller', () => {
        it('basic', async () => {
            await executeAsyncExpression(`
                await t.wait(10);
            `);
        });

        it('shared context', async () => {
            const testRun = new TestRunMock();

            await executeAsyncExpression(`
                t.testRun.sharedVar = 1;
            `, testRun);

            await executeAsyncExpression(`
                if (!t.testRun.sharedVar)
                    t.testRun.sharedVar = 2;
            `, testRun);

            expect(testRun.sharedVar).eql(1);
        });

        it('different context', async () => {
            const testRun1 = new TestRunMock();
            const testRun2 = new TestRunMock();

            await executeAsyncExpression(`
                t.testRun.sharedVar = 1;
            `, testRun1);

            await executeAsyncExpression(`
                if (!t.testRun.sharedVar)
                    t.testRun.sharedVar = 2;
            `, testRun2);

            expect(testRun1.sharedVar).eql(1);
            expect(testRun2.sharedVar).eql(2);
        });

        it('debug', async () => {
            const testRun = new TestRunMock();
            let err       = null;

            testRun._enqueueCommand = () => Promise.resolve();

            try {
                await executeAsyncExpression('await t.debug();', testRun);
            }
            catch (e) {
                err = e;
            }

            expect(err).eql(null);
            expect(testRun.stubStream.data).contains('Chrome');
            expect(testRun.stubStream.data).contains('DEBUGGER PAUSE');
        });
    });
});
