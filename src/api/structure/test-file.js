const BORROWED_TEST_PROPERTIES = ['skip', 'only', 'pageUrl', 'authCredentials'];

export default class TestFile {
    constructor (filename) {
        this.filename       = filename;
        this.currentFixture = null;
        this.collectedTests = [];
    }

    getTests () {
        BORROWED_TEST_PROPERTIES.forEach(prop => {
            this.collectedTests.forEach(test => {
                test[prop] = test[prop] || test.fixture[prop];
            });
        });

        return this.collectedTests;
    }
}
