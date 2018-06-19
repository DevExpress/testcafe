const BORROWED_TEST_PROPERTIES = ['skip', 'only', 'pageUrl', 'authCredentials'];

export default class TestFile {
    constructor (filename) {
        this.filename       = filename;
        this.currentFixture = null;
        this.collectedTests = [];
    }

    getTests () {
        this.collectedTests.forEach(test => {
            BORROWED_TEST_PROPERTIES.forEach(prop => {
                test[prop] = test[prop] || test.fixture[prop];
            });

            if (test.disableReloading === void 0)
                test.disableReloading = test.fixture.disableReloading;
        });

        return this.collectedTests;
    }
}
