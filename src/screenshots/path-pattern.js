import { escapeRegExp as escapeRe } from 'lodash';
import sanitizeFilename from 'sanitize-filename';
import correctFilePath from '../utils/correct-file-path';

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH-mm-ss';

const SCRENSHOT_EXTENTION = 'png';

const ERRORS_FOLDER = 'errors';

const PLACEHOLDERS = {
    DATE:               '${DATE}',
    TIME:               '${TIME}',
    TEST_INDEX:         '${TEST_INDEX}',
    FILE_INDEX:         '${FILE_INDEX}',
    QUARANTINE_ATTEMPT: '${QUARANTINE_ATTEMPT}',
    FIXTURE:            '${FIXTURE}',
    TEST:               '${TEST}',
    USERAGENT:          '${USERAGENT}',
    BROWSER:            '${BROWSER}',
    BROWSER_VERSION:    '${BROWSER_VERSION}',
    OS:                 '${OS}',
    OS_VERSION:         '${OS_VERSION}'
};

const DEFAULT_PATH_PATTERN_FOR_REPORT      = `${PLACEHOLDERS.DATE}_${PLACEHOLDERS.TIME}\\test-${PLACEHOLDERS.TEST_INDEX}`;
const DEFAULT_PATH_PATTERN                 = `${DEFAULT_PATH_PATTERN_FOR_REPORT}\\${PLACEHOLDERS.USERAGENT}\\${PLACEHOLDERS.FILE_INDEX}.${SCRENSHOT_EXTENTION}`;
const QUARANTINE_MODE_DEFAULT_PATH_PATTERN = `${DEFAULT_PATH_PATTERN_FOR_REPORT}\\run-${PLACEHOLDERS.QUARANTINE_ATTEMPT}\\${PLACEHOLDERS.USERAGENT}\\${PLACEHOLDERS.FILE_INDEX}.${SCRENSHOT_EXTENTION}`;

export default class PathPattern {
    constructor (pattern, data) {
        this.pattern              = this._ensurePattern(pattern, data.quarantineAttempt);
        this.data                 = this._addDefaultFields(data);
        this.placeholderToDataMap = this._createPlaceholderToDataMap();
    }

    _ensurePattern (pattern, quarantineAttempt) {
        if (pattern)
            return pattern;

        return quarantineAttempt ? QUARANTINE_MODE_DEFAULT_PATH_PATTERN : DEFAULT_PATH_PATTERN;
    }

    _addDefaultFields (data) {
        const defaultFields = {
            date:           data.now.format(DATE_FORMAT),
            time:           data.now.format(TIME_FORMAT),
            fileIndex:      1,
            errorFileIndex: 1
        };

        return Object.assign({}, defaultFields, data);
    }

    _createPlaceholderToDataMap () {
        return {
            [PLACEHOLDERS.DATE]:               this.data.date,
            [PLACEHOLDERS.TIME]:               this.data.time,
            [PLACEHOLDERS.TEST_INDEX]:         this.data.testIndex,
            [PLACEHOLDERS.QUARANTINE_ATTEMPT]: this.data.quarantineAttempt || 1,
            [PLACEHOLDERS.FIXTURE]:            this.data.fixture,
            [PLACEHOLDERS.TEST]:               this.data.test,
            [PLACEHOLDERS.FILE_INDEX]:         forError => forError ? this.data.errorFileIndex : this.data.fileIndex,
            [PLACEHOLDERS.USERAGENT]:          this.data.parsedUserAgent.toString(),
            [PLACEHOLDERS.BROWSER]:            this.data.parsedUserAgent.browser,
            [PLACEHOLDERS.BROWSER_VERSION]:    this.data.parsedUserAgent.browserVersion,
            [PLACEHOLDERS.OS]:                 this.data.parsedUserAgent.os,
            [PLACEHOLDERS.OS_VERSION]:         this.data.parsedUserAgent.osVersion
        };
    }

    static _escapeUserAgent (userAgent) {
        return sanitizeFilename(userAgent.toString()).replace(/\s+/g, '_');
    }

    static _buildPath (pattern, placeholderToDataMap, forError) {
        let resultFilePath = pattern;

        for (const placeholder in placeholderToDataMap) {
            const findPlaceholderRegExp = new RegExp(escapeRe(placeholder), 'g');

            resultFilePath = resultFilePath.replace(findPlaceholderRegExp, () => {
                if (placeholder === PLACEHOLDERS.FILE_INDEX) {
                    const getFileIndexFn = placeholderToDataMap[placeholder];
                    let result           = getFileIndexFn(forError);

                    if (forError)
                        result = `${ERRORS_FOLDER}\\${result}`;

                    return result;
                }

                else if (placeholder === PLACEHOLDERS.USERAGENT) {
                    const userAgent = placeholderToDataMap[placeholder];

                    return PathPattern._escapeUserAgent(userAgent);
                }

                return placeholderToDataMap[placeholder];
            });
        }

        return resultFilePath;
    }

    getPath (forError) {
        const path = PathPattern._buildPath(this.pattern, this.placeholderToDataMap, forError);

        return correctFilePath(path, SCRENSHOT_EXTENTION);
    }

    getPathForReport () {
        const path = PathPattern._buildPath(DEFAULT_PATH_PATTERN_FOR_REPORT, this.placeholderToDataMap);

        return correctFilePath(path);
    }

    // For testing purposes
    static get PLACEHOLDERS () {
        return PLACEHOLDERS;
    }
}
