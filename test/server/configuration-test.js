/*eslint-disable no-console */

const { cloneDeep } = require('lodash');
const { expect }    = require('chai');
const fs            = require('fs');
const tmp           = require('tmp');
const nanoid        = require('nanoid');

const TestCafeConfiguration                   = require('../../lib/configuration/testcafe-configuration');
const TypescriptConfiguration                 = require('../../lib/configuration/typescript-configuration');
const { DEFAULT_TYPESCRIPT_COMPILER_OPTIONS } = require('../../lib/configuration/default-values');
const consoleWrapper                          = require('./helpers/console-wrapper');

let configuration     = null;
let configPath        = null;
let keyFileContent    = null;

const createConfigFile = options => {
    options = options || {};
    fs.writeFileSync(configPath, JSON.stringify(options));
};

describe('TestCafeConfiguration', () => {
    consoleWrapper.init();

    tmp.setGracefulCleanup();

    beforeEach(() => {
        configuration = new TestCafeConfiguration();
        configPath    = configuration.filePath;

        const keyFile = tmp.fileSync();

        keyFileContent = Buffer.from(nanoid());
        fs.writeFileSync(keyFile.name, keyFileContent);

        createConfigFile({
            'hostname': '123.456.789',
            'port1':    1234,
            'port2':    5678,
            'src':      'path1/folder',
            'ssl':      {
                'key':                keyFile.name,
                'rejectUnauthorized': 'true'
            },
            'browsers':    'ie',
            'concurrency': 0.5,
            'filter':      {
                'fixture':     'testFixture',
                'test':        'some test',
                'testGrep':    'test\\d',
                'fixtureGrep': 'fixture\\d',
                'testMeta':    { test: 'meta' },
                'fixtureMeta': { fixture: 'meta' }
            }
        });
    });

    afterEach(() => {
        if (fs.existsSync(configPath))
            fs.unlinkSync(configPath);

        consoleWrapper.unwrap();
        consoleWrapper.messages.clear();
    });

    describe('Init', () => {
        describe('Exists', () => {
            it('Config is not well-formed', () => {
                fs.writeFileSync(configPath, '{');
                consoleWrapper.wrap();

                return configuration.init()
                    .then(() => {
                        consoleWrapper.unwrap();

                        expect(configuration.getOption('hostname')).eql(void 0);
                        expect(consoleWrapper.messages.log).contains("Failed to parse the '.testcaferc.json' file.");
                    });
            });

            it('Options', () => {
                return configuration.init()
                    .then(() => {
                        expect(configuration.getOption('hostname')).eql('123.456.789');
                        expect(configuration.getOption('port1')).eql(1234);

                        const ssl = configuration.getOption('ssl');

                        expect(ssl.key).eql(keyFileContent);
                        expect(ssl.rejectUnauthorized).eql(true);
                        expect(configuration.getOption('src')).eql([ 'path1/folder' ]);
                        expect(configuration.getOption('browsers')).eql([ 'ie' ]);
                        expect(configuration.getOption('concurrency')).eql(0.5);
                        expect(configuration.getOption('filter')).to.be.a('function');
                        expect(configuration.getOption('filter').testGrep.test('test1')).to.be.true;
                        expect(configuration.getOption('filter').fixtureGrep.test('fixture1')).to.be.true;
                        expect(configuration.getOption('filter').testMeta).to.be.deep.equal({ test: 'meta' });
                        expect(configuration.getOption('filter').fixtureMeta).to.be.deep.equal({ fixture: 'meta' });
                    });
            });

            it('"Reporter" option', () => {
                let optionValue = null;

                createConfigFile({
                    reporter: 'json'
                });

                return configuration
                    .init()
                    .then(() => {
                        optionValue = configuration.getOption('reporter');

                        expect(optionValue.length).eql(1);
                        expect(optionValue[0].name).eql('json');

                        createConfigFile({
                            reporter: ['json', 'minimal']
                        });

                        return configuration.init();
                    })
                    .then(() => {
                        optionValue = configuration.getOption('reporter');

                        expect(optionValue.length).eql(2);
                        expect(optionValue[0].name).eql('json');
                        expect(optionValue[1].name).eql('minimal');

                        createConfigFile({
                            reporter: [ {
                                name: 'json',
                                file: 'path/to/file'
                            }]
                        });

                        return configuration.init();
                    })
                    .then(() => {
                        optionValue = configuration.getOption('reporter');

                        expect(optionValue.length).eql(1);
                        expect(optionValue[0].name).eql('json');
                        expect(optionValue[0].file).eql('path/to/file');
                    });
            });
        });

        it('File doesn\'t exists', () => {
            fs.unlinkSync(configPath);

            const defaultOptions = cloneDeep(configuration._options);

            return configuration.init()
                .then(() => {
                    expect(configuration._options).to.deep.equal(defaultOptions);
                });
        });
    });

    describe('Merge options', () => {
        it('One', () => {
            consoleWrapper.wrap();

            return configuration.init()
                .then(() => {
                    configuration.mergeOptions({ 'hostname': 'anotherHostname' });
                    configuration.notifyAboutOverridenOptions();

                    consoleWrapper.unwrap();

                    expect(configuration.getOption('hostname')).eql('anotherHostname');
                    expect(consoleWrapper.messages.log).eql('The "hostname" option from the configuration file will be ignored.');
                });
        });

        it('Many', () => {
            consoleWrapper.wrap();

            return configuration.init()
                .then(() => {
                    configuration.mergeOptions({
                        'hostname': 'anotherHostname',
                        'port1':    'anotherPort1',
                        'port2':    'anotherPort2'
                    });

                    configuration.notifyAboutOverridenOptions();

                    consoleWrapper.unwrap();

                    expect(configuration.getOption('hostname')).eql('anotherHostname');
                    expect(configuration.getOption('port1')).eql('anotherPort1');
                    expect(configuration.getOption('port2')).eql('anotherPort2');
                    expect(consoleWrapper.messages.log).eql('The "hostname", "port1", "port2" options from the configuration file will be ignored.');
                });
        });

        it('Should ignore an option with the "undefined" value', () => {
            return configuration.init()
                .then(() => {
                    configuration.mergeOptions({ 'hostname': void 0 });

                    expect(configuration.getOption('hostname')).eql('123.456.789');
                });
        });
    });
});

describe('TypeScriptConfiguration', () => {
    const tsConfigPath = 'tsconfig.json';

    it('Default', () => {
        configuration = new TypescriptConfiguration();

        return configuration.init()
            .then(() => {
                expect(configuration.getOptions()).to.deep.equal(DEFAULT_TYPESCRIPT_COMPILER_OPTIONS);
            });
    });

    it('Configuration file does not exist', async () => {
        let message = null;

        configuration = new TypescriptConfiguration('non-existing-path');

        try {
            await configuration.init();
        }
        catch (err) {
            message = err.message;
        }

        expect(message).eql(`Unable to find the TypeScript configuration file in "${configuration.filePath}"`);
    });

    describe('With configuration file', () => {
        tmp.setGracefulCleanup();

        beforeEach(() => {
            consoleWrapper.init();
            consoleWrapper.wrap();
        });

        afterEach(() => {
            if (configuration.filePath)
                fs.unlinkSync(configuration.filePath);

            consoleWrapper.unwrap();
            consoleWrapper.messages.clear();
        });

        it('tsconfig.json does not apply automatically', () => {
            configuration = new TypescriptConfiguration();
            configPath    = tsConfigPath;

            createConfigFile({
                compilerOptions: {
                    experimentalDecorators: false,
                }
            });

            return configuration.init()
                .then(() => {
                    consoleWrapper.unwrap();

                    const options = configuration.getOptions();

                    expect(options['experimentalDecorators']).eql(true);
                });
        });

        it('override options', () => {
            configuration = new TypescriptConfiguration(tsConfigPath);
            configPath    = configuration.filePath;

            // NOTE: suppressOutputPathCheck can't be overridden by a config file
            createConfigFile({
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

            return configuration.init()
                .then(() => {
                    consoleWrapper.unwrap();

                    const options = configuration.getOptions();

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
            configuration = new TypescriptConfiguration(tsConfigPath);
            configPath    = configuration.filePath;

            createConfigFile({
                compilerOptions: {
                    module:           'commonjs',
                    moduleResolution: 'node',
                    target:           'es2016'
                }
            });

            return configuration.init()
                .then(() => {
                    consoleWrapper.unwrap();

                    expect(consoleWrapper.messages.log).not.ok;
                });
        });

        it('TestCafe config + TypeScript config', () => {
            let runner = null;

            configuration = new TestCafeConfiguration();

            configPath = configuration.filePath;

            const customConfigFilePath = 'custom-config.json';

            createConfigFile({
                tsConfigPath: customConfigFilePath
            });

            configPath = customConfigFilePath;

            createConfigFile({
                compilerOptions: {
                    target: 'es5'
                }
            });

            return configuration.init()
                .then(() => {
                    const RunnerCtor = require('../../lib/runner');

                    runner = new RunnerCtor(null, null, configuration);

                    runner.src('test/server/data/test-suites/typescript-basic/testfile1.ts');
                    runner._setBootstrapperOptions();

                    return runner.bootstrapper._getTests();
                })
                .then(() => {
                    fs.unlinkSync(customConfigFilePath);

                    expect(runner.bootstrapper.tsConfigPath).eql(customConfigFilePath);
                    expect(consoleWrapper.messages.log).contains('You cannot override the "target" compiler option in the TypeScript configuration file.');
                });
        });

        it('Runner + TypeScript config', () => {
            let runner = null;

            const customConfigFilePath = 'custom-config.json';

            configPath    = customConfigFilePath;
            configuration = { filePath: customConfigFilePath };

            createConfigFile({
                compilerOptions: {
                    target: 'es5'
                }
            });


            const RunnerCtor = require('../../lib/runner');

            runner = new RunnerCtor(null, null, new TestCafeConfiguration());

            runner.src('test/server/data/test-suites/typescript-basic/testfile1.ts');
            runner.tsConfigPath(customConfigFilePath);
            runner._setBootstrapperOptions();

            return runner.bootstrapper._getTests()
                .then(() => {
                    expect(runner.bootstrapper.tsConfigPath).eql(customConfigFilePath);
                    expect(consoleWrapper.messages.log).contains('You cannot override the "target" compiler option in the TypeScript configuration file.');
                });
        });
    });
});
