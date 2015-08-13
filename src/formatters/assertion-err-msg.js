import { ERR_TYPES, ASSERT_TYPES } from './consts';
import moment from 'moment';

const DATA_TIME_FORMAT = 'ddd MMM DD YYYY hh:mm:ss.SSS [GMT]ZZ';
const DIFF_MARKER_SYMBOL = '^';
const DEFAULT_ASSERT_STRING_LENGTH = 107;
const EMPTY_STRING_LENGTH = '""'.length;
const STRING_OVERFLOW_MARKER = '...';

const DIFF_TYPE = {
    DATE: 'DATA_DIFF_TYPE',
    STRING: 'STRING_DIFF_TYPE'
};

//Utils
var cutNewLines = function (code) {
    return typeof code === 'string' ? code.replace(/(\r\n|\n|\r)/gm, '\\n') : code;
};

var formatDateTime = function (date) {
    return [
        moment(date).format(DATA_TIME_FORMAT),
        (new Date(date)).toString().match(/\(.*\)$/)[0]
    ].join(' ');
};

export class AssertionErrMsg {
    constructor(err, assertType, maxStringLength) {
        this.expected = err.expected;
        this.actual = err.actual;
        this.message = err.message;
        this.stepName = err.stepName;
        this.diffKey = err.key;
        this.relatedSourceCode = err.relatedSourceCode;
        this.isArrays = err.isArrays;
        this.isObjects = err.isObjects;
        this.isStrings = err.isStrings;

        this.maxStringLength = maxStringLength || DEFAULT_ASSERT_STRING_LENGTH;
        this.diffIndex = 0;
        this.marker = '';
        this.diffType = this._getDiffType(err);
        this.assertType = assertType;
    }

    build() {
        var assertHandlers = {};

        assertHandlers[ASSERT_TYPES.OK] = this._buildOkAssert;
        assertHandlers[ASSERT_TYPES.NOT_OK] = this._buildNotOkAssert;
        assertHandlers[ASSERT_TYPES.NOT_EQ] = this._buildNotEqAssert;
        assertHandlers[ASSERT_TYPES.EQ] = this._buildEqAssert;

        return assertHandlers[this.assertType].call(this);
    }

    _getDiffType(err) {
        var diffType = '';

        if (err.isDates || err.diffType && err.diffType.isDates)
            diffType = DIFF_TYPE.DATE;
        else if ((err.isStrings || (err.diffType && err.diffType.isStrings))
            && err.expected.length > EMPTY_STRING_LENGTH && err.actual.length > EMPTY_STRING_LENGTH)
            diffType = DIFF_TYPE.STRING;

        if (err.diffType && err.diffType.diffIndex)
            this.diffIndex = err.diffType.diffIndex;

        return diffType;
    }

    _getMsgPrefix() {
        return typeof this.message !== 'undefined' && this.message !== null ?
        '<err-type>' + ERR_TYPES.ASSERT_ERROR + '</err-type>"' + this.message + '" assertion' :
        '<err-type>' + ERR_TYPES.ASSERT_ERROR + '</err-type>Assertion';
    }

    _buildBooleanAssertion(err, expected) {
        return `${this._getMsgPrefix()} failed at step <step-name>${this.stepName}</step-name>: ` +
            `<related-code>${err.relatedSourceCode}</related-code>\n` +
            `<expected>${expected}</expected>\n` +
            `<actual><js>${err.actual}</js></actual>\n`;
    }

    _buildOkAssert() {
        var expected = 'not <js>null</js>, not <js>undefined</js>, not <js>false</js>, ' +
            'not <js>NaN</js> and not <js>\'\'</js>';

        return this._buildBooleanAssertion(this, expected);
    }

    _buildNotOkAssert() {
        var expected = "<js>null</js>, <js>undefined</js>, <js>false</js>, <js>NaN</js> or <js>''</js>";

        return this._buildBooleanAssertion(this, expected);
    }

    _buildNotEqAssert() {
        return `${this._getMsgPrefix()} failed at step <step-name>${this.stepName}</step-name>: ` +
            `<related-code>${this.relatedSourceCode}</related-code>\n` +
            `<expected>not <js>${this.actual}</js></expected>\n` +
            `<actual><js>${this.actual}</js></actual>\n`;
    }

    _formatDateTime() {
        this.actual = formatDateTime(this.actual);
        this.expected = formatDateTime(this.expected);
    }

    _cutDiffs() {
        this.actual = this._cutOverflowString(this.actual);
        this.expected = this._cutOverflowString(this.expected);
    }

    _getArrayIndexStr() {
        return `[${this.diffKey}]: `;
    }

    _formatStringsDiff() {
        var stringOutputOffset = 0;
        var diffIndex = 0;

        if (this.isArrays) {
            stringOutputOffset = this._getArrayIndexStr().length;

            if (this.diffType && this.diffType === DIFF_TYPE.STRING)
                diffIndex = this.diffIndex + 1;
        } else //NOTE: string quote
            diffIndex = this.diffKey + 1;

        this._formatOverflowDiffString(diffIndex, stringOutputOffset, stringOutputOffset);
    }

    _formatDiffValues() {
        switch (this.diffType) {
            case DIFF_TYPE.DATE:
                this._formatDateTime();
                break;
            case DIFF_TYPE.STRING:
                this._formatStringsDiff();
                break;
            default:
                this._cutDiffs();
        }
    }

    _cutOverflowString(str) {
        if (str && str.length > this.maxStringLength)
            str = str.substr(0, this.maxStringLength - STRING_OVERFLOW_MARKER.length) + STRING_OVERFLOW_MARKER;

        return str;
    }

    static getMarkerStr(offset) {
        return (new Array(offset + 1)).join(' ') + DIFF_MARKER_SYMBOL;
    }

    _buildEqAssert() {
        var arrayIndexStr = '';
        var messagePrefix = this._getMsgPrefix();

        this._formatDiffValues();

        if (this.isArrays) {
            arrayIndexStr = this._getArrayIndexStr();

            return `${messagePrefix} failed at step <step-name>${this.stepName}</step-name>: ` +
                `<related-code>${this.relatedSourceCode}</related-code>\n\n` +
                `Arrays differ at index <js>${this.diffKey}</js>:\n\n` +
                `<expected><diff-index>${arrayIndexStr}</diff-index><js>${this.expected}</js></expected>\n` +
                `<actual><diff-index>${arrayIndexStr}</diff-index><js>${this.actual}</js></actual>\n` +
                `${this.marker}`;
        }
        else if (this.isObjects)
            return `${messagePrefix} failed at step <step-name>${this.stepName}</step-name>: ` +
                `<related-code>${this.relatedSourceCode}</related-code>\n\n` +
                `Objects differ at the <js>${this.diffKey}</js> field:\n\n` +
                `<expected><js>${this.expected}</js></expected>\n` +
                `<actual><js>${this.actual}</js></actual>\n` +
                `${this.marker}`;
        else if (this.isStrings)
            return `${messagePrefix} failed at step <step-name>${this.stepName}</step-name>: ` +
                `<related-code>${this.relatedSourceCode}</related-code>\n\n` +
                `Strings differ at index <js>${this.diffKey}</js>:\n\n` +
                `<expected><js>${this.expected}</js></expected>\n` +
                `<actual><js>${this.actual}</js></actual>\n` +
                `${this.marker}`;
        else
            return `${messagePrefix} failed at step <step-name>${this.stepName}</step-name>: ` +
                `<related-code>${this.relatedSourceCode}</related-code>\n` +
                `<expected><js>${this.expected}</js></expected>\n` +
                `<actual><js>${this.actual}</js></actual>\n`;
    }

    _formatOverflowDiffString(key, markerOffset, maxStringLengthOffset) {
        var diffPosition = null;
        var maxStringLength = this.maxStringLength - maxStringLengthOffset;

        //NOTE: recalculate diff position after replacing new lines
        var actualLeftPart = cutNewLines(this.actual.substr(0, key));

        key += actualLeftPart.length - key;
        this.actual = actualLeftPart + cutNewLines(this.actual.substr(key, this.actual.length));

        this.expected = cutNewLines(this.expected);

        var cutString = function (originStr, diffIndex) {
            var maxLength = maxStringLength;
            var maxStringOffsetFromMiddle = Math.floor(maxStringLength / 2);
            var str = originStr.substr(1, originStr.length - 2);
            var quote = originStr[0];
            var formattedStr = '';

            //NOTE case: '123456'
            //           '123945'
            //               ^
            if (str.length <= maxStringLength) {
                if (!diffPosition)
                    diffPosition = diffIndex;

                formattedStr = originStr;
            }
            //NOTE: case '1234...'
            //           '1239...'
            //               ^
            else if (diffIndex < maxStringOffsetFromMiddle) {
                maxLength -= STRING_OVERFLOW_MARKER.length;

                if (!diffPosition)
                    diffPosition = diffIndex;

                formattedStr = [
                    quote,
                    str.substr(0, maxLength),
                    STRING_OVERFLOW_MARKER, quote
                ].join('');
            }
            //NOTE: case '...456'
            //           '...956;
            //               ^
            else if (str.length - diffIndex - 1 < maxStringOffsetFromMiddle) {
                maxLength -= STRING_OVERFLOW_MARKER.length;

                if (!diffPosition)
                    diffPosition = quote.length + STRING_OVERFLOW_MARKER.length +
                        diffIndex - 1 - (str.length - maxLength);

                formattedStr = [
                    quote, STRING_OVERFLOW_MARKER,
                    str.substr(str.length - maxLength, maxLength),
                    quote
                ].join('');
            }
            //NOTE: case '...345...'
            //           '...395...'
            //                ^
            else {
                maxLength -= STRING_OVERFLOW_MARKER.length * 2;
                maxStringOffsetFromMiddle = Math.floor(maxLength / 2);

                if (!diffPosition)
                    diffPosition = quote.length + STRING_OVERFLOW_MARKER.length + maxStringOffsetFromMiddle - 1;

                formattedStr = [
                    quote, STRING_OVERFLOW_MARKER,
                    str.substr(diffIndex - maxStringOffsetFromMiddle, maxLength),
                    STRING_OVERFLOW_MARKER, quote
                ].join('');
            }

            return formattedStr;
        };

        this.actual = cutString(this.actual, key);
        this.expected = cutString(this.expected, key);
        this.marker = `<diff-marker>${AssertionErrMsg.getMarkerStr(diffPosition + (markerOffset || 0))}</diff-marker>`;
    }
}
