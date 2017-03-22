import { find } from 'lodash';
import sanitizeFilename from 'sanitize-filename';
import moment from 'moment';
import Capturer from './capturer';

export default class Screenshots {
    constructor (path) {
        this.enabled               = !!path;
        this.screenshotsPath       = path;
        this.testEntries           = [];
        this.screenshotBaseDirName = Screenshots._getScreenshotBaseDirName();
        this.userAgentNames        = [];
    }

    static _getScreenshotBaseDirName () {
        var now = Date.now();

        return moment(now).format('YYYY-MM-DD_hh-mm-ss');
    }

    static _escapeUserAgent (userAgent) {
        return sanitizeFilename(userAgent.toString()).replace(/\s+/g, '_');
    }

    _getUsedUserAgent (name, testIndex, quarantineAttemptNum) {
        var userAgent = null;

        for (var i = 0; i < this.userAgentNames.length; i++) {
            userAgent = this.userAgentNames[i];

            if (userAgent.name === name && userAgent.testIndex === testIndex &&
                userAgent.quarantineAttemptNum === quarantineAttemptNum)
                return userAgent;
        }

        return null;
    }

    _getUserAgentName (userAgent, testIndex, quarantineAttemptNum) {
        var userAgentName = Screenshots._escapeUserAgent(userAgent);
        var usedUserAgent = this._getUsedUserAgent(userAgentName, testIndex, quarantineAttemptNum);

        if (usedUserAgent) {
            usedUserAgent.index++;
            return `${userAgentName}_${usedUserAgent.index}`;
        }

        this.userAgentNames.push({ name: userAgentName, index: 0, testIndex, quarantineAttemptNum });
        return userAgentName;
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

    createCapturerFor (test, testIndex, quarantineAttemptNum, connection) {
        var testEntry = this._getTestEntry(test);

        if (!testEntry)
            testEntry = this._addTestEntry(test);

        var namingOptions = {
            testIndex,
            quarantineAttemptNum,
            baseDirName:   this.screenshotBaseDirName,
            userAgentName: this._getUserAgentName(connection.userAgent, testIndex, quarantineAttemptNum)
        };

        return new Capturer(this.screenshotsPath, testEntry, connection, namingOptions);
    }
}
