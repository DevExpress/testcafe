const path           = require('path');
const expect         = require('chai').expect;
const promisify      = require('../../lib/utils/promisify');
const licenseChecker = promisify(require('license-checker').init);

const PERMISSIVE_LICENSES = [
    'MIT',
    'BSD-3-Clause OR MIT',
    'BSD-3-Clause AND MIT',
    '(MIT OR Apache-2.0)',
    '(MIT AND CC-BY-3.0)',
    'ISC',
    'ISC*',
    'MIT*',
    'CC-BY-3.0',
    'CC-BY-4.0',
    'BSD',
    'BSD*',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'Unlicense',
    'Apache 2.0',
    'WTFPL OR ISC',
    'Public Domain',
    'WTFPL',
    'Apache-2.0'
];

const INCOMPATIBLE_LICENSES_RE = /GPL/i;

const hasIncompatibleLicenses = license => INCOMPATIBLE_LICENSES_RE.test(license);
const hasUnknownLicenses      = license => PERMISSIVE_LICENSES.indexOf(license) === -1;

describe('Dependency licenses', function () {
    it('Should not have dependencies with an unknown or incompatible licenses', () => {
        const modulePath = path.join(__dirname, '../../');

        return licenseChecker({ start: modulePath, production: true })
            .then(modules => {
                Object.keys(modules).forEach(module => {
                    const licenses = modules[module].licenses;

                    const unknownModuleAssertionMsg       = `The module '${module}' contains an unknown license '${licenses}'. Update the permissive licenses list only if it's a known permissive license`;
                    const incompatibleLicenseAssertionMsg = `The module '${module}' contains an incompatible license: '${licenses}' and can't be used with testcafe !!!`;

                    if (typeof licenses === 'string') {
                        expect(hasUnknownLicenses(licenses), unknownModuleAssertionMsg).not.ok;
                        expect(hasIncompatibleLicenses(licenses), incompatibleLicenseAssertionMsg).not.ok;
                    }

                    else {
                        licenses.forEach(license => {
                            expect(hasUnknownLicenses(license), unknownModuleAssertionMsg).not.ok;
                            expect(hasIncompatibleLicenses(license), incompatibleLicenseAssertionMsg).not.ok;
                        });
                    }
                });
            });
    });
});
