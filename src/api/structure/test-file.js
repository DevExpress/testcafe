import BaseUnit from './base-unit';
import { TEST_FILE as TEST_FILE_TYPE } from './unit-types';


const BORROWED_TEST_PROPERTIES = ['skip', 'only', 'pageUrl', 'authCredentials'];

export default class TestFile extends BaseUnit {
    constructor (filename) {
        super(TEST_FILE_TYPE);

        this.filename       = filename;
        this.currentFixture = null;
        this.collectedTests = [];
    }

    getTests () {
        this.collectedTests.forEach(test => {
            BORROWED_TEST_PROPERTIES.forEach(prop => {
                test[prop] = test[prop] || test.fixture[prop];
            });

            if (test.disablePageReloads === void 0)
                test.disablePageReloads = test.fixture.disablePageReloads;

            if (!test.disablePageCaching)
                test.disablePageCaching = test.fixture.disablePageCaching;
        });

        return this.collectedTests;
    }
}
