'use strict';

exports.__esModule = true;
exports.removeTTYColors = removeTTYColors;
exports.wordWrap = wordWrap;
exports.splitQuotedText = splitQuotedText;

var _indentString = require('indent-string');

var _indentString2 = _interopRequireDefault(_indentString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rtrim(str) {
    return str.replace(/\s+$/, '');
}

function removeTTYColors(str) {
    return str.replace(/\033\[[0-9;]*m/g, '');
}

function wordWrap(str, indent, width) {
    var curStr = '';
    var wrappedMsg = '';

    if (removeTTYColors(str).length <= width - indent) return (0, _indentString2.default)(str, ' ', indent);

    str = str.replace(/(\r\n)/gm, '\n').split(/(\S+[ \t]+)|(\S+(?:\n))|(\n)/m)
    //NOTE: cut empty elements
    .filter(function (elm) {
        return !!elm;
    });

    str.forEach(function (word) {
        var newStr = curStr + word;

        if (removeTTYColors(newStr).length > width - indent) {
            wrappedMsg += rtrim(curStr) + '\n';
            curStr = word;
        } else {
            if (curStr[curStr.length - 1] === '\n') {
                wrappedMsg += rtrim(curStr) + '\n';
                curStr = '';
            }

            curStr += word;
        }
    });

    return (0, _indentString2.default)(wrappedMsg + curStr, ' ', indent);
}

function splitQuotedText(str, splitChar) {
    var quotes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '"\'';

    var currentPart = '';
    var parts = [];
    var quoteChar = null;

    for (var i = 0; i < str.length; i++) {
        var currentChar = str[i];

        if (currentChar === splitChar) {
            if (quoteChar) currentPart += currentChar;else {
                parts.push(currentPart);
                currentPart = '';
            }
        } else if (quotes.indexOf(currentChar) > -1) {
            if (quoteChar === currentChar) quoteChar = null;else if (!quoteChar) quoteChar = currentChar;else currentPart += currentChar;
        } else currentPart += currentChar;
    }

    if (currentPart) parts.push(currentPart);

    return parts;
}