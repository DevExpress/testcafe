/*eslint-disable no-console */

const Configuration  = require('../../lib/configuration');
const { cloneDeep }  = require('lodash');
const { expect }     = require('chai');
const fs             = require('fs');
const tmp            = require('tmp');
const nanoid         = require('nanoid');
const consoleWrapper = require('./helpers/console-wrapper');

describe('Configuration', () => {
    let configuration     = null;
    let configPath        = null;
    let keyFileContent    = null;

    consoleWrapper.init();

    tmp.setGracefulCleanup();

    const createConfigFile = options => {
        options = options || {};
        fs.writeFileSync(configPath, JSON.stringify(options));
    };

    beforeEach(() => {
        configuration = new Configuration();
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
