const { expect }        = require('chai');
const path              = require('path');
const fs                = require('fs');
const tmp               = require('tmp');
const { find }          = require('lodash');
const CliArgumentParser = require('../../lib/cli/argument-parser');
const nanoid            = require('nanoid');
const runOptionNames    = require('../../lib/configuration/run-option-names');

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

    describe('Set browser provider name', function () {
        it('Should set the default provider name to "locally-installed" from "--list-browsers"', function () {
            return parse('--list-browsers')
                .then(function (parser) {
                    expect(parser.opts.listBrowsers).eql(true);
                    expect(parser.opts.providerName).eql('locally-installed');
                });
        });

        it('Should parse the browser provider name from "--list-browsers saucelabs"', function () {
            return parse('--list-browsers saucelabs')
                .then(function (parser) {
                    expect(parser.opts.listBrowsers).eql(true);
                    expect(parser.opts.providerName).eql('saucelabs');
                });
        });

        it('Should set the default provider name to "locally-installed" from "-b"', function () {
            return parse('-b')
                .then(function (parser) {
                    expect(parser.opts.listBrowsers).eql(true);
                    expect(parser.opts.providerName).eql('locally-installed');
                });
        });

        it('Should parse "-b saucelabs" browser provider name from "-b saucelabs"', function () {
            return parse('-b saucelabs')
                .then(function (parser) {
                    expect(parser.opts.listBrowsers).eql(true);
                    expect(parser.opts.providerName).eql('saucelabs');
                });
        });
    });

    describe('Browser list', function () {
        it('Should be parsed as array of aliases or paths', function () {
            return parse('path:"/Applications/Firefox.app",ie,chrome,firefox,')
                .then(function (parser) {
                    expect(parser.opts.browsers).eql(['path:/Applications/Firefox.app', 'ie', 'chrome', 'firefox']);
                });
        });

        it('Should accept "remote" alias', function () {
            return parse('remote:12,ie,remote,chrome,remote:3')
                .then(function (parser) {
                    expect(parser.opts.browsers).eql(['ie', 'chrome']);
                    expect(parser.remoteCount).eql(16);
                });
        });

        it('Should accept "all" alias', function () {
            return parse('ie,chrome,all')
                .then(function (parser) {
                    expect(parser.opts.browsers).eql(['ie', 'chrome', 'all']);
                });
        });

        it('Should split browsers correctly if paths have commas and quotes', function () {
            return parse('path:"/Apps,Libs/\'Firefox.app",ie,chrome,firefox,path:\'/Apps,Libs/"Chrome.app\'')
                .then(function (parser) {
                    expect(parser.opts.browsers).eql([
                        'path:/Apps,Libs/\'Firefox.app', 'ie', 'chrome', 'firefox',
                        'path:/Apps,Libs/"Chrome.app'
                    ]);
                });
        });

        it('Should split browsers correctly if providers have arguments', function () {
            return parse(['path:"/Apps/Firefox.app --arg1",chrome --arg2'])
                .then(function (parser) {
                    expect(parser.opts.browsers).eql([
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
            return assertRaisesError('--ports 1337,yo', 'The port number ("yo") is not of expected type (non-negative number).');
        });

        it('Should raise error if "--ports" option has less than 2 ports specified', function () {
            return assertRaisesError('--ports 1337', 'The "--ports" argument accepts two values at a time.');
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
            return assertRaisesError('--selector-timeout yo', 'The Selector timeout ("yo") is not of expected type (non-negative number).');
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
            return assertRaisesError('--assertion-timeout yo', 'The assertion timeout ("yo") is not of expected type (non-negative number).');
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
            return assertRaisesError('--page-load-timeout yo', 'The page load timeout ("yo") is not of expected type (non-negative number).');
        });
    });

    describe('Request timeout', () => {
        describe('Page request timeout', () => {
            it('Should parse the option as integer value', async () => {
                const parser = await parse('--page-request-timeout 1000');

                expect(parser.opts.pageRequestTimeout).eql(1000);
            });

            it('Should raise an error on invalid option value', () => {
                return assertRaisesError('--page-request-timeout str', 'The page request timeout ("str") is not of expected type (non-negative number).');
            });
        });

        describe('Ajax request timeout', () => {
            it('Should parse the option as integer value', async () => {
                const parser = await parse('--ajax-request-timeout 1000');

                expect(parser.opts.ajaxRequestTimeout).eql(1000);
            });

            it('Should raise an error on invalid option value', () => {
                return assertRaisesError('--ajax-request-timeout str', 'The AJAX request timeout ("str") is not of expected type (non-negative number).');
            });
        });
    });

    describe('Browser initialization timeout', function () {
        it('Should parse "--browser-init-timeout" option as integer value', function () {
            return parse('--browser-init-timeout 1000')
                .then(function (parser) {
                    expect(parser.opts.browserInitTimeout).eql(1000);
                });
        });

        it('Should raise an error if the "--browser-init-timeout" option value is not an integer', function () {
            return assertRaisesError('--browser-init-timeout yo', 'The browser initialization timeout ("yo") is not of expected type (non-negative number).');
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
            return assertRaisesError('--app-init-delay yo', 'The tested app initialization delay ("yo") is not of expected type (non-negative number).');
        });
    });

    describe('Filtering options', function () {
        it('Should filter by test name with "-t, --test" option', function () {
            return parse('-t test.js')
                .then(function (parser) {
                    expect(parser.opts.filter('test.js')).to.be.true;
                    expect(parser.opts.filter('1test.js')).to.be.false;
                    expect(parser.opts.filter('test-js')).to.be.false;
                });
        });

        it('Should filter by test name with "-T, --test-grep" option', function () {
            parse('-T ^test\\d+$')
                .then(function (parser) {
                    expect(parser.opts.filter.testGrep.test('test1')).to.be.true;
                    expect(parser.opts.filter.testGrep.test('test')).to.be.false;

                    expect(parser.opts.filter('test1')).to.be.true;
                    expect(parser.opts.filter('test2')).to.be.true;
                    expect(parser.opts.filter('test')).to.be.false;
                });
        });

        it('Should raise error if "-T, --test-grep" value is invalid regular expression', function () {
            return assertRaisesError('-T *+', 'The "--test-grep" option does not contain a valid regular expression.');
        });

        it('Should filter by fixture name with "-f, --fixture" option', function () {
            return parse('-f fixture.js')
                .then(function (parser) {
                    expect(parser.opts.filter('test', 'fixture.js')).to.be.true;
                    expect(parser.opts.filter('test', '1fixture.js')).to.be.false;
                    expect(parser.opts.filter('test', 'fixture-js')).to.be.false;
                });
        });

        it('Should filter by fixture name with "-F, --fixture-grep" option', function () {
            return parse('-F ^fixture\\d+$')
                .then(function (parser) {
                    expect(parser.opts.filter.fixtureGrep.test('fixture1')).to.be.true;
                    expect(parser.opts.filter.fixtureGrep.test('fixture')).to.be.false;

                    expect(parser.opts.filter('test', 'fixture1')).to.be.true;
                    expect(parser.opts.filter('test', 'fixture2')).to.be.true;
                    expect(parser.opts.filter('test', 'fixture')).to.be.false;
                });
        });

        it('Should raise error if "-F, --fixture-grep" value is invalid regular expression', function () {
            return assertRaisesError('-F *+', 'The "--fixture-grep" option does not contain a valid regular expression.');
        });

        it('Should filter by test meta with "--test-meta" option', function () {
            return parse('--test-meta meta=test')
                .then(function (parser) {
                    expect(parser.opts.filter.testMeta).to.be.deep.equal({ meta: 'test' });

                    expect(parser.opts.filter(null, null, null, { meta: 'test' })).to.be.true;
                    expect(parser.opts.filter(null, null, null, { another: 'meta', meta: 'test' })).to.be.true;
                    expect(parser.opts.filter(null, null, null, {})).to.be.false;
                    expect(parser.opts.filter(null, null, null, { meta: 'notest' })).to.be.false;
                });
        });

        it('Should filter by fixture meta with "--fixture-meta" option', function () {
            return parse('--fixture-meta meta=test,more=meta')
                .then(function (parser) {
                    expect(parser.opts.fixtureMeta).to.be.deep.equal({ meta: 'test', more: 'meta' });

                    expect(parser.opts.filter(null, null, null, null, { meta: 'test', more: 'meta' })).to.be.true;
                    expect(parser.opts.filter(null, null, null, null, { another: 'meta', meta: 'test', more: 'meta' })).to.be.true;
                    expect(parser.opts.filter(null, null, null, null, {})).to.be.false;
                    expect(parser.opts.filter(null, null, null, null, { meta: 'test' })).to.be.false;
                    expect(parser.opts.filter(null, null, null, null, { meta: 'test', more: 'another' })).to.be.false;
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
            return assertRaisesError('--test-meta error', 'The "--test-meta" option does not contain a valid key-value pair.');
        });

        it('Should raise error if "--fixture-meta" value is invalid json', function () {
            return assertRaisesError('--fixture-meta error', 'The "--fixture-meta" option does not contain a valid key-value pair.');
        });

        it('Should combine filters provided by multiple options', function () {
            return parse('-t thetest1 -T test\\d+$')
                .then(function (parser) {
                    expect(parser.opts.filter('thetest1')).to.be.true;
                    expect(parser.opts.filter('thetest2')).to.be.false;
                })
                .then(function () {
                    return parse('-t thetest1 -T test$ ');
                })
                .then(function (parser) {
                    expect(parser.opts.filter('thetest1')).to.be.false;
                    expect(parser.opts.filter('thetest')).to.be.false;
                })
                .then(function () {
                    return parse('-f thefixture1 -F fixture\\d+$');
                })
                .then(function (parser) {
                    expect(parser.opts.filter(null, 'thefixture1')).to.be.true;
                    expect(parser.opts.filter(null, 'thefixture2')).to.be.false;
                })
                .then(function () {
                    return parse('-f thefixture1 -F fixture$');
                })
                .then(function (parser) {
                    expect(parser.opts.filter(null, 'thefixture1')).to.be.false;
                    expect(parser.opts.filter(null, 'thefixture')).to.be.false;
                })
                .then(function () {
                    return parse('-t thetest1 -f thefixture1');
                })
                .then(function (parser) {
                    expect(parser.opts.filter('thetest1', 'thefixture1')).to.be.true;
                    expect(parser.opts.filter('thetest', 'thefixture1')).to.be.false;
                    expect(parser.opts.filter('thetest1', 'thefixture')).to.be.false;
                })
                .then(function () {
                    return parse('-T test\\d+$ -f thefixture1 -F fixture\\d+$');
                })
                .then(function (parser) {
                    expect(parser.opts.filter('thetest1', 'thefixture1')).to.be.true;
                    expect(parser.opts.filter('thetest', 'thefixture1')).to.be.false;
                    expect(parser.opts.filter('thetest1', 'thefixture')).to.be.false;
                })
                .then(function () {
                    return parse('-t thetest1 --test-meta meta=test');
                })
                .then(function (parser) {
                    expect(parser.opts.filter('thetest1', null, null, { meta: 'test' })).to.be.true;
                    expect(parser.opts.filter('thetest1', null, null, {})).to.be.false;
                    expect(parser.opts.filter('thetest2', null, null, { meta: 'test' })).to.be.false;
                })
                .then(function () {
                    return parse('-f thefixture1 --test-meta meta=test');
                })
                .then(function (parser) {
                    expect(parser.opts.filter(null, 'thefixture1', null, { meta: 'test' })).to.be.true;
                    expect(parser.opts.filter(null, 'thefixture1', null, {})).to.be.false;
                    expect(parser.opts.filter(null, 'thefixture2', null, { meta: 'test' })).to.be.false;
                })
                .then(function () {
                    return parse('-t thetest1 -f thefixture1 --test-meta meta=test');
                })
                .then(function (parser) {
                    expect(parser.opts.filter('thetest1', 'thefixture1', null, { meta: 'test' })).to.be.true;
                    expect(parser.opts.filter('thetest1', 'thefixture1', null, {})).to.be.false;
                    expect(parser.opts.filter('thetest1', 'thefixture2', null, { meta: 'test' })).to.be.false;
                    expect(parser.opts.filter('thetest2', 'thefixture1', null, { meta: 'test' })).to.be.false;
                })
                .then(function () {
                    return parse('-t thetest1 --fixture-meta meta=test');
                })
                .then(function (parser) {
                    expect(parser.opts.filter('thetest1', null, null, null, { meta: 'test' })).to.be.true;
                    expect(parser.opts.filter('thetest1', null, null, null, {})).to.be.false;
                    expect(parser.opts.filter('thetest2', null, null, null, { meta: 'test' })).to.be.false;
                })
                .then(function () {
                    return parse('-f thefixture1 --fixture-meta meta=test');
                })
                .then(function (parser) {
                    expect(parser.opts.filter(null, 'thefixture1', null, null, { meta: 'test' })).to.be.true;
                    expect(parser.opts.filter(null, 'thefixture1', null, null, {})).to.be.false;
                    expect(parser.opts.filter(null, 'thefixture2', null, null, { meta: 'test' })).to.be.false;
                })
                .then(function () {
                    return parse('-t thetest1 -f thefixture1 --fixture-meta meta=test');
                })
                .then(function (parser) {
                    expect(parser.opts.filter('thetest1', 'thefixture1', null, null, { meta: 'test' })).to.be.true;
                    expect(parser.opts.filter('thetest1', 'thefixture1', null, null, {})).to.be.false;
                    expect(parser.opts.filter('thetest1', 'thefixture2', null, null, { meta: 'test' })).to.be.false;
                    expect(parser.opts.filter('thetest2', 'thefixture1', null, null, { meta: 'test' })).to.be.false;
                })
                .then(function () {
                    return parse('-t thetest1 -f thefixture1 --test-meta test=test --fixture-meta fixture=test');
                })
                .then(function (parser) {
                    expect(parser.opts.filter('thetest1', 'thefixture1', null, { test: 'test' }, { fixture: 'test' })).to.be.true;
                    expect(parser.opts.filter('thetest1', 'thefixture1', null, {}, { fixture: 'test' })).to.be.false;
                    expect(parser.opts.filter('thetest1', 'thefixture1', null, { test: 'test' }, {})).to.be.false;
                    expect(parser.opts.filter('thetest1', 'thefixture2', null, { test: 'test' }, { fixture: 'test' })).to.be.false;
                    expect(parser.opts.filter('thetest2', 'thefixture1', null, { test: 'test' }, { fixture: 'test' })).to.be.false;
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
                            `Unable to read the file referenced by the "key" ssl option ("${__dirname}"). Error details:`
                        );
                    })
                    .then(() => parse(`--ssl cert=${__dirname}`))
                    .catch(error => {
                        expect(error.message).to.include(
                            `Unable to read the file referenced by the "cert" ssl option ("${__dirname}"). Error details:`
                        );
                    })
                    .then(() => parse(`--ssl pfx=${__dirname}`))
                    .catch(error => {
                        expect(error.message).to.include(
                            `Unable to read the file referenced by the "pfx" ssl option ("${__dirname}"). Error details:`
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

    describe('Screenshot options', () => {
        it('Should parse screenshot options', async () => {
            const parser = await parse('--screenshots path=/a/b/c,fullPage=true,takeOnFails=true,pathPattern=${TEST}.png');

            expect(parser.opts.screenshots.takeOnFails).to.be.ok;
            expect(parser.opts.screenshots.path).equal('/a/b/c');
            expect(parser.opts.screenshots.fullPage).to.be.ok;
            expect(parser.opts.screenshots.pathPattern).equal('${TEST}.png');
        });

        it('Should understand legacy keys', async () => {
            const parser = await parse('--screenshots-on-fails --screenshots /a/b/c --screenshot-path-pattern ${TEST}.png');

            expect(parser.opts.screenshots.takeOnFails).to.be.ok;
            expect(parser.opts.screenshots.path).equal('/a/b/c');
            expect(parser.opts.screenshots.fullPage).to.be.undefined;
            expect(parser.opts.screenshots.pathPattern).equal('${TEST}.png');
        });

        it('Should prioritize over legacy keys', async () => {
            const parser = await parse('--screenshots path=/a/b/c,takeOnFails=false,pathPattern=${TEST}.png --screenshots-on-fails --screenshot-path-pattern not${TEST}.png');

            expect(parser.opts.screenshots.takeOnFails).to.be.false;
            expect(parser.opts.screenshots.path).equal('/a/b/c');
            expect(parser.opts.screenshots.fullPage).to.be.undefined;
            expect(parser.opts.screenshots.pathPattern).equal('${TEST}.png');
        });
    });

    describe('Compiler options', () => {
        it('Basic', async () => {
            const cmd = '--compiler-options ' +
                'typescript.options.skipLibCheck=true;' +
                "typescript.options.lib=ES5,'WebWorker';" +
                'typescript.configPath=/path-to-tsconfig.json';

            const parser = await parse(cmd);

            const typescriptCompilerOptions = parser.opts.compilerOptions.typescript;

            expect(typescriptCompilerOptions.options.skipLibCheck).eql(true);
            expect(typescriptCompilerOptions.options.lib).eql(['ES5', 'WebWorker']);
            expect(typescriptCompilerOptions.configPath).eql('/path-to-tsconfig.json');
        });

        it('Array option with a single element', async () => {
            const parser = await parse('--compiler-options typescript.options.lib=ES5');

            expect(parser.opts.compilerOptions.typescript.options.lib).eql(['ES5']);
        });
    });

    it('Client scripts', () => {
        return parse('--client-scripts asserts/jquery.js,mockDate.js')
            .then(parser => {
                expect(parser.opts.clientScripts).eql([
                    'asserts/jquery.js',
                    'mockDate.js'
                ]);
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

    describe('Quarantine Option', function () {
        it('Should parse quarantine arguments', async () => {
            async function checkCliArgs (argsString) {
                const parser = await parse(argsString);

                expect(parser.opts.quarantineMode).to.be.ok;
                expect(parser.opts.quarantineMode.attemptLimit).equal(5);
                expect(parser.opts.quarantineMode.successThreshold).equal(1);
            }

            await checkCliArgs('-q attemptLimit=5,successThreshold=1');
            await checkCliArgs('--quarantine-mode attemptLimit=5,successThreshold=1');
        });

        it('Should pass if only "successThreshold" is provided', async () => {
            async function checkCliArgs (argsString) {
                const parser = await parse(argsString);

                expect(parser.opts.quarantineMode).to.be.ok;
                expect(parser.opts.quarantineMode.successThreshold).equal(1);
            }

            await checkCliArgs('-q successThreshold=1');
            await checkCliArgs('--quarantine-mode successThreshold=1');
        });

        it('Should fail if the argument value is not specified', async () => {
            await assertRaisesError('-q attemptLimit=', 'The "--quarantine-mode" option does not contain a valid key-value pair.');
            await assertRaisesError('--quarantine-mode attemptLimit=', 'The "--quarantine-mode" option does not contain a valid key-value pair.');
        });

        it('Should fail if "successThreshold" is greater or equal to "attemptLimit"', async () => {
            await assertRaisesError('-q attemptLimit=2,successThreshold=2', 'The value of "attemptLimit" (2) should be greater then the value of "successThreshold" (2).');
            await assertRaisesError('--quarantine-mode attemptLimit=2,successThreshold=2', 'The value of "attemptLimit" (2) should be greater then the value of "successThreshold" (2).');

            await assertRaisesError('-q attemptLimit=2,successThreshold=3', 'The value of "attemptLimit" (2) should be greater then the value of "successThreshold" (3).');
            await assertRaisesError('--quarantine-mode attemptLimit=2,successThreshold=3', 'The value of "attemptLimit" (2) should be greater then the value of "successThreshold" (3).');
        });

        it('Should fail if "attemptLimit" is less than 3 with the default "successThreshold" value (3)', async () => {
            await assertRaisesError('-q attemptLimit=2', 'The value of "attemptLimit" (2) should be greater then the value of "successThreshold" (3).');
            await assertRaisesError('--quarantine-mode attemptLimit=2', 'The value of "attemptLimit" (2) should be greater then the value of "successThreshold" (3).');
        });

        it('Should fail if "attemptLimit" is less than 2', async () => {
            await assertRaisesError('-q attemptLimit=1', 'The "attemptLimit" parameter only accepts values of 2 and up.');
            await assertRaisesError('--quarantine-mode attemptLimit=1', 'The "attemptLimit" parameter only accepts values of 2 and up.');

            await assertRaisesError('-q attemptLimit=0', 'The "attemptLimit" parameter only accepts values of 2 and up.');
            await assertRaisesError('--quarantine-mode attemptLimit=0', 'The "attemptLimit" parameter only accepts values of 2 and up.');
        });

        it('Should fail if "successThreshold" is less than 1', async () => {
            await assertRaisesError('-q successThreshold=0', 'The "successThreshold" parameter only accepts values of 1 and up.');
            await assertRaisesError('--quarantine-mode successThreshold=0', 'The "successThreshold" parameter only accepts values of 1 and up.');
        });

        it('Should not fail if the quarantine option is not the latest option and no quarantine mode arguments are specified', async () => {
            async function checkCliArgs (argsString) {
                const parser = await parse(argsString);

                expect(parser.opts.quarantineMode).to.be.ok;
                expect(parser.opts.browsers).eql(['chrome']);
                expect(parser.opts.src).eql(['test.js']);
            }

            await checkCliArgs('-q chrome test.js');
            await checkCliArgs('--quarantine-mode chrome test.js');
            await checkCliArgs('chrome -q test.js');
            await checkCliArgs('chrome --quarantine-mode test.js');
        });
    });

    it('Should parse command line arguments', function () {
        return parse('-r list -S -q -e --hostname myhost --proxy localhost:1234 --proxy-bypass localhost:5678 --qr-code --app run-app --speed 0.5 --debug-on-fail --disable-page-reloads --retry-test-pages --dev --sf --disable-page-caching ie test/server/data/file-list/file-1.js')
            .then(parser => {
                expect(parser.opts.browsers).eql(['ie']);
                expect(parser.opts.src).eql(['test/server/data/file-list/file-1.js']);
                expect(parser.opts.reporter[0].name).eql('list');
                expect(parser.opts.hostname).eql('myhost');
                expect(parser.opts.app).eql('run-app');
                expect(parser.opts.screenshots.takeOnFails).to.be.ok;
                expect(parser.opts.screenshots.path).to.be.undefined;
                expect(parser.opts.screenshots.fullPage).to.be.undefined;
                expect(parser.opts.screenshots.pathPattern).to.be.undefined;
                expect(parser.opts.quarantineMode).to.be.ok;
                expect(parser.opts.skipJsErrors).to.be.ok;
                expect(parser.opts.dev).to.be.ok;
                expect(parser.opts.speed).eql(0.5);
                expect(parser.opts.qrCode).to.be.ok;
                expect(parser.opts.proxy).to.be.ok;
                expect(parser.opts.proxyBypass).to.be.ok;
                expect(parser.opts.debugOnFail).to.be.ok;
                expect(parser.opts.stopOnFirstFail).to.be.ok;
                expect(parser.opts.disablePageCaching).to.be.ok;
                expect(parser.opts.disablePageReloads).to.be.ok;
                expect(parser.opts.retryTestPages).to.be.ok;
            });
    });

    it('Should have static CLI', () => {
        const CHANGE_CLI_WARNING         = 'IMPORTANT: Please be sure what you want to change CLI if this test is failing!';
        const ADD_TO_RUN_OPTIONS_WARNING = 'Check that the added option is correctly passed from the command-line interface to the run options.' +
                                           'If the new option is not a run option just increase the "expectedOtherOptionsCount" value';

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
            { long: '--browser-init-timeout' },
            { long: '--speed' },
            { long: '--ports' },
            { long: '--hostname' },
            { long: '--proxy' },
            { long: '--proxy-bypass' },
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
            { long: '--config-file' },
            { long: '--ts-config-path' },
            { long: '--client-scripts', short: '--cs' },
            { long: '--disable-page-caching' },
            { long: '--disable-page-reloads' },
            { long: '--retry-test-pages' },
            { long: '--disable-screenshots' },
            { long: '--screenshots-full-page' },
            { long: '--disable-multiple-windows' },
            { long: '--experimental-compiler-service' },
            { long: '--compiler-options' },
            { long: '--page-request-timeout' },
            { long: '--ajax-request-timeout' },
            { long: '--cache' }
        ];

        const parser  = new CliArgumentParser('');
        const options = [ ...parser.program.options, ...parser.experimental.options];

        expect(options.length).eql(EXPECTED_OPTIONS.length, CHANGE_CLI_WARNING);

        for (let i = 0; i < EXPECTED_OPTIONS.length; i++) {
            const option = find(options, EXPECTED_OPTIONS[i]);

            expect(option).not.eql(void 0, CHANGE_CLI_WARNING);
            expect(option.long).eql(EXPECTED_OPTIONS[i].long, CHANGE_CLI_WARNING);
            expect(option.short).eql(EXPECTED_OPTIONS[i].short, CHANGE_CLI_WARNING);
        }

        const expectedRunOptionsCount   = 18;
        const expectedOtherOptionsCount = 35;
        const otherOptionsCount         = options.length - expectedRunOptionsCount;

        expect(runOptionNames.length).eql(expectedRunOptionsCount, ADD_TO_RUN_OPTIONS_WARNING);
        expect(otherOptionsCount).eql(expectedOtherOptionsCount, ADD_TO_RUN_OPTIONS_WARNING);
    });

    it('Run options', () => {
        const argumentsString = 'ie,chrome test.js' + [
            '--debug-on-fail',
            '--skip-js-errors',
            '--skip-uncaught-errors',
            '--quarantine-mode',
            '--debug-mode',
            '--debug-on-fail',
            '--selector-timeout 1000',
            '--assertion-timeout 1000',
            '--page-load-timeout 1000',
            '--browser-init-timeout 1000',
            '--speed 1',
            '--stop-on-first-fail',
            '--disable-page-caching',
            '--disable-page-reloads',
            '--disable-screenshots',
            '--disable-multiple-windows'
        ].join(' ');

        return parse(argumentsString)
            .then(parser => {
                const runOpts = parser.getRunOptions();

                expect(runOpts.skipJsErrors).eql(true);
                expect(runOpts.skipUncaughtErrors).eql(true);
                expect(runOpts.quarantineMode).eql(true);
                expect(runOpts.debugMode).eql(true);
                expect(runOpts.debugOnFail).eql(true);
                expect(runOpts.selectorTimeout).eql(1000);
                expect(runOpts.assertionTimeout).eql(1000);
                expect(runOpts.pageLoadTimeout).eql(1000);
                expect(runOpts.browserInitTimeout).eql(1000);
                expect(runOpts.speed).eql(1);
                expect(runOpts.stopOnFirstFail).eql(true);
                expect(runOpts.disablePageCaching).eql(true);
                expect(runOpts.disablePageReloads).eql(true);
                expect(runOpts.disableScreenshots).eql(true);
                expect(runOpts.disableMultipleWindows).eql(true);
                expect(runOpts.browsers).to.be.undefined;
            });
    });
});
