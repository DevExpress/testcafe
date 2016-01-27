var expect    = require('chai').expect;
var resolve   = require('path').resolve;
var Promise   = require('pinkie');
var Compiler  = require('../../lib/compiler');
var Role      = require('../../lib/api/common/role');
var Hybrid    = require('../../lib/api/common/hybrid');
var compareFn = require('compare-func');

describe('Compiler', function () {
    this.timeout(10000);

    function compile (sources) {
        sources = Array.isArray(sources) ? sources : [sources];

        sources = sources.map(function (filename) {
            return resolve(filename);
        });

        var compiler = new Compiler(sources);

        return compiler.getTests()
            .then(function (tests) {
                var comparer = compareFn('name');

                tests = tests.sort(comparer);

                var fixtures = tests
                    .reduce(function (fxtrs, test) {
                        if (fxtrs.indexOf(test.fixture) < 0)
                            fxtrs.push(test.fixture);

                        return fxtrs;
                    }, [])
                    .sort(comparer);

                return { tests: tests, fixtures: fixtures };
            });
    }


    it('Should compile test files and their dependencies', function () {
        var sources = [
            'test/server/data/test-suites/basic/testfile1.js',
            'test/server/data/test-suites/basic/testfile2.js'
        ];

        return compile(sources)
            .then(function (compiled) {
                var testfile1 = resolve('test/server/data/test-suites/basic/testfile1.js');
                var testfile2 = resolve('test/server/data/test-suites/basic/testfile2.js');
                var tests     = compiled.tests;
                var fixtures  = compiled.fixtures;

                expect(tests.length).eql(4);
                expect(fixtures.length).eql(3);

                expect(fixtures[0].name).eql('Fixture1');
                expect(fixtures[0].path).eql(testfile1);
                expect(fixtures[0].page).eql('about:blank');

                expect(fixtures[1].name).eql('Fixture2');
                expect(fixtures[1].path).eql(testfile1);
                expect(fixtures[1].page).eql('http://example.org');

                expect(fixtures[2].name).eql('Fixture3');
                expect(fixtures[2].path).eql(testfile2);
                expect(fixtures[2].page).eql('https://example.com');

                expect(tests[0].name).eql('Fixture1Test1');
                expect(tests[0].fixture).eql(fixtures[0]);

                expect(tests[1].name).eql('Fixture1Test2');
                expect(tests[1].fixture).eql(fixtures[0]);

                expect(tests[2].name).eql('Fixture2Test1');
                expect(tests[2].fixture).eql(fixtures[1]);

                expect(tests[3].name).eql('Fixture3Test1');
                expect(tests[3].fixture).eql(fixtures[2]);

                return Promise.all(tests.map(function (test) {
                    return test.fn();
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

    it('Should provide common API functions via lib dependency', function () {
        return compile('test/server/data/test-suites/common-runtime-dep/testfile.js')
            .then(function (compiled) {
                var commons = compiled.tests[0].fn();

                expect(commons.Role).eql(Role);
                expect(commons.Hybrid).eql(Hybrid);
            });
    });

    it('Should not leak globals to dependencies and test body', function () {
        return compile('test/server/data/test-suites/globals-in-dep/testfile.js')
            .then(function (compiled) {
                expect(compiled.tests[0].fn()).to.be.true;
            });
    });

    it('Should compile mixed content', function () {
        var sources = [
            'test/server/data/test-suites/mixed-content/testfile.js',
            'test/server/data/test-suites/mixed-content/legacy.test.js',
            'test/server/data/test-suites/mixed-content/non-testfile.js'
        ];

        return compile(sources)
            .then(function (compiled) {
                expect(compiled.tests.length).eql(2);

                expect(compiled.tests[0].name).eql('1.Test');
                expect(compiled.tests[0].isLegacy).to.be.undefined;

                expect(compiled.tests[1].name).eql('2.LegacyTest');
                expect(compiled.tests[1].isLegacy).to.be.true;
            });
    });
});
