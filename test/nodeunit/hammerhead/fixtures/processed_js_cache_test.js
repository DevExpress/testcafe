var ProcessedJSCache = require('../../../../hammerhead/lib/processed_js_cache');

exports['Add - pick'] = function (t) {
    var cache = new ProcessedJSCache();

    cache.add('Some value 1', 'Hey ya!1');
    cache.add('Some value 2', 'Hey ya!2');

    //NOTE: give some time to cache to update

    setTimeout(function () {
        t.strictEqual(cache.pick('Some value 1'), 'Hey ya!1');
        t.strictEqual(cache.pick('Some value 2'), 'Hey ya!2');

        t.ok(!cache.pick('Some value 3'));

        t.done();
    }, 200);
};

exports['Clean up'] = function (t) {
    var cache = new ProcessedJSCache(),
        savedMaxSize = ProcessedJSCache.MAX_SIZE,
        savedCleanupSize = ProcessedJSCache.CLEAN_UP_DEST_SIZE;

    ProcessedJSCache.MAX_SIZE = 4;
    ProcessedJSCache.CLEAN_UP_DEST_SIZE = 2;

    cache.add('key1', '1');
    cache.add('key2', '2');
    cache.add('key3', '3');
    cache.add('key4', '4');

    setTimeout(function () {
        cache.add('key5', '5');
        cache.pick('key1');

        setTimeout(function () {
            t.strictEqual(cache.pick('key1'), '1');
            t.strictEqual(cache.pick('key5'), '5');

            t.ok(!cache.pick('key2'));
            t.ok(!cache.pick('key3'));
            t.ok(!cache.pick('key4'));

            ProcessedJSCache.MAX_SIZE = savedMaxSize;
            ProcessedJSCache.CLEAN_UP_DEST_SIZE = savedCleanupSize;

            t.done();
        }, 200);
    }, 200);


};