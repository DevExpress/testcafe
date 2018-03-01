import { find } from 'lodash';
import sanitizeFilename from 'sanitize-filename';
import moment from 'moment';
import useragent from 'useragent';
import Capturer from './capturer';

export default class Screenshots {
    constructor (path, pattern) {
        const now = moment(Date.now());

        this.enabled               = !!path;
        this.screenshotsPath       = path;
        this.screenshotsPattern    = pattern;
        this.testEntries           = [];
        this.userAgentNames        = [];
        this.currentDate           = now.format('YYYY-MM-DD');
        this.currentTime           = now.format('HH-mm-ss');
        // FILE_INDEX is handled in the Capturer class
        this.patternMap            = {
            FIXTURE:         null,
            TEST:            null,
            TEST_INDEX:      null,
            DATE:            this.currentDate,
            TIME:            this.currentTime,
            USERAGENT:       null,
            BROWSER:         null,
            BROWSER_VERSION: null,
            OS:              null,
            OSV_ERSION:      null
        };
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
        var userAgentString = userAgent.toString();
        var userAgentName = Screenshots._escapeUserAgent(userAgentString);
        var usedUserAgent = this._getUsedUserAgent(userAgentName, testIndex, quarantineAttemptNum);

        if (usedUserAgent) {
            usedUserAgent.index++;
            return `${userAgentName}_${usedUserAgent.index}`;
        }

        this.userAgentNames.push({ name: userAgentName, index: 0, testIndex, quarantineAttemptNum });

        return {
            full:           userAgentName,
            browser:        userAgent.family,
            browserVersion: userAgent.toVersion(),
            os:             userAgent.os.family,
            osVersion:      userAgent.os.toVersion()
        };
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

    _parsePattern (namePattern, options) {
        if (!namePattern) return '';

        var spaceRegex = new RegExp(' ', 'g');

        this.patternMap = Object.assign(this.patternMap, {
            FIXTURE:            options.fixture.replace(spaceRegex, '-'),
            TEST:               options.test.replace(spaceRegex, '-'),
            TEST_INDEX:         options.testIndex,
            DATE:               this.currentDate,
            TIME:               this.currentTime,
            USERAGENT:          options.userAgent.full,
            BROWSER:            options.userAgent.browser.replace(spaceRegex, '_'),
            BROWSER_VERSION:    options.userAgent.browserVersion,
            OS:                 options.userAgent.os.replace(spaceRegex, '_'),
            OS_VERSION:         options.userAgent.osVersion,
            QUARANTINE_ATTEMPT: options.quarantineAttempt
        });

        for (const pattern in this.patternMap)
            namePattern = namePattern.replace(new RegExp(`\\$\\{${pattern}\\}`, 'g'), this.patternMap[pattern]);

        return namePattern;
    }

    createCapturerFor (test, testIndex, quarantineAttemptNum, connection, warningLog) {
        var userAgent = useragent.parse(connection.browserInfo.userAgentRaw);
        var testEntry = this._getTestEntry(test);

        if (!testEntry)
            testEntry = this._addTestEntry(test);

        const patternOptions = {
            testIndex:         testIndex,
            fixture:           test.fixture.name,
            test:              test.name,
            quarantineAttempt: quarantineAttemptNum ? quarantineAttemptNum : 1,
            userAgent:         this._getUserAgentName(userAgent, testIndex, quarantineAttemptNum)
        };

        var namingOptions = {
            testIndex,
            quarantineAttemptNum,
            patternMap:  this.patternMap,
            patternName: this._parsePattern(this.screenshotsPattern, patternOptions)
        };

        return new Capturer(this.screenshotsPath, testEntry, connection, namingOptions, warningLog);
    }
}
