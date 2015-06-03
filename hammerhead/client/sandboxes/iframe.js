HammerheadClient.define('DOMSandbox.IFrame', function (require, exports) {
    var $ = require('jQuery'),
        NativeMethods = require('DOMSandbox.NativeMethods'),
        SharedConst = require('Shared.Const'),
        ServiceCommands = require('Shared.ServiceCommands'),
        Transport = require('Transport'),
        UrlUtil = require('UrlUtil'),
        Util = require('Util');

    // For iframes without src only!
    exports.IFRAME_READY_TO_INIT = 'iframeReadyToInit';
    exports.IFRAME_READY_TO_INIT_INTERNAL = 'iframeReadyToInitInternal';
    exports.IFRAME_DOCUMENT_CREATED = 'iframeDocumentCreated';
    exports.IFRAME_DOCUMENT_RECREATED = 'iframeDocumentRecreated';

    var IFRAME_WINDOW_INITED = 'hh_iwi_5d9138e9';

    var eventEmitter = new Util.EventEmitter();

    exports.on = eventEmitter.on.bind(eventEmitter);
    exports.off = eventEmitter.off.bind(eventEmitter);

    exports.isIframeInitialized = function (iframe) {
        var isFFIframeUninitialized = Util.isMozilla && iframe.contentWindow.document.readyState === 'uninitialized';

        return !isFFIframeUninitialized && !!iframe.contentDocument.documentElement;
    };

    exports.isWindowInited = function (window) {
        return window[IFRAME_WINDOW_INITED];
    };

    exports.iframeReadyToInitHandler = iframeReadyToInitHandler;

    function iframeReadyToInitHandler(e) {
        // Get and evaluate iframe task script
        Transport.syncServiceMsg({ cmd: ServiceCommands.GET_IFRAME_TASK_SCRIPT }, function (iFrameTaskScript) {
            e.iframe.contentWindow.eval.apply(e.iframe.contentWindow, [ iFrameTaskScript ]);
        });
    }

    eventEmitter.on(exports.IFRAME_READY_TO_INIT, iframeReadyToInitHandler);

    function raiseReadyToInitEvent(iframe) {
        if (UrlUtil.isIframeWithoutSrc(iframe)) {
            var iframeInitialized = exports.isIframeInitialized(iframe),
                iframeWindowInitialized = iframe.contentWindow[IFRAME_WINDOW_INITED];

            if (iframeInitialized && !iframeWindowInitialized) {
                // Ok, iframe fully loaded now, but Hammerhead not injected
                iframe.contentWindow[IFRAME_WINDOW_INITED] = true;

                // Rise this internal event to eval Hammerhead code script
                eventEmitter.emit(exports.IFRAME_READY_TO_INIT_INTERNAL, {
                    iframe: iframe
                });

                // Rise this event to eval "task" script and to call Hammerhead initialization method after
                eventEmitter.emit(exports.IFRAME_READY_TO_INIT, {
                    iframe: iframe
                });

                iframe.contentWindow[SharedConst.DOM_SANDBOX_OVERRIDE_DOM_METHOD_NAME]();
            } else if (!iframeInitialized) {
                // Even if iframe is not loaded (iframe.contentDocument.documentElement not exist) we should still
                // override document.write method, without Hammerhead initializing. This method can be called
                // before iframe fully loading, we are obliged to override it now
                if (iframe.contentDocument.write.toString() === NativeMethods.documentWrite.toString()) {
                    eventEmitter.emit(exports.IFRAME_DOCUMENT_CREATED, {
                        iframe: iframe
                    });
                }
            } else if (iframeWindowInitialized && (Util.isMozilla || Util.isIE)) {
                // IE recreates iframe document after document.write calling.
                // FireFox recreates iframe document during loading
//                if (iframe.contentDocument.write.toString() === NativeMethods.documentWrite.toString()) {
//                    eventEmitter.emit(exports.IFRAME_DOCUMENT_RECREATED, {
//                        iframe: iframe
//                    });
//                }
            }
        }

    }

    exports.iframeAddedToDom = function (el) {
        if (!Util.isShadowUIElement(el)) {
            raiseReadyToInitEvent(el);

            if (!Util.isWebKit && el.contentDocument) {
                $(el.contentDocument).ready(function () {
                    raiseReadyToInitEvent(el);
                });
            }
        }
    };

    exports.onIframeBeganToRun = function (iframe) {
        raiseReadyToInitEvent(iframe);
    };

    exports.overrideIframe = function ($el) {
        var el = $el[0];

        if (Util.isShadowUIElement(el))
            return;

        var src = $el.attr('src');

        if (!src || !UrlUtil.isSupportedProtocol(src)) {
            if (el.contentWindow) {
                raiseReadyToInitEvent(el);

                var readyHandler = function () {
                    if (el.contentWindow)
                        raiseReadyToInitEvent(el);
                };

                $el.bind('load', readyHandler);

                if (Util.isMozilla)
                    $(el.contentDocument).bind('ready', readyHandler);

            } else {
                var handler = function () {
                    if (!Util.isShadowUIElement(el)) {
                        if (Util.isCrossDomainIframe(el))
                            $el.unbind('load', handler);
                        else
                            raiseReadyToInitEvent(el);
                    }
                };

                if (Util.isElementInDocument(el))
                    raiseReadyToInitEvent(el);

                $el.bind('load', handler);
            }
        } else {
            if (Util.isElementInDocument(el))
                raiseReadyToInitEvent(el);

            $el.bind('load', function () {

                raiseReadyToInitEvent(this);
            });
        }
    };
});