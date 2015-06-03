var Crypto = require('crypto');

var ProcessedJSCache = module.exports = function () {
    this.items = {};
    this.size = 0;
};

//TODO use LRU cache instead

ProcessedJSCache.MAX_SIZE = 50 * 1024 * 1024; //NOTE: Max cache size is 50 MBytes
ProcessedJSCache.CLEAN_UP_DEST_SIZE = Math.round(ProcessedJSCache.MAX_SIZE / 2); //NOTE: clean up cache to the half of the max size

ProcessedJSCache.prototype._cleanUp = function () {
    var cache = this;

    var lruOrdered = Object.keys(this.items)
        //NOTE: map cache data to {digest, lastUse} pair
        .map(function (digest) {
            return {
                digest: digest,
                lastUse: cache.items[digest].lastUse
            };
        })
        //NOTE: sort it by lastUse
        .sort(function (a, b) {
            return a.lastUse > b.lastUse ? 1 : -1;
        });

    for (var i = 0; i < lruOrdered.length; i++) {
        var digest = lruOrdered[i].digest;

        cache.size -= cache.items[digest].size;
        delete cache.items[digest];

        if (cache.size <= ProcessedJSCache.CLEAN_UP_DEST_SIZE)
            break;
    }

};

ProcessedJSCache.prototype.add = function (js, processedJs) {
    var cache = this,
        lastUse = new Date().getTime();

    setTimeout(function () {
        var hash = Crypto.createHash('md5');

        hash.update(js);

        var digest = hash.digest('hex'),
            size = processedJs.length;

        cache.size += size;

        cache.items[digest] = {
            data: processedJs,
            size: size,
            lastUse: lastUse
        };

        if (cache.size > ProcessedJSCache.MAX_SIZE)
            cache._cleanUp();
    });
};

ProcessedJSCache.prototype.pick = function (js) {
    var hash = Crypto.createHash('md5');

    hash.update(js);

    var digest = hash.digest('hex');

    var cacheItem = this.items[digest];

    if (cacheItem) {
        cacheItem.lastUse = new Date().getTime();

        return cacheItem.data;
    }

    return null;
};