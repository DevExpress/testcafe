var escapeHtml = require('lodash').escape;

module.exports = {
    syntax: ['string', 'punctuator', 'keyword', 'number', 'regex', 'comment', 'invalid'].reduce(function (syntaxRenderer, tokenType) {
        syntaxRenderer[tokenType] = function (str) {
            return '<span class="syntax-' + tokenType + '">' + escapeHtml(str) + '</span>';
        };

        return syntaxRenderer;
    }, {}),

    codeFrame: function (str) {
        return '<div class="code-frame">' + str + '</div>';
    },

    codeLine: function (num, base, src, isLast) {
        var lineClass = isLast ? 'code-line-last' : 'code-line';
        var numClass  = base ? 'code-line-num-base' : 'code-line-num';

        return '<div class="' + lineClass + '">' +
               '<div class="' + numClass + '">' + num + '</div>' +
               '<div class="code-line-src">' + src + '</div>' +
               '</div>';
    },

    stackLine: function (name, location, isLast) {
        var lineClass = isLast ? 'stack-line-last' : 'stack-line';

        return '<div class="' + lineClass + '">' +
               '<div class="stack-line-name">' + escapeHtml(name) + '</div>' +
               '<div class="stack-line-location">' + escapeHtml(location) + '</div>' +
               '</div>';
    },

    stack: function (stack) {
        return '<div class="stack">' + stack + '</div>';
    }
};
