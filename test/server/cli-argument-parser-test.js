var expect            = require('chai').expect;
var path              = require('path');
var fs                = require('fs');
var tmp               = require('tmp');
var find              = require('lodash').find;
var CliArgumentParser = require('../../lib/cli/argument-parser');

describe('CLI argument parser', function () {
    this.timeout(10000);

    tmp.setGracefulCleanup();

    function parse (args, cwd) {
        var parser = new CliArgumentParser(cwd);

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
                    expect(parser.concurrency).eql(2);
                });
        });

        it('Should parse "-c" option as a number', function () {
            return parse('-c 2')
                .then(function (parser) {
                    expect(parser.concurrency).eql(2);
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
                    expect(parser.filter('test', 'fixture1')).to.be.true;
                    expect(parser.filter('test', 'fixture2')).to.be.true;
                    expect(parser.filter('test', 'fixture')).to.be.false;
                });
        });

        it('Should raise error if "-F, --fixture-grep" value is invalid regular expression', function () {
            return assertRaisesError('-F *+', 'The "--fixture-grep" option value is not a valid regular expression.');
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
                });
        });
    });

    it('Should accept globs and paths as source files', function () {
        var cwd = process.cwd();

        var expected = [
            'test/server/data/file-list/file-1.js',
            'test/server/data/file-list/file-2.js',
            'test/server/data/file-list/dir1/dir1-1/file-1-1-1.js',
            'test/server/data/file-list/dir1/file-1-1.js',
            'test/server/data/file-list/dir1/file-1-2.js',
            'test/server/data/file-list/dir1/file-1-3.testcafe',
            'test/server/data/file-list/dir1/file-1-4.ts',
            'test/server/data/file-list/dir2/file-2-2.js',
            'test/server/data/file-list/dir2/file-2-3.js'
        ];

        expected = expected.map(function (file) {
            return path.resolve(cwd, file);
        });

        return parse('chrome ' +
                     'test/server/data/file-list/file-1.js ' +
                     path.join(cwd, 'test/server/data/file-list/file-2.js') + ' ' +
                     'test/server/data/file-list/dir1 ' +
                     'test/server/data/file-list/dir2/*.js ' +
                     '!test/server/data/file-list/dir2/file-2-1.js ' +
                     'test/server/data/file-list/dir3')
            .then(function (parser) {
                expect(parser.src).eql(expected);
            });
    });

    it('Should use "test" and "tests" dirs if source files are not specified', function () {
        var workingDir = path.join(__dirname, './data/file-list');

        var expected = [
            'test/test-dir-file.js',
            'tests/tests-dir-file.js'
        ];

        expected = expected.map(function (file) {
            return path.resolve(workingDir, file);
        });

        return parse('chrome', workingDir)
            .then(function (parser) {
                expect(parser.src).eql(expected);
            });
    });

    it('Should parse the screenshot path and ensure it exists', function () {
        var dir = path.join(tmp.dirSync().name, 'my/screenshots');

        return parse('-s ' + dir)
            .then(function (parser) {
                expect(parser.opts.screenshots).eql(dir);
                expect(fs.existsSync(dir)).to.be.true;
            });
    });

    it('Should parse reporters and their output file paths and ensure they exist', function () {
        var cwd      = process.cwd();
        var filePath = path.join(tmp.dirSync().name, 'my/reports/report.json');

        return parse('-r list,json:' + filePath)
            .then(function (parser) {
                expect(parser.opts.reporters[0].name).eql('list');
                expect(parser.opts.reporters[0].outFile).to.be.undefined;
                expect(parser.opts.reporters[1].name).eql('json');
                expect(parser.opts.reporters[1].outFile).eql(path.resolve(cwd, filePath));
            });
    });

    it('Should parse command line arguments', function () {
        return parse('-r list -S -q -e --hostname myhost --proxy localhost:1234 --proxy-bypass localhost:5678 --qr-code --app run-app --speed 0.5 --debug-on-fail ie test/server/data/file-list/file-1.js')
            .then(function (parser) {
                expect(parser.browsers).eql(['ie']);
                expect(parser.src).eql([path.resolve(process.cwd(), 'test/server/data/file-list/file-1.js')]);
                expect(parser.opts.reporters[0].name).eql('list');
                expect(parser.opts.hostname).eql('myhost');
                expect(parser.opts.app).eql('run-app');
                expect(parser.opts.screenshots).to.be.undefined;
                expect(parser.opts.screenshotsOnFails).to.be.ok;
                expect(parser.opts.quarantineMode).to.be.ok;
                expect(parser.opts.skipJsErrors).to.be.ok;
                expect(parser.opts.speed).eql(0.5);
                expect(parser.opts.qrCode).to.be.ok;
                expect(parser.opts.proxy).to.be.ok;
                expect(parser.opts.proxyBypass).to.be.ok;
                expect(parser.opts.debugOnFail).to.be.ok;
            });
    });

    it('Should has static CLI', function () {
        var WARNING          = 'IMPORTANT: Please be sure what you want to change CLI if this test is failing!';
        var EXPECTED_OPTIONS = [
            { long: '--version', short: '-v' },
            { long: '--list-browsers', short: '-b' },
            { long: '--reporter', short: '-r' },
            { long: '--screenshots', short: '-s' },
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
            { long: '--qr-code' },
            { long: '--color' },
            { long: '--no-color' }
        ];

        var parser  = new CliArgumentParser('');
        var options = parser.program.options;

        expect(options.length).eql(EXPECTED_OPTIONS.length, WARNING);

        for (var i = 0; i < EXPECTED_OPTIONS.length; i++)
            expect(find(options, EXPECTED_OPTIONS[i])).not.eql(void 0, WARNING);
    });
});

