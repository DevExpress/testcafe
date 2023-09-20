const { expect } = require('chai');

describe('Role url test', () => {
    it('Should throw "error in role initializer" without baseUrl and with relative path Role', () => {
        return runTests(
            './testcafe-fixtures/role-url-test.js',
            'Should throw error in role initializer without baseUrl and with relative path Role',
            {
                only:       'chrome',
                shouldFail: true,
            }
        )
            .catch(err => {
                expect(err[0]).contains('Error in Role initializer');
            });
    });

    it('Should get success with baseUrl and with relative path Role', () => {
        return runTests(
            './testcafe-fixtures/role-url-test.js',
            'Should get success with baseUrl and with relative path Role',
            {
                only:    'chrome',
                baseUrl: 'http://localhost:3000/',
            }
        );
    });

    it('Should get success with baseUrl and with absolute path Role', () => {
        return runTests(
            './testcafe-fixtures/role-url-test.js',
            'Should get success with baseUrl and with absolute path Role',
            {
                only:    'chrome',
                baseUrl: 'http://localhost:3000/',
            }
        );
    });
});

