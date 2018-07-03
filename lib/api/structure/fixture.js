'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _typeAssertions = require('../../errors/runtime/type-assertions');

var _handleTagArgs = require('../../utils/handle-tag-args');

var _handleTagArgs2 = _interopRequireDefault(_handleTagArgs);

var _testingUnit = require('./testing-unit');

var _testingUnit2 = _interopRequireDefault(_testingUnit);

var _wrapTestFunction = require('../wrap-test-function');

var _wrapTestFunction2 = _interopRequireDefault(_wrapTestFunction);

var _assertType = require('../request-hooks/assert-type');

var _assertType2 = _interopRequireDefault(_assertType);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Fixture = function (_TestingUnit) {
    (0, _inherits3.default)(Fixture, _TestingUnit);

    function Fixture(testFile) {
        var _ret;

        (0, _classCallCheck3.default)(this, Fixture);

        var _this = (0, _possibleConstructorReturn3.default)(this, _TestingUnit.call(this, testFile, 'fixture'));

        _this.path = testFile.filename;

        _this.pageUrl = 'about:blank';

        _this.beforeEachFn = null;
        _this.afterEachFn = null;

        _this.beforeFn = null;
        _this.afterFn = null;

        _this.requestHooks = [];

        return _ret = _this.apiOrigin, (0, _possibleConstructorReturn3.default)(_this, _ret);
    }

    Fixture.prototype._add = function _add(name) {
        for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            rest[_key - 1] = arguments[_key];
        }

        name = (0, _handleTagArgs2.default)(name, rest);

        (0, _typeAssertions.assertType)(_typeAssertions.is.string, 'apiOrigin', 'The fixture name', name);

        this.name = name;
        this.testFile.currentFixture = this;

        return this.apiOrigin;
    };

    Fixture.prototype._before$ = function _before$(fn) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'before', 'fixture.before hook', fn);

        this.beforeFn = fn;

        return this.apiOrigin;
    };

    Fixture.prototype._after$ = function _after$(fn) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'after', 'fixture.after hook', fn);

        this.afterFn = fn;

        return this.apiOrigin;
    };

    Fixture.prototype._beforeEach$ = function _beforeEach$(fn) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'beforeEach', 'fixture.beforeEach hook', fn);

        this.beforeEachFn = (0, _wrapTestFunction2.default)(fn);

        return this.apiOrigin;
    };

    Fixture.prototype._afterEach$ = function _afterEach$(fn) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'afterEach', 'fixture.afterEach hook', fn);

        this.afterEachFn = (0, _wrapTestFunction2.default)(fn);

        return this.apiOrigin;
    };

    Fixture.prototype._requestHooks$ = function _requestHooks$() {
        for (var _len2 = arguments.length, hooks = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            hooks[_key2] = arguments[_key2];
        }

        hooks = (0, _lodash.flattenDeep)(hooks);

        (0, _assertType2.default)(hooks);

        this.requestHooks = hooks;

        return this.apiOrigin;
    };

    return Fixture;
}(_testingUnit2.default);

exports.default = Fixture;


_testingUnit2.default._makeAPIListForChildClass(Fixture);
module.exports = exports['default'];