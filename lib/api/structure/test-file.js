'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BORROWED_TEST_PROPERTIES = ['skip', 'only', 'pageUrl', 'authCredentials'];

var TestFile = function () {
    function TestFile(filename) {
        (0, _classCallCheck3.default)(this, TestFile);

        this.filename = filename;
        this.currentFixture = null;
        this.collectedTests = [];
    }

    TestFile.prototype.getTests = function getTests() {
        this.collectedTests.forEach(function (test) {
            BORROWED_TEST_PROPERTIES.forEach(function (prop) {
                test[prop] = test[prop] || test.fixture[prop];
            });

            if (test.disablePageReloads === void 0) test.disablePageReloads = test.fixture.disablePageReloads;
        });

        return this.collectedTests;
    };

    return TestFile;
}();

exports.default = TestFile;
module.exports = exports['default'];