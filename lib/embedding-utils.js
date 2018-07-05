'use strict';

exports.__esModule = true;

var _pluginHost = require('./reporter/plugin-host');

var _pluginHost2 = _interopRequireDefault(_pluginHost);

var _formattableAdapter = require('./errors/test-run/formattable-adapter');

var _formattableAdapter2 = _interopRequireDefault(_formattableAdapter);

var _testRun = require('./errors/test-run');

var testRunErrors = _interopRequireWildcard(_testRun);

var _testRun2 = require('./test-run');

var _testRun3 = _interopRequireDefault(_testRun2);

var _type = require('./test-run/commands/type');

var _type2 = _interopRequireDefault(_type);

var _assignable = require('./utils/assignable');

var _assignable2 = _interopRequireDefault(_assignable);

var _getTestList = require('./compiler/test-file/formats/es-next/get-test-list');

var _getTestList2 = require('./compiler/test-file/formats/typescript/get-test-list');

var _initializers = require('./test-run/commands/validations/initializers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    getTestList: _getTestList.getTestList,
    getTypeScriptTestList: _getTestList2.getTypeScriptTestList,
    getTestListFromCode: _getTestList.getTestListFromCode,
    getTypeScriptTestListFromCode: _getTestList2.getTypeScriptTestListFromCode,
    TestRunErrorFormattableAdapter: _formattableAdapter2.default,
    TestRun: _testRun3.default,
    testRunErrors: testRunErrors,
    COMMAND_TYPE: _type2.default,
    Assignable: _assignable2.default,
    initSelector: _initializers.initSelector,

    buildReporterPlugin: function buildReporterPlugin(pluginFactory, outStream) {
        var plugin = pluginFactory();

        return new _pluginHost2.default(plugin, outStream);
    }
};
module.exports = exports['default'];