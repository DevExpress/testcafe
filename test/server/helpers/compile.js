var sortBy   = require('lodash').sortBy;
var resolve  = require('path').resolve;
var Compiler = require('../../../lib/compiler');

module.exports = function compile (sources) {
    sources = Array.isArray(sources) ? sources : [sources];

    sources = sources.map(function (filename) {
        return resolve(filename);
    });

    var compiler = new Compiler(sources);

    return compiler.getTests()
        .then(function (tests) {
            var fixtures = tests
                .reduce(function (fxtrs, test) {
                    if (fxtrs.indexOf(test.fixture) < 0)
                        fxtrs.push(test.fixture);

                    return fxtrs;
                }, []);

            return {
                tests:    sortBy(tests, 'name'),
                fixtures: sortBy(fixtures, 'name')
            };
        });
};
