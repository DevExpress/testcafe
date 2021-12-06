const { expect }          = require('chai');
const TestController      = require('../../lib/api/test-controller');
const AssertionExecutor   = require('../../lib/assertions/executor');
const BaseTestRunMock     = require('./helpers/base-test-run-mock');
const { TEST_RUN_ERRORS } = require('../../lib/errors/types');

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

const mockTestRun    = new TestRunMock('');
const testController = new TestController(mockTestRun);

describe('TestController', () => {
    it('should reset executionChain if some command is rejected', () => {
        return testController.click('input', {})
            .catch(err => {
                expect(err.message).eql(errorMessage);

                return testController.expect(10).eql(10);
            });
    });

    describe('Cookies API arguments (preparation and validation)', () => {
        const validCookiesToGetOrDelete = [
            { name: 'name1', domain: 'domain1.com', path: '/path1' },
            { name: 'name2' },
            { domain: 'domain2.com' },
            { domain: 'domain3.com', path: '/path2' },
        ];

        const validCookiesToSet = [
            { name: 'name1', value: 'value1', domain: 'domain1.com', path: '/path1' },
            { name: 'name2', value: 'value2', domain: 'domain2.com', path: '/path2' },
            { name: 'name3', value: 'value3', domain: 'domain3.com', path: '/path3' },
            { name: 'name4', value: 'value4', domain: 'domain4.com', path: '/path4' },
        ];

        describe('Valid arguments', () => {
            function testValidCase (argumentsCase, testMethod) {
                const callsiteMock = null;
                let isErrorRaised  = false;
                let result;

                try {
                    result = testMethod(callsiteMock, ...argumentsCase.validArguments);
                }
                catch (err) {
                    isErrorRaised = true;
                }

                expect(isErrorRaised).eql(false);
                expect(result).eql(argumentsCase.expectedResultArguments);
            }

            describe('"...cookies"', () => {
                function createValidCookieArgumentsCases (validCookies, namesOrNameValueObjectsPropString, urlsOrUrlPropString) {
                    return [
                        {
                            validArguments:          [validCookies[0]],
                            expectedResultArguments: {
                                cookies:                             [validCookies[0]],
                                [namesOrNameValueObjectsPropString]: void 0,
                                [urlsOrUrlPropString]:               void 0,
                            },
                        },
                        {
                            validArguments:          [validCookies[0], validCookies[1]],
                            expectedResultArguments: {
                                cookies:                             [validCookies[0], validCookies[1]],
                                [namesOrNameValueObjectsPropString]: void 0,
                                [urlsOrUrlPropString]:               void 0,
                            },
                        },
                        {
                            validArguments:          [validCookies[0], validCookies[1], validCookies[2]],
                            expectedResultArguments: {
                                cookies:                             [validCookies[0], validCookies[1], validCookies[2]],
                                [namesOrNameValueObjectsPropString]: void 0,
                                [urlsOrUrlPropString]:               void 0,
                            },
                        },
                        {
                            validArguments:          [[validCookies[0], validCookies[1]], validCookies[2]],
                            expectedResultArguments: {
                                cookies:                             [validCookies[0], validCookies[1], validCookies[2]],
                                [namesOrNameValueObjectsPropString]: void 0,
                                [urlsOrUrlPropString]:               void 0,
                            },
                        },
                        {
                            validArguments:          [validCookies[0], [validCookies[1], validCookies[2]]],
                            expectedResultArguments: {
                                cookies:                             [validCookies[0], validCookies[1], validCookies[2]],
                                [namesOrNameValueObjectsPropString]: void 0,
                                [urlsOrUrlPropString]:               void 0,
                            },
                        },
                        {
                            validArguments:          [validCookies[0], validCookies[1], [validCookies[2], validCookies[3]]],
                            expectedResultArguments: {
                                cookies:                             [validCookies[0], validCookies[1], validCookies[2], validCookies[3]],
                                [namesOrNameValueObjectsPropString]: void 0,
                                [urlsOrUrlPropString]:               void 0,
                            },
                        },
                    ];
                }

                it('_prepareAndValidateCookieArgumentsToGetOrDelete', () => {
                    const testCases = createValidCookieArgumentsCases(validCookiesToGetOrDelete, 'names', 'urls');

                    testCases.forEach(argumentsCase => {
                        testValidCase(argumentsCase, testController._prepareAndValidateCookieArgumentsToGetOrDelete);
                    });
                });

                it('_prepareAndValidateCookieArgumentsToSet', () => {
                    const testCases = createValidCookieArgumentsCases(validCookiesToSet, 'nameValueObjects', 'url');

                    testCases.forEach(argumentsCase => {
                        testValidCase(argumentsCase, testController._prepareAndValidateCookieArgumentsToSet);
                    });
                });
            });

            it('"names", "urls" (_prepareAndValidateCookieArgumentsToGetOrDelete)', () => {
                const testCases = [
                    {
                        validArguments:          ['cookieName', 'https://valid-url.com'],
                        expectedResultArguments: {
                            cookies: void 0,
                            names:   ['cookieName'],
                            urls:    ['https://valid-url.com'],
                        },
                    },
                    {
                        validArguments:          [['cookieName'], 'https://valid-url.com'],
                        expectedResultArguments: {
                            cookies: void 0,
                            names:   ['cookieName'],
                            urls:    ['https://valid-url.com'],
                        },
                    },
                    {
                        validArguments:          ['cookieName', ['https://valid-url.com']],
                        expectedResultArguments: {
                            cookies: void 0,
                            names:   ['cookieName'],
                            urls:    ['https://valid-url.com'],
                        },
                    },
                    {
                        validArguments:          [['cookieName1', 'cookieName2'], 'https://valid-url.com'],
                        expectedResultArguments: {
                            cookies: void 0,
                            names:   ['cookieName1', 'cookieName2'],
                            urls:    ['https://valid-url.com'],
                        },
                    },
                    {
                        validArguments:          [['cookieName1', 'cookieName2'], ['https://valid-url.com']],
                        expectedResultArguments: {
                            cookies: void 0,
                            names:   ['cookieName1', 'cookieName2'],
                            urls:    ['https://valid-url.com'],
                        },
                    },
                    {
                        validArguments:          ['cookieName', ['https://valid-url-1.com', 'https://valid-url-2.com']],
                        expectedResultArguments: {
                            cookies: void 0,
                            names:   ['cookieName'],
                            urls:    ['https://valid-url-1.com', 'https://valid-url-2.com'],
                        },
                    },
                    {
                        validArguments:          [['cookieName1', 'cookieName2'], ['https://valid-url-1.com', 'https://valid-url-2.com']],
                        expectedResultArguments: {
                            cookies: void 0,
                            names:   ['cookieName1', 'cookieName2'],
                            urls:    ['https://valid-url-1.com', 'https://valid-url-2.com'],
                        },
                    },
                ];

                testCases.forEach(argumentsCase => {
                    testValidCase(argumentsCase, testController._prepareAndValidateCookieArgumentsToGetOrDelete);
                });
            });

            it('"nameValueObjects", "url" (_prepareAndValidateCookieArgumentsToSet)', () => {
                const testCases = [
                    {
                        validArguments:          [{ validCookie: 'cookieValue' }, 'https://valid-url.com'],
                        expectedResultArguments: { cookies: void 0, nameValueObjects: [{ validCookie: 'cookieValue' }], url: ['https://valid-url.com'] },
                    },
                    {
                        validArguments:          [[{ validCookie: 'cookieValue' }], 'https://valid-url.com'],
                        expectedResultArguments: { cookies: void 0, nameValueObjects: [{ validCookie: 'cookieValue' }], url: ['https://valid-url.com'] },
                    },
                    {
                        validArguments:          [[{ validCookie1: 'cookieValue1' }, { 'validCookie2': 'cookieValue2' }], 'https://valid-url.com'],
                        expectedResultArguments: { cookies: void 0, nameValueObjects: [{ validCookie1: 'cookieValue1' }, { 'validCookie2': 'cookieValue2' }], url: ['https://valid-url.com'] },
                    },
                ];

                testCases.forEach(argumentsCase => {
                    testValidCase(argumentsCase, testController._prepareAndValidateCookieArgumentsToSet);
                });
            });
        });

        describe('Invalid arguments', () => {
            function testInvalidCase (argumentsCase, testMethod) {
                const callsiteMock = null;

                try {
                    testMethod(callsiteMock, ...argumentsCase.invalidArguments);
                }
                catch (err) {
                    expect(err.code).eql(argumentsCase.expectedErrorCode);
                }
            }

            describe('"...cookies"', () => {
                const invalidCookieArgumentCases = [
                    {
                        invalidArguments:  [{}],
                        expectedErrorCode: TEST_RUN_ERRORS.actionCookieArgumentError,
                    },
                    {
                        invalidArguments:  [1],
                        expectedErrorCode: TEST_RUN_ERRORS.actionCookieArgumentError,
                    },
                    {
                        invalidArguments:  [true],
                        expectedErrorCode: TEST_RUN_ERRORS.actionCookieArgumentError,
                    },
                    {
                        invalidArguments:  [null],
                        expectedErrorCode: TEST_RUN_ERRORS.actionCookieArgumentError,
                    },
                    {
                        invalidArguments:  [void 0],
                        expectedErrorCode: TEST_RUN_ERRORS.actionCookieArgumentError,
                    },
                    {
                        invalidArguments:  [[]],
                        expectedErrorCode: TEST_RUN_ERRORS.actionCookieArgumentError,
                    },
                ];

                function createInvalidCookieArgumentsCases (validCookies) {
                    return [
                        {
                            invalidArguments:  [validCookies[0], {}],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArgumentsError,
                        },
                        {
                            invalidArguments:  [true, validCookies[1]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArgumentsError,
                        },
                        {
                            invalidArguments:  [validCookies[2], null],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArgumentsError,
                        },
                        {
                            invalidArguments:  [[validCookies[3]], void 0],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArgumentsError,
                        },
                        {
                            invalidArguments:  [validCookies[0], [validCookies[1]], void 0],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArgumentsError,
                        },
                        {
                            invalidArguments:  [validCookies[1], [validCookies[2]], validCookies[3], []],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArgumentsError,
                        },
                    ];
                }

                function createInvalidCookieArrayArgumentCases (validCookies) {
                    return [
                        {
                            invalidArguments:  [[{}]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArrayArgumentError,
                        },
                        {
                            invalidArguments:  [[[]]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArrayArgumentError,
                        },
                        {
                            invalidArguments:  [[validCookies[0], 1]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArrayArgumentError,
                        },
                        {
                            invalidArguments:  [[validCookies[1], true]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArrayArgumentError,
                        },
                        {
                            invalidArguments:  [[validCookies[2], null]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArrayArgumentError,
                        },
                        {
                            invalidArguments:  [[validCookies[3], void 0]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArrayArgumentError,
                        },
                        {
                            invalidArguments:  [[validCookies[0], []]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArrayArgumentError,
                        },
                    ];
                }

                function createInvalidCookieArrayArgumentsCases (validCookies) {
                    return [
                        {
                            invalidArguments:  [validCookies[0], [{}]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArrayArgumentsError,
                        },
                        {
                            invalidArguments:  [[[]], validCookies[1]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArrayArgumentsError,
                        },
                        {
                            invalidArguments:  [validCookies[2], [validCookies[3], 1]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArrayArgumentsError,
                        },
                        {
                            invalidArguments:  [validCookies[0], [validCookies[1], true]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArrayArgumentsError,
                        },
                        {
                            invalidArguments:  [validCookies[2], [validCookies[3], null]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArrayArgumentsError,
                        },
                        {
                            invalidArguments:  [validCookies[0], [validCookies[1], void 0]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArrayArgumentsError,
                        },
                        {
                            invalidArguments:  [validCookies[2], [validCookies[3], []]],
                            expectedErrorCode: TEST_RUN_ERRORS.actionCookieArrayArgumentsError,
                        },
                    ];
                }

                it('_prepareAndValidateCookieArgumentsToGetOrDelete', () => {
                    const testCases = invalidCookieArgumentCases
                        .concat(
                            createInvalidCookieArgumentsCases(validCookiesToGetOrDelete),
                            createInvalidCookieArrayArgumentCases(validCookiesToGetOrDelete),
                            createInvalidCookieArrayArgumentsCases(validCookiesToGetOrDelete),
                        );

                    testCases.forEach(argumentsCase => {
                        testInvalidCase(argumentsCase, testController._prepareAndValidateCookieArgumentsToGetOrDelete);
                    });
                });

                it('_prepareAndValidateCookieArgumentsToSet', () => {
                    const testCases = invalidCookieArgumentCases
                        .concat(
                            createInvalidCookieArgumentsCases(validCookiesToSet),
                            createInvalidCookieArrayArgumentCases(validCookiesToSet),
                            createInvalidCookieArrayArgumentsCases(validCookiesToSet),
                        );

                    testCases.forEach(argumentsCase => {
                        testInvalidCase(argumentsCase, testController._prepareAndValidateCookieArgumentsToSet);
                    });
                });
            });

            it('"names" (_prepareAndValidateCookieArgumentsToGetOrDelete)', () => {
                const invalidNamesArgumentCases = [
                    {
                        invalidArguments:  [{}, 'https://some-url.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNamesCookieArgumentError,
                    },
                    {
                        invalidArguments:  [1, 'https://some-url.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNamesCookieArgumentError,
                    },
                    {
                        invalidArguments:  [true, 'https://some-url.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNamesCookieArgumentError,
                    },
                    {
                        invalidArguments:  [null, 'https://some-url.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNamesCookieArgumentError,
                    },
                    {
                        invalidArguments:  [void 0, 'https://some-url.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNamesCookieArgumentError,
                    },
                ];

                const invalidNamesArrayArgumentCases = [
                    {
                        invalidArguments:  [[true], 'https://some-url.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNamesArrayCookieArgumentError,
                    },
                    {
                        invalidArguments:  [[null], 'https://some-url.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNamesArrayCookieArgumentError,
                    },
                    {
                        invalidArguments:  [[void 0], 'https://some-url.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNamesArrayCookieArgumentError,
                    },
                    {
                        invalidArguments:  [['cookieName', 1], 'https://some-url.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNamesArrayCookieArgumentError,
                    },
                ];

                const testCases = invalidNamesArgumentCases
                    .concat(invalidNamesArrayArgumentCases);

                testCases.forEach(argumentsCase => {
                    testInvalidCase(argumentsCase, testController._prepareAndValidateCookieArgumentsToGetOrDelete);
                });
            });

            it('"urls" (_prepareAndValidateCookieArgumentsToGetOrDelete)', () => {
                const invalidUrlsCookieArgumentCases = [
                    {
                        invalidArguments:  ['cookieName', {}],
                        expectedErrorCode: TEST_RUN_ERRORS.actionUrlsCookieArgumentError,
                    },
                    {
                        invalidArguments:  ['cookieName', true],
                        expectedErrorCode: TEST_RUN_ERRORS.actionUrlsCookieArgumentError,
                    },
                    {
                        invalidArguments:  ['cookieName', null],
                        expectedErrorCode: TEST_RUN_ERRORS.actionUrlsCookieArgumentError,
                    },
                    {
                        invalidArguments:  ['cookieName', void 0],
                        expectedErrorCode: TEST_RUN_ERRORS.actionUrlsCookieArgumentError,
                    },
                    {
                        invalidArguments:  ['cookieName', []],
                        expectedErrorCode: TEST_RUN_ERRORS.actionUrlsCookieArgumentError,
                    },
                    {
                        invalidArguments:  [['cookieName1', 'cookieName2'], {}],
                        expectedErrorCode: TEST_RUN_ERRORS.actionUrlsCookieArgumentError,
                    },
                ];

                const invalidUrlsArrayCookieArgumentCases = [
                    {
                        invalidArguments:  ['cookieName', ['https://domain.com', {}]],
                        expectedErrorCode: TEST_RUN_ERRORS.actionUrlsArrayCookieArgumentError,
                    },
                    {
                        invalidArguments:  ['cookieName', ['https://domain.com', true]],
                        expectedErrorCode: TEST_RUN_ERRORS.actionUrlsArrayCookieArgumentError,
                    },
                    {
                        invalidArguments:  ['cookieName', ['https://domain.com', null]],
                        expectedErrorCode: TEST_RUN_ERRORS.actionUrlsArrayCookieArgumentError,
                    },
                    {
                        invalidArguments:  ['cookieName', ['https://domain.com', void 0]],
                        expectedErrorCode: TEST_RUN_ERRORS.actionUrlsArrayCookieArgumentError,
                    },
                    {
                        invalidArguments:  ['cookieName', ['https://domain.com', []]],
                        expectedErrorCode: TEST_RUN_ERRORS.actionUrlsArrayCookieArgumentError,
                    },
                    {
                        invalidArguments:  [['cookieName1', 'cookieName2'], ['https://domain.com', {}]],
                        expectedErrorCode: TEST_RUN_ERRORS.actionUrlsArrayCookieArgumentError,
                    },
                ];

                const testCases = invalidUrlsCookieArgumentCases
                    .concat(invalidUrlsArrayCookieArgumentCases);

                testCases.forEach(argumentsCase => {
                    testInvalidCase(argumentsCase, testController._prepareAndValidateCookieArgumentsToGetOrDelete);
                });
            });

            it('"nameValueObjects" (_prepareAndValidateCookieArgumentsToSet)', () => {
                const invalidNameValueObjectCookieArgumentCases = [
                    {
                        invalidArguments:  [{}, 'https://domain.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNameValueObjectCookieArgumentError,
                    },
                    {
                        invalidArguments:  [true, 'https://domain.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNameValueObjectCookieArgumentError,
                    },
                    {
                        invalidArguments:  [null, 'https://domain.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNameValueObjectCookieArgumentError,
                    },
                    {
                        invalidArguments:  [void 0, 'https://domain.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNameValueObjectCookieArgumentError,
                    },
                    {
                        invalidArguments:  [[], 'https://domain.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNameValueObjectCookieArgumentError,
                    },
                    {
                        invalidArguments:  [{ someCookieName: 'value', unexpectedAdditionalProp: 'value' }, 'https://domain.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNameValueObjectCookieArgumentError,
                    },
                ];

                const invalidNameValueObjectsCookieArgumentCases = [
                    {
                        invalidArguments:  [[{ someCookieName1: 'value1' }, {}], 'https://domain.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNameValueObjectsCookieArgumentError,
                    },
                    {
                        invalidArguments:  [[{ someCookieName1: 'value1' }, true], 'https://domain.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNameValueObjectsCookieArgumentError,
                    },
                    {
                        invalidArguments:  [[{ someCookieName1: 'value1' }, null], 'https://domain.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNameValueObjectsCookieArgumentError,
                    },
                    {
                        invalidArguments:  [[{ someCookieName1: 'value1' }, void 0], 'https://domain.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNameValueObjectsCookieArgumentError,
                    },
                    {
                        invalidArguments:  [[{ someCookieName1: 'value1' }, []], 'https://domain.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNameValueObjectsCookieArgumentError,
                    },
                    {
                        invalidArguments:  [[{ someCookieName: 'value', unexpectedAdditionalProp: 'value' }], 'https://domain.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNameValueObjectsCookieArgumentError,
                    },
                    {
                        invalidArguments:  [[{ someCookieName1: 'value1' }, { someCookieName2: 'value2', unexpectedAdditionalProp: 'value' }], 'https://domain.com'],
                        expectedErrorCode: TEST_RUN_ERRORS.actionNameValueObjectsCookieArgumentError,
                    },
                ];

                const testCases = invalidNameValueObjectCookieArgumentCases
                    .concat(invalidNameValueObjectsCookieArgumentCases);

                testCases.forEach(argumentsCase => {
                    testInvalidCase(argumentsCase, testController._prepareAndValidateCookieArgumentsToSet);
                });
            });

            it('"url" (_prepareAndValidateCookieArgumentsToSet)', () => {
                const invalidUrlArgumentCases = [
                    {
                        invalidArguments:  [{ someCookieName1: 'value1' }, {}],
                        expectedErrorCode: TEST_RUN_ERRORS.actionStringArgumentError,
                    },
                    {
                        invalidArguments:  [[{ someCookieName1: 'value1' }], {}],
                        expectedErrorCode: TEST_RUN_ERRORS.actionStringArgumentError,
                    },
                    {
                        invalidArguments:  [{ someCookieName1: 'value1' }, true],
                        expectedErrorCode: TEST_RUN_ERRORS.actionStringArgumentError,
                    },
                    {
                        invalidArguments:  [{ someCookieName1: 'value1' }, null],
                        expectedErrorCode: TEST_RUN_ERRORS.actionStringArgumentError,
                    },
                    {
                        invalidArguments:  [{ someCookieName1: 'value1' }, void 0],
                        expectedErrorCode: TEST_RUN_ERRORS.actionStringArgumentError,
                    },
                    {
                        invalidArguments:  [{ someCookieName1: 'value1' }, []],
                        expectedErrorCode: TEST_RUN_ERRORS.actionStringArgumentError,
                    },
                ];

                invalidUrlArgumentCases.forEach(argumentsCase => {
                    testInvalidCase(argumentsCase, testController._prepareAndValidateCookieArgumentsToSet);
                });
            });
        });
    });
});
