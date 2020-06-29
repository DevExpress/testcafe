import BaseUnit from './base-unit';
import UnitType from './unit-type';
import Fixture from './fixture';
import Test from './test';

const BORROWED_TEST_PROPERTIES = ['skip', 'only', 'pageUrl', 'authCredentials'];

export default class TestFile extends BaseUnit {
    public filename: string;
    public currentFixture: Fixture | null;
    public collectedTests: Test[];

    public constructor (filename: string) {
        super(UnitType.testFile);

        this.filename       = filename;
        this.currentFixture = null;
        this.collectedTests = [];
    }

    public getTests (): Test[] {
        this.collectedTests.forEach(test => {
            BORROWED_TEST_PROPERTIES.forEach(prop => {
                // TODO: add index signature to the Test and Fixture classes
                //@ts-ignore
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
