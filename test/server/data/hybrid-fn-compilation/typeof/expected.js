(function () {
    return
    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };
    (function () {
        return function (someParam) {
            return typeof someParam === "undefined" ? "undefined" : _typeof(someParam);
        };
    });
})();
