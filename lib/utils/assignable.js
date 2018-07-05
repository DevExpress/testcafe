'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

var Assignable = function () {
    function Assignable() {
        (0, _classCallCheck3.default)(this, Assignable);
    }

    Assignable.prototype._getAssignableProperties = function _getAssignableProperties() {
        throw new Error('Not implemented');
    };

    Assignable.prototype._assignFrom = function _assignFrom(obj, validate) {
        if (!obj) return;

        var props = this._getAssignableProperties();

        for (var i = 0; i < props.length; i++) {
            var _props$i = props[i],
                name = _props$i.name,
                type = _props$i.type,
                required = _props$i.required,
                init = _props$i.init;


            var path = name.split('.');
            var lastIdx = path.length - 1;
            var last = path[lastIdx];
            var srcObj = obj;
            var destObj = this;

            for (var j = 0; j < lastIdx && srcObj && destObj; j++) {
                srcObj = srcObj[path[j]];
                destObj = destObj[path[j]];
            }

            if (srcObj && destObj) {
                var srcVal = srcObj[last];

                if (srcVal !== void 0 || required) {
                    if (validate && type) type(name, srcVal);

                    destObj[last] = init ? init(name, srcVal) : srcVal;
                }
            }
        }
    };

    return Assignable;
}();

exports.default = Assignable;
module.exports = exports['default'];