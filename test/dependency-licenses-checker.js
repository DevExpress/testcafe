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
    '(WTFPL OR MIT)',
    'Public Domain',
    'WTFPL',
    'Apache-2.0'
];

const INCOMPATIBLE_LICENSES_RE = /GPL/i;

const hasIncompatibleLicenses = license => INCOMPATIBLE_LICENSES_RE.test(license);
const hasUnknownLicenses      = license => PERMISSIVE_LICENSES.indexOf(license) === -1;

const modulePath = path.join(__dirname, '../');

function checkLicense (license, module) {
    const unknownModuleAssertionMsg       = `The module '${module}' contains an unknown license '${license}'. You can add this license to the list of known permissive licenses. But be cautious and do this only if you are sure that this license is compatible with TestCafe`;
    const incompatibleLicenseAssertionMsg = `Alert! The module '${module}' contains an incompatible license '${license}' and cannot be used with TestCafe!`;

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
