const { sortBy, castArray } = require('lodash');
const { resolve }           = require('path');
const Compiler              = require('../../../lib/compiler');

module.exports = function compile (sources, compilerOptions, optionalCompilerArgs) {
    sources = castArray(sources).map(filename => resolve(filename));

    const compiler = new Compiler(sources, compilerOptions, optionalCompilerArgs );

    return compiler.getTests()
        .then(tests => {
            const fixtures = tests
                .reduce((fxtrs, test) => {
                    if (!fxtrs.includes(test.fixture))
                        fxtrs.push(test.fixture);

                    return fxtrs;
                }, []);

            return {
                tests:    sortBy(tests, 'name'),
                fixtures: sortBy(fixtures, 'name'),
            };
        });
};
