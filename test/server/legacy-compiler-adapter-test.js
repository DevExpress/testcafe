var expect                = require('chai').expect;
var path                  = require('path');
var LegacyCompilerAdapter = require('../../lib/compiler');
var RequireAnalyzer       = require('../../lib/compiler/legacy/analysis/require_analyzer');


describe('Legacy compiler adapter', function () {
    it('Should read each require once and save it to the cache', function (done) {
        var requireAnalyzingCount    = 0;
        var nativeRequireAnalyzerRun = RequireAnalyzer.run;

        var sources = [
            path.resolve('test/server/data/test-suite/require1.test.js'),
            path.resolve('test/server/data/test-suite/require2.test.js')
        ];

        RequireAnalyzer.run = function () {
            requireAnalyzingCount++;
            nativeRequireAnalyzerRun.apply(this, arguments);
        };

        var compiler = new LegacyCompilerAdapter(sources);

        compiler
            .getTests()
            .then(function () {
                expect(requireAnalyzingCount).eql(1);
                done();
            })
            .catch(done);
    });

    it('Should provide errors for the legacy compiler', function (done) {
        var compiler = new LegacyCompilerAdapter(['test/server/data/test-suite/broken.test.js']);

        compiler
            .getTests()
            .then(function () {
                throw new Error('Promise rejection expected');
            })
            .catch(function (err) {
                expect(err).to.be.an.instanceof(Error);
                expect(err.message).not.to.be.empty;
            })

            .then(function () {
                done();
            })
            .catch(done);
    });
});
