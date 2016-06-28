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
