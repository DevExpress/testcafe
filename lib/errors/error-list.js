'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _processTestFnError = require('./process-test-fn-error');

var _processTestFnError2 = _interopRequireDefault(_processTestFnError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TestCafeErrorList = function () {
    function TestCafeErrorList() {
        (0, _classCallCheck3.default)(this, TestCafeErrorList);

        this.items = [];
    }

    TestCafeErrorList.prototype.addError = function addError(err) {
        if (err instanceof TestCafeErrorList) this.items = this.items.concat(err.items);else this.items.push((0, _processTestFnError2.default)(err));
    };

    (0, _createClass3.default)(TestCafeErrorList, [{
        key: 'hasErrors',
        get: function get() {
            return !!this.items.length;
        }
    }]);
    return TestCafeErrorList;
}();

exports.default = TestCafeErrorList;
module.exports = exports['default'];