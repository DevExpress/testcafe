"use strict";

exports.__esModule = true;
exports.default = renderTemplate;
function renderTemplate(template) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    if (!args.length) return template;

    var counter = 0;

    return template.replace(/{.+?}/g, function (match) {
        return counter < args.length ? args[counter++] : match;
    });
}
module.exports = exports["default"];