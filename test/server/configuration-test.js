/*eslint-disable no-console */

const Configuration = require('../../lib/configuration');
const { cloneDeep } = require('lodash');
const { expect }    = require('chai');
const fs            = require('fs');
const tmp           = require('tmp');
const nanoid        = require('nanoid');

describe('Configuration', () => {
    let configuration     = null;
    let configPath        = null;
    const savedConsoleLog = console.log;
    let consoleMsg        = null;
    let keyFileContent    = null;

    tmp.setGracefulCleanup();

    const consoleLogWrapper = (...args) => {
        consoleMsg = args.join();
    };

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
                'fixtureGrep': '^Unstable'
            },
            'reporter': 'json'
        });
    });

    afterEach(() => {
        if (fs.existsSync(configPath))
            fs.unlinkSync(configPath);
    });

    describe('Init', () => {
        describe('Exists', () => {
            it('Config is not well-formed', () => {
                fs.writeFileSync(configPath, '{');
                console.log = consoleLogWrapper;

                return configuration.init()
                    .then(() => {
                        console.log = savedConsoleLog;

                        expect(configuration.getOption('hostname')).eql(void 0);
                        expect(consoleMsg).eql("Failed to parse the '.testcaferc.json' file.\n\n The file is not well-formed JSON.");
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
                        expect(configuration.getOption('filter')).instanceof(Function);
                        expect(configuration.getOption('reporter')).eql([ 'json' ]);
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
            console.log = consoleLogWrapper;

            return configuration.init()
                .then(() => {
                    configuration.mergeOptions({ 'hostname': 'anotherHostname' });
                    console.log = savedConsoleLog;

                    expect(configuration.getOption('hostname')).eql('anotherHostname');
                    expect(consoleMsg).eql('The "hostname" option from configuration file will be ignored.');
                });
        });

        it('Many', () => {
            console.log = consoleLogWrapper;

            return configuration.init()
                .then(() => {
                    configuration.mergeOptions({
                        'hostname': 'anotherHostname',
                        'port1':    'anotherPort1',
                        'port2':    'anotherPort2'
                    });
                    console.log = savedConsoleLog;

                    expect(configuration.getOption('hostname')).eql('anotherHostname');
                    expect(configuration.getOption('port1')).eql('anotherPort1');
                    expect(configuration.getOption('port2')).eql('anotherPort2');
                    expect(consoleMsg).eql('The "hostname", "port1", "port2" options from configuration file will be ignored.');
                });
        });

        it('Should ignore an option with undefined value', () => {
            return configuration.init()
                .then(() => {
                    configuration.mergeOptions({ 'hostname': void 0 });

                    expect(configuration.getOption('hostname')).eql('123.456.789');
                });
        });
    });
});
