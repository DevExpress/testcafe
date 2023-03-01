/* eslint-disable */
describe('Redirects', () => {
    it.only('Should correctly handle redirects', () => {
        return runTests('testcafe-fixtures/redirects.js', null, { only: 'chrome' });
    });
});
