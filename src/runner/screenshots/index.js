import { join as joinPath } from 'path';
import uuid from 'uuid';
import { find } from 'lodash';
import Capturer from './capturer';
import SCREENSHOTS_WARNING_MESSAGES from './warning-messages';

export default class Screenshots {
    constructor (path) {
        this.enabled         = !!path;
        this.screenshotsPath = path;
        this.testEntries     = [];
    }

    static _escapeUserAgent (userAgent) {
        return userAgent
            .toString()
            .split('/')
            .map(str => str.trim().replace(/\s/g, '_'))
            .join('_');
    }

    _addTestEntry (test) {
        var testEntry = {
            test:                      test,
            path:                      this.screenshotsPath ? joinPath(this.screenshotsPath, uuid.v4().substr(0, 8)) : '',
            screenshotCapturingCalled: false
        };

        this.testEntries.push(testEntry);

        return testEntry;
    }

    _getTestEntry (test) {
        return find(this.testEntries, entry => entry.test === test);
    }

    hasCapturedFor (test) {
        return this._getTestEntry(test).screenshotCapturingCalled;
    }

    getPathFor (test) {
        if (this._getTestEntry(test).screenshotCapturingCalled && !this.enabled)
            return SCREENSHOTS_WARNING_MESSAGES.screenshotDirNotSet;

        return this._getTestEntry(test).path;
    }

    createCapturerFor (test, userAgent) {
        var testEntry = this._getTestEntry(test);

        if (!testEntry)
            testEntry = this._addTestEntry(test);

        var testScreenshotsPath = joinPath(testEntry.path, Screenshots._escapeUserAgent(userAgent));

        return new Capturer(this.screenshotsPath, testScreenshotsPath, testEntry);
    }
}
