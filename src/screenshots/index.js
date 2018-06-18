import { find } from 'lodash';
import moment from 'moment';
import Capturer from './capturer';
import PathPattern from './path-pattern';

export default class Screenshots {
    constructor (path, pattern) {
        this.enabled               = !!path;
        this.screenshotsPath       = path;
        this.screenshotsPattern    = pattern;
        this.testEntries           = [];
        this.now                   = moment();
    }

    _addTestEntry (test) {
        var testEntry = {
            test:           test,
            path:           this.screenshotsPath || '',
            hasScreenshots: false
        };

        this.testEntries.push(testEntry);

        return testEntry;
    }

    _getTestEntry (test) {
        return find(this.testEntries, entry => entry.test === test);
    }

    hasCapturedFor (test) {
        return this._getTestEntry(test).hasScreenshots;
    }

    getPathFor (test) {
        return this._getTestEntry(test).path;
    }

    createCapturerFor (test, testIndex, quarantineAttempt, connection, warningLog) {
        let testEntry   = this._getTestEntry(test);

        if (!testEntry)
            testEntry = this._addTestEntry(test);

        const pathPattern = new PathPattern(this.screenshotsPattern, {
            testIndex,
            quarantineAttempt,
            now:             this.now,
            fixture:         test.fixture.name,
            test:            test.name,
            parsedUserAgent: connection.browserInfo.parsedUserAgent,
        });

        return new Capturer(this.screenshotsPath, testEntry, connection, pathPattern, warningLog);
    }
}
