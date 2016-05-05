(function () {
    var _stringify2 = { default: JSON.stringify };
    return (function () {
        var str = (0, _stringify2.default)(someObj);

        return JSON.parse(someStr + str);
    });
})();
