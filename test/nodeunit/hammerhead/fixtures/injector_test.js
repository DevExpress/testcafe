var fs        = require('fs'),
    zlib      = require('zlib'),
    iconv     = require('iconv-lite'),
    injector  = require('../../../../hammerhead/lib/injector'),
    testUtils = require('../../test_utils'),
    ERR       = require('../../../../hammerhead/lib/server_errs'),
    path      = require('path');

var CHUNK_SIZE = 50;

function makeBuffer (buf) {
    if (!Buffer.isBuffer(buf))
        buf = new Buffer(buf);

    return buf;
}

var srcHtml  = null,
    watchdog = null,
    cc       = testUtils.compareCode;

exports['Compatible meta'] = {
    setUp: function (done) {
        watchdog = new testUtils.Watchdog();

        done();
    },

    tearDown: function (done) {
        watchdog.shrink();
        done();
    },

    'Not exists': function (t) {
        var srcChunks    = makeBuffer(fs.readFileSync(path.join(__dirname, '../data/injector/compatible_meta/not_exists_src.html')).toString()),
            expectedHtml = fs.readFileSync(path.join(__dirname, '../data/injector/compatible_meta/not_exists_expected.html')).toString(),
            options      = { scripts: ['/testscript'] };

        injector.injectInPage(srcChunks, '', 'utf8', options, function (err, htmlBuf) {
            t.ok(!err);
            t.ok(testUtils.compareCode(htmlBuf.toString(), expectedHtml));
            t.done();
        });
    },

    'Exists': function (t) {
        var srcChunks    = makeBuffer(fs.readFileSync(path.join(__dirname, '../data/injector/compatible_meta/exists_src.html')).toString()),
            expectedHtml = fs.readFileSync(path.join(__dirname, '../data/injector/compatible_meta/exists_expected.html')).toString(),
            options      = { scripts: ['/testscript'] };

        injector.injectInPage(srcChunks, '', 'utf8', options, function (err, htmlBuf) {
            t.ok(!err);
            t.ok(testUtils.compareCode(htmlBuf.toString(), expectedHtml));
            t.done();
        });
    }
};

exports['Encodings'] = {
    setUp: function (done) {
        srcHtml  = fs.readFileSync(path.join(__dirname, '../data/injector/encodings.html')).toString();
        watchdog = new testUtils.Watchdog();

        done();
    },

    tearDown: function (done) {
        watchdog.shrink();
        done();
    },

    'Plain text passed - plain text returned': function (t) {
        var srcChunks = makeBuffer(srcHtml);

        injector.injectInPage(srcChunks, '', 'utf8', null, function (err, html) {
            t.ok(!err);
            t.ok(Buffer.isBuffer(html));
            t.ok(cc(html.toString(), srcHtml));
            t.done();
        });
    },

    'Gzip passed - gzip returned': function (t) {
        zlib.gzip(srcHtml, function (err, encodedSrcHtml) {
            var srcChunks = makeBuffer(encodedSrcHtml);

            injector.injectInPage(srcChunks, 'gzip', 'utf8', null, function (err, encodedHtml) {
                t.ok(!err);
                t.ok(Buffer.isBuffer(encodedHtml));

                zlib.gunzip(encodedHtml, function (err, html) {
                    t.ok(cc(html.toString(), srcHtml));
                    t.done();
                });
            });
        });
    },

    'Deflate passed - deflate returned': function (t) {
        zlib.deflate(srcHtml, function (err, encodedSrcHtml) {
            var srcChunks = makeBuffer(encodedSrcHtml);

            injector.injectInPage(srcChunks, 'deflate', 'utf8', null, function (err, encodedHtml) {
                t.ok(!err);
                t.ok(Buffer.isBuffer(encodedHtml));

                zlib.inflate(encodedHtml, function (err, html) {
                    t.ok(cc(html.toString(), srcHtml));
                    t.done();
                });
            });
        });
    },

    'Gzip decoding failed': function (t) {
        var srcChunks = makeBuffer('Answer to the Ultimate Question of Life, the Universe, and Everything.');

        injector.injectInPage(srcChunks, 'gzip', 'utf8', null, function (err) {
            t.strictEqual(err.code, ERR.INJECTOR_RESOURCE_DECODING_FAILED);
            t.strictEqual(err.encoding, 'gzip');
            t.done();
        });
    },

    'Deflate decoding failed': function (t) {
        var srcChunks = makeBuffer('Answer to the Ultimate Question of Life, the Universe, and Everything.');

        injector.injectInPage(srcChunks, 'deflate', 'utf8', null, function (err) {
            t.strictEqual(err.code, ERR.INJECTOR_RESOURCE_DECODING_FAILED);
            t.strictEqual(err.encoding, 'deflate');
            t.done();
        });
    },

    'Charset decoding': function (t) {
        var srcChunks = makeBuffer(iconv.encode(srcHtml, 'win1251'));

        injector.injectInPage(srcChunks, '', 'win1251', null, function (err, html) {
            t.ok(!err);
            t.ok(Buffer.isBuffer(html));
            t.ok(cc(iconv.decode(html, 'win1251'), srcHtml));
            t.done();
        });
    },

    'Decoding failed': function (t) {
        var srcChunks = makeBuffer(iconv.encode(srcHtml, 'win1251'));

        injector.injectInPage(srcChunks, '', 'test', null, function (err) {
            t.strictEqual(err.code, ERR.INJECTOR_RESOURCE_DECODING_FAILED);
            t.done();
        });
    }
};

exports['injector.injectInPage'] = {
    setUp: function (done) {
        watchdog = new testUtils.Watchdog(true);
        done();
    },

    tearDown: function (done) {
        watchdog.shrink();
        process.nextTick(function () {
            done();
        });
    },

    'Startup script': function (t) {
        var srcChunks    = makeBuffer(fs.readFileSync(path.join(__dirname, '../data/injector/inject_startup_script/src.html')).toString()),
            expectedHtml = fs.readFileSync(path.join(__dirname, '../data/injector/inject_startup_script/expected.html')).toString(),
            options      = {
                scripts: [
                    '/testscript1',
                    '/testscript2'
                ]
            };

        injector.injectInPage(srcChunks, '', 'utf8', options, function (err, htmlBuf) {
            t.ok(!err);
            t.ok(testUtils.compareCode(htmlBuf.toString(), expectedHtml));
            t.done();
        });
    },

    'Inject UI stylesheet': function (t) {
        var srcChunks    = makeBuffer(fs.readFileSync(path.join(__dirname, '../data/injector/inject_ui_stylesheet/src.html')).toString()),
            expectedHtml = fs.readFileSync(path.join(__dirname, '../data/injector/inject_ui_stylesheet/expected.html')).toString(),
            options      = {
                styleUrl: '/testStyleUrl'
            };

        injector.injectInPage(srcChunks, '', 'utf8', options, function (err, htmlBuf) {
            t.ok(!err);
            t.ok(testUtils.compareCode(htmlBuf.toString(), expectedHtml));
            t.done();
        });
    },

    'Process resources': function (t) {
        var srcChunks      = makeBuffer(fs.readFileSync(path.join(__dirname, '../data/injector/process_resources/src.html')).toString()),
            expectedHtml   = fs.readFileSync(path.join(__dirname, '../data/injector/process_resources/expected.html')).toString(),
            urlReplacement = 'http://i.am.replaced',
            options        = {
                urlReplacer: function () {
                    return urlReplacement;
                }
            };


        injector.injectInPage(srcChunks, '', 'utf8', options, function (err, htmlBuf) {
            t.ok(!err);
            t.ok(testUtils.compareCode(htmlBuf.toString(), expectedHtml));
            t.done();
        });
    }
};

exports['Regression'] = {
    setUp: function (done) {
        watchdog = new testUtils.Watchdog();

        done();
    },

    tearDown: function (done) {
        watchdog.shrink();
        done();
    },

    'B239430 - Google images - TestCafe script does not inject on empty page': function (t) {
        var srcHtml        = fs.readFileSync(path.join(__dirname, '../data/injector/B239430/src.html'), 'utf8').toString(),
            expectedHtml   = fs.readFileSync(path.join(__dirname, '../data/injector/B239430/expected.html'), 'utf8').toString(),
            srcChunks      = makeBuffer(srcHtml),
            injectedScript = ['/testscript'];

        injector.injectInPage(srcChunks, '', 'iso-8859-1', { scripts: injectedScript }, function (err, html) {
            t.ok(cc(html.toString(), expectedHtml));
            t.done();
        });
    }
};
