var expect      = require('chai').expect;
var resolve     = require('path').resolve;
var sep         = require('path').sep;
var readFile    = require('fs').readFileSync;
var Promise     = require('pinkie');
var stackParser = require('error-stack-parser');
var stripAnsi   = require('strip-ansi');
var sortBy      = require('lodash').sortBy;
var Compiler    = require('../../lib/compiler');
var commonAPI   = require('../../lib/api/common');
var NODE_VER    = require('../../lib/utils/node-version');

describe('Compiler', function () {
    var testRunMock = { id: 'yo' };

    this.timeout(20000);

    // FIXME: Babel errors always contain POSIX-format file paths.
    function posixResolve (path) {
        return resolve(path).replace(new RegExp('\\\\', 'g'), '/');
    }

    function compile (sources) {
        sources = Array.isArray(sources) ? sources : [sources];

        sources = sources.map(function (filename) {
            return resolve(filename);
        });

        var compiler = new Compiler(sources);

        return compiler.getTests()
            .then(function (tests) {
                var fixtures = tests
                    .reduce(function (fxtrs, test) {
                        if (fxtrs.indexOf(test.fixture) < 0)
                            fxtrs.push(test.fixture);

                        return fxtrs;
                    }, []);

                return {
                    tests:    sortBy(tests, 'name'),
                    fixtures: sortBy(fixtures, 'name')
                };
            });
    }


    function assertError (err, expected) {
        expect(err.message).eql(expected.message);
        expect(err.stack.indexOf(expected.message)).eql(0);

        assertStack(err, expected);
    }

    function assertAPIError (err, expected) {
        assertError(err, expected);

        expect(err.stack.indexOf(expected.message + '\n\n' + expected.callsite)).eql(0);
        expect(stripAnsi(err.coloredStack)).eql(err.stack);
    }

    function assertStack (err, expected) {
        // HACK: stackParser can't handle empty stacks correctly
        // (it treats error messages as stack frames).
        // Therefore we add this dummy stack frame to make things work
        if (!expected.stackTop)
            err.stack += '\n    at (<empty-marker>:1:1)';

        var parsedStack = stackParser.parse(err);

        if (expected.stackTop) {
            var expectedStackTop = Array.isArray(expected.stackTop) ? expected.stackTop : [expected.stackTop];

            parsedStack.forEach(function (frame, idx) {
                var filename   = frame.fileName;
                var isInternal = frame.fileName.indexOf('internal/') === 0 ||
                                 frame.fileName.indexOf(sep) < 0;

                // NOTE: assert that stack is clean from internals
                expect(isInternal).to.be.false;
                expect(filename).not.to.contain(sep + 'babel-');
                expect(filename).not.to.contain(sep + 'babylon' + sep);
                expect(filename).not.to.contain(sep + 'core-js' + sep);

                if (expectedStackTop[idx])
                    expect(filename).eql(expectedStackTop[idx]);
            });
        }
        else {
            expect(parsedStack.length).eql(1);
            expect(parsedStack[0].fileName).eql('<empty-marker>');
        }
    }

    it('Should compile test files and their dependencies', function () {
        var sources = [
            'test/server/data/test-suites/basic/testfile1.js',
            'test/server/data/test-suites/basic/testfile2.js'
        ];

        return compile(sources)
            .then(function (compiled) {
                var testfile1 = resolve('test/server/data/test-suites/basic/testfile1.js');
                var testfile2 = resolve('test/server/data/test-suites/basic/testfile2.js');
                var tests     = compiled.tests;
                var fixtures  = compiled.fixtures;

                expect(tests.length).eql(4);
                expect(fixtures.length).eql(3);

                expect(fixtures[0].name).eql('Fixture1');
                expect(fixtures[0].path).eql(testfile1);
                expect(fixtures[0].pageUrl).eql('about:blank');

                expect(fixtures[1].name).eql('Fixture2');
                expect(fixtures[1].path).eql(testfile1);
                expect(fixtures[1].pageUrl).eql('http://example.org');

                expect(fixtures[2].name).eql('Fixture3');
                expect(fixtures[2].path).eql(testfile2);
                expect(fixtures[2].pageUrl).eql('https://example.com');

                expect(tests[0].name).eql('Fixture1Test1');
                expect(tests[0].fixture).eql(fixtures[0]);

                expect(tests[1].name).eql('Fixture1Test2');
                expect(tests[1].fixture).eql(fixtures[0]);

                expect(tests[2].name).eql('Fixture2Test1');
                expect(tests[2].fixture).eql(fixtures[1]);

                expect(tests[3].name).eql('Fixture3Test1');
                expect(tests[3].fixture).eql(fixtures[2]);

                return Promise.all(tests.map(function (test) {
                    return test.fn(testRunMock);
                }));
            })
            .then(function (results) {
                expect(results).eql([
                    'F1T1: Hey from dep1',
                    'F1T2',
                    'F2T1',
                    'F3T1: Hey from dep1 and dep2'
                ]);
            });
    });

    it('Should provide common API functions via lib dependency', function () {
        return compile('test/server/data/test-suites/common-runtime-dep/testfile.js')
            .then(function (compiled) {
                return compiled.tests[0].fn(testRunMock);
            })
            .then(function (result) {
                expect(result.commonsEql).to.be.true;
                expect(result.commons).eql(commonAPI);
            });
    });

    it('Should not leak globals to dependencies and test body', function () {
        return compile('test/server/data/test-suites/globals-in-dep/testfile.js')
            .then(function (compiled) {
                return compiled.tests[0].fn(testRunMock);
            })
            .then(function (noLeak) {
                expect(noLeak).to.be.true;
            });
    });

    it('Should compile mixed content', function () {
        var sources = [
            'test/server/data/test-suites/mixed-content/testfile.js',
            'test/server/data/test-suites/mixed-content/legacy.test.js',
            'test/server/data/test-suites/mixed-content/non-testfile.js'
        ];

        return compile(sources)
            .then(function (compiled) {
                expect(compiled.tests.length).eql(2);

                expect(compiled.tests[0].name).eql('1.Test');
                expect(compiled.tests[0].isLegacy).to.be.undefined;

                expect(compiled.tests[1].name).eql('2.LegacyTest');
                expect(compiled.tests[1].isLegacy).to.be.true;
            });
    });

    it('Should gracefully handle fixture pages without protocol', function () {
        return compile('test/server/data/test-suites/fixture-page-without-protocol/testfile.js')
            .then(function (compiled) {
                expect(compiled.tests[0].fixture.pageUrl).eql('http://example.org');
                expect(compiled.tests[1].fixture.pageUrl).eql('http://example.org');
            });
    });

    describe('Client function compilation', function () {
        function normalizeCode (code) {
            return code
                .replace(/(\r\n|\n|\r)/gm, ' ')
                .replace(/'/gm, '"')
                .replace(/\s+/gm, '');
        }

        function getExpected (testDir) {
            if (NODE_VER < 4) {
                try {
                    return readFile(testDir + '/expected-node10.js').toString();
                }
                catch (err) {
                    // NOTE: ignore error - we don't have version-specific data
                }
            }

            return readFile(testDir + '/expected.js').toString();
        }

        function testClientFnCompilation (testName) {
            var testDir  = 'test/server/data/client-fn-compilation/' + testName;
            var src      = testDir + '/testfile.js';
            var expected = getExpected(testDir);

            return compile(src)
                .then(function (compiled) {
                    return compiled.tests[0].fn({ id: 'test' });
                })
                .then(function (compiledClientFn) {
                    expect(normalizeCode(compiledClientFn)).eql(normalizeCode(expected));
                });
        }

        it('Should compile basic client function', function () {
            return testClientFnCompilation('basic');
        });

        it('Should polyfill Babel `Promises` artifacts', function () {
            return testClientFnCompilation('promises');
        });

        it('Should polyfill Babel `Object.keys()` artifacts', function () {
            return testClientFnCompilation('object-keys');
        });

        it('Should polyfill Babel `JSON.stringify()` artifacts', function () {
            return testClientFnCompilation('json-stringify');
        });

        it('Should polyfill Babel `typeof` artifacts', function () {
            return testClientFnCompilation('typeof');
        });
    });

    describe('Errors', function () {
        it("Should raise an error if the specified source file doesn't exists", function () {
            return compile('does/not/exists.js')
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('Cannot find a test source file at "' +
                                            resolve('does/not/exists.js') + '".');
                });
        });

        it('Should raise an error if test dependency has a syntax error', function () {
            var testfile = resolve('test/server/data/test-suites/syntax-error-in-dep/testfile.js');
            var dep      = posixResolve('test/server/data/test-suites/syntax-error-in-dep/dep.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'SyntaxError: ' + dep + ': Unexpected token (1:7)'
                    });
                });
        });

        it("Should raise an error if dependency can't require a module", function () {
            var testfile = resolve('test/server/data/test-suites/require-error-in-dep/testfile.js');
            var dep      = resolve('test/server/data/test-suites/require-error-in-dep/dep.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: [
                            dep,
                            testfile
                        ],

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 "Error: Cannot find module './yo'"
                    });
                });
        });

        it('Should raise an error if dependency throws runtime error', function () {
            var testfile = resolve('test/server/data/test-suites/runtime-error-in-dep/testfile.js');
            var dep      = resolve('test/server/data/test-suites/runtime-error-in-dep/dep.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: [
                            dep,
                            testfile
                        ],

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'Error: Hey ya!'
                    });
                });
        });

        it('Should raise an error if test file has a syntax error', function () {
            var testfile = posixResolve('test/server/data/test-suites/syntax-error-in-testfile/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: null,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'SyntaxError: ' + testfile + ': Unexpected token (1:7)'
                    });
                });
        });

        it("Should raise an error if test file can't require a module", function () {
            var testfile = resolve('test/server/data/test-suites/require-error-in-testfile/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 "Error: Cannot find module './yo'"
                    });
                });
        });

        it('Should raise an error if test file throws runtime error', function () {
            var testfile = resolve('test/server/data/test-suites/runtime-error-in-testfile/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'Error: Hey ya!'
                    });
                });
        });

        it('Should raise an error if fixture name is not a string', function () {
            var testfile = resolve('test/server/data/test-suites/fixture-name-is-not-a-string/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'The fixture name is expected to be a string, but it was "object".',

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
            var testfile = resolve('test/server/data/test-suites/fixture-page-is-not-a-string/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'The page URL is expected to be a string, but it was "object".',

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

        it('Should raise an error if test name is not a string', function () {
            var testfile = resolve('test/server/data/test-suites/test-name-is-not-a-string/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'The test name is expected to be a string, but it was "number".',

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
            var testfile = resolve('test/server/data/test-suites/test-body-is-not-a-function/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'The test body is expected to be a function, but it was "string".',

                        callsite: '   1 |fixture `Test body is not a function`;\n' +
                                  '   2 |\n' +
                                  " > 3 |test('Test', 'Yo');\n" +
                                  '   4 |'
                    });
                });
        });

        it('Should raise an error if beforeEach is not a function', function () {
            var testfile = resolve('test/server/data/test-suites/before-each-is-not-a-function/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'Fixture\'s "beforeEach" method takes a function, but "string" was passed.',

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
            var testfile = resolve('test/server/data/test-suites/after-each-is-not-a-function/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'Fixture\'s "afterEach" method takes a function, but "string" was passed.',

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

        it('Should raise an error if ClientFunction argument is not a function', function () {
            var testfile = resolve('test/server/data/test-suites/client-fn-arg-is-not-a-function/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'ClientFunction code is expected to be specified as a function, but "number" was passed.',

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

        it('Should raise an error if Selector argument is not a function or string', function () {
            var testfile = resolve('test/server/data/test-suites/selector-arg-is-not-a-function-or-string/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'Selector code is expected to be specified as a function or string, but "number" was passed.',

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


        it('Should raise an error if ClientFunction argument is not a function (if called as ctor)', function () {
            var testfile = resolve('test/server/data/test-suites/client-fn-arg-is-not-a-function-as-ctor/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'ClientFunction code is expected to be specified as a function, but "number" was passed.',

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


        it('Should raise an error if ClientFunction not able to resolve test run', function () {
            var testfile = resolve('test/server/data/test-suites/client-fn-cant-resolve-test-run/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'ClientFunction cannot implicitly resolve the test run in context of which it ' +
                                 'should be executed. If you need to call ClientFunction from the Node.js API ' +
                                 "callback, pass the test controller manually via ClientFunction's `.with({ boundTestRun: t })` " +
                                 'method first. Note that you cannot execute ClientFunction outside the test code.',

                        callsite: "   1 |import { ClientFunction } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  ' > 5 |ClientFunction(() => 123)();\n' +
                                  '   6 |\n' +
                                  "   7 |test('yo', () => {\n" +
                                  '   8 |});\n' +
                                  '   9 |'
                    });
                });
        });

        it('Should raise an error if ClientFunction uses async function', function () {
            var testfile = resolve('test/server/data/test-suites/async-function-in-client-fn/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'ClientFunction code cannot contain generators or `async/await` syntax (use Promises instead).',

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
            var testfile = resolve('test/server/data/test-suites/generator-in-client-fn/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'ClientFunction code cannot contain generators or `async/await` syntax (use Promises instead).',

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

        it('Should raise an error if ClientFunction dependencies is not an object', function () {
            var testfile = resolve('test/server/data/test-suites/client-fn-deps-not-object/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'ClientFunction "dependencies" argument is expected to be an object, but it was "string".',

                        callsite: "   1 |import { ClientFunction } from 'testcafe';\n" +
                                  '   2 |\n' +
                                  '   3 |fixture `Test`;\n' +
                                  '   4 |\n' +
                                  " > 5 |var selectYo = ClientFunction(() => document.querySelector('#yo'), '42');\n"
                    });
                });
        });

        it('Should raise an error if ClientFunction dependency is not a ClientFunction', function () {
            var testfile = resolve('test/server/data/test-suites/client-fn-dep-not-client-fn/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertAPIError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'ClientFunction dependency "getText" is not a client function.',

                        callsite: '    3 |fixture `Test`;\n' +
                                  '    4 |\n' +
                                  '    5 |const select  = ClientFunction(id => document.querySelector(id));\n' +
                                  "    6 |const getText = '42';\n" +
                                  '    7 |\n' +
                                  " >  8 |var selectYo = ClientFunction(() => select('#yo'), { select, getText });\n"
                    });
                });
        });
    });

    describe('Raw data compiler', function () {
        it('Should compile test files', function () {
            var sources = ['test/server/data/test-suites/raw/test.testcafe'];

            return compile(sources)
                .then(function (compiled) {
                    var testfile = resolve('test/server/data/test-suites/raw/test.testcafe');
                    var tests    = compiled.tests;
                    var fixtures = compiled.fixtures;

                    expect(tests.length).eql(3);
                    expect(fixtures.length).eql(2);

                    expect(fixtures[0].name).eql('Fixture1');
                    expect(fixtures[0].path).eql(testfile);
                    expect(fixtures[0].pageUrl).eql('about:blank');

                    expect(fixtures[1].name).eql('Fixture2');
                    expect(fixtures[1].path).eql(testfile);
                    expect(fixtures[1].pageUrl).eql('http://example.org');

                    expect(tests[0].name).eql('Fixture1Test1');
                    expect(tests[0].fixture).eql(fixtures[0]);

                    expect(tests[1].name).eql('Fixture1Test2');
                    expect(tests[1].fixture).eql(fixtures[0]);

                    expect(tests[2].name).eql('Fixture2Test1');
                    expect(tests[2].fixture).eql(fixtures[1]);
                });
        });

        it('Should raise an error if it cannot parse a raw file', function () {
            var testfile = resolve('test/server/data/test-suites/raw/invalid.testcafe');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection is expected');
                })
                .catch(function (err) {
                    expect(err.message).contains('Cannot parse a test source file in the raw format at "' + testfile +
                                                 '" due to an error.\n\n' +
                                                 'SyntaxError: Unexpected token i');
                });
        });

        describe('test.fn()', function () {
            var TestRunMock = function (expectedError) {
                this.commands      = [];
                this.expectedError = expectedError;
            };

            TestRunMock.prototype.executeCommand = function (command) {
                this.commands.push(command);

                return this.expectedError ? Promise.reject(new Error(this.expectedError)) : Promise.resolve();
            };

            it('Should be resolved if the test passed', function () {
                var sources = ['test/server/data/test-suites/raw/test.testcafe'];
                var test    = null;
                var testRun = new TestRunMock();

                return compile(sources)
                    .then(function (compiled) {
                        test = compiled.tests[0];

                        return test.fn(testRun);
                    })
                    .then(function () {
                        expect(testRun.commands.length).eql(2);
                    });
            });

            it('Should be rejected if the test failed', function () {
                var sources       = ['test/server/data/test-suites/raw/test.testcafe'];
                var expectedError = 'test-error';
                var testRun       = new TestRunMock(expectedError);

                return compile(sources)
                    .then(function (compiled) {
                        return compiled.tests[0].fn(testRun);
                    })
                    .then(function () {
                        throw new Error('Promise rejection is expected');
                    })
                    .catch(function (err) {
                        expect(err.message).eql(expectedError);
                        expect(testRun.commands.length).eql(1);
                    });
            });
        });
    });
});
