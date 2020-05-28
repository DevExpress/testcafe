const { exec }            = require('child_process');
const fs                  = require('fs');
const os                  = require('os');
const path                = require('path');
const { promisify }       = require('util');
const expect              = require('chai').expect;
const proxyquire          = require('proxyquire');
const sinon               = require('sinon');
const globby              = require('globby');
const nanoid              = require('nanoid');
const { TEST_RUN_ERRORS } = require('../../lib/errors/types');
const exportableLib       = require('../../lib/api/exportable-lib');
const createStackFilter   = require('../../lib/errors/create-stack-filter.js');
const assertError         = require('./helpers/assert-runtime-error').assertError;
const compile             = require('./helpers/compile');


const copy   = promisify(fs.copyFile);
const remove = promisify(fs.unlink);


require('source-map-support').install();

describe('Compiler', function () {
    const testRunMock = { id: 'yo' };

    const tsCompilerPath     = path.resolve('src/compiler/test-file/formats/typescript/compiler.ts');
    const apiBasedPath       = path.resolve('src/compiler/test-file/api-based.js');
    const esNextCompilerPath = path.resolve('src/compiler/test-file/formats/es-next/compiler.js');

    this.timeout(20000);

    // FIXME: Babel errors always contain POSIX-format file paths.
    function posixResolve (pathname) {
        return path.resolve(pathname).replace(new RegExp('\\\\', 'g'), '/');
    }

    it('Should compile mixed content', function () {
        const sources = [
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
        it('Should compile test defined in separate module if option is enabled', function () {
            const sources = [
                'test/server/data/test-suites/test-as-module/with-tests/testfile.js'
            ];

            return compile(sources, true)
                .then(function (compiled) {
                    const tests    = compiled.tests;
                    const fixtures = compiled.fixtures;

                    expect(tests.length).eql(1);
                    expect(fixtures.length).eql(1);

                    expect(tests[0].name).eql('test');
                    expect(fixtures[0].name).eql('Library tests');
                });
        });

        it('Should compile test files and their dependencies', function () {
            const sources = [
                'test/server/data/test-suites/basic/testfile1.js',
                'test/server/data/test-suites/basic/testfile2.js'
            ];

            return compile(sources)
                .then(function (compiled) {
                    const testfile1 = path.resolve('test/server/data/test-suites/basic/testfile1.js');
                    const testfile2 = path.resolve('test/server/data/test-suites/basic/testfile2.js');
                    const tests     = compiled.tests;
                    const fixtures  = compiled.fixtures;

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

        it('Should compile basic JSX', async function () {
            const sources = [
                'test/server/data/test-suites/compile-react/testfile.jsx'
            ];

            const compiled = await compile(sources);

            const testfile = path.resolve('test/server/data/test-suites/compile-react/testfile.jsx');
            const tests    = compiled.tests;
            const fixtures = compiled.fixtures;

            expect(tests.length).eql(1);
            expect(fixtures.length).eql(1);

            expect(fixtures[0].name).eql('JSX');
            expect(fixtures[0].path).eql(testfile);
            expect(fixtures[0].pageUrl).eql('about:blank');

            expect(tests[0].name).eql('Test React');
            expect(tests[0].fixture).eql(fixtures[0]);

            const results = await tests[0].fn(testRunMock);

            expect(results.type).eql('h2');
            expect(results.props.children).eql('Hello React');
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
        it('Should compile test defined in separate module if option is enabled', function () {
            const sources = [
                'test/server/data/test-suites/test-as-module/with-tests/testfile.ts'
            ];

            return compile(sources, true)
                .then(function (compiled) {
                    const tests    = compiled.tests;
                    const fixtures = compiled.fixtures;

                    expect(tests.length).eql(1);
                    expect(fixtures.length).eql(1);

                    expect(tests[0].name).eql('test');
                    expect(fixtures[0].name).eql('Library tests');
                });
        });

        it('Should compile test files and their dependencies', function () {
            const sources = [
                'test/server/data/test-suites/typescript-basic/testfile1.ts',
                'test/server/data/test-suites/typescript-basic/testfile2.ts'
            ];

            return compile(sources)
                .then(function (compiled) {
                    const testfile1 = path.resolve('test/server/data/test-suites/typescript-basic/testfile1.ts');
                    const testfile2 = path.resolve('test/server/data/test-suites/typescript-basic/testfile2.ts');
                    const tests     = compiled.tests;
                    const fixtures  = compiled.fixtures;

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

        it('Should compile basic TSX', async function () {
            const sources = [
                'test/server/data/test-suites/compile-react/testfile.tsx'
            ];

            const compiled = await compile(sources);

            const testfile = path.resolve('test/server/data/test-suites/compile-react/testfile.tsx');
            const tests    = compiled.tests;
            const fixtures = compiled.fixtures;

            expect(tests.length).eql(1);
            expect(fixtures.length).eql(1);

            expect(fixtures[0].name).eql('TSX');
            expect(fixtures[0].path).eql(testfile);
            expect(fixtures[0].pageUrl).eql('about:blank');

            expect(tests[0].name).eql('Test React');
            expect(tests[0].fixture).eql(fixtures[0]);

            const results = await tests[0].fn(testRunMock);

            expect(results.type).eql('h2');
            expect(results.props.children).eql('Hello React');
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

        it('Should complile ts-definitions successfully with the `--strict` option enabled', function () {
            this.timeout(60000);

            const tscPath  = path.resolve('node_modules/.bin/tsc');
            const defsPath = path.resolve('ts-defs/index.d.ts');
            const args     = '--strict';
            const command  = `${tscPath} ${defsPath} ${args} --target ES6 --noEmit`;

            return new Promise(resolve => {
                exec(command, (error, stdout) => {
                    resolve({ error, stdout });
                });
            }).then(value => {
                expect(value.stdout).eql('');
                expect(value.error).is.null;
            });
        });

        it('Should provide API definitions', function () {
            this.timeout(60000);

            const typescriptDefsFolder = 'test/server/data/test-suites/typescript-defs/';
            const src                  = [];

            fs.readdirSync(typescriptDefsFolder).forEach(file => {
                src.push(path.join(typescriptDefsFolder, file));
            });

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

        it('Should import pure TypeScript dependency module', () => {
            return compile('test/server/data/test-suites/typescript-pure-ts-module-dep/testfile.ts')
                .then(function (compiled) {
                    return compiled.tests[0].fn(testRunMock);
                })
                .then(function (result) {
                    expect(result.exportableLib).eql(exportableLib);
                    expect(result.exportableLib).eql(result.exportableLibInDep);
                });
        });

        it('Should start and terminate runner w/out errors', () => {
            return compile('test/server/data/test-suites/typescript-runner/runner.ts')
                .then(function (compiled) {
                    expect(compiled.tests.length).gt(0);
                });
        });

        it('Should not recompile cached files', async () => {
            const ts            = require('typescript');
            const createProgram = sinon.stub().callsFake(ts.createProgram);

            const TSCompiler = proxyquire('../../lib/compiler/test-file/formats/typescript/compiler', {
                'typescript': { createProgram }
            });

            const testData   = [{ filename: 'test/server/data/test-suites/typescript-basic/testfile1.ts', code: 'console.log(42)' }];
            const tsCompiler = new TSCompiler();

            await tsCompiler.precompile(testData);
            await tsCompiler.precompile(testData);

            expect(createProgram.callCount).eql(1);
        });

        it('Should provide correct globals in TestCafe scripts', async function () {
            this.timeout(60000);

            const tscPath     = path.resolve('node_modules/.bin/tsc');
            const defsPath    = path.resolve('ts-defs/testcafe-scripts.d.ts');
            const scriptPaths = await globby('test/server/data/test-suites/typescript-testcafe-scripts-defs/*.ts');
            const command     = `${tscPath} ${defsPath} ${scriptPaths.join(' ')} --target ES6 --noEmit`;

            return new Promise(resolve => {
                exec(command, (error, stdout) => {
                    resolve({ error, stdout });
                });
            }).then(value => {
                expect(value.stdout).eql('');
                expect(value.error).is.null;
            });
        });

        it('Should provide correct globals for selector and client-functions only', async function () {
            this.timeout(60000);

            const tscPath     = path.resolve('node_modules/.bin/tsc');
            const defsPath    = path.resolve('ts-defs/selectors.d.ts');
            const scriptPaths = await globby('test/server/data/test-suites/typescript-selectors-defs/*.ts');
            const command     = `${tscPath} ${defsPath} ${scriptPaths.join(' ')} --target ES6 --noEmit`;

            return new Promise(resolve => {
                exec(command, (error, stdout) => {
                    resolve({ error, stdout });
                });
            }).then(value => {
                expect(value.stdout).eql('');
                expect(value.error).is.null;
            });
        });

        it('Should provide correct globals when they are redeclared in node_modules/@types', async () => {
            const currentDir = process.cwd();
            const scriptDir  = 'test/server/data/test-suites/typescript-test-redeclared-in-types';
            const scriptName = 'testfile.ts';

            process.chdir(scriptDir);

            try {
                return await compile(scriptName);
            }
            finally {
                process.chdir(currentDir);
            }
        });

        it('Should provide Node.js global when TestCafe is installed globally', async function () {
            this.timeout(60000);

            const tmpFileName = `testfile-${nanoid()}.ts`;
            const tmpFileDir  = os.tmpdir();
            const tmpFilePath = path.join(tmpFileDir, tmpFileName);
            const currentDir  = process.cwd();

            await copy(path.resolve('test/server/data/test-suites/typescript-nodejs-globals/testfile.ts'), tmpFilePath);

            try {
                process.chdir(tmpFileDir);

                await compile(tmpFileName);
            }
            finally {
                process.chdir(currentDir);

                await remove(tmpFilePath);
            }
        });
    });


    describe('CoffeeScript', function () {
        it('Should compile test defined in separate module if option is enabled', function () {
            const sources = [
                'test/server/data/test-suites/test-as-module/with-tests/testfile.coffee'
            ];

            return compile(sources, true)
                .then(function (compiled) {
                    const tests    = compiled.tests;
                    const fixtures = compiled.fixtures;

                    expect(tests.length).eql(1);
                    expect(fixtures.length).eql(1);

                    expect(tests[0].name).eql('test');
                    expect(fixtures[0].name).eql('Library tests');
                });
        });

        it('Should compile test files and their dependencies', function () {
            const sources = [
                'test/server/data/test-suites/coffeescript-basic/testfile1.coffee',
                'test/server/data/test-suites/coffeescript-basic/testfile2.coffee'
            ];

            return compile(sources)
                .then(function (compiled) {
                    const testfile1 = path.resolve('test/server/data/test-suites/coffeescript-basic/testfile1.coffee');
                    const testfile2 = path.resolve('test/server/data/test-suites/coffeescript-basic/testfile2.coffee');

                    const tests     = compiled.tests;
                    const fixtures  = compiled.fixtures;

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
    });


    describe('RAW file', function () {
        it('Should compile test files', function () {
            const sources = ['test/server/data/test-suites/raw/test.testcafe'];

            return compile(sources)
                .then(function (compiled) {
                    const testfile = path.resolve('test/server/data/test-suites/raw/test.testcafe');
                    const tests    = compiled.tests;
                    const fixtures = compiled.fixtures;

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
            const testfile1 = path.resolve('test/server/data/test-suites/raw/invalid.testcafe');
            const testfile2 = path.resolve('test/server/data/test-suites/raw/invalid2.testcafe');

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
            const TestRunMock = function (expectedError) {
                this.id            = 'PPBqWA9';
                this.commands      = [];
                this.expectedError = expectedError;
            };

            TestRunMock.prototype.executeCommand = function (command) {
                this.commands.push(command);

                return this.expectedError ? Promise.reject(new Error(this.expectedError)) : Promise.resolve();
            };

            it('Should be resolved if the test passed', function () {
                const sources = ['test/server/data/test-suites/raw/test.testcafe'];
                let test      = null;
                const testRun = new TestRunMock();

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
                const sources       = ['test/server/data/test-suites/raw/test.testcafe'];
                const expectedError = 'test-error';
                const testRun       = new TestRunMock(expectedError);

                return compile(sources)
                    .then(function (compiled) {
                        return compiled.tests[0].fn(testRun);
                    })
                    .then(function () {
                        throw new Error('Promise rejection is expected');
                    })
                    .catch(function (errList) {
                        expect(errList.items[0].code).eql(TEST_RUN_ERRORS.uncaughtErrorInTestCode);
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
            return fs.readFileSync(testDir + '/expected.js').toString();
        }

        function testClientFnCompilation (testName) {
            const testDir  = 'test/server/data/client-fn-compilation/' + testName;
            const src      = testDir + '/testfile.js';
            const expected = getExpected(testDir);

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
                                            path.resolve('does/not/exists.js') + '".');
                });
        });

        it('Should raise an error if test dependency has a syntax error', function () {
            const testfile = path.resolve('test/server/data/test-suites/syntax-error-in-dep/testfile.js');
            const dep      = posixResolve('test/server/data/test-suites/syntax-error-in-dep/dep.js');

            const stack = [
                esNextCompilerPath,
                esNextCompilerPath,
                apiBasedPath,
                testfile
            ];

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: stack,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'SyntaxError: ' + dep + ': Unexpected token, expected { (1:7)'
                    });
                });
        });

        it("Should raise an error if dependency can't require a module", function () {
            const testfile = path.resolve('test/server/data/test-suites/require-error-in-dep/testfile.js');
            const dep      = path.resolve('test/server/data/test-suites/require-error-in-dep/dep.js');

            const stack = [
                dep,
                apiBasedPath,
                testfile
            ];

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: stack,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 "Error: Cannot find module './yo'"

                    }, true);
                });
        });

        it('Should raise an error if dependency throws runtime error', function () {
            const testfile = path.resolve('test/server/data/test-suites/runtime-error-in-dep/testfile.js');
            const dep      = path.resolve('test/server/data/test-suites/runtime-error-in-dep/dep.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: [
                            dep,
                            apiBasedPath,
                            testfile
                        ],

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'Error: Hey ya!'
                    });
                });
        });

        it("Should raise an error if test file can't require a module", function () {
            const testfile = path.resolve('test/server/data/test-suites/require-error-in-testfile/testfile.js');

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: testfile,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 "Error: Cannot find module './yo'",
                    }, true);
                });
        });

        it('Should raise an error if test file throws runtime error', function () {
            const testfile = path.resolve('test/server/data/test-suites/runtime-error-in-testfile/testfile.js');

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
            const testfile = posixResolve('test/server/data/test-suites/syntax-error-in-testfile/testfile.js');

            const stack  = [
                esNextCompilerPath,
                apiBasedPath,
            ];

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: stack,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'SyntaxError: ' + testfile + ': Unexpected token, expected { (1:7)'
                    });
                });
        });

        it('Should raise an error if test file has Flow syntax without a marker comment', function () {
            const testfiles = [
                posixResolve('test/server/data/test-suites/flow-type-declarations/no-flow-marker.js'),
                posixResolve('test/server/data/test-suites/flow-type-declarations/flower-marker.js')
            ];

            const stack  = [
                esNextCompilerPath,
                apiBasedPath,
            ];

            return compile(testfiles[0])
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: stack,


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
                        stackTop: stack,

                        message: 'Cannot prepare tests due to an error.\n\n' +
                                 'SyntaxError: ' + testfiles[1] + ': Unexpected token, expected ; (2:8)'
                    });
                });
        });

        it('Should raise an error if test file has a TypeScript error', function () {
            const testfile = posixResolve('test/server/data/test-suites/typescript-compile-errors/testfile.ts');
            const stack    = tsCompilerPath;

            return compile(testfile)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    assertError(err, {
                        stackTop: stack,

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
                    const stackTraceLimit = 200;
                    const err             = errList.items[0];
                    const stack           = err.callsite.stackFrames.filter(createStackFilter(stackTraceLimit));

                    expect(stack.length).eql(3);
                    expect(stack[0].source).to.have.string('helper.js');
                    expect(stack[1].source).to.have.string('helper.js');
                    expect(stack[2].source).to.have.string('testfile.js');
                });
        });

        it('getTests method should not raise an error for typescript declaration files', function () {
            return compile('test/server/data/test-suites/typescript-description-file/fs.d.ts')
                .then(res => {
                    expect(res).eql({ tests: [], fixtures: [] });
                });
        });
    });
});
