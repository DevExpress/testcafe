const { expect }        = require('chai');
const TestController    = require('../../lib/api/test-controller');
const AssertionExecutor = require('../../lib/assertions/executor');
const BaseTestRunMock   = require('./helpers/base-test-run-mock');

const errorMessage = 'some error in click command';

class TestRunMock extends BaseTestRunMock {
    constructor (reason) {
        super();

        this.errors = [];
        this.reason = reason;
    }

    addError (err) {
        this.errors.push(err);
    }

    _executeActionCommand (command) {
        return this._internalExecuteCommand(command);
    }

    _internalExecuteCommand (command, callsite) {
        if (command.type === 'click')
            return Promise.reject(new Error(errorMessage));

        return new AssertionExecutor(command, 0, callsite).run();
    }
}

describe('TestController', () => {
    const mockTestRun    = new TestRunMock('');
    const testController = new TestController(mockTestRun);

    it('should reset executionChain if some command is rejected', () => {
        return testController.click('input', {})
            .catch(err => {
                expect(err.message).eql(errorMessage);

                return testController.expect(10).eql(10);
            });
    });


    describe('Preparing cookies arguments', () => {
        it('Should prepare name and url arguments', () => {
            const args = ['cookie', 'url'];

            expect(testController._prepareCookieArguments(args)).eql({
                cookies: [
                    {
                        name: 'cookie',
                    },
                ],
                urls: ['url'],
            });
        });

        it('Should prepare names and urls arguments', () => {
            const args = [['cookie1', 'cookie2'], ['url1', 'url2']];

            expect(testController._prepareCookieArguments(args)).eql({
                cookies: [
                    {
                        name: 'cookie1',
                    },
                    {
                        name: 'cookie2',
                    },
                ],
                urls: ['url1', 'url2'],
            });
        });

        it('Should prepare object argument', () => {
            const args = [{ name: 'apiCookie13', value: 'value13', domain: 'some-another-domain.com', path: '/' }];

            expect(testController._prepareCookieArguments(args)).eql({
                cookies: args,
                urls:    [],
            });
        });

        it('Should prepare objects argument', () => {
            const args = [[
                { name: 'apiCookie1', value: 'value1', domain: 'some-another-domain.com', path: '/' },
                { name: 'apiCookie3', value: 'value3', domain: 'some-another-domain.com', path: '/' },
            ]];

            expect(testController._prepareCookieArguments(args)).eql({
                cookies: args[0],
                urls:    [],
            });
        });

        it('Should prepare name-value and url arguments', () => {
            const args = [{ apiCookie1: 'value1' }, 'url'];

            expect(testController._prepareCookieArguments(args, true)).eql({
                cookies: [
                    {
                        name:  'apiCookie1',
                        value: 'value1',
                    },
                ],
                urls: ['url'],
            });
        });

        it('Should prepare name-values and urls arguments', () => {
            const args = [[
                { apiCookie1: 'value1' },
                { apiCookie3: 'value3' },
            ], ['url1', 'url3']];

            expect(testController._prepareCookieArguments(args, true)).eql({
                cookies: [
                    {
                        name:  'apiCookie1',
                        value: 'value1',
                    },
                    {
                        name:  'apiCookie3',
                        value: 'value3',
                    },
                ],
                urls: ['url1', 'url3'],
            });
        });

        it("Should prepare object like name-value if property name isn't defined", () => {
            const args = [{ value: 'value13', domain: 'some-another-domain.com', path: '/' }];

            expect(testController._prepareCookieArguments(args, true)).eql({
                cookies: [
                    {
                        name:  'value',
                        value: 'value13',
                    },
                    {
                        name:  'domain',
                        value: 'some-another-domain.com',
                    },
                    {
                        name:  'path',
                        value: '/',
                    },
                ],
                urls: [],
            });
        });
    });
});
