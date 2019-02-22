import { escapeRegExp as escapeRe } from 'lodash';
import correctFilePath from '../utils/correct-file-path';
import escapeUserAgent from '../utils/escape-user-agent';
import EventEmitter from 'events';

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH-mm-ss';

const ERRORS_FOLDER = 'errors';

const PROBLEMATIC_PLACEHOLDER_VALUE = '';

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
    OS_VERSION:         '${OS_VERSION}',
    TEST_ID:            '${TEST_ID}',
    RUN_ID:             '${RUN_ID}'
};

const DEFAULT_PATH_PATTERN_FOR_REPORT = `${PLACEHOLDERS.DATE}_${PLACEHOLDERS.TIME}\\${PLACEHOLDERS.TEST_ID}\\` +
                                        `${PLACEHOLDERS.RUN_ID}\\${PLACEHOLDERS.USERAGENT}\\${PLACEHOLDERS.FILE_INDEX}`;

const TEST_ID_TEMPLATE = data => data.testIndex ? `test-${data.testIndex}` : '';
const RUN_ID_TEMPLATE  = data => data.quarantineAttempt ? `run-${data.quarantineAttempt}` : '';

export default class PathPattern extends EventEmitter {
    constructor (pattern, fileExtension, data) {
        super();

        this.pattern              = this._ensurePattern(pattern);
        this.data                 = this._addDefaultFields(data);
        this.placeholderToDataMap = this._createPlaceholderToDataMap();
        this.fileExtension        = fileExtension;
    }

    _ensurePattern (pattern) {
        if (pattern)
            return pattern;

        return DEFAULT_PATH_PATTERN_FOR_REPORT;
    }

    _addDefaultFields (data) {
        const defaultFields = {
            testId:         TEST_ID_TEMPLATE(data),
            runId:          RUN_ID_TEMPLATE(data),
            formattedDate:  data.now.format(DATE_FORMAT),
            formattedTime:  data.now.format(TIME_FORMAT),
            fileIndex:      1,
            errorFileIndex: 1
        };

        return Object.assign({}, defaultFields, data);
    }

    _createPlaceholderToDataMap () {
        return {
            [PLACEHOLDERS.TEST_ID]:            this.data.testId,
            [PLACEHOLDERS.RUN_ID]:             this.data.runId,
            [PLACEHOLDERS.DATE]:               this.data.formattedDate,
            [PLACEHOLDERS.TIME]:               this.data.formattedTime,
            [PLACEHOLDERS.TEST_INDEX]:         this.data.testIndex,
            [PLACEHOLDERS.QUARANTINE_ATTEMPT]: this.data.quarantineAttempt || 1,
            [PLACEHOLDERS.FIXTURE]:            this.data.fixture,
            [PLACEHOLDERS.TEST]:               this.data.test,
            [PLACEHOLDERS.FILE_INDEX]:         forError => forError ? this.data.errorFileIndex : this.data.fileIndex,
            [PLACEHOLDERS.USERAGENT]:          this.data.parsedUserAgent.toString(),
            [PLACEHOLDERS.BROWSER]:            this.data.parsedUserAgent.family,
            [PLACEHOLDERS.BROWSER_VERSION]:    this.data.parsedUserAgent.toVersion(),
            [PLACEHOLDERS.OS]:                 this.data.parsedUserAgent.os.family,
            [PLACEHOLDERS.OS_VERSION]:         this.data.parsedUserAgent.os.toVersion()
        };
    }

    _buildPath (pattern, placeholderToDataMap, forError) {
        let resultFilePath            = pattern;
        const problematicPlaceholders = [];

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

                    return escapeUserAgent(userAgent);
                }

                let calculatedValue = placeholderToDataMap[placeholder];

                if (calculatedValue === null || calculatedValue === void 0) {
                    problematicPlaceholders.push(placeholder);

                    calculatedValue = PROBLEMATIC_PLACEHOLDER_VALUE;
                }

                return calculatedValue;
            });
        }

        if (problematicPlaceholders.length)
            this.emit('problematic-placeholders-found', { placeholders: problematicPlaceholders });

        return resultFilePath;
    }

    getPath (forError) {
        const path = this._buildPath(this.pattern, this.placeholderToDataMap, forError);

        return correctFilePath(path, this.fileExtension);
    }

    // For testing purposes
    static get PLACEHOLDERS () {
        return PLACEHOLDERS;
    }
}
