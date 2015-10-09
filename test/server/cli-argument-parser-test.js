var expect                  = require('chai').expect;
var path                    = require('path');
var fs                      = require('fs');
var promisify               = require('es6-promisify');
var tmp                     = require('tmp');
var Promise                 = require('es6-promise').Promise;
var getBrowserInstallations = require('testcafe-browser-natives').getInstallations;
var CliArgumentParser       = require('../../lib/cli/argument-parser');

var readFile = promisify(fs.readFile);

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

    function assertRaisesError (args, expectedMsg, done) {
        parse(args)
            .then(function () {
                throw new Error('Promise rejection expected');
            })
            .catch(function (err) {
                expect(err.message).eql(expectedMsg);
            })

            .then(function () {
                done();
            })
            .catch(done);
    }

    describe('Browser list', function () {
        it('Should be parsed as array of aliases or paths', function (done) {
            parse('/Applications/Firefox.app,ie,chrome,ff,')
                .then(function (parser) {
                    expect(parser.browsers).eql(['/Applications/Firefox.app', 'ie', 'chrome', 'ff']);
                    done();
                })
                .catch(done);
        });

        it('Should accept "remote" alias', function (done) {
            parse('12remote,ie,remote,chrome,3remote')
                .then(function (parser) {
                    expect(parser.browsers).eql(['ie', 'chrome']);
                    expect(parser.remoteCount).eql(16);
                    done();
                });
        });

        it('Should accept "all" alias', function (done) {
            Promise
                .all([
                    getBrowserInstallations(),
                    parse('ie,chrome,all')
                ])
                .then(function (results) {
                    var allAliasses = Object.keys(results[0]);
                    var parser      = results[1];

                    expect(parser.browsers).eql(['ie', 'chrome'].concat(allAliasses));
                    done();
                });
        });
    });

    describe('Ports', function () {
        it('Should parse "--ports" option as array of two integers', function (done) {
            parse('--ports 1337,1338')
                .then(function (parser) {
                    expect(parser.opts.ports).eql([1337, 1338]);
                    done();
                })
                .catch(done);
        });

        it('Should raise error if "--ports" option value is not a integer', function (done) {
            assertRaisesError(
                '--ports 1337,yo',
                'A port number should be a valid integer.',
                done
            );
        });

        it('Should raise error if "--ports" option has less than 2 ports specified', function (done) {
            assertRaisesError(
                '--ports 1337',
                'The "--ports" option requires two numbers to be specified.',
                done
            );
        });
    });


    describe('Filtering options', function () {
        it('Should filter by test name with "-t, --test" option', function (done) {
            parse('-t test.js')
                .then(function (parser) {
                    expect(parser.filter('test.js')).to.be.true;
                    expect(parser.filter('1test.js')).to.be.false;
                    expect(parser.filter('test-js')).to.be.false;
                    done();
                })
                .catch(done);
        });

        it('Should filter by test name with "-T, --test-grep" option', function (done) {
            parse('-T ^test\\d+$')
                .then(function (parser) {
                    expect(parser.filter('test1')).to.be.true;
                    expect(parser.filter('test2')).to.be.true;
                    expect(parser.filter('test')).to.be.false;
                    done();
                })
                .catch(done);
        });

        it('Should raise error if "-T, --test-grep" value is invalid regular expression', function (done) {
            assertRaisesError(
                '-T *+',
                'The "--test-grep" option value is not a valid regular expression.',
                done
            );
        });

        it('Should filter by fixture name with "-f, --fixture" option', function (done) {
            parse('-f fixture.js')
                .then(function (parser) {
                    expect(parser.filter('test', 'fixture.js')).to.be.true;
                    expect(parser.filter('test', '1fixture.js')).to.be.false;
                    expect(parser.filter('test', 'fixture-js')).to.be.false;
                    done();
                })
                .catch(done);
        });

        it('Should filter by fixture name with "-F, --fixture-grep" option', function (done) {
            parse('-F ^fixture\\d+$')
                .then(function (parser) {
                    expect(parser.filter('test', 'fixture1')).to.be.true;
                    expect(parser.filter('test', 'fixture2')).to.be.true;
                    expect(parser.filter('test', 'fixture')).to.be.false;
                    done();
                })
                .catch(done);
        });

        it('Should raise error if "-F, --fixture-grep" value is invalid regular expression', function (done) {
            assertRaisesError(
                '-F *+',
                'The "--fixture-grep" option value is not a valid regular expression.',
                done
            );
        });

        it('Should combine filters provided by multiple options', function (done) {
            parse('-t thetest1 -T test\\d+$')
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
                    done();
                })
                .catch(done);
        });
    });

    it('Should accept globs and paths as source files', function (done) {
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

        parse('chrome ' +
              'test/server/data/file-list/file-1.js ' +
              path.join(cwd, 'test/server/data/file-list/file-2.js') + ' ' +
              'test/server/data/file-list/dir1/*.js ' +
              'test/server/data/file-list/dir2/*.js ' +
              '!test/server/data/file-list/dir2/file-2-1.js ' +
              'test/server/data/file-list/dir3')
            .then(function (parser) {
                expect(parser.src).eql(expected);
                done();
            })
            .catch(done);
    });

    it('Should parse the screenshot path and ensure it exists', function (done) {
        var dir = path.join(tmp.dirSync().name, 'my/screenshots');

        parse('-s ' + dir)
            .then(function (parser) {
                expect(parser.opts.screenshots).eql(dir);
                expect(fs.existsSync(dir)).to.be.true;
                done();
            })
            .catch(done);
    });

    it('Should parse report path and provide file stream', function (done) {
        var file = path.join(tmp.dirSync().name, 'my/reports/report1');

        parse('-p ' + file)
            .then(function (parser) {
                parser.reportOutStream.end('42');

                return readFile(file, 'utf8');
            })
            .then(function (content) {
                expect(content).eql('42');
                done();
            })
            .catch(done);
    });

    it('Should parse command line arguments', function (done) {
        parse('-r list -S -q -e --hostname myhost --qrcode ie test/server/data/file-list/file-1.js')
            .then(function (parser) {
                expect(parser.browsers).eql(['ie']);
                expect(parser.src).eql([path.resolve(process.cwd(), 'test/server/data/file-list/file-1.js')]);
                expect(parser.opts.reporter).eql('list');
                expect(parser.opts.hostname).eql('myhost');
                expect(parser.opts.screenshots).to.be.undefined;
                expect(parser.reportOutStream).to.be.null;
                expect(parser.opts.screenshotsOnFails).to.be.ok;
                expect(parser.opts.quarantineMode).to.be.ok;
                expect(parser.opts.skipJsErrors).to.be.ok;
                expect(parser.opts.qrcode).to.be.ok;
                done();
            })
            .catch(done);
    });
});

