import { find } from 'lodash';
import sanitize from 'sanitize-filename';
import dateFormat from 'dateformat';
import Capturer from './capturer';

export default class Screenshots {
    constructor (path) {
        this.enabled         = !!path;
        this.screenshotsPath = path;
        this.testEntries     = [];
        this.startDate       = Screenshots._getStartTestDate();
        this.userAgentNames  = [];
    }

    static _getStartTestDate () {
        var now = Date.now();

        return dateFormat(now, 'yyyy-mm-dd_hh-MM-ss');
    }

    static _escapeUserAgent (userAgent) {
        return sanitize(userAgent.toString()).replace(/\s+/g, '_');
    }

    _getUsedUserAgent (name, testIndex, quarantineAttempt) {
        var userAgent = null;

        for (var i = 0; i < this.userAgentNames.length; i++) {
            userAgent = this.userAgentNames[i];

            if (userAgent.name === name && userAgent.testIndex === testIndex &&
                userAgent.quarantineAttempt === quarantineAttempt)
                return userAgent;
        }

        return null;
    }

    _getUserAgentName (userAgent, testIndex, quarantineAttempt) {
        var userAgentName = Screenshots._escapeUserAgent(userAgent);
        var usedUserAgent = this._getUsedUserAgent(userAgentName, testIndex, quarantineAttempt);

        if (usedUserAgent) {
            usedUserAgent.index++;
            return `${userAgentName}_${usedUserAgent.index}`;
        }

        this.userAgentNames.push({ name: userAgentName, index: 0, testIndex, quarantineAttempt });
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

    createCapturerFor (test, testIndex, quarantineAttempt, connection) {
        var testEntry = this._getTestEntry(test);

        if (!testEntry)
            testEntry = this._addTestEntry(test);

        var namingOptions = {
            testIndex,
            quarantineAttempt,
            startDate:     this.startDate,
            userAgentName: this._getUserAgentName(connection.userAgent, testIndex, quarantineAttempt)
        };

        return new Capturer(this.screenshotsPath, testEntry, connection, namingOptions);
    }
}
