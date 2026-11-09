const chalk = require('chalk');
const asIs  = require('lodash').identity;

module.exports = {
    syntax: {
        string:     chalk.green,
        punctuator: chalk.grey,
        keyword:    chalk.cyan,
        number:     chalk.magenta,
        regex:      chalk.magenta,
        comment:    chalk.grey.bold,
        invalid:    chalk.inverse,
    },

    codeFrame: asIs,

    codeLine: function (num, base, src, isLast) {
        const prefix  = base ? ' > ' : '   ';
        let lineNum = prefix + num + ' ';

        if (base)
            lineNum = chalk.bgRed(lineNum);

        let line = lineNum + '|' + src;

        if (!isLast)
            line += '\n';

        return line;
    },

    stackLine: function (name, location, isLast) {
        let line = '   at ' + chalk.bold(name) + ' (' + chalk.grey.underline(location) + ')';

        if (!isLast)
            line += '\n';

        return line;
    },

    stack: function (stack) {
        return '\n\n' + stack;
    },
};
