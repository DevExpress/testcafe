var expect                = require('chai').expect;
var path                  = require('path');
var LegacyCompilerAdapter = require('../../lib/compiler');
var RequireAnalyzer       = require('../../lib/compiler/legacy/analysis/require_analyzer');


describe('Legacy compiler adapter', function () {
    it('Should read each require once and save it to the cache', function () {
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

        return compiler
            .getTests()
            .then(function () {
                expect(requireAnalyzingCount).eql(1);
            });
    });

    it('Should provide errors for the legacy compiler', function () {
        var compiler = new LegacyCompilerAdapter(['test/server/data/test-suite/broken.test.js']);

        return compiler
            .getTests()
            .then(function () {
                throw new Error('Promise rejection expected');
            })
            .catch(function (err) {
                expect(err).to.be.an.instanceof(Error);
                expect(err.message).not.to.be.empty;
            });
    });
});
