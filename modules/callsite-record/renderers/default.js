var chalk = require('chalk');
var asIs  = require('lodash').identity;

module.exports = {
    syntax: {
        string:     chalk.green,
        punctuator: chalk.grey,
        keyword:    chalk.cyan,
        number:     chalk.magenta,
        regex:      chalk.magenta,
        comment:    chalk.grey.bold,
        invalid:    chalk.inverse
    },

    codeFrame: asIs,

    codeLine: function (num, base, src, isLast) {
        var prefix  = base ? ' > ' : '   ';
        var lineNum = prefix + num + ' ';

        if (base)
            lineNum = chalk.bgRed(lineNum);

        var line = lineNum + '|' + src;

        if (!isLast)
            line += '\n';

        return line;
    },

    stackLine: function (name, location, isLast) {
        var line = '   at ' + chalk.bold(name) + ' (' + chalk.grey.underline(location) + ')';

        if (!isLast)
            line += '\n';

        return line;
    },

    stack: function (stack) {
        return '\n\n' + stack;
    }
};
