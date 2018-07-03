'use strict';

exports.__esModule = true;

exports.default = function (providerName) {
    var _BROWSER_PROVIDER_NAM = BROWSER_PROVIDER_NAME_RE.exec(providerName),
        scope = _BROWSER_PROVIDER_NAM[1],
        name = _BROWSER_PROVIDER_NAM[2];

    if (!scope) scope = '';

    if (name.indexOf(BROWSER_PROVIDER_MODULE_NAME_PREFIX) === 0) name = name.replace(BROWSER_PROVIDER_MODULE_NAME_PREFIX, '');

    return {
        providerName: scope + name,
        moduleName: scope + BROWSER_PROVIDER_MODULE_NAME_PREFIX + name
    };
};

var BROWSER_PROVIDER_NAME_RE = /^(@(?:[^/]+)\/)?(.+)$/;
var BROWSER_PROVIDER_MODULE_NAME_PREFIX = 'testcafe-browser-provider-';

module.exports = exports['default'];