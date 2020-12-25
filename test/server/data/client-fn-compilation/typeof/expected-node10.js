(function () {
    var_typeof3 = {
        default: function (obj) {
            return typeof obj;
        }
    };
    var func = (function () {
        return typeof someObj === "undefined" ? "undefined" : (0, _typeof3.default)(someObj);
    });

    return func;
})();
