import indentString from 'indent-string';

const DEFAULT_CONCATENATED_VALUES = {
    SEPARATOR:  ', ',
    QUOTE_CHAR: '"'
};

function rtrim (str) {
    return str.replace(/\s+$/, '');
}

export function removeTTYColors (str) {
    return str.replace(/\033\[[0-9;]*m/g, '');
}

export function wordWrap (str, indent, width) {
    let curStr     = '';
    let wrappedMsg = '';

    if (removeTTYColors(str).length <= width - indent)
        return indentString(str, ' ', indent);

    str = str.replace(/(\r\n)/gm, '\n')
        .split(/(\S+[ \t]+)|(\S+(?:\n))|(\n)/m)
        //NOTE: cut empty elements
        .filter(elm => !!elm);

    str.forEach(word => {
        const newStr = curStr + word;

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
    let currentPart = '';
    const parts       = [];
    let quoteChar   = null;

    for (let i = 0; i < str.length; i++) {
        const currentChar = str[i];

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

export function getPluralSuffix (array) {
    return array.length > 1 ? 's' : '';
}

function getDisplayedItemText (item, quote) {
    return `${quote}${item}${quote}`;
}

export function getConcatenatedValuesString (array, separator = DEFAULT_CONCATENATED_VALUES.SEPARATOR, quoteChar = DEFAULT_CONCATENATED_VALUES.QUOTE_CHAR) {
    const clonedArray = [...array];

    if (separator === '\n')
        return clonedArray.map(item => getDisplayedItemText(item, quoteChar)).join(separator);

    else if (clonedArray.length === 1)
        return getDisplayedItemText(clonedArray[0], quoteChar);

    else if (clonedArray.length === 2) {
        const item1 = array[0];
        const item2 = array[1];

        return `${getDisplayedItemText(item1, quoteChar)} and ${getDisplayedItemText(item2, quoteChar)}`;
    }

    const lastItem        = clonedArray.pop();
    const otherItemString = clonedArray.map(item => getDisplayedItemText(item, quoteChar)).join(separator);

    return `${otherItemString}, and ${getDisplayedItemText(lastItem, quoteChar)}`;
}

export function getToBeInPastTense (array) {
    return array.length > 1 ? 'were' : 'was';
}

export function createList (array, PREFIX = '- ', SEPARATOR = '\n') {
    return array.map(option => PREFIX + option).join(SEPARATOR);
}
