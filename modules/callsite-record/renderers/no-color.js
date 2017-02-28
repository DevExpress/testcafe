var asIs = require('lodash').identity;

module.exports = {
    codeFrame: asIs,

    codeLine: function (num, base, src, isLast) {
        var prefix = base ? ' > ' : '   ';
        var line   = prefix + num + ' |' + src;

        if (!isLast)
            line += '\n';

        return line;
    },

    stackLine: function (name, location, isLast) {
        var line = '   at ' + name + ' (' + location + ')';

        if (!isLast)
            line += '\n';

        return line;
    },

    stack: function (stack) {
        return '\n\n' + stack;
    }
};
