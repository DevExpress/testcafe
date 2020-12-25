(function () {
    var _typeof = function (obj) {
        return typeof obj;
    };
    var func = (function () {
        return typeof someObj === "undefined" ? "undefined" : _typeof(someObj);
    });
    return func;
})();
