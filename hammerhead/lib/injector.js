var whacko           = require('whacko'),
    sharedConst      = require('./../shared/const'),
    pageProc         = require('./../shared/page_processor'),
    ProcessedJsCache = require('./processed_js_cache'),
    ERR              = require('./server_errs');

var contentUtils = require('./content-utils');

var jsCache = new ProcessedJsCache();

//Const
var BODY_CREATED_EVENT_SCRIPT              = [
    '<script type="text/javascript" class="' + sharedConst.TEST_CAFE_SCRIPT_CLASSNAME + '">',
    'if (window.Hammerhead)',
    '   window.Hammerhead._raiseBodyCreatedEvent();',
    'var script = document.currentScript || document.scripts[document.scripts.length - 1];',
    'script.parentNode.removeChild(script);',
    '</script>'
].join('\n');

//Injection
function inject (body, encoding, charset, callback, processor, injectionOptions) {
    contentUtils.decodeContent(body, encoding, charset)
        .then(function (rawData) {
            var processedData = null;

            try {
                processedData = processor(rawData, charset, injectionOptions);

                if (processedData === null)
                    return;
            } catch (err) {
                callback(err);
                return;
            }

            contentUtils.encodeContent(processedData, encoding, charset)
                .then(function (encodedHtml) {
                    callback(null, encodedHtml);
                })
                .catch(function () {
                    // TODO quite meaningless message
                    callback({ code: ERR.INJECTOR_RESOURCE_ENCODING_FAILED, encoding: encoding });
                });
        })
        .catch(function () {
            // TODO quite meaningless message
            callback({ code: ERR.INJECTOR_RESOURCE_DECODING_FAILED, encoding: encoding });
        });
}

//API
exports.injectInPage = function (body, encoding, charset, injectionOptions, callback) {
    var rawDataProcessor = function (rawData, actualCharset, injectionOptions) {
        if (injectionOptions && injectionOptions.iframeImageSrc)
            rawData = '<html><body><img src="' + injectionOptions.iframeImageSrc + '" /></body></html>';

        var $   = null,
            bom = pageProc.getBOM(rawData);

        rawData = bom ? rawData.replace(bom, '') : rawData;

        try {
            $ = whacko.load(rawData);
        } catch (parseErrs) {
            throw { code: ERR.INJECTOR_DOCUMENT_PARSING_FAILED, msg: parseErrs };
        }

        if (injectionOptions) {
            if (!charset) {
                // NOTE: if the charset doesn't set in server's header and if the charset sets in page's meta tag
                // and isn't equal to the default charset, we restart injecting with the new charset.
                // We returns null if need to restart injection.
                var metas = [];

                $('meta').each(function (meta) {
                    var $meta = $(meta);

                    metas.push({
                        httpEquiv: $meta.attr('http-equiv'),
                        content:   $meta.attr('content'),
                        charset:   $meta.attr('charset')
                    });
                });

                var pageCharset = contentUtils.parseCharsetFromMeta(metas);

                if (pageCharset && (pageCharset !== actualCharset)) {
                    //restart injecting
                    inject(body, encoding, pageCharset, callback, rawDataProcessor, injectionOptions);
                    return null;
                }
            }

            var crossDomainProxyPort = injectionOptions.crossDomainProxyPort;

            // TODO: figure out how to emulate the behavior of the tag
            $('meta[name="referrer"][content="origin"]').remove();

            var handler = function (html, callback) {
                var storedIsIframe = injectionOptions.isIFrame;

                injectionOptions.isIFrame = true;

                var result = rawDataProcessor(html, actualCharset, injectionOptions);

                injectionOptions.isIFrame = storedIsIframe;

                callback(result);
            };

            pageProc.on(pageProc.HTML_PROCESSING_REQUIRED, handler);
            pageProc.processPage($, injectionOptions.urlReplacer, crossDomainProxyPort, injectionOptions.isIFrame);
            pageProc.off(pageProc.HTML_PROCESSING_REQUIRED, handler);

            var injection = [];

            if (injectionOptions.styleUrl) {
                injection.push('<link rel="stylesheet" type="text/css" class="');
                injection.push(sharedConst.TEST_CAFE_UI_STYLESHEET_FULL_CLASSNAME);
                injection.push('"href = "');
                injection.push(injectionOptions.styleUrl);
                injection.push('">');
            }

            if (injectionOptions.scripts) {
                injectionOptions.scripts.forEach(function (scriptUrl) {
                    injection.push('<script type="text/javascript" class="');
                    injection.push(sharedConst.TEST_CAFE_SCRIPT_CLASSNAME);
                    injection.push('" charset="UTF-8" src="');
                    injection.push(scriptUrl);
                    injection.push('">');
                    injection.push('</script>');
                });
            }

            if (injection.length)
                $('head').prepend(injection.join(''));

            $('body').prepend(BODY_CREATED_EVENT_SCRIPT);

            // NOTE: Remove existing compatible meta tag and add a new at the beginning of the head
            $('meta[http-equiv="X-UA-Compatible"]').remove();
            $('head').prepend('<meta http-equiv="X-UA-Compatible" content="IE=edge" />');
        }

        return (bom || '') + $.html();
    };

    inject(body, encoding, charset, callback, rawDataProcessor, injectionOptions);
};

exports.injectInStylesheet = function (body, encoding, charset, urlReplacer, callback) {
    inject(body, encoding, charset, callback, function (rawData) {
        return pageProc.processStylesheet(rawData, urlReplacer);
    });
};

exports.injectInScript = function (body, encoding, charset, callback) {
    inject(body, encoding, charset, callback, function (rawData) {
        var processedJs = jsCache.pick(rawData);

        if (!processedJs) {
            processedJs = pageProc.processScript(rawData);
            jsCache.add(rawData, processedJs);
        }

        return processedJs;
    });
};

exports.injectInManifest = function (body, encoding, charset, urlReplacer, callback) {
    inject(body, encoding, charset, callback, function (rawData) {
        return pageProc.processManifest(rawData, urlReplacer);
    });
};

//TODO do we really need this?
exports.injectInJSON = function (body, encoding, charset, callback) {
    inject(body, encoding, charset, callback, function (rawData) {
        return pageProc.processScript(rawData, true);
    });
};