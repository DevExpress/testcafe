var expect            = require('chai').expect;
var resolve           = require('path').resolve;
var readFile          = require('fs').readFileSync;
var Promise           = require('pinkie');
var renderers         = require('callsite-record').renderers;
var ERR_TYPE          = require('../../lib/errors/test-run/type');
var exportableLib     = require('../../lib/api/exportable-lib');
var NODE_VER          = require('../../lib/utils/node-version');
var createStackFilter = require('../../lib/errors/create-stack-filter.js');
var assertError       = require('./helpers/assert-error').assertError;
var compile           = require('./helpers/compile');

describe('Compiler', function () {
    var testRunMock = { id: 'yo' };

    this.timeout(20000);

    // FIXME: Babel errors always contain POSIX-format file paths.
    function posixResolve (path) {
        return resolve(path).replace(new RegExp('\\\\', 'g'), '/');
    }

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
                expect(compiled.tests[0].meta).eql({ run: 'run-001' });
                expect(compiled.tests[0].isLegacy).to.be.undefined;

                expect(compiled.tests[1].name).eql('2.LegacyTest');
                expect(compiled.tests[1].isLegacy).to.be.true;
            });
    });

    describe('ES-next', function () {
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

        it('Should provide exportable lib dep', function () {
            return compile('test/server/data/test-suites/exportable-lib-dep/testfile.js')
                .then(function (compiled) {
                    return compiled.tests[0].fn(testRunMock);
                })
                .then(function (result) {
                    expect(result.exportableLibsEql).to.be.true;
                    expect(result.exportableLib).eql(exportableLib);
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

        it('Should strip Flow type declarations if a marker comment presents', function () {
            return compile('test/server/data/test-suites/flow-type-declarations/testfile.js')
                .then(function (compiled) {
                    return compiled.tests[0].fn(testRunMock);
                })
                .then(function (results) {
                    expect(results.repeated1).to.equal('yoyoyoyoyoyoyoyoyoyoyoyoyo');
                    expect(results.repeated2).to.equal('yoyoyoyoyoyoyoyoyoyoyoyoyo');
                    expect(results.length).to.equal(5);
                    expect(results.launchStatus).to.equal('Rocket launched succesfully!');
                    expect(results.cash).to.equal('1000000 USD');
                    expect(results.inventory).to.equal('42 yoyo');
                });
        });
    });


    describe('TypeScript', function () {
        it('Should compile test files and their dependencies', function () {
            var sources = [
                'test/server/data/test-suites/typescript-basic/testfile1.ts',
                'test/server/data/test-suites/typescript-basic/testfile2.ts'
            ];

            return compile(sources)
                .then(function (compiled) {
                    var testfile1 = resolve('test/server/data/test-suites/typescript-basic/testfile1.ts');
                    var testfile2 = resolve('test/server/data/test-suites/typescript-basic/testfile2.ts');
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

        it('Should compile mixed dependencies', function () {
            return compile('test/server/data/test-suites/typescript-mixed-dep/testfile.ts')
                .then(function (compiled) {
                    return compiled.tests[0].fn(testRunMock);
                })
                .then(function (results) {
                    expect(results).eql([8, 8]);
                });
        });

        it('Should provide API definitions', function () {
            var src = [
                'test/server/data/test-suites/typescript-defs/structure.ts',
                'test/server/data/test-suites/typescript-defs/selectors.ts',
                'test/server/data/test-suites/typescript-defs/client-functions.ts',
                'test/server/data/test-suites/typescript-defs/roles.ts',
                'test/server/data/test-suites/typescript-defs/test-controller.ts'
            ];

            return compile(src).then(function (compiled) {
                expect(compiled.tests.length).gt(0);
            });
        });

        it('Should provide exportable lib dep', function () {
            return compile('test/server/data/test-suites/typescript-exportable-lib-dep/testfile.ts')
                .then(function (compiled) {
                    return compiled.tests[0].fn(testRunMock);
                })
                .then(function (result) {
                    expect(result.exportableLib).eql(exportableLib);
                    expect(result.exportableLib).eql(result.exportableLibInDep);
                });
        });

    });


    describe('RAW file', function () {
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
            var testfile1 = resolve('test/server/data/test-suites/raw/invalid.testcafe');
            var testfile2 = resolve('test/server/data/test-suites/raw/invalid2.testcafe');

            return compile(testfile1)
                .then(function () {
                    throw new Error('Promise rejection is expected');
                })
                .catch(function (err) {
                    expect(err.message).contains('Cannot parse a test source file in the raw format at "' + testfile1 +
                                                 '" due to an error.\n\n' +
                                                 'SyntaxError: Unexpected token i');
                })
                .then(function () {
                    return compile(testfile2);
                })
                .then(function () {
                    throw new Error('Promise rejection is expected');
                })
                .catch(function (err) {
                    expect(err.message).contains('Cannot parse a test source file in the raw format at "' + testfile2 +
                                                 '" due to an error.\n\n');
                });
        });

        describe('test.fn()', function () {
            var TestRunMock = function (expectedError) {
                this.id            = 'PPBqWA9';
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
                    .catch(function (errList) {
                        expect(errList.items[0].type).eql(ERR_TYPE.uncaughtErrorInTestCode);
                        expect(errList.items[0].errMsg).contains('test-error');
                        expect(testRun.commands.length).eql(1);
                    });
            });
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

        describe('Regression', function () {
            it('Should compile ES6 object method (GH-1279)', function () {
                return testClientFnCompilation('gh1279');
            });
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
                                 'SyntaxError: ' + dep + ': Unexpected token, expected { (1:7)'
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
                                 'SyntaxError: ' + testfile + ': Unexpected token, expected { (1:7)'
                    });
                });
        });

        it('Should raise an error if test file has Flow syntax without a marker comment', function () {
            var testfiles = [
                posixResolve('test/server/data/test-suites/flow-type-declarations/no-flow-marker.js'),
                posixResolve('test/server/data/test-suites/flow-type-declarations/flower-marker.js')
            ];

            return compile(testfiles[0])
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: null,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'SyntaxError: ' + testfiles[0] + ': Unexpected token, expected ; (1:8)'
                    });

                    return compile(testfiles[1]);
                })
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: null,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'SyntaxError: ' + testfiles[1] + ': Unexpected token, expected ; (2:8)'
                    });
                });
        });

        it('Should raise an error if test file has a TypeScript error', function () {
            var testfile = posixResolve('test/server/data/test-suites/typescript-compile-errors/testfile.ts');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: null,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'Error: TypeScript compilation failed.\n' +
                                 testfile + ' (6, 13): Property \'doSmthg\' does not exist on type \'TestController\'.\n' +
                                 testfile + ' (9, 6): Argument of type \'123\' is not assignable to parameter of type \'string\'.\n' +
                                 testfile + ' (18, 5): Unable to resolve signature of property decorator when called as an expression.\n'
                    });
                });
        });

    });


    describe('Regression', function () {
        it('Incorrect callsite line in error report on node v0.10.41 (GH-599)', function () {
            return compile('test/server/data/test-suites/regression-gh-599/testfile.js')
                .then(function (compiled) {
                    return compiled.tests[0].fn(testRunMock);
                })
                .then(function () {
                    throw 'Promise rejection expected';
                })
                .catch(function (errList) {
                    var callsite = errList.items[0].callsite.renderSync({ renderer: renderers.noColor });

                    expect(callsite).contains(' > 19 |        .method1()\n');
                });
        });

        it('Should successfully compile tests if re-export is used', function () {
            return compile('test/server/data/test-suites/regression-gh-969/testfile.js')
                .then(function (compiled) {
                    return compiled.tests[0].fn(testRunMock);
                });
        });

        it('Incorrect callsite stack in error report if "import" is used (GH-1226)', function () {
            return compile('test/server/data/test-suites/regression-gh-1226/testfile.js')
                .then(function (compiled) {
                    return compiled.tests[0].fn(testRunMock);
                })
                .then(function () {
                    throw 'Promise rejection expected';
                })
                .catch(function (errList) {
                    var stackTraceLimit = 200;
                    var err             = errList.items[0];
                    var stack           = err.callsite.stackFrames.filter(createStackFilter(stackTraceLimit));

                    expect(stack.length).eql(3);
                    expect(stack[0].source).to.have.string('helper.js');
                    expect(stack[1].source).to.have.string('helper.js');
                    expect(stack[2].source).to.have.string('testfile.js');
                });
        });
    });
});
