import { join as joinPath, dirname } from 'path';
import uuid from 'uuid';
import { find } from 'lodash';
import Capturer from './capturer';

export default class Screenshots {
    constructor (path) {
        this.enabled     = !!path;
        this.path        = path;
        this.testEntries = [];
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
            test:           test,
            path:           this.path ? joinPath(this.path, uuid.v4().substr(0, 8)) : '',
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

    createCapturerFor (test, userAgent) {
        var testEntry = this._getTestEntry(test);

        if (!testEntry)
            testEntry = this._addTestEntry(test);

        var screenshotPath = this.enabled ? joinPath(testEntry.path, Screenshots._escapeUserAgent(userAgent)) : null;

        return new Capturer(screenshotPath, dirname(test.fixture.path), testEntry);
    }
}
