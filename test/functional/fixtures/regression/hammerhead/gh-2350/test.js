const { skipInNativeAutomation } = require('../../../../utils/skip-in');

describe("Should provide a valid value for the 'document.title' property", () => {
    describe('Initial value', () => {
        // NOTE: in the proxy mode we have some additional scripts for processing document.title
        // we do not have these scripts in the proxyless mode yet
        skipInNativeAutomation('script before and after <title>', () => {
            return runTests('./testcafe-fixtures/index.js', 'script before and after <title>');
        });

        it('script tag only in <body>', () => {
            return runTests('./testcafe-fixtures/index.js', 'script tag only in <body>');
        });

        it('script tag only in <body> and <title> is not last in <head>', () => {
            return runTests('./testcafe-fixtures/index.js', 'script tag only in <body> and <title> is not last in <head>');
        });
    });

    it('Empty value', () => {
        return runTests('./testcafe-fixtures/index.js', 'empty value');
    });

    // NOTE: in the proxy mode we have some additional scripts for processing document.title
    // we do not have these scripts in the proxyless mode yet
    skipInNativeAutomation('Change value', () => {
        return runTests('./testcafe-fixtures/index.js', 'change value');
    });

    it('Text property getters of the title element', () => {
        return runTests('./testcafe-fixtures/index.js', 'text property getters of the title element');
    });

    it('Set document.title in body', () => {
        return runTests('./testcafe-fixtures/index.js', 'set document.title in body');
    });

    it('Iframes', () => {
        return runTests('./testcafe-fixtures/iframes.js');
    });
});
