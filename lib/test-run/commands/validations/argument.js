'use strict';

exports.__esModule = true;
exports.setSpeedArgument = exports.booleanArgument = exports.positiveIntegerArgument = exports.integerArgument = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.actionRoleArgument = actionRoleArgument;
exports.actionOptions = actionOptions;
exports.nonEmptyStringArgument = nonEmptyStringArgument;
exports.nullableStringArgument = nullableStringArgument;
exports.urlArgument = urlArgument;
exports.stringOrStringArrayArgument = stringOrStringArrayArgument;
exports.resizeWindowDeviceArgument = resizeWindowDeviceArgument;

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _markerSymbol = require('../../../role/marker-symbol');

var _markerSymbol2 = _interopRequireDefault(_markerSymbol);

var _factories = require('./factories');

var _testRun = require('../../../errors/test-run');

var _testPageUrl = require('../../../api/test-page-url');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Validators
var integerArgument = exports.integerArgument = (0, _factories.createIntegerValidator)(_testRun.ActionIntegerArgumentError);
var positiveIntegerArgument = exports.positiveIntegerArgument = (0, _factories.createPositiveIntegerValidator)(_testRun.ActionPositiveIntegerArgumentError);
var booleanArgument = exports.booleanArgument = (0, _factories.createBooleanValidator)(_testRun.ActionBooleanArgumentError);
var setSpeedArgument = exports.setSpeedArgument = (0, _factories.createSpeedValidator)(_testRun.SetTestSpeedArgumentError);

function actionRoleArgument(name, val) {
    if (!val || !val[_markerSymbol2.default]) throw new _testRun.ActionRoleArgumentError(name, typeof val === 'undefined' ? 'undefined' : (0, _typeof3.default)(val));
}

function actionOptions(name, val) {
    var type = typeof val === 'undefined' ? 'undefined' : (0, _typeof3.default)(val);

    if (type !== 'object' && val !== null && val !== void 0) throw new _testRun.ActionOptionsTypeError(type);
}

function nonEmptyStringArgument(argument, val, createError) {
    if (!createError) createError = function createError(actualValue) {
        return new _testRun.ActionStringArgumentError(argument, actualValue);
    };

    var type = typeof val === 'undefined' ? 'undefined' : (0, _typeof3.default)(val);

    if (type !== 'string') throw createError(type);

    if (!val.length) throw createError('""');
}

function nullableStringArgument(argument, val) {
    var type = typeof val === 'undefined' ? 'undefined' : (0, _typeof3.default)(val);

    if (type !== 'string' && val !== null) throw new _testRun.ActionNullableStringArgumentError(argument, type);
}

function urlArgument(name, val) {
    nonEmptyStringArgument(name, val);

    (0, _testPageUrl.assertUrl)(val.trim(), 'navigateTo');
}

function stringOrStringArrayArgument(argument, val) {
    var type = typeof val === 'undefined' ? 'undefined' : (0, _typeof3.default)(val);

    if (type === 'string') {
        if (!val.length) throw new _testRun.ActionStringOrStringArrayArgumentError(argument, '""');
    } else if (Array.isArray(val)) {
        if (!val.length) throw new _testRun.ActionStringOrStringArrayArgumentError(argument, '[]');

        var validateElement = function validateElement(elementIndex) {
            return nonEmptyStringArgument(argument, val[elementIndex], function (actualValue) {
                return new _testRun.ActionStringArrayElementError(argument, actualValue, elementIndex);
            });
        };

        for (var i = 0; i < val.length; i++) {
            validateElement(i);
        }
    } else throw new _testRun.ActionStringOrStringArrayArgumentError(argument, type);
}

function resizeWindowDeviceArgument(name, val) {
    nonEmptyStringArgument(name, val);

    if (!(0, _testcafeBrowserTools.isValidDeviceName)(val)) throw new _testRun.ActionUnsupportedDeviceTypeError(name, val);
}