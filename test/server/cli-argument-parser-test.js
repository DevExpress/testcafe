var expect                  = require('chai').expect;
var path                    = require('path');
var fs                      = require('fs');
var tmp                     = require('tmp');
var Promise                 = require('es6-promise').Promise;
var getBrowserInstallations = require('testcafe-browser-natives').getInstallations;
var CliArgumentParser       = require('../../lib/cli/argument-parser');

describe('CLI argument parser', function () {
    tmp.setGracefulCleanup();

    function parse (args) {
        var parser = new CliArgumentParser();

        args = ['node', 'index.js'].concat(args.split(/\s+/));

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
            return parse('/Applications/Firefox.app,ie,chrome,ff,')
                .then(function (parser) {
                    expect(parser.browsers).eql(['/Applications/Firefox.app', 'ie', 'chrome', 'ff']);
                });
        });

        it('Should accept "remote" alias', function () {
            return parse('12remote,ie,remote,chrome,3remote')
                .then(function (parser) {
                    expect(parser.browsers).eql(['ie', 'chrome']);
                    expect(parser.remoteCount).eql(16);
                });
        });

        it('Should accept "all" alias', function () {
            return Promise
                .all([
                    getBrowserInstallations(),
                    parse('ie,chrome,all')
                ])
                .then(function (results) {
                    var allAliasses = Object.keys(results[0]);
                    var parser      = results[1];

                    expect(parser.browsers).eql(['ie', 'chrome'].concat(allAliasses));
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
            return assertRaisesError('--ports 1337,yo', 'A port number should be a valid integer.');
        });

        it('Should raise error if "--ports" option has less than 2 ports specified', function () {
            return assertRaisesError('--ports 1337', 'The "--ports" option requires two numbers to be specified.');
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
            'test/server/data/file-list/dir1/file-1-1.js',
            'test/server/data/file-list/dir1/file-1-2.js',
            'test/server/data/file-list/dir2/file-2-2.js',
            'test/server/data/file-list/dir2/file-2-3.js'
        ];

        expected = expected.map(function (file) {
            return path.resolve(cwd, file);
        });

        return parse('chrome ' +
                     'test/server/data/file-list/file-1.js ' +
                     path.join(cwd, 'test/server/data/file-list/file-2.js') + ' ' +
                     'test/server/data/file-list/dir1/*.js ' +
                     'test/server/data/file-list/dir2/*.js ' +
                     '!test/server/data/file-list/dir2/file-2-1.js ' +
                     'test/server/data/file-list/dir3')
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

    it('Should parse command line arguments', function () {
        return parse('-r list -S -q -e --hostname myhost --qr-code ie test/server/data/file-list/file-1.js')
            .then(function (parser) {
                expect(parser.browsers).eql(['ie']);
                expect(parser.src).eql([path.resolve(process.cwd(), 'test/server/data/file-list/file-1.js')]);
                expect(parser.opts.reporter).eql('list');
                expect(parser.opts.hostname).eql('myhost');
                expect(parser.opts.screenshots).to.be.undefined;
                expect(parser.opts.screenshotsOnFails).to.be.ok;
                expect(parser.opts.quarantineMode).to.be.ok;
                expect(parser.opts.skipJsErrors).to.be.ok;
                expect(parser.opts.qrCode).to.be.ok;
            });
    });
});

