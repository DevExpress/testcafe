// NOTE: Supporting $.data(elem, key) calling in test scenarios:
// jQuery objects data is not shared between different instances of jQuery.
// In the TestCafe scripts we use a local jQuery instance. Therefore we should make a proxy between
// local instance of jQuery and tested page's instance of jQuery (if it exists)

export function setup (testCafeJQuery) {
    testCafeJQuery.fn._data = testCafeJQuery.fn.data;

    if (testCafeJQuery !== window.jQuery) {
        (function (undefined) {
            testCafeJQuery.fn.data = function () {
                var elem       = this[0],
                    rootJQuery = window.jQuery,
                    key        = arguments[0],
                    value      = arguments[1];

                if (arguments.length === 2)
                    return this._data(key, value);

                if (!rootJQuery || typeof rootJQuery(elem).data !== 'function')
                    return this._data(key);

                if (!elem)
                    return this._data(key);

                var res = this._data(key);

                if (key === undefined)
                    return testCafeJQuery.extend(res, rootJQuery(elem).data());

                if (res !== undefined)
                    return res;

                var rootJQueryObject = rootJQuery(elem);

                return rootJQueryObject.length ? rootJQueryObject.data(key) : undefined;
            };
        })();
    }
}