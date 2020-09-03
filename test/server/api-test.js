const expect         = require('chai').expect;
const proxyquire     = require('proxyquire');
const sinon          = require('sinon');
const resolve        = require('path').resolve;
const assertAPIError = require('./helpers/assert-runtime-error').assertAPIError;
const compile        = require('./helpers/compile');
const OPTION_NAMES   = require('../../lib/configuration/option-names');


describe('API', function () {
    this.timeout(20000);

    describe('fixture', function () {
        it('Should gracefully handle fixture pages without protocol', function () {
            return compile('test/server/data/test-suites/fixture-page-without-protocol/testfile.js')
                .then(function (compiled) {
                    expect(compiled.tests[0].fixture.pageUrl).eql('http://example.org');
                    expect(compiled.tests[1].fixture.pageUrl).eql('http://example.org');
                });
        });

        it('Should raise an error if fixture name is not a string', function () {
            const testfile = resolve('test/server/data/test-suites/fixture-name-is-not-a-string/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'The fixture name is expected to be a string, but it was object.',

                        callsite: '    2 |// (to treat a file as a test, it requires at least one fixture definition\n' +
                                  '    3 |//  with the string argument).\n' +
                                  '    4 |\n' +
                                  '    5 |fixture `Yo`;\n' +
                                  '    6 |\n' +
                                  ' >  7 |fixture({ answer: 42 });\n' +
                                  '    8 |\n' +
                                  "    9 |test('Test', () => {\n" +
                                  "   10 |    return 'yo';\n" +
                                  '   11 |});\n' +
                                  '   12 |'
                    });
                });
        });

        it('Should raise an error if fixture page is not a string', function () {
            const testfile = resolve('test/server/data/test-suites/fixture-page-is-not-a-string/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'The page URL is expected to be a string, but it was object.',

                        callsite: '   1 |fixture `Yo`\n' +
                                  ' > 2 |    .page({ answer: 42 });\n' +
                                  '   3 |\n' +
                                  "   4 |test('Test', () => {\n" +
                                  "   5 |    return 'yo';\n" +
                                  '   6 |});\n' +
                                  '   7 |'
                    });
                });
        });

        it('Should raise an error if beforeEach is not a function', function () {
            const testfile = resolve('test/server/data/test-suites/before-each-is-not-a-function/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'fixture.beforeEach hook is expected to be a function, but it was string.',

                        callsite: '   1 |fixture `beforeEach is not a function`\n' +
                                  " > 2 |    .beforeEach('yo');\n" +
                                  '   3 |\n' +
                                  "   4 |test('Some test', () => {\n" +
                                  '   5 |\n' +
                                  '   6 |});\n' +
                                  '   7 |'
                    });
                });
        });

        it('Should raise an error if afterEach is not a function', function () {
            const testfile = resolve('test/server/data/test-suites/after-each-is-not-a-function/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'fixture.afterEach hook is expected to be a function, but it was string.',

                        callsite: '   1 |fixture `afterEach is not a function`\n' +
                                  " > 2 |    .afterEach('yo');\n" +
                                  '   3 |\n' +
                                  "   4 |test('Some test', () => {\n" +
                                  '   5 |\n' +
                                  '   6 |});\n' +
                                  '   7 |'
                    });
                });
        });

        it('Should raise an error if fixture.before is not a function', function () {
            const testfile = resolve('test/server/data/test-suites/fixture-before-is-not-a-function/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'fixture.before hook is expected to be a function, but it was string.',

                        callsite: '   1 |fixture `before is not a function`\n' +
                                  " > 2 |    .before('yo');\n" +
                                  '   3 |\n' +
                                  "   4 |test('Some test', () => {\n" +
                                  '   5 |\n' +
                                  '   6 |});\n' +
                                  '   7 |'
                    });
                });
        });

        it('Should raise an error if fixture.after is not a function', function () {
            const testfile = resolve('test/server/data/test-suites/fixture-after-is-not-a-function/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'fixture.after hook is expected to be a function, but it was string.',

                        callsite: '   1 |fixture `after is not a function`\n' +
                                  " > 2 |    .after('yo');\n" +
                                  '   3 |\n' +
                                  "   4 |test('Some test', () => {\n" +
                                  '   5 |\n' +
                                  '   6 |});\n' +
                                  '   7 |'
                    });
                });
        });

        it('Should raise an error if httpAuth takes a wrong argument', function () {
            const credentialsInNotObject = resolve('test/server/data/test-suites/http-auth/credentials-is-not-an-object.js');
            const passIsNotString        = resolve('test/server/data/test-suites/http-auth/password-is-not-a-string.js');
            const usernameIsNotDefined   = resolve('test/server/data/test-suites/http-auth/username-is-not-defined.js');

            return compile(credentialsInNotObject)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: credentialsInNotObject,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'credentials is expected to be a non-null object, but it was string.',

                        callsite: '   1 |fixture `Credentials is not an object`\n' +
                                  " > 2 |    .httpAuth('');\n" +
                                  '   3 |\n' +
                                  "   4 |test('Some test', () => {\n" +
                                  '   5 |\n' +
                                  '   6 |});\n' +
                                  '   7 |'
                    });

                    return compile(passIsNotString);
                })
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: passIsNotString,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'credentials.password is expected to be a string, but it was object.',

                        callsite: '   1 |fixture `Password is not a string`\n' +
                                  ' > 2 |    .httpAuth({ username: \'username\', password: {} });\n' +
                                  '   3 |\n' +
                                  "   4 |test('Some test', () => {\n" +
                                  '   5 |\n' +
                                  '   6 |});\n' +
                                  '   7 |'
                    });

                    return compile(usernameIsNotDefined);
                })
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: usernameIsNotDefined,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'credentials.username is expected to be a string, but it was undefined.',

                        callsite: '   1 |fixture `Username is not defined`\n' +
                                  " > 2 |    .httpAuth({ password: 'password' });\n" +
                                  '   3 |\n' +
                                  "   4 |test('Some test', () => {\n" +
                                  '   5 |\n' +
                                  '   6 |});\n' +
                                  '   7 |'
                    });
                });
        });

        it('Should raise an error if requestHooks takes a wrong argument', function () {
            const fixtureHookHasWrongType = resolve('test/server/data/test-suites/request-hooks/fixture-hook-has-wrong-type.js');

            return compile(fixtureHookHasWrongType)
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    assertAPIError(err, {
                        stackTop: fixtureHookHasWrongType,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'Hook is expected to be a RequestHook subclass, but it was string.',

                        callsite: '   1 |fixture `RequestHook is undefined`\n' +
                                  ' > 2 |    .requestHooks(\'string\');\n' +
                                  '   3 |\n' +
                                  '   4 |test(\'test\', async t => {\n' +
                                  '   5 |});\n' +
                                  '   6 |'

                    });
                });
        });

        it('Should raise an error if "fixture.requestHooks" method calls several times', () => {
            const testfile = resolve('test/server/data/test-suites/request-hooks/fixture-request-hooks-call-several-times.js');

            return compile(testfile)
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'You cannot call the "requestHooks" method more than once. Pass an array of parameters to this method instead.',

                        callsite: '    3 |const logger1 = new RequestLogger();\n' +
                                  '    4 |const logger2 = new RequestLogger();\n' +
                                  '    5 |\n' +
                                  '    6 |fixture `Fixture`\n' +
                                  '    7 |    .requestHooks(logger1)\n' +
                                  ' >  8 |    .requestHooks(logger2);\n' +
                                  '    9 |\n' +
                                  '   10 |test(\'test\', async t => {});\n' +
                                  '   11 |'
                    });
                });
        });

        it('Should collect meta data', function () {
            return compile('test/server/data/test-suites/meta/testfile.js')
                .then(function (compiled) {
                    expect(compiled.tests[0].fixture.meta.metaField1).eql('fixtureMetaValue1');
                    expect(compiled.tests[0].fixture.meta.metaField2).eql('fixtureMetaUpdatedValue2');
                    expect(compiled.tests[0].fixture.meta.metaField3).eql('fixtureMetaValue3');
                    expect(compiled.tests[1].fixture.meta.emptyField).eql(void 0);
                });
        });

        it('Should raise an error if fixture.meta is undefined', function () {
            const file = resolve('test/server/data/test-suites/meta/incorrect-fixture-meta.js');

            return compile(file)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: file,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'fixture.meta is expected to be a string or a non-null object, but it was undefined.',

                        callsite: '   1 |fixture(\'Fixture1\')\n' +
                                  '   2 |    .page(\'http://example.com\')\n' +
                                  ' > 3 |    .meta();\n' +
                                  '   4 |\n' +
                                  '   5 |test\n' +
                                  '   6 |    (\'Fixture1Test1\', async () => {\n' +
                                  '   7 |        // do nothing\n' +
                                  '   8 |    });'
                    });
                });
        });

        it('Should raise an error if "fixture.clientScripts" method takes a wrong argument', () => {
            const testfile = resolve('test/server/data/test-suites/custom-client-scripts/fixture-client-scripts-has-wrong-type.js');

            return compile(testfile)
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'Client script is expected to be a string or a client script initializer, but it was number.',

                        callsite: ' > 1 |fixture.clientScripts(8);\n' +
                                  '   2 |\n' +
                                  '   3 |test(\'test\', async t => {});\n' +
                                  '   4 |'
                    });
                });
        });

        it('Should raise an error if "fixture.clientScripts" method calls several times', () => {
            const testfile = resolve('test/server/data/test-suites/custom-client-scripts/fixture-client-scripts-call-several-times.js');

            return compile(testfile)
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'You cannot call the "clientScripts" method more than once. Pass an array of parameters to this method instead.',

                        callsite: '   1 |fixture `Fixture`\n' +
                                  '   2 |    .clientScripts(\'script1.js\')\n' +
                                  ' > 3 |    .clientScripts(\'script2.js\');\n' +
                                  '   4 |\n' +
                                  '   5 |test(\'test\', async t => {});\n' +
                                  '   6 |'
                    });
                });
        });
    });

    describe('test', function () {
        it('Should raise an error if test name is not a string', function () {
            const testfile = resolve('test/server/data/test-suites/test-name-is-not-a-string/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'The test name is expected to be a string, but it was number.',

                        callsite: '    4 |// (to treat a file as a test, it requires at least one fixture definition\n' +
                                  '    5 |//  with the string argument).\n' +
                                  "    6 |test('TheAnswer', () => {\n    7 |});\n" +
                                  '    8 |\n' +
                                  ' >  9 |test(42, () => {\n' +
                                  '   10 |});\n' +
                                  '   11 |'
                    });
                });
        });

        it('Should raise an error if test body is not a function', function () {
            const testfile = resolve('test/server/data/test-suites/test-body-is-not-a-function/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'The test body is expected to be a function, but it was string.',

                        callsite: '   1 |fixture `Test body is not a function`;\n' +
                                  '   2 |\n' +
                                  " > 3 |test('Test', 'Yo');\n" +
                                  '   4 |'
                    });
                });
        });

        it('Should raise an error if test.before is not a function', function () {
            const testfile = resolve('test/server/data/test-suites/test-before-is-not-a-function/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'test.before hook is expected to be a function, but it was number.',

                        callsite: '   1 |fixture `Fixture`;\n' +
                                  '   2 |\n' +
                                  " > 3 |test.before(123)('Some test', () => {\n" +
                                  '   4 |\n' +
                                  '   5 |});\n' +
                                  '   6 |'
                    });
                });
        });

        it('Should raise an error if test.after is not a function', function () {
            const testfile = resolve('test/server/data/test-suites/test-after-is-not-a-function/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'test.after hook is expected to be a function, but it was number.',

                        callsite: '   1 |fixture `Fixture`;\n' +
                                  '   2 |\n' +
                                  " > 3 |test.after(123)('Some test', () => {\n" +
                                  '   4 |\n' +
                                  '   5 |});\n' +
                                  '   6 |'
                    });
                });
        });

        it('Should raise an error if requestHooks takes a wrong argument', function () {
            const testHookArrayContainsNotRequestHookInheritor = resolve('test/server/data/test-suites/request-hooks/test-hook-array-contains-not-request-hook-inheritor.js');

            return compile(testHookArrayContainsNotRequestHookInheritor)
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    assertAPIError(err, {
                        stackTop: testHookArrayContainsNotRequestHookInheritor,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'Hook is expected to be a RequestHook subclass, but it was number.',

                        callsite: "   1 |import { RequestMock } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Hook array contains not RequestHook inheritor`;\n' +
                                  '   4 |\n' +
                                  " > 5 |test.requestHooks([RequestMock(), 1])('test', async t => {\n" +
                                  '   6 |});\n' +
                                  '   7 |\n'
                    });
                });
        });

        it('Should clone request hooks from fixture to test', () => {
            const cloneHooksFromFixtureToTest = resolve('test/server/data/test-suites/request-hooks/clone-hooks-from-fixture-to-test.js');

            return compile(cloneHooksFromFixtureToTest)
                .then(compiledData => {
                    const fixture = compiledData.fixtures[0];
                    const test    = compiledData.tests[0];

                    expect(fixture.requestHooks.length).eql(2);
                    expect(test.requestHooks.length).eql(3);
                });
        });

        it('Should not clone the same request hook from fixture to test twice', () => {
            const shouldNotCloneSameRequestHookFromFixtureToTest = resolve('test/server/data/test-suites/request-hooks/should-not-clone-same-request-hook-from-fixture-to-test.js');

            return compile(shouldNotCloneSameRequestHookFromFixtureToTest)
                .then(compiledData => {
                    const fixture = compiledData.fixtures[0];
                    const test    = compiledData.tests[0];

                    expect(fixture.requestHooks.length).eql(2);
                    expect(test.requestHooks.length).eql(3);
                });
        });

        it('Should raise an error if "test.requestHooks" method calls several times', () => {
            const testfile = resolve('test/server/data/test-suites/request-hooks/test-request-hooks-call-several-times.js');

            return compile(testfile)
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'You cannot call the "requestHooks" method more than once. Pass an array of parameters to this method instead.',

                        callsite: '    5 |\n' +
                                  '    6 |fixture `Fixture`;\n' +
                                  '    7 |\n' +
                                  '    8 |test\n' +
                                  '    9 |    .requestHooks(logger1)\n' +
                                  ' > 10 |    .requestHooks(logger2)\n' +
                                  '   11 |    (\'test\', async t => {});\n' +
                                  '   12 |'
                    });
                });
        });

        it('Should collect meta data', function () {
            return compile('test/server/data/test-suites/meta/testfile.js')
                .then(function (compiled) {
                    expect(compiled.tests[0].meta.metaField1).eql('testMetaValue1');
                    expect(compiled.tests[0].meta.metaField4).eql('testMetaUpdatedValue4');
                    expect(compiled.tests[0].meta.metaField5).eql('testMetaValue5');
                    expect(compiled.tests[1].meta.emptyField).eql(void 0);
                });
        });

        it('Should raise an error if test.meta is null', function () {
            const file = resolve('test/server/data/test-suites/meta/incorrect-test-meta.js');

            return compile(file)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: file,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'test.meta is expected to be a string or a non-null object, but it was null.',

                        callsite: '   1 |fixture(\'Fixture1\')\n' +
                                  '   2 |    .page(\'http://example.com\');\n' +
                                  '   3 |\n' +
                                  '   4 |test\n' +
                                  ' > 5 |    .meta(null)\n' +
                                  '   6 |    (\'Fixture1Test1\', async () => {\n' +
                                  '   7 |        // do nothing\n' +
                                  '   8 |    });'
                    });
                });
        });

        it('Should raise an error if fixture is missing', function () {
            const file = resolve('test/server/data/test-suites/fixture-is-missing/testfile.js');

            return compile(file)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: file,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'The fixture of \'Test\' test is expected to be a non-null object, but it was null.',

                        callsite: '   1 |// fixture `Fixture`\n' +
                                  '   2 |\n' +
                                  ' > 3 |test(\'Test\', () => {\n' +
                                  '   4 |    return \'yo\';\n' +
                                  '   5 |});'
                    });
                });
        });

        it('Should raise an error if "test.clientScripts" method takes a wrong argument', () => {
            const testfile = resolve('test/server/data/test-suites/custom-client-scripts/test-client-scripts-has-wrong-type.js');

            return compile(testfile)
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'Client script is expected to be a string or a client script initializer, but it was number.',

                        callsite: '   1 |fixture `Fixture`;\n' +
                                  '   2 |\n' +
                                  '   3 |test\n' +
                                  ' > 4 |    .clientScripts(8)\n' +
                                  '   5 |    (\'test\', async t => {});'
                    });
                });
        });

        it('Should raise an error if "test.clientScripts" method calls several times', () => {
            const testfile = resolve('test/server/data/test-suites/custom-client-scripts/test-client-scripts-call-several-times.js');

            return compile(testfile)
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'You cannot call the "clientScripts" method more than once. Pass an array of parameters to this method instead.',

                        callsite: '   1 |fixture `Fixture`;\n' +
                                  '   2 |\n' +
                                  '   3 |test\n' +
                                  '   4 |    .clientScripts(\'script1.js\')\n' +
                                  ' > 5 |    .clientScripts(\'script2.js\')\n' +
                                  '   6 |    (\'test\', async t => {});\n' +
                                  '   7 |'
                    });
                });
        });
    });

    describe('Selector', function () {
        it('Should raise an error if Selector initialized with wrong type', function () {
            const testfile = resolve('test/server/data/test-suites/selector-arg-is-not-a-function-or-string/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'Selector is expected to be initialized with a function, CSS selector string, another Selector, ' +
                                 'node snapshot or a Promise returned by a Selector, but number was passed.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |Selector(123);\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});\n' +
                                  '   9 |'
                    });
                });
        });

        it('Should raise an error if Selector `visibilityCheck` option is not a boolean value', function () {
            const testfile = resolve('test/server/data/test-suites/selector-visibility-check-opt-not-bool/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"visibilityCheck" option is expected to be a boolean, but it was number.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |Selector(() => {}).with({ visibilityCheck: 42 });\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

        it('Should raise an error if Selector `timeout` option is not a non-negative number', function () {
            const testfile = resolve('test/server/data/test-suites/selector-timeout-is-not-non-negative-value/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"timeout" option is expected to be a non-negative number, but it was -5.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |Selector(() => {}).with({ timeout: -5 });\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

        it('Should raise `it was NaN` error if Selector.nth() `index` argument is NaN', function () {
            const testfile = resolve('test/server/data/test-suites/selector-nth-arg-is-nan-value/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"index" argument is expected to be a number, but it was NaN.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |Selector(() => {}).nth(NaN);\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

        it('Should raise `it was Infinity` error if Selector.nth() `index` argument is Infinity', function () {
            const testfile = resolve('test/server/data/test-suites/selector-nth-arg-is-infinity-value/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"index" argument is expected to be a number, but it was Infinity.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |Selector(() => {}).nth(Infinity);\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

        it('Should raise an error if Selector.nth() `index` argument is not a number', function () {
            const testfile = resolve('test/server/data/test-suites/selector-nth-arg-is-a-number-value/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"index" argument is expected to be a number, but it was string.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |Selector(() => {}).nth(\'hey\');\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

        it('Should raise an error if Selector.withText `text` argument is not a RegExp or string', function () {
            const testfile = resolve('test/server/data/test-suites/selector-with-text-arg-is-not-regexp-or-string/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"text" argument is expected to be a string or a regular expression, but it was object.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |Selector(() => {}).withText({});\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

        it('Should raise an error if Selector.withAttribute `attrName` argument is not a RegExp or string', function () {
            const testfile = resolve('test/server/data/test-suites/selector-with-attr-arg-is-not-regexp-or-string/attrName.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"attrName" argument is expected to be a string or a regular expression, but it was object.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |Selector(() => {}).withAttribute(null);\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

        it('Should raise an error if Selector.withAttribute `attrValue` argument is not a RegExp or string', function () {
            const testfile = resolve('test/server/data/test-suites/selector-with-attr-arg-is-not-regexp-or-string/attrValue.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"attrValue" argument is expected to be a string or a regular expression, but it was number.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |Selector(() => {}).withAttribute(/class/, -100);\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

        it('Should raise an error if Selector.filter `filter` argument is not a function or string', function () {
            const testfile = resolve('test/server/data/test-suites/selector-filter-arg-is-not-a-function-or-string/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"filter" argument is expected to be a string or a function, but it was object.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  " > 5 |Selector('span').filter({});\n" +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

        it('Should raise an error if Selector.find `filter` argument is not a function or string', function () {
            const testfile = resolve('test/server/data/test-suites/selector-find-arg-is-not-a-string-or-function/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"filter" argument is expected to be a string or a function, but it was object.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |Selector(\'span\').find({});\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

        it('Should raise an error if Selector.parent `filter` argument is not a function or string', function () {
            const testfile = resolve('test/server/data/test-suites/selector-parent-incorrect-arg-type/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"filter" argument is expected to be a string, function or a number, but it was object.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |Selector(\'span\').parent();\n' +
                                  ' > 5 |Selector(\'span\').parent({});\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

        it('Should raise an error if Selector.child `filter` argument is not a function or string', function () {
            const testfile = resolve('test/server/data/test-suites/selector-child-incorrect-arg-type/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"filter" argument is expected to be a string, function or a number, but it was object.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |Selector(\'span\').child();\n' +
                                  ' > 5 |Selector(\'span\').child({});\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

        it('Should raise an error if Selector.sibling `filter` argument is not a function or string', function () {
            const testfile = resolve('test/server/data/test-suites/selector-sibling-incorrect-arg-type/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"filter" argument is expected to be a string, function or a number, but it was object.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |Selector(\'span\').sibling();\n' +
                                  ' > 5 |Selector(\'span\').sibling({});\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

        it('Should raise an error if Selector.nextSibling `filter` argument is not a function or string', function () {
            const testfile = resolve('test/server/data/test-suites/selector-next-sibling-incorrect-arg-type/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"filter" argument is expected to be a string, function or a number, but it was object.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |Selector(\'span\').nextSibling();\n' +
                                  ' > 5 |Selector(\'span\').nextSibling({});\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });


        it('Should raise an error if Selector.prevSibling `filter` argument is not a function or string', function () {
            const testfile = resolve('test/server/data/test-suites/selector-prev-sibling-incorrect-arg-type/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"filter" argument is expected to be a string, function or a number, but it was object.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |Selector(\'span\').prevSibling();\n' +
                                  ' > 5 |Selector(\'span\').prevSibling({});\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

        it('Should raise an error if Selector.addCustomDOMProperties argument is not object', function () {
            const testfile = resolve('test/server/data/test-suites/selector-add-custom-dom-properties-incorrect-arg-type/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"addCustomDOMProperties" option is expected to be a non-null object, but it was number.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  "   4 |Selector('span').addCustomDOMProperties({a: () => {}});\n" +
                                  " > 5 |Selector('span').addCustomDOMProperties(42);\n" +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});\n' +
                                  '   9 |'
                    });
                });
        });

        it('Should raise error if at least one of Selector custom DOM properties is not function', function () {
            const testfile = resolve('test/server/data/test-suites/selector-custom-dom-property-incorrect-arg-type/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 "Custom DOM properties method 'prop1' is expected to be a function, but it was number.",

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  " > 4 |Selector('rect').addCustomDOMProperties({ prop1: 1, prop2: () => 42 });\n" +
                                  '   5 |\n' +
                                  "   6 |test('yo', () => {\n" +
                                  '   7 |});\n' +
                                  '   8 |'
                    });
                });
        });

        it('Should raise error if Selector.addCustomMethods argument is not object', function () {
            const testfile = resolve('test/server/data/test-suites/selector-add-custom-methods-incorrect-arg-type/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"addCustomMethods" option is expected to be a non-null object, but it was number.',

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  "   4 |Selector('span').addCustomMethods({a: () => {}});\n" +
                                  " > 5 |Selector('span').addCustomMethods(42);\n" +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});\n' +
                                  '   9 |'
                    });
                });
        });

        it('Should raise error if at least one of custom methods is not function', function () {
            const testfile = resolve('test/server/data/test-suites/selector-custom-dom-method-incorrect-arg-type/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 "Custom method 'prop1' is expected to be a function, but it was number.",

                        callsite: "   1 |import { Selector } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  " > 4 |Selector('span').addCustomMethods({ prop1: 1, prop2: () => 42 });\n" +
                                  '   5 |\n' +
                                  "   6 |test('yo', () => {\n" +
                                  '   7 |});\n' +
                                  '   8 |'
                    });
                });
        });
    });

    describe('ClientFunction', function () {
        it('Should raise an error if ClientFunction argument is not a function', function () {
            const testfile = resolve('test/server/data/test-suites/client-fn-arg-is-not-a-function/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'ClientFunction code is expected to be specified as a function, but number was passed.',

                        callsite: "   1 |import { ClientFunction } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |ClientFunction(123);\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});\n' +
                                  '   9 |'
                    });
                });
        });

        it('Should raise an error if ClientFunction argument is not a function (if called as ctor)', function () {
            const testfile = resolve('test/server/data/test-suites/client-fn-arg-is-not-a-function-as-ctor/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'ClientFunction code is expected to be specified as a function, but number was passed.',

                        callsite: "   1 |import { ClientFunction } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |var h = new ClientFunction(123);\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});\n' +
                                  '   9 |'
                    });
                });
        });

        it('Should raise an error if ClientFunction uses async function', function () {
            const testfile = resolve('test/server/data/test-suites/async-function-in-client-fn/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'ClientFunction code, arguments or dependencies cannot contain generators or "async/await" syntax (use Promises instead).',

                        callsite: "    1 |import { ClientFunction } from 'testcafe';\n" +
                                  '    2 |\n' +
                                  '    3 |fixture `Test`;\n' +
                                  '    4 |\n' +
                                  ' >  5 |ClientFunction(async function () {\n' +
                                  '    6 |});\n' +
                                  '    7 |\n' +
                                  "    8 |test('yo', () => {\n" +
                                  '    9 |});\n'
                    });
                });
        });

        it('Should raise an error if ClientFunction uses generator', function () {
            const testfile = resolve('test/server/data/test-suites/generator-in-client-fn/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'ClientFunction code, arguments or dependencies cannot contain generators or "async/await" syntax (use Promises instead).',

                        callsite: "    1 |import { ClientFunction } from 'testcafe';\n" +
                                  '    2 |\n' +
                                  '    3 |fixture `Test`;\n' +
                                  '    4 |\n' +
                                  ' >  5 |ClientFunction(function* () {\n' +
                                  '    6 |    yield 1;\n' +
                                  '    7 |});\n' +
                                  '    8 |\n' +
                                  "    9 |test('yo', () => {\n" +
                                  '   10 |});'
                    });
                });
        });

        it('Should raise an error if ClientFunction options is not an object', function () {
            const testfile = resolve('test/server/data/test-suites/client-fn-options-not-object/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"options" argument is expected to be a non-null object, but it was number.',

                        callsite: "   1 |import { ClientFunction } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |ClientFunction(() => {}).with(123);\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});\n'
                    });
                });
        });

        it('Should raise an error if ClientFunction "dependencies" is not an object', function () {
            const testfile = resolve('test/server/data/test-suites/client-fn-dependencies-not-object/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"dependencies" option is expected to be a non-null object, but it was string.',

                        callsite: "   1 |import { ClientFunction } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  " > 5 |var selectYo = ClientFunction(() => document.querySelector('#yo'), { dependencies: '42' });\n"
                    });
                });
        });

        it('Should raise an error if ClientFunction `boundTestRun` option is not TestController', function () {
            const testfile = resolve('test/server/data/test-suites/client-fn-bound-test-run-not-t/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'The "boundTestRun" option value is expected to be a test controller.',

                        callsite: "   1 |import { ClientFunction } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  " > 5 |ClientFunction(() => {}).with({ boundTestRun: 'yo' });\n" +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});'
                    });
                });
        });

    });

    describe('Role', function () {
        it('Should raise an error if Role "loginUrl" is not a string', function () {
            const testfile = resolve('test/server/data/test-suites/role-login-page-is-not-a-string/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"loginUrl" argument is expected to be a string, but it was number.',

                        callsite: "   1 |import { Role } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |Role(123, () => {});\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});\n' +
                                  '   9 |'
                    });
                });
        });

        it('Should raise an error if Role "initFn" is not a string', function () {
            const testfile = resolve('test/server/data/test-suites/role-init-fn-is-not-a-function/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"initFn" argument is expected to be a function, but it was number.',

                        callsite: "   1 |import { Role } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  " > 5 |Role('exampe.com', 123);\n" +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});\n' +
                                  '   9 |'
                    });
                });
        });

        it('Should raise an error if Role "options" is not an object', function () {
            const testfile = resolve('test/server/data/test-suites/role-options-is-not-an-object/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"options" argument is expected to be a non-null object, but it was string.',

                        callsite: "   1 |import { Role } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  " > 5 |Role('http://example.com', () => {}, 'hey');\n" +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});\n' +
                                  '   9 |'
                    });
                });
        });

        it('Should raise an error if Role "option.preserveUrl" is not a boolean', function () {
            const testfile = resolve('test/server/data/test-suites/role-preserve-url-option-is-not-a-boolean/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 '"preserveUrl" option is expected to be a boolean, but it was object.',

                        callsite: "   1 |import { Role } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  " > 5 |Role('http://example.com', () => {}, { preserveUrl: [] });\n" +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});\n' +
                                  '   9 |'
                    });
                });
        });
    });

    describe('TestController import', function () {
        it('Should raise an error if TestControllerProxy cannot resolve test run', function () {
            const testfile = resolve('test/server/data/test-suites/cannot-resolve-test-run-proxy-context/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 "Cannot implicitly resolve the test run in the context of which the test controller action should be executed. Use test function's 't' argument instead.",

                        callsite: '    1 |import { t } from \'testcafe\';\n' +
                                  '    2 |\n' +
                                  '    3 |fixture `Some fixture`;\n' +
                                  '    4 |\n' +
                                  ' >  5 |t.click(\'div\');\n' +
                                  '    6 |\n' +
                                  '    7 |test(\'Some test\', async () => {\n' +
                                  '    8 |\n' +
                                  '    9 |});'
                    });
                });
        });
    });

    describe('Request Hooks', () => {
        describe('Should raise errors for wrong RequestLogger construction', () => {
            it('Cannot stringify the request body', () => {
                const testFile = resolve('test/server/data/test-suites/request-hooks/request-logger/cannot-stringify-request-body.js');

                return compile(testFile)
                    .then(() => {
                        throw new Error('Promise rejection expected');
                    })
                    .catch(err => {
                        assertAPIError(err, {
                            stackTop: testFile,

                            message: 'Cannot prepare tests due to an error.\n\n' +
                                     'There was an error while configuring the request hook:\n\n' +
                                     'RequestLogger: Cannot stringify the request body because it is not logged. Specify { logRequestBody: true } in log options.',

                            callsite: '    1 |import { RequestLogger } from \'testcafe\';\n' +
                                      '    2 |\n' +
                                      '    3 |fixture `Fixture`;\n' +
                                      '    4 |\n' +
                                      " >  5 |const logger = new RequestLogger('', {\n" +
                                      '    6 |    logRequestBody:       false,\n' +
                                      '    7 |    stringifyRequestBody: true\n' +
                                      '    8 |});'
                        });
                    });
            });

            it('Cannot stringify the response body', () => {
                const testFile = resolve('test/server/data/test-suites/request-hooks/request-logger/cannot-stringify-response-body.js');

                return compile(testFile)
                    .then(() => {
                        throw new Error('Promise rejection expected');
                    })
                    .catch(err => {
                        assertAPIError(err, {
                            stackTop: testFile,

                            message: 'Cannot prepare tests due to an error.\n\n' +
                                     'There was an error while configuring the request hook:\n\n' +
                                     'RequestLogger: Cannot stringify the response body because it is not logged. Specify { logResponseBody: true } in log options.',

                            callsite: '    1 |import { RequestLogger } from \'testcafe\';\n' +
                                      '    2 |\n' +
                                      '    3 |fixture `Fixture`;\n' +
                                      '    4 |\n' +
                                      " >  5 |const logger = new RequestLogger('', {\n" +
                                      '    6 |    logResponseBody:       false,\n' +
                                      '    7 |    stringifyResponseBody: true\n' +
                                      '    8 |});'
                        });
                    });
            });
        });

        describe('Should raise errors for wrong RequestMock api order call', () => {
            it("The 'respond' method was not called after 'onRequestTo'", () => {
                const testFile = resolve('test/server/data/test-suites/request-hooks/request-mock/respond-was-not-called-after-on-request-to.js');

                return compile(testFile)
                    .then(() => {
                        throw new Error('Promise rejection expected');
                    })
                    .catch(err => {
                        assertAPIError(err, {
                            stackTop: testFile,

                            message: 'Cannot prepare tests due to an error.\n\n' +
                                     'There was an error while configuring the request hook:\n\n' +
                                     "RequestMock: The 'respond' method was not called after 'onRequestTo'. You must call the 'respond' method to provide the mocked response.",

                            callsite: '   1 |import { RequestMock } from \'testcafe\';\n' +
                                      '   2 |\n' +
                                      '   3 |fixture `Fixture`;\n' +
                                      '   4 |\n' +
                                      ' > 5 |const mock = RequestMock().onRequestTo({}).onRequestTo({});\n' +
                                      '   6 |\n' +
                                      '   7 |test(\'test\', async t => {});\n' +
                                      '   8 |\n'
                        });
                    });
            });

            it("The 'onRequestTo' method was not called before 'respond'", () => {
                const testFile = resolve('test/server/data/test-suites/request-hooks/request-mock/on-request-to-was-not-called-before-respond.js');

                return compile(testFile)
                    .then(() => {
                        throw new Error('Promise rejection expected');
                    })
                    .catch(err => {
                        assertAPIError(err, {
                            stackTop: testFile,

                            message: 'Cannot prepare tests due to an error.\n\n' +
                                     'There was an error while configuring the request hook:\n\n' +
                                     "RequestMock: The 'onRequestTo' method was not called before 'respond'. You must call the 'onRequestTo' method to provide the URL requests to which are mocked.",

                            callsite: '   1 |import { RequestMock } from \'testcafe\';\n' +
                                      '   2 |\n' +
                                      '   3 |fixture `Fixture`;\n' +
                                      '   4 |\n' +
                                      ' > 5 |const mock = RequestMock().respond(() => {}).onRequestTo({});\n' +
                                      '   6 |\n' +
                                      '   7 |test(\'test\', async t => {});\n' +
                                      '   8 |'
                        });
                    });
            });
        });
    });

    describe('createTestCafe', () => {
        it('Should accept configuration as an arguments array', async () => {
            const TestCafe = sinon.stub().returns({});

            const createTestCafe = proxyquire('../..', {
                './testcafe':      TestCafe,
                'async-exit-hook': () => {},

                'endpoint-utils': {
                    isMyHostname: sinon.stub().resolves(true),
                    isFreePort:   sinon.stub().resolves(true)
                }
            });

            await createTestCafe('my-host', 1337, 1338, { test: 42 }, true, true);

            const configuration = TestCafe.firstCall.args[0];

            expect(configuration.getOption(OPTION_NAMES.hostname)).equal('my-host');
            expect(configuration.getOption(OPTION_NAMES.port1)).equal(1337);
            expect(configuration.getOption(OPTION_NAMES.port2)).equal(1338);
            expect(configuration.getOption(OPTION_NAMES.ssl)).deep.equal({ test: 42 });
            expect(configuration.getOption(OPTION_NAMES.developmentMode)).be.true;
            expect(configuration.getOption(OPTION_NAMES.retryTestPages)).be.true;

        });

        it('Should accept configuration as an object', async () => {
            const TestCafe = sinon.stub().returns({});

            const createTestCafe = proxyquire('../..', {
                './testcafe':      TestCafe,
                'async-exit-hook': () => {},

                'endpoint-utils': {
                    isMyHostname: sinon.stub().resolves(true),
                    isFreePort:   sinon.stub().resolves(true)
                }
            });

            await createTestCafe({
                hostname: 'my-host',
                port1:    1337,
                port2:    1338,

                ssl: {
                    test: 42
                },

                developmentMode: true,
                retryTestPages:  true
            });

            const configuration = TestCafe.firstCall.args[0];

            expect(configuration.getOption(OPTION_NAMES.hostname)).equal('my-host');
            expect(configuration.getOption(OPTION_NAMES.port1)).equal(1337);
            expect(configuration.getOption(OPTION_NAMES.port2)).equal(1338);
            expect(configuration.getOption(OPTION_NAMES.ssl)).deep.equal({ test: 42 });
            expect(configuration.getOption(OPTION_NAMES.developmentMode)).be.true;
            expect(configuration.getOption(OPTION_NAMES.retryTestPages)).be.true;
        });
    });
});
