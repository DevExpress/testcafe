(function () {
    var _typeof3 = {
        default: function (obj) {
            return typeof obj;
        }
    };
    return (function () {
        return function (someParam) {
            return typeof someParam === 'undefined' ? 'undefined' : (0, _typeof3.default)(someParam);
        };
    });
})();
