(function () {
    var _promise2 = { default: Promise };
    return (function () {
        var a = new _promise2.default(function (resolve, reject) {
            reject(1);
        });


        return _promise2.default.resolve().then(function () {
            return a;
        }).catch(function (err) {
            return err;
        });
    });
})();
