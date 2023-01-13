const expect = require('chai').expect;
const config = require('../../config');
const path = require('path');

describe('ESM support', function () {
    if (config.experimentalESM || config.experimentalDebug) {
        it('Should import ESM without errors in ESM mode', function () {
            return runTests('./testcafe-fixtures/import-esm.js', null, { only: 'chrome' });
        });
    }
    else {
        it('Should throw an error if ESM imported in CommonJS mode', function () {
            return runTests('./testcafe-fixtures/import-esm.js', null, { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    const targetFileName = path.resolve('test/functional/fixtures/esm/testcafe-fixtures/import-esm.js');
                    const ESModule = path.resolve('test/functional/fixtures/esm/testcafe-fixtures/esm-package.mjs');

                    expect(errs.message).to.contains(`Cannot import the ${ESModule} ECMAScript module from ${targetFileName}. Use a dynamic import() statement or enable the --experimental-esm CLI flag.`);
                });
        });
    }

});
