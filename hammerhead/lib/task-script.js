'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

exports.__esModule = true;
exports.render = render;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var TASK_TEMPLATE_FILE = _path2.default.join(__dirname, '../../_compiled_/hammerhead_client/task.jstmpl');
var TASK_TEMPLATE = _fs2.default.readFileSync(TASK_TEMPLATE_FILE).toString();
var VAR_RE = /"<@\s*(\S+)\s*@>"/g;

function render(vars) {
    return TASK_TEMPLATE.replace(VAR_RE, function (str, varName) {
        return vars[varName] === void 0 ? str : vars[varName];
    });
}
//# sourceMappingURL=task-script.js.map