'use strict';

var _resolveCwd = require('resolve-cwd');

var _resolveCwd2 = _interopRequireDefault(_resolveCwd);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getLocalInstallation() {
    var local = (0, _resolveCwd2.default)('testcafe/lib/cli');

    if (local && local !== __filename) {
        _log2.default.write('Using locally installed version of TestCafe.');
        return local;
    }

    return '';
}

(function loader() {
    var cliPath = getLocalInstallation() || require.resolve('./cli');

    require(cliPath);
})();