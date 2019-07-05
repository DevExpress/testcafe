const expect            = require('chai').expect;
const path              = require('path');
const fs                = require('fs');
const tmp               = require('tmp');
const find              = require('lodash').find;
const CliArgumentParser = require('../../lib/cli/argument-parser');
const nanoid            = require('nanoid');

describe('CLI argument parser', function () {
    this.timeout(10000);

    tmp.setGracefulCleanup();

    function parse (args, cwd) {
        const parser = new CliArgumentParser(cwd);

        args = ['node', 'index.js'].concat(typeof args === 'string' ? args.split(/\s+/) : args);

        return parser.parse(args)
            .then(function () {
                return parser;
            });
    }

    function assertRaisesError (args, expectedMsg) {
        return parse(args)
            .then(function () {
                throw new Error('Promise rejection expected');
            })
            .catch(function (err) {
                expect(err.message).eql(expectedMsg);
            });
    }

    describe('Browser list', function () {
        it('Should be parsed as array of aliases or paths', function () {
            return parse('path:"/Applications/Firefox.app",ie,chrome,firefox,')
                .then(function (parser) {
                    expect(parser.browsers).eql(['path:/Applications/Firefox.app', 'ie', 'chrome', 'firefox']);
                });
        });

        it('Should accept "remote" alias', function () {
            return parse('remote:12,ie,remote,chrome,remote:3')
                .then(function (parser) {
                    expect(parser.browsers).eql(['ie', 'chrome']);
                    expect(parser.remoteCount).eql(16);
                });
        });

        it('Should accept "all" alias', function () {
            return parse('ie,chrome,all')
                .then(function (parser) {
                    expect(parser.browsers).eql(['ie', 'chrome', 'all']);
                });
        });

        it('Should split browsers correctly if paths have commas and quotes', function () {
            return parse('path:"/Apps,Libs/\'Firefox.app",ie,chrome,firefox,path:\'/Apps,Libs/"Chrome.app\'')
                .then(function (parser) {
                    expect(parser.browsers).eql([
                        'path:/Apps,Libs/\'Firefox.app', 'ie', 'chrome', 'firefox',
                        'path:/Apps,Libs/"Chrome.app'
                    ]);
                });
        });

        it('Should split browsers correctly if providers have arguments', function () {
            return parse(['path:"/Apps/Firefox.app --arg1",chrome --arg2'])
                .then(function (parser) {
                    expect(parser.browsers).eql([
                        'path:/Apps/Firefox.app --arg1',
                        'chrome --arg2'
                    ]);
                });
        });
    });

    describe('Ports', function () {
        it('Should parse "--ports" option as array of two integers', function () {
            return parse('--ports 1337,1338')
                .then(function (parser) {
                    expect(parser.opts.ports).eql([1337, 1338]);
                });
        });

        it('Should raise error if "--ports" option value is not a integer', function () {
            return assertRaisesError('--ports 1337,yo', 'Port number is expected to be a non-negative number, but it was "yo".');
        });

        it('Should raise error if "--ports" option has less than 2 ports specified', function () {
            return assertRaisesError('--ports 1337', 'The "--ports" option requires two numbers to be specified.');
        });
    });

    describe('Selector timeout', function () {
        it('Should parse "--selector-timeout" option as integer value', function () {
            return parse('--selector-timeout 1000')
                .then(function (parser) {
                    expect(parser.opts.selectorTimeout).eql(1000);
                });
        });

        it('Should raise an error if the "--selector-timeout" option value is not an integer', function () {
            return assertRaisesError('--selector-timeout yo', 'Selector timeout is expected to be a non-negative number, but it was "yo".');
        });
    });

    describe('Assertion timeout', function () {
        it('Should parse "--assertion-timeout" option as integer value', function () {
            return parse('--assertion-timeout 1000')
                .then(function (parser) {
                    expect(parser.opts.assertionTimeout).eql(1000);
                });
        });

        it('Should raise an error if the "--assertion-timeout" option value is not an integer', function () {
            return assertRaisesError('--assertion-timeout yo', 'Assertion timeout is expected to be a non-negative number, but it was "yo".');
        });
    });

    describe('Page load timeout', function () {
        it('Should parse "--page-load-timeout" option as integer value', function () {
            return parse('--page-load-timeout 1000')
                .then(function (parser) {
                    expect(parser.opts.pageLoadTimeout).eql(1000);
                });
        });

        it('Should raise an error if the "--page-load-timeout" option value is not an integer', function () {
            return assertRaisesError('--page-load-timeout yo', 'Page load timeout is expected to be a non-negative number, but it was "yo".');
        });
    });

    describe('Speed', function () {
        it('Should parse "--speed" option as a number', function () {
            return parse('--speed 0.01')
                .then(function (parser) {
                    expect(parser.opts.speed).eql(0.01);
                });
        });
    });

    describe('Concurrency', function () {
        it('Should parse "--concurrency" option as a number', function () {
            return parse('--concurrency 2')
                .then(function (parser) {
                    expect(parser.opts.concurrency).eql(2);
                });
        });

        it('Should parse "-c" option as a number', function () {
            return parse('-c 2')
                .then(function (parser) {
                    expect(parser.opts.concurrency).eql(2);
                });
        });
    });

    describe('App initialization delay', function () {
        it('Should parse "--app-init-delay" option as integer value', function () {
            return parse('--app-init-delay 1000')
                .then(function (parser) {
                    expect(parser.opts.appInitDelay).eql(1000);
                });
        });

        it('Should raise an error if the "--app-init-delay" option value is not an integer', function () {
            return assertRaisesError('--app-init-delay yo', 'Tested app initialization delay is expected to be a non-negative number, but it was "yo".');
        });
    });

    describe('Filtering options', function () {
        it('Should filter by test name with "-t, --test" option', function () {
            return parse('-t test.js')
                .then(function (parser) {
                    expect(parser.filter('test.js')).to.be.true;
                    expect(parser.filter('1test.js')).to.be.false;
                    expect(parser.filter('test-js')).to.be.false;
                });
        });

        it('Should filter by test name with "-T, --test-grep" option', function () {
            parse('-T ^test\\d+$')
                .then(function (parser) {
                    expect(parser.filter.testGrep.test('test1')).to.be.true;
                    expect(parser.filter.testGrep.test('test')).to.be.false;

                    expect(parser.filter('test1')).to.be.true;
                    expect(parser.filter('test2')).to.be.true;
                    expect(parser.filter('test')).to.be.false;
                });
        });

        it('Should raise error if "-T, --test-grep" value is invalid regular expression', function () {
            return assertRaisesError('-T *+', 'The "--test-grep" option value is not a valid regular expression.');
        });

        it('Should filter by fixture name with "-f, --fixture" option', function () {
            return parse('-f fixture.js')
                .then(function (parser) {
                    expect(parser.filter('test', 'fixture.js')).to.be.true;
                    expect(parser.filter('test', '1fixture.js')).to.be.false;
                    expect(parser.filter('test', 'fixture-js')).to.be.false;
                });
        });

        it('Should filter by fixture name with "-F, --fixture-grep" option', function () {
            return parse('-F ^fixture\\d+$')
                .then(function (parser) {
                    expect(parser.filter.fixtureGrep.test('fixture1')).to.be.true;
                    expect(parser.filter.fixtureGrep.test('fixture')).to.be.false;

                    expect(parser.filter('test', 'fixture1')).to.be.true;
                    expect(parser.filter('test', 'fixture2')).to.be.true;
                    expect(parser.filter('test', 'fixture')).to.be.false;
                });
        });

        it('Should raise error if "-F, --fixture-grep" value is invalid regular expression', function () {
            return assertRaisesError('-F *+', 'The "--fixture-grep" option value is not a valid regular expression.');
        });

        it('Should filter by test meta with "--test-meta" option', function () {
            return parse('--test-meta meta=test')
                .then(function (parser) {
                    expect(parser.filter.testMeta).to.be.deep.equal({ meta: 'test' });

                    expect(parser.filter(null, null, null, { meta: 'test' })).to.be.true;
                    expect(parser.filter(null, null, null, { another: 'meta', meta: 'test' })).to.be.true;
                    expect(parser.filter(null, null, null, {})).to.be.false;
                    expect(parser.filter(null, null, null, { meta: 'notest' })).to.be.false;
                });
        });

        it('Should filter by fixture meta with "--fixture-meta" option', function () {
            return parse('--fixture-meta meta=test,more=meta')
                .then(function (parser) {
                    expect(parser.filter.fixtureMeta).to.be.deep.equal({ meta: 'test', more: 'meta' });

                    expect(parser.filter(null, null, null, null, { meta: 'test', more: 'meta' })).to.be.true;
                    expect(parser.filter(null, null, null, null, { another: 'meta', meta: 'test', more: 'meta' })).to.be.true;
                    expect(parser.filter(null, null, null, null, {})).to.be.false;
                    expect(parser.filter(null, null, null, null, { meta: 'test' })).to.be.false;
                    expect(parser.filter(null, null, null, null, { meta: 'test', more: 'another' })).to.be.false;
                });
        });

        it('Should throw an error if invalid meta is specified', () => {
            return parse('--fixture-meta meta')
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (error) {
                    expect(error.message).contains('The "--fixture-meta" option value is not a valid key-value pair.');

                    return parse('--fixture-meta =test');
                })
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (error) {
                    expect(error.message).contains('The "--fixture-meta" option value is not a valid key-value pair.');

                    return parse('--test-meta meta');
                })
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (error) {
                    expect(error.message).contains('The "--test-meta" option value is not a valid key-value pair.');

                    return parse('--test-meta =test');
                })
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (error) {
                    expect(error.message).contains('The "--test-meta" option value is not a valid key-value pair.');
                });
        });

        it('Should raise error if "--test-meta" value is invalid json', function () {
            return assertRaisesError('--test-meta error', 'The "--test-meta" option value is not a valid key-value pair.');
        });

        it('Should raise error if "--fixture-meta" value is invalid json', function () {
            return assertRaisesError('--fixture-meta error', 'The "--fixture-meta" option value is not a valid key-value pair.');
        });

        it('Should combine filters provided by multiple options', function () {
            return parse('-t thetest1 -T test\\d+$')
                .then(function (parser) {
                    expect(parser.filter('thetest1')).to.be.true;
                    expect(parser.filter('thetest2')).to.be.false;
                })
                .then(function () {
                    return parse('-t thetest1 -T test$ ');
                })
                .then(function (parser) {
                    expect(parser.filter('thetest1')).to.be.false;
                    expect(parser.filter('thetest')).to.be.false;
                })
                .then(function () {
                    return parse('-f thefixture1 -F fixture\\d+$');
                })
                .then(function (parser) {
                    expect(parser.filter(null, 'thefixture1')).to.be.true;
                    expect(parser.filter(null, 'thefixture2')).to.be.false;
                })
                .then(function () {
                    return parse('-f thefixture1 -F fixture$');
                })
                .then(function (parser) {
                    expect(parser.filter(null, 'thefixture1')).to.be.false;
                    expect(parser.filter(null, 'thefixture')).to.be.false;
                })
                .then(function () {
                    return parse('-t thetest1 -f thefixture1');
                })
                .then(function (parser) {
                    expect(parser.filter('thetest1', 'thefixture1')).to.be.true;
                    expect(parser.filter('thetest', 'thefixture1')).to.be.false;
                    expect(parser.filter('thetest1', 'thefixture')).to.be.false;
                })
                .then(function () {
                    return parse('-T test\\d+$ -f thefixture1 -F fixture\\d+$');
                })
                .then(function (parser) {
                    expect(parser.filter('thetest1', 'thefixture1')).to.be.true;
                    expect(parser.filter('thetest', 'thefixture1')).to.be.false;
                    expect(parser.filter('thetest1', 'thefixture')).to.be.false;
                })
                .then(function () {
                    return parse('-t thetest1 --test-meta meta=test');
                })
                .then(function (parser) {
                    expect(parser.filter('thetest1', null, null, { meta: 'test' })).to.be.true;
                    expect(parser.filter('thetest1', null, null, {})).to.be.false;
                    expect(parser.filter('thetest2', null, null, { meta: 'test' })).to.be.false;
                })
                .then(function () {
                    return parse('-f thefixture1 --test-meta meta=test');
                })
                .then(function (parser) {
                    expect(parser.filter(null, 'thefixture1', null, { meta: 'test' })).to.be.true;
                    expect(parser.filter(null, 'thefixture1', null, {})).to.be.false;
                    expect(parser.filter(null, 'thefixture2', null, { meta: 'test' })).to.be.false;
                })
                .then(function () {
                    return parse('-t thetest1 -f thefixture1 --test-meta meta=test');
                })
                .then(function (parser) {
                    expect(parser.filter('thetest1', 'thefixture1', null, { meta: 'test' })).to.be.true;
                    expect(parser.filter('thetest1', 'thefixture1', null, {})).to.be.false;
                    expect(parser.filter('thetest1', 'thefixture2', null, { meta: 'test' })).to.be.false;
                    expect(parser.filter('thetest2', 'thefixture1', null, { meta: 'test' })).to.be.false;
                })
                .then(function () {
                    return parse('-t thetest1 --fixture-meta meta=test');
                })
                .then(function (parser) {
                    expect(parser.filter('thetest1', null, null, null, { meta: 'test' })).to.be.true;
                    expect(parser.filter('thetest1', null, null, null, {})).to.be.false;
                    expect(parser.filter('thetest2', null, null, null, { meta: 'test' })).to.be.false;
                })
                .then(function () {
                    return parse('-f thefixture1 --fixture-meta meta=test');
                })
                .then(function (parser) {
                    expect(parser.filter(null, 'thefixture1', null, null, { meta: 'test' })).to.be.true;
                    expect(parser.filter(null, 'thefixture1', null, null, {})).to.be.false;
                    expect(parser.filter(null, 'thefixture2', null, null, { meta: 'test' })).to.be.false;
                })
                .then(function () {
                    return parse('-t thetest1 -f thefixture1 --fixture-meta meta=test');
                })
                .then(function (parser) {
                    expect(parser.filter('thetest1', 'thefixture1', null, null, { meta: 'test' })).to.be.true;
                    expect(parser.filter('thetest1', 'thefixture1', null, null, {})).to.be.false;
                    expect(parser.filter('thetest1', 'thefixture2', null, null, { meta: 'test' })).to.be.false;
                    expect(parser.filter('thetest2', 'thefixture1', null, null, { meta: 'test' })).to.be.false;
                })
                .then(function () {
                    return parse('-t thetest1 -f thefixture1 --test-meta test=test --fixture-meta fixture=test');
                })
                .then(function (parser) {
                    expect(parser.filter('thetest1', 'thefixture1', null, { test: 'test' }, { fixture: 'test' })).to.be.true;
                    expect(parser.filter('thetest1', 'thefixture1', null, {}, { fixture: 'test' })).to.be.false;
                    expect(parser.filter('thetest1', 'thefixture1', null, { test: 'test' }, {})).to.be.false;
                    expect(parser.filter('thetest1', 'thefixture2', null, { test: 'test' }, { fixture: 'test' })).to.be.false;
                    expect(parser.filter('thetest2', 'thefixture1', null, { test: 'test' }, { fixture: 'test' })).to.be.false;
                });
        });

        it("'.filter' property should equal undefined if filtering options are not provided", () => {
            return parse('param1')
                .then(parser => {
                    expect(parser.filter).is.undefined;
                });
        });
    });

    describe('Ssl options', () => {
        it('Should parse ssl options', () => {
            return parse('param1 --ssl passphrase=sample;sessionTimeout=1000;rejectUnauthorized=false;=onlyValue;onlyKey=')
                .then(parser => {
                    expect(parser.opts.ssl.passphrase).eql('sample');
                    expect(parser.opts.ssl.sessionTimeout).eql(1000);
                    expect(parser.opts.ssl.rejectUnauthorized).eql(false);
                    expect(parser.opts.ssl.onlyKey).to.be.undefined;
                });
        });

        describe('`key`, `cert` and `pfx` keys', () => {
            it('Should parse keys as file paths and read its content', () => {
                const keyFile         = tmp.fileSync();
                const certFile        = tmp.fileSync();
                const pfxFile         = tmp.fileSync();
                const keyFileContent  = Buffer.from(nanoid());
                const certFileContent = Buffer.from(nanoid());
                const pfxFileContent  = Buffer.from(nanoid());

                fs.writeFileSync(keyFile.name, keyFileContent);
                fs.writeFileSync(certFile.name, certFileContent);
                fs.writeFileSync(pfxFile.name, pfxFileContent);

                return parse(`--ssl key=${keyFile.name};cert=${certFile.name};pfx=${pfxFile.name}`)
                    .then(parser => {
                        expect(parser.opts.ssl.key).deep.eql(keyFileContent);
                        expect(parser.opts.ssl.cert).deep.eql(certFileContent);
                        expect(parser.opts.ssl.pfx).deep.eql(pfxFileContent);
                    });
            });

            it('Should not read file content if file does not exists', () => {
                const dummyFilePath = '/dummy-file-path';

                return parse(`--ssl key=${dummyFilePath}`)
                    .then(parser => {
                        expect(parser.opts.ssl.key).eql(dummyFilePath);
                    });
            });

            it('Should interpret a long path as a certificate content', () => {
                const keyFileContent = nanoid(5000);

                return parse(`--ssl key=${keyFileContent}`)
                    .then(parser => {
                        expect(parser.opts.ssl.key).eql(keyFileContent);
                    });
            });

            it('Should throw an error if a file is not readable', () => {
                return parse(`--ssl key=${__dirname}`)
                    .catch(error => {
                        expect(error.message).to.include(
                            `Unable to read the "${__dirname}" file, specified by the "key" ssl option. Error details:`
                        );
                    })
                    .then(() => parse(`--ssl cert=${__dirname}`))
                    .catch(error => {
                        expect(error.message).to.include(
                            `Unable to read the "${__dirname}" file, specified by the "cert" ssl option. Error details:`
                        );
                    })
                    .then(() => parse(`--ssl pfx=${__dirname}`))
                    .catch(error => {
                        expect(error.message).to.include(
                            `Unable to read the "${__dirname}" file, specified by the "pfx" ssl option. Error details:`
                        );
                    });
            });
        });
    });

    describe('Video options', () => {
        it('Should parse video recording options', () => {
            return parse(`--video /home/user/video --video-options singleFile=true,failedOnly --video-encoding-options c:v=x264`)
                .then(parser => {
                    expect(parser.opts.video).eql('/home/user/video');
                    expect(parser.opts.videoOptions.singleFile).eql(true);
                    expect(parser.opts.videoOptions.failedOnly).eql(true);
                    expect(parser.opts.videoEncodingOptions['c:v']).eql('x264');
                });
        });

        it('Should provide "undefined" as a default value for video recording options', () => {
            return parse(``)
                .then(parser => {
                    expect(parser.opts.video).eql(void 0);
                    expect(parser.opts.videoOptions).eql(void 0);
                    expect(parser.opts.videoEncodingOptions).eql(void 0);
                });
        });
    });


    it('Should parse reporters and their output file paths and ensure they exist', function () {
        const cwd      = process.cwd();
        const filePath = path.join(tmp.dirSync().name, 'my/reports/report.json');

        return parse('-r list,json:' + filePath)
            .then(function (parser) {
                expect(parser.opts.reporter[0].name).eql('list');
                expect(parser.opts.reporter[0].output).to.be.undefined;
                expect(parser.opts.reporter[1].name).eql('json');
                expect(parser.opts.reporter[1].output).eql(path.resolve(cwd, filePath));
            });
    });

    it('Should parse command line arguments', function () {
        return parse('-r list -S -q -e --hostname myhost --proxy localhost:1234 --proxy-bypass localhost:5678 --qr-code --app run-app --speed 0.5 --debug-on-fail --disable-page-reloads --dev --sf ie test/server/data/file-list/file-1.js')
            .then(parser => {
                expect(parser.browsers).eql(['ie']);
                expect(parser.src).eql(['test/server/data/file-list/file-1.js']);
                expect(parser.opts.reporter[0].name).eql('list');
                expect(parser.opts.hostname).eql('myhost');
                expect(parser.opts.app).eql('run-app');
                expect(parser.opts.screenshots).to.be.undefined;
                expect(parser.opts.screenshotsOnFails).to.be.ok;
                expect(parser.opts.quarantineMode).to.be.ok;
                expect(parser.opts.skipJsErrors).to.be.ok;
                expect(parser.opts.disablePageReloads).to.be.ok;
                expect(parser.opts.dev).to.be.ok;
                expect(parser.opts.speed).eql(0.5);
                expect(parser.opts.qrCode).to.be.ok;
                expect(parser.opts.proxy).to.be.ok;
                expect(parser.opts.proxyBypass).to.be.ok;
                expect(parser.opts.debugOnFail).to.be.ok;
                expect(parser.opts.stopOnFirstFail).to.be.ok;
            });
    });

    it('Should have static CLI', () => {
        const WARNING          = 'IMPORTANT: Please be sure what you want to change CLI if this test is failing!';
        const EXPECTED_OPTIONS = [
            { long: '--version', short: '-v' },
            { long: '--list-browsers', short: '-b' },
            { long: '--reporter', short: '-r' },
            { long: '--screenshots', short: '-s' },
            { long: '--screenshot-path-pattern', short: '-p' },
            { long: '--screenshots-on-fails', short: '-S' },
            { long: '--quarantine-mode', short: '-q' },
            { long: '--debug-mode', short: '-d' },
            { long: '--skip-js-errors', short: '-e' },
            { long: '--test', short: '-t' },
            { long: '--test-grep', short: '-T' },
            { long: '--fixture', short: '-f' },
            { long: '--fixture-grep', short: '-F' },
            { long: '--app', short: '-a' },
            { long: '--concurrency', short: '-c' },
            { long: '--live', short: '-L' },
            { long: '--test-meta' },
            { long: '--fixture-meta' },
            { long: '--debug-on-fail' },
            { long: '--app-init-delay' },
            { long: '--selector-timeout' },
            { long: '--assertion-timeout' },
            { long: '--page-load-timeout' },
            { long: '--speed' },
            { long: '--ports' },
            { long: '--hostname' },
            { long: '--proxy' },
            { long: '--proxy-bypass' },
            { long: '--disable-page-reloads' },
            { long: '--dev' },
            { long: '--ssl' },
            { long: '--qr-code' },
            { long: '--skip-uncaught-errors', short: '-u' },
            { long: '--color' },
            { long: '--no-color' },
            { long: '--stop-on-first-fail', short: '--sf' },
            { long: '--video' },
            { long: '--video-options' },
            { long: '--video-encoding-options' },
            { long: '--ts-config-path' }
        ];

        const parser  = new CliArgumentParser('');
        const options = parser.program.options;

        expect(options.length).eql(EXPECTED_OPTIONS.length, WARNING);

        for (let i = 0; i < EXPECTED_OPTIONS.length; i++) {
            const option = find(options, EXPECTED_OPTIONS[i]);

            expect(option).not.eql(void 0, WARNING);
            expect(option.long).eql(EXPECTED_OPTIONS[i].long, WARNING);
            expect(option.short).eql(EXPECTED_OPTIONS[i].short, WARNING);
        }
    });
});
