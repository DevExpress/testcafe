/*eslint-disable no-console */
const { cloneDeep } = require('lodash');
const { expect }    = require('chai');
const fs            = require('fs');
const tmp           = require('tmp');
const nanoid        = require('nanoid');
const del           = require('del');
const pathUtil      = require('path');

const TestCafeConfiguration                   = require('../../lib/configuration/testcafe-configuration');
const TypeScriptConfiguration                 = require('../../lib/configuration/typescript-configuration');
const { DEFAULT_TYPESCRIPT_COMPILER_OPTIONS } = require('../../lib/configuration/default-values');
const RunnerCtor                              = require('../../lib/runner');
const OptionNames                             = require('../../lib/configuration/option-names');
const consoleWrapper                          = require('./helpers/console-wrapper');

const tsConfigPath           = 'tsconfig.json';
const customTSConfigFilePath = 'custom-config.json';

const createConfigFile = (path, options) => {
    options = options || {};
    fs.writeFileSync(path, JSON.stringify(options));
};

const createTestCafeConfigurationFile   = createConfigFile.bind(null, TestCafeConfiguration.FILENAME);
const createTypeScriptConfigurationFile = createConfigFile.bind(null, tsConfigPath);

const TEST_TIMEOUT = 5000;

describe('TestCafeConfiguration', function () {
    this.timeout(TEST_TIMEOUT);

    const testCafeConfiguration = new TestCafeConfiguration();
    let keyFileContent          = null;

    consoleWrapper.init();
    tmp.setGracefulCleanup();

    beforeEach(() => {
        const keyFile = tmp.fileSync();

        keyFileContent = Buffer.from(nanoid());
        fs.writeFileSync(keyFile.name, keyFileContent);

        createTestCafeConfigurationFile({
            'hostname': '123.456.789',
            'port1':    1234,
            'port2':    5678,
            'src':      'path1/folder',
            'ssl':      {
                'key':                keyFile.name,
                'rejectUnauthorized': 'true'
            },
            'browsers':    'remote',
            'concurrency': 0.5,
            'filter':      {
                'fixture':     'testFixture',
                'test':        'some test',
                'testGrep':    'test\\d',
                'fixtureGrep': 'fixture\\d',
                'testMeta':    { test: 'meta' },
                'fixtureMeta': { fixture: 'meta' }
            },
            'clientScripts': 'test-client-script.js',
        });
    });

    afterEach(async () => {
        await del([testCafeConfiguration.filePath]);

        consoleWrapper.unwrap();
        consoleWrapper.messages.clear();
    });

    describe('Init', () => {
        describe('Exists', () => {
            it('Config is not well-formed', () => {
                fs.writeFileSync(testCafeConfiguration.filePath, '{');
                consoleWrapper.wrap();

                return testCafeConfiguration.init()
                    .then(() => {
                        consoleWrapper.unwrap();

                        expect(testCafeConfiguration.getOption('hostname')).eql(void 0);
                        expect(consoleWrapper.messages.log).contains(`Failed to parse the '${testCafeConfiguration.filePath}' file.`);
                    });
            });

            it('Options', () => {
                return testCafeConfiguration.init()
                    .then(() => {
                        expect(testCafeConfiguration.getOption('hostname')).eql('123.456.789');
                        expect(testCafeConfiguration.getOption('port1')).eql(1234);

                        const ssl = testCafeConfiguration.getOption('ssl');

                        expect(ssl.key).eql(keyFileContent);
                        expect(ssl.rejectUnauthorized).eql(true);
                        expect(testCafeConfiguration.getOption('src')).eql(['path1/folder']);
                        expect(testCafeConfiguration.getOption('browsers')).to.be.an('array').that.not.empty;
                        expect(testCafeConfiguration.getOption('browsers')[0]).to.include({ providerName: 'remote' });
                        expect(testCafeConfiguration.getOption('concurrency')).eql(0.5);
                        expect(testCafeConfiguration.getOption('filter')).to.be.a('function');
                        expect(testCafeConfiguration.getOption('filter').testGrep.test('test1')).to.be.true;
                        expect(testCafeConfiguration.getOption('filter').fixtureGrep.test('fixture1')).to.be.true;
                        expect(testCafeConfiguration.getOption('filter').testMeta).to.be.deep.equal({ test: 'meta' });
                        expect(testCafeConfiguration.getOption('filter').fixtureMeta).to.be.deep.equal({ fixture: 'meta' });
                        expect(testCafeConfiguration.getOption('clientScripts')).eql([ 'test-client-script.js' ]);
                    });
            });

            it('"Reporter" option', () => {
                let optionValue = null;

                createTestCafeConfigurationFile({
                    reporter: 'json'
                });

                return testCafeConfiguration
                    .init()
                    .then(() => {
                        optionValue = testCafeConfiguration.getOption('reporter');

                        expect(optionValue.length).eql(1);
                        expect(optionValue[0].name).eql('json');

                        createTestCafeConfigurationFile({
                            reporter: ['json', 'minimal']
                        });

                        return testCafeConfiguration.init();
                    })
                    .then(() => {
                        optionValue = testCafeConfiguration.getOption('reporter');

                        expect(optionValue.length).eql(2);
                        expect(optionValue[0].name).eql('json');
                        expect(optionValue[1].name).eql('minimal');

                        createTestCafeConfigurationFile({
                            reporter: [ {
                                name: 'json',
                                file: 'path/to/file'
                            }]
                        });

                        return testCafeConfiguration.init();
                    })
                    .then(() => {
                        optionValue = testCafeConfiguration.getOption('reporter');

                        expect(optionValue.length).eql(1);
                        expect(optionValue[0].name).eql('json');
                        expect(optionValue[0].file).eql('path/to/file');
                    });
            });

            describe('Screenshot options', () => {
                it('`mergeOptions` overrides config values', () => {
                    createTestCafeConfigurationFile({
                        'screenshots': {
                            'path':        'screenshot-path',
                            'pathPattern': 'screenshot-path-pattern',
                            'takeOnFails': true,
                            'fullPage':    true,
                        }
                    });

                    return testCafeConfiguration.init()
                        .then(() => {
                            testCafeConfiguration.mergeOptions({
                                screenshots: {
                                    path:        'modified-path',
                                    pathPattern: 'modified-pattern',
                                    takeOnFails: false,
                                    fullPage:    false
                                }
                            });

                            expect(testCafeConfiguration.getOption('screenshots')).eql({
                                path:        'modified-path',
                                pathPattern: 'modified-pattern',
                                takeOnFails: false,
                                fullPage:    false
                            });

                            expect(testCafeConfiguration._overriddenOptions).eql([
                                'screenshots.path',
                                'screenshots.pathPattern',
                                'screenshots.takeOnFails',
                                'screenshots.fullPage'
                            ]);
                        });
                });

                it('`mergeOptions` merges config values', () => {
                    createTestCafeConfigurationFile({
                        'screenshots': {
                            'path':        'screenshot-path',
                            'pathPattern': 'screenshot-path-pattern'
                        }
                    });

                    return testCafeConfiguration.init()
                        .then(() => {
                            testCafeConfiguration.mergeOptions({
                                screenshots: {
                                    path:        'modified-path',
                                    pathPattern: void 0,
                                    takeOnFails: false,
                                }
                            });

                            expect(testCafeConfiguration.getOption('screenshots')).eql({
                                path:        'modified-path',
                                pathPattern: 'screenshot-path-pattern',
                                takeOnFails: false
                            });

                            expect(testCafeConfiguration._overriddenOptions).eql(['screenshots.path']);
                        });
                });

                it('`mergeOptions` with an empty object does not override anything', () => {
                    createTestCafeConfigurationFile({
                        'screenshots': {
                            'path':        'screenshot-path',
                            'pathPattern': 'screenshot-path-pattern'
                        }
                    });

                    return testCafeConfiguration.init()
                        .then(() => {

                            testCafeConfiguration.mergeOptions({ });

                            testCafeConfiguration.mergeOptions({ screenshots: {} });

                            expect(testCafeConfiguration.getOption('screenshots')).eql({
                                path:        'screenshot-path',
                                pathPattern: 'screenshot-path-pattern'
                            });
                        });
                });

                it('both `screenshots` options exist in config', () => {
                    createTestCafeConfigurationFile({
                        'screenshots': {
                            'path':        'screenshot-path-1',
                            'pathPattern': 'screenshot-path-pattern-1',
                            'takeOnFails': true,
                            'fullPage':    true,
                        },
                        'screenshotPath':         'screenshot-path-2',
                        'screenshotPathPattern':  'screenshot-path-pattern-2',
                        'takeScreenshotsOnFails': false
                    });

                    return testCafeConfiguration.init()
                        .then(() => {
                            expect(testCafeConfiguration._overriddenOptions.length).eql(0);

                            expect(testCafeConfiguration.getOption('screenshots')).eql({
                                path:        'screenshot-path-1',
                                pathPattern: 'screenshot-path-pattern-1',
                                takeOnFails: true,
                                fullPage:    true,
                            });

                            expect(testCafeConfiguration.getOption('screenshotPath')).eql('screenshot-path-2');
                            expect(testCafeConfiguration.getOption('screenshotPathPattern')).eql('screenshot-path-pattern-2');
                            expect(testCafeConfiguration.getOption('takeScreenshotsOnFails')).eql(false);
                        });
                });
            });
        });

        it('File doesn\'t exists', () => {
            fs.unlinkSync(testCafeConfiguration.filePath);

            const defaultOptions = cloneDeep(testCafeConfiguration._options);

            return testCafeConfiguration.init()
                .then(() => {
                    expect(testCafeConfiguration._options).to.deep.equal(defaultOptions);
                });
        });
    });

    describe('Merge options', () => {
        it('One', () => {
            consoleWrapper.wrap();

            return testCafeConfiguration.init()
                .then(() => {
                    testCafeConfiguration.mergeOptions({ 'hostname': 'anotherHostname' });
                    testCafeConfiguration.notifyAboutOverriddenOptions();

                    consoleWrapper.unwrap();

                    expect(testCafeConfiguration.getOption('hostname')).eql('anotherHostname');
                    expect(consoleWrapper.messages.log).eql('The "hostname" option from the configuration file will be ignored.');
                });
        });

        it('Many', () => {
            consoleWrapper.wrap();

            return testCafeConfiguration.init()
                .then(() => {
                    testCafeConfiguration.mergeOptions({
                        'hostname': 'anotherHostname',
                        'port1':    'anotherPort1',
                        'port2':    'anotherPort2'
                    });

                    testCafeConfiguration.notifyAboutOverriddenOptions();

                    consoleWrapper.unwrap();

                    expect(testCafeConfiguration.getOption('hostname')).eql('anotherHostname');
                    expect(testCafeConfiguration.getOption('port1')).eql('anotherPort1');
                    expect(testCafeConfiguration.getOption('port2')).eql('anotherPort2');
                    expect(consoleWrapper.messages.log).eql('The "hostname", "port1", and "port2" options from the configuration file will be ignored.');
                });
        });

        it('Should ignore an option with the "undefined" value', () => {
            return testCafeConfiguration.init()
                .then(() => {
                    testCafeConfiguration.mergeOptions({ 'hostname': void 0 });

                    expect(testCafeConfiguration.getOption('hostname')).eql('123.456.789');
                });
        });
    });

    describe('Should copy value from "tsConfigPath" to compiler options', () => {
        it('only tsConfigPath is specified', () => {
            const configuration = new TestCafeConfiguration();
            const runner        = new RunnerCtor({ configuration });

            return runner
                .tsConfigPath('path-to-ts-config')
                ._applyOptions()
                .then(() => {
                    expect(runner.configuration.getOption(OptionNames.compilerOptions)).eql({
                        'typescript': {
                            configPath: 'path-to-ts-config'
                        }
                    });
                });
        });

        it('tsConfigPath is specified and compiler options are "undefined"', () => {
            const configuration = new TestCafeConfiguration();
            const runner        = new RunnerCtor({ configuration });

            return runner
                .tsConfigPath('path-to-ts-config')
                .compilerOptions(void 0) // emulate command-line run
                ._applyOptions()
                .then(() => {
                    expect(runner.configuration.getOption(OptionNames.compilerOptions)).eql({
                        'typescript': {
                            configPath: 'path-to-ts-config'
                        }
                    });
                });
        });

        it('both "tsConfigPath" and compiler options are specified', () => {
            const configuration = new TestCafeConfiguration();
            const runner        = new RunnerCtor({ configuration });

            return runner
                .tsConfigPath('path-to-ts-config')
                .compilerOptions({
                    'typescript': {
                        configPath: 'path-in-compiler-options'
                    }
                })
                ._applyOptions()
                .then(() => {
                    expect(runner.configuration.getOption(OptionNames.compilerOptions)).eql({
                        'typescript': {
                            configPath: 'path-in-compiler-options'
                        }
                    });
                });
        });
    });
});

describe('TypeScriptConfiguration', function () {
    this.timeout(TEST_TIMEOUT);

    const typeScriptConfiguration = new TypeScriptConfiguration(tsConfigPath);

    it('Default', () => {
        const defaultTypeScriptConfiguration = new TypeScriptConfiguration();

        return defaultTypeScriptConfiguration.init()
            .then(() => {
                expect(defaultTypeScriptConfiguration.getOptions()).to.deep.equal(DEFAULT_TYPESCRIPT_COMPILER_OPTIONS);
            });
    });

    it('Configuration file does not exist', async () => {
        let message = null;

        const nonExistingConfiguration = new TypeScriptConfiguration('non-existing-path');

        try {
            await nonExistingConfiguration.init();
        }
        catch (err) {
            message = err.message;
        }

        expect(message).eql(`"${nonExistingConfiguration.filePath}" is not a valid TypeScript configuration file.`);
    });

    it('Config is not well-formed', () => {
        fs.writeFileSync(tsConfigPath, '{');
        consoleWrapper.wrap();

        return typeScriptConfiguration.init()
            .then(() => {
                consoleWrapper.unwrap();
                fs.unlinkSync(tsConfigPath);

                expect(typeScriptConfiguration.getOption('hostname')).eql(void 0);
                expect(consoleWrapper.messages.log).contains(`Failed to parse the '${typeScriptConfiguration.filePath}' file.`);
            });
    });

    describe('With configuration file', () => {
        tmp.setGracefulCleanup();

        beforeEach(() => {
            consoleWrapper.init();
            consoleWrapper.wrap();
        });

        afterEach(async () => {
            await del([typeScriptConfiguration.filePath, customTSConfigFilePath]);

            consoleWrapper.unwrap();
            consoleWrapper.messages.clear();
        });

        it('tsconfig.json does not apply automatically', () => {
            const defaultTSConfiguration = new TypeScriptConfiguration();

            createTypeScriptConfigurationFile({
                compilerOptions: {
                    experimentalDecorators: false,
                }
            });

            return defaultTSConfiguration.init()
                .then(() => {
                    consoleWrapper.unwrap();

                    const options = defaultTSConfiguration.getOptions();

                    expect(options['experimentalDecorators']).eql(true);
                });
        });

        it('override options', () => {
            // NOTE: suppressOutputPathCheck can't be overridden by a config file
            createTypeScriptConfigurationFile({
                compilerOptions: {
                    experimentalDecorators: false,
                    emitDecoratorMetadata:  false,
                    allowJs:                false,
                    pretty:                 false,
                    inlineSourceMap:        false,
                    noImplicitAny:          true,

                    module:           'esnext',
                    moduleResolution: 'classic',
                    target:           'esnext',
                    lib:              ['es2018', 'dom'],

                    incremental:         true,
                    tsBuildInfoFile:     'tsBuildInfo.txt',
                    emitDeclarationOnly: true,
                    declarationMap:      true,
                    declarationDir:      'C:/',
                    composite:           true,
                    outFile:             'oufile.js',
                    out:                 ''
                }
            });

            return typeScriptConfiguration.init()
                .then(() => {
                    consoleWrapper.unwrap();

                    const options = typeScriptConfiguration.getOptions();

                    expect(options['experimentalDecorators']).eql(false);
                    expect(options['emitDecoratorMetadata']).eql(false);
                    expect(options['allowJs']).eql(false);
                    expect(options['pretty']).eql(false);
                    expect(options['inlineSourceMap']).eql(false);
                    expect(options['noImplicitAny']).eql(true);
                    expect(options['suppressOutputPathCheck']).eql(true);

                    // NOTE: `module` and `target` default options can not be overridden by custom config
                    expect(options['module']).eql(1);
                    expect(options['moduleResolution']).eql(2);
                    expect(options['target']).eql(3);

                    expect(options['lib']).deep.eql(['lib.es2018.d.ts', 'lib.dom.d.ts']);

                    expect(options).not.have.property('incremental');
                    expect(options).not.have.property('tsBuildInfoFile');
                    expect(options).not.have.property('emitDeclarationOnly');
                    expect(options).not.have.property('declarationMap');
                    expect(options).not.have.property('declarationDir');
                    expect(options).not.have.property('composite');
                    expect(options).not.have.property('outFile');
                    expect(options).not.have.property('out');

                    expect(consoleWrapper.messages.log).contains('You cannot override the "module" compiler option in the TypeScript configuration file.');
                    expect(consoleWrapper.messages.log).contains('You cannot override the "moduleResolution" compiler option in the TypeScript configuration file.');
                    expect(consoleWrapper.messages.log).contains('You cannot override the "target" compiler option in the TypeScript configuration file.');
                });
        });

        it('Should not display override messages if config values are the same as default values', () => {
            const tsConfiguration = new TypeScriptConfiguration(tsConfigPath);

            createTypeScriptConfigurationFile({
                compilerOptions: {
                    module:           'commonjs',
                    moduleResolution: 'node',
                    target:           'es2016'
                }
            });

            return tsConfiguration.init()
                .then(() => {
                    consoleWrapper.unwrap();

                    expect(consoleWrapper.messages.log).not.ok;
                });
        });

        it('TestCafe config + TypeScript config', function () {
            createTestCafeConfigurationFile({
                tsConfigPath: customTSConfigFilePath
            });

            createConfigFile(customTSConfigFilePath, {
                compilerOptions: {
                    target: 'es5'
                }
            });

            const configuration = new TestCafeConfiguration();
            const runner        = new RunnerCtor({ configuration });

            return runner
                .src('test/server/data/test-suites/typescript-basic/testfile1.ts')
                ._applyOptions()
                .then(() => {
                    return runner.bootstrapper._getTests();
                })
                .then(() => {
                    fs.unlinkSync(TestCafeConfiguration.FILENAME);
                    typeScriptConfiguration._filePath = customTSConfigFilePath;

                    expect(runner.bootstrapper.tsConfigPath).eql(customTSConfigFilePath);
                    expect(consoleWrapper.messages.log).contains('You cannot override the "target" compiler option in the TypeScript configuration file.');
                });
        });

        describe('Should warn message on rewrite a non-overridable property', () => {
            it('TypeScript config', function () {
                let runner = null;

                createConfigFile(customTSConfigFilePath, {
                    compilerOptions: {
                        target: 'es5'
                    }
                });

                runner = new RunnerCtor({ configuration: new TestCafeConfiguration() });

                runner.src('test/server/data/test-suites/typescript-basic/testfile1.ts');
                runner.tsConfigPath(customTSConfigFilePath);
                runner._setBootstrapperOptions();

                return runner._applyOptions()
                    .then(() => runner.bootstrapper._getTests())
                    .then(() => {
                        typeScriptConfiguration._filePath = customTSConfigFilePath;

                        expect(runner.bootstrapper.tsConfigPath).eql(customTSConfigFilePath);
                        expect(consoleWrapper.messages.log).contains('You cannot override the "target" compiler option in the TypeScript configuration file.');
                    });
            });

            it('Custom compiler options', () => {
                const runner = new RunnerCtor({ configuration: new TestCafeConfiguration() });

                runner
                    .src('test/server/data/test-suites/typescript-basic/testfile1.ts')
                    .compilerOptions({
                        'typescript': {
                            'options': { target: 'es5' }
                        }
                    });

                return runner._applyOptions()
                    .then(() => runner.bootstrapper._getTests())
                    .then(() => {
                        expect(consoleWrapper.messages.log).contains('You cannot override the "target" compiler option in the TypeScript configuration file.');
                    });
            });
        });
    });

    describe('Custom Testcafe Config Path', () => {
        let configuration;

        afterEach(async () => {
            await del([configuration.filePath]);
        });

        it('Custom config path is used', () => {
            const customConfigFile = 'custom11.testcaferc.json';

            const options = {
                'hostname': '123.456.789',
                'port1':    1234,
                'port2':    5678,
                'src':      'path1/folder',
                'browser':  'ie'
            };

            createConfigFile(customConfigFile, options);

            configuration = new TestCafeConfiguration(customConfigFile);

            return configuration.init()
                .then(() => {
                    expect(pathUtil.basename(configuration.filePath)).eql(customConfigFile);
                    expect(configuration.getOption('hostname')).eql(options.hostname);
                    expect(configuration.getOption('port1')).eql(options.port1);
                    expect(configuration.getOption('port2')).eql(options.port2);
                    expect(configuration.getOption('src')).eql([ options.src ]);
                    expect(configuration.getOption('browser')).eql(options.browser);
                });
        });

        it('Constructor should revert back to default when no custom config', () => {
            const defaultFileLocation = '.testcaferc.json';

            const options = {
                'hostname': '123.456.789',
                'port1':    1234,
                'port2':    5678,
                'src':      'path1/folder',
                'browser':  'ie'
            };

            createConfigFile(defaultFileLocation, options);

            configuration = new TestCafeConfiguration();

            return configuration.init()
                .then(() => {
                    expect(pathUtil.basename(configuration.filePath)).eql(defaultFileLocation);
                    expect(configuration.getOption('hostname')).eql(options.hostname);
                    expect(configuration.getOption('port1')).eql(options.port1);
                    expect(configuration.getOption('port2')).eql(options.port2);
                    expect(configuration.getOption('src')).eql([ options.src ]);
                    expect(configuration.getOption('browser')).eql(options.browser);
                });
        });
    });
});
