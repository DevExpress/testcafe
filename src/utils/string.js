import indentString from 'indent-string';

function rtrim (str) {
    return str.replace(/\s+$/, '');
}

export function removeTTYColors (str) {
    return str.replace(/\033\[[0-9;]*m/g, '');
}

export function wordWrap (str, indent, width) {
    var curStr     = '';
    var wrappedMsg = '';

    if (removeTTYColors(str).length <= width - indent)
        return indentString(str, ' ', indent);

    str = str.replace(/(\r\n)/gm, '\n')
        .split(/(\S+[ \t]+)|(\S+(?:\n))|(\n)/m)
        //NOTE: cut empty elements
        .filter(elm => !!elm);

    str.forEach(word => {
        var newStr = curStr + word;

        if (removeTTYColors(newStr).length > width - indent) {
            wrappedMsg += `${rtrim(curStr)}\n`;
            curStr = word;
        }
        else {
            if (curStr[curStr.length - 1] === '\n') {
                wrappedMsg += `${rtrim(curStr)}\n`;
                curStr = '';
            }

            curStr += word;
        }
    });

    return indentString(wrappedMsg + curStr, ' ', indent);
}

export function splitQuotedText (str, splitChar, quotes = '"\'') {
    var currentPart = '';
    var parts       = [];
    var quoteChar   = null;

    for (var i = 0; i < str.length; i++) {
        var currentChar = str[i];

        if (currentChar === splitChar) {
            if (quoteChar)
                currentPart += currentChar;
            else {
                parts.push(currentPart);
                currentPart = '';
            }
        }
        else if (quotes.indexOf(currentChar) > -1) {
            if (quoteChar === currentChar)
                quoteChar = null;
            else if (!quoteChar)
                quoteChar = currentChar;
            else
                currentPart += currentChar;
        }
        else
            currentPart += currentChar;
    }

    if (currentPart)
        parts.push(currentPart);

    return parts;
}
