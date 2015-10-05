var path            = require('path');
var expect          = require('chai').expect;
var Compiler        = require('../../lib/compiler');
var RequireAnalyzer = require('../../lib/compiler/old/analysis/require_analyzer');


describe('Compiler', function () {
    it('Should read each require once and save it to the cache', function (done) {
        var requireAnalyzingCount    = 0;
        var nativeRequireAnalyzerRun = RequireAnalyzer.run;

        RequireAnalyzer.run = function () {
            requireAnalyzingCount++;
            nativeRequireAnalyzerRun.apply(this, arguments);
        };

        var compiler = new Compiler([
            path.join(__dirname, './data/test-suite/require1.test.js'),
            path.join(__dirname, './data/test-suite/require2.test.js')
        ]);

        compiler
            .getTests()
            .then(function () {
                expect(requireAnalyzingCount).eql(1);
                done();
            })
            .catch(function (err) {
                done(err);
            });
    });
});
