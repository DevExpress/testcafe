const expect = require('chai').expect;
const config = require('../../config');
const path   = require('path');
const semver = require('semver');

describe('ESM support', function () {
    if (config.esm) {
        it('Should import ESM without errors in ESM mode', function () {
            return runTests('./testcafe-fixtures/import-esm.js', null, { only: 'chrome' });
        });
    }
    else if (semver.gte(process.version, '22.12.0')) {
        // Node.js 22.12.0+ supports require(esm) natively, so ESM imports succeed even in non-ESM mode
        it('Should import ESM without errors in CommonJS mode on Node.js 22.12.0+', function () {
            return runTests('./testcafe-fixtures/import-esm.js', null, { only: 'chrome' });
        });
    }
    else {
        it('Should throw an error if ESM imported in CommonJS mode', function () {
            return runTests('./testcafe-fixtures/import-esm.js', null, { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    const targetFileName = path.resolve('test/functional/fixtures/esm/testcafe-fixtures/import-esm.js');
                    const ESModule = path.resolve('test/functional/fixtures/esm/testcafe-fixtures/esm-package.mjs');

                    expect(errs.message).to.contains(`Cannot import the ${ESModule} ECMAScript module from ${targetFileName}. Use a dynamic import() statement or enable the --esm CLI flag.`);
                });
        });
    }

});
