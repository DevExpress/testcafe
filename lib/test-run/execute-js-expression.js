'use strict';

exports.__esModule = true;
exports.executeJsExpression = executeJsExpression;

var _vm = require('vm');

var _selectorBuilder = require('../client-functions/selectors/selector-builder');

var _selectorBuilder2 = _interopRequireDefault(_selectorBuilder);

var _clientFunctionBuilder = require('../client-functions/client-function-builder');

var _clientFunctionBuilder2 = _interopRequireDefault(_clientFunctionBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function executeJsExpression(expression, skipVisibilityCheck, testRun) {
    var sandbox = {
        Selector: function Selector(fn) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            if (skipVisibilityCheck) options.visibilityCheck = false;

            if (testRun) options.boundTestRun = testRun;

            var builder = new _selectorBuilder2.default(fn, options, { instantiation: 'Selector' });

            return builder.getFunction();
        },

        ClientFunction: function ClientFunction(fn) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            if (testRun) options.boundTestRun = testRun;

            var builder = new _clientFunctionBuilder2.default(fn, options, { instantiation: 'ClientFunction' });

            return builder.getFunction();
        }
    };

    var context = (0, _vm.createContext)(sandbox);

    return (0, _vm.runInContext)(expression, context, { displayErrors: false });
}