import { find } from 'lodash';
import moment from 'moment';
import Capturer from './capturer';
import PathPattern from '../utils/path-pattern';
import getCommonPath from '../utils/get-common-path';
import DEFAULT_SCREENSHOT_EXTENSION from './default-extension';


export default class Screenshots {
    constructor ({ enabled, path, pathPattern, pathPatternOnFails, fullPage, thumbnails }) {
        this.enabled                   = enabled;
        this.screenshotsPath           = path;
        this.screenshotsPattern        = pathPattern;
        this.screenshotsPatternOnFails = pathPatternOnFails;
        this.fullPage                  = fullPage;
        this.thumbnails                = thumbnails;
        this.testEntries               = [];
        this.now                       = moment();
    }

    _addTestEntry (test) {
        const testEntry = {
            test:        test,
            testRuns:    {},
            screenshots: [],
        };

        this.testEntries.push(testEntry);

        return testEntry;
    }

    _getTestEntry (test) {
        return find(this.testEntries, entry => entry.test === test);
    }

    _ensureTestEntry (test) {
        let testEntry = this._getTestEntry(test);

        if (!testEntry)
            testEntry = this._addTestEntry(test);

        return testEntry;
    }

    getScreenshotsInfo (test) {
        return this._getTestEntry(test).screenshots;
    }

    hasCapturedFor (test) {
        return this.getScreenshotsInfo(test).length > 0;
    }

    getPathFor (test) {
        const testEntry       = this._getTestEntry(test);
        const screenshotPaths = testEntry.screenshots.map(screenshot => screenshot.screenshotPath);

        return getCommonPath(screenshotPaths);
    }

    createCapturerFor (test, testIndex, quarantine, connection, warningLog) {
        const testEntry   = this._ensureTestEntry(test);
        const pathPattern = new PathPattern(this.screenshotsPattern, DEFAULT_SCREENSHOT_EXTENSION, {
            testIndex,
            quarantineAttempt: quarantine ? quarantine.getNextAttemptNumber() : null,
            now:               this.now,
            fixture:           test.fixture.name,
            test:              test.name,
            parsedUserAgent:   connection.browserInfo.parsedUserAgent,
        }, this.screenshotsPatternOnFails);

        return new Capturer(this.screenshotsPath, testEntry, connection, pathPattern, this.fullPage, this.thumbnails, warningLog);
    }

    addTestRun (test, testRun) {
        const testEntry = this._getTestEntry(test);

        testEntry.testRuns[testRun.browserConnection.id] = testRun;
    }
}
