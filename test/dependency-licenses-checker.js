const Promise        = require('pinkie');
const path           = require('path');
const licenseChecker = require('license-checker').init;

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

const modulePath = path.join(__dirname, '../');

function checkLicense (license, module) {
    const unknownModuleAssertionMsg       = `The module '${module}' contains an unknown license '${license}'. Update the permissive licenses list only if it's a known permissive license`;
    const incompatibleLicenseAssertionMsg = `The module '${module}' contains an incompatible license: '${license}' and can't be used with testcafe !!!`;

    if (hasUnknownLicenses(license)) throw new Error(unknownModuleAssertionMsg);
    if (hasIncompatibleLicenses(license)) throw new Error(incompatibleLicenseAssertionMsg);
}

module.exports = function () {
    return new Promise((resolve, reject) => {
        licenseChecker({ start: modulePath, production: true }, (err, modules) => {
            if (err) {
                reject(err);

                return;
            }

            Object.keys(modules).forEach(module => {
                const licenses = modules[module].licenses;

                if (typeof licenses === 'string')
                    checkLicense(licenses, module);

                else {
                    licenses.forEach(license => {
                        checkLicense(license, module);
                    });
                }
            });

            resolve();
        });
    });
};
