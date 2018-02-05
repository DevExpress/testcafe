import { find } from 'lodash';
import sanitizeFilename from 'sanitize-filename';
import moment from 'moment';
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
        // FILENUMBER is handled in the Capturer class
        this.patternMap            = {
            FIXTURE:        null,
            TEST:           null,
            TESTNUMBER:     null,
            DATE:           this.currentDate,
            TIME:           this.currentTime,
            USERAGENT:      null,
            BROWSER:        null,
            BROWSERVERSION: null,
            OS:             null,
            OSVERSION:      null
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
        var userAgentName = Screenshots._escapeUserAgent(userAgent);
        var usedUserAgent = this._getUsedUserAgent(userAgentName, testIndex, quarantineAttemptNum);

        if (usedUserAgent) {
            usedUserAgent.index++;
            return `${userAgentName}_${usedUserAgent.index}`;
        }

        this.userAgentNames.push({ name: userAgentName, index: 0, testIndex, quarantineAttemptNum });

        const userAgentMatches = userAgentName.match(new RegExp('^(.+?)_([0-9.]+)_(.+?)_([0-9.]+)$'));

        userAgentMatches.shift();
        const [browser, browserVersion, os, osVersion] = userAgentMatches;

        return {
            full: userAgentName,
            browser,
            browserVersion,
            os,
            osVersion
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

        this.patternMap = Object.assign(this.patternMap, {
            FIXTURE:        options.fixture.replace(' ', '-'),
            TEST:           options.test.replace(' ', '-'),
            TESTNUMBER:     options.testNumber,
            DATE:           this.currentDate,
            TIME:           this.currentTime,
            USERAGENT:      options.userAgent.full,
            BROWSER:        options.userAgent.browser,
            BROWSERVERSION: options.userAgent.browserVersion,
            OS:             options.userAgent.os,
            OSVERSION:      options.userAgent.osVersion
        });

        for (const pattern in this.patternMap)
            namePattern = namePattern.replace(new RegExp(`\\$\\{${pattern}\\}`, 'g'), this.patternMap[pattern]);

        return namePattern;
    }

    createCapturerFor (test, testIndex, quarantineAttemptNum, connection, warningLog) {
        var testEntry = this._getTestEntry(test);

        if (!testEntry)
            testEntry = this._addTestEntry(test);

        const patternOptions = {
            testNumber: testIndex,
            fixture:    test.fixture.name,
            test:       test.name,
            userAgent:  this._getUserAgentName(connection.userAgent, testIndex, quarantineAttemptNum)
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
