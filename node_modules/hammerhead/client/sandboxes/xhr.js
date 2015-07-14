HammerheadClient.define('DOMSandbox.Xhr', function (require, exports) {
    var NativeMethods = require('DOMSandbox.NativeMethods'),
        Settings = require('Settings'),
        SharedConst = require('Shared.Const'),
        UrlUtil = require('UrlUtil'),
        Util = require('Util');

    var TEST_CAFE_SERVICE_MSG_REQUEST_FLAG = 'is_tc_req-c8f5bd4f',
        XHR_PROPERTY_ACCESS_ERROR = "INVALID_STATE_ERR";

    var corsSupported = false;

    //Event
    exports.XHR_COMPLETED = 'xhrCompleted';
    exports.XHR_ERROR = 'xhrError';
    exports.XHR_SEND = 'xhrSend';

    exports.eventEmitter = exports.eventEmitter || new Util.EventEmitter();

    exports.on = exports.eventEmitter.on.bind(exports.eventEmitter);

    // NOTE: We should wrap xhr response (B236741)
    function XMLHttpRequestWrapper(xhr) {
        var eventHandlers = [];

        function wrapFunc(xhr, xhrWrapper, funcName) {
            xhrWrapper[funcName] = function () {
                var args = Array.prototype.slice.call(arguments),
                    isFunc = typeof args[1] === 'function';

                if (funcName === 'addEventListener' && isFunc) {
                    var originHandler = args[1],
                        wrappedHandler = function () {
                            originHandler.apply(xhrWrapper, arguments);
                        };

                    args[1] = wrappedHandler;

                    eventHandlers.push({
                        origin: originHandler,
                        wrapped: wrappedHandler
                    });
                } else if (funcName === 'removeEventListener' && isFunc) {
                    for (var i = 0; i < eventHandlers.length; i++) {
                        if (eventHandlers[i].origin === args[1]) {
                            args[1] = eventHandlers[i].wrapped;
                            eventHandlers.splice(i, 1);

                            break;
                        }
                    }
                }

                return xhr[funcName].apply(xhr, args);
            };
        }

        function wrapProp(xhr, xhrWrapper, propName) {
            Object.defineProperty(xhrWrapper, propName, {
                get: function () {
                    if (propName.indexOf('on') === 0)
                        return typeof xhr[propName] === 'function' ? xhr[propName]('get') : xhr[propName];
                    else
                        return xhr[propName];
                },
                set: function (value) {
                    if (propName.indexOf('on') === 0) {
                        xhr[propName] = typeof value !== 'function' ? value : (function (func) {
                            return function () {
                                return arguments[0] === 'get' ? func : func.apply(xhrWrapper, arguments);
                            };
                        })(value);
                    } else
                        xhr[propName] = value;

                    return xhr[propName];
                }
            });
        }

        for (var prop in xhr) {
            if (!Object.prototype.hasOwnProperty(prop)) {
                var isFunction = false;

                //in some cases xhr properties reading leads to error throwing (B253550, T177746)
                //if it happens we wrap these properties without reading them
                try {
                    isFunction = typeof xhr[prop] === 'function';
                }
                catch (e) {
                    if (e.message.indexOf(XHR_PROPERTY_ACCESS_ERROR) < 0)
                        throw e;
                }

                if (isFunction)
                    wrapFunc(xhr, this, prop);
                else
                    wrapProp(xhr, this, prop);
            }
        }
    }

    //Barrier
    function proxyXhrMethods(xhr) {
        var open = xhr.open,
            send = xhr.send;

        //NOTE: redirect all requests to TestCafe proxy and ensure that request don't violate Same Origin Policy
        xhr.open = function (method, url, async, user, password) {
            if (url === Settings.SERVICE_MSG_URL)
                xhr[TEST_CAFE_SERVICE_MSG_REQUEST_FLAG] = true;
            else {
                try {
                    url = UrlUtil.getProxyUrl(url);
                } catch (err) {
                    exports.eventEmitter.emit(exports.XHR_ERROR, {
                        err: err,
                        xhr: xhr
                    });

                    return;
                }
            }

            //NOTE: the 'async' argument is true by default. But when you send 'undefined' as the 'async' argument
            // a browser (Chrome, FF) casts it to 'false', and request becomes synchronous (B238528).
            if (arguments.length === 2)
                open.call(xhr, method, url);
            else
                open.call(xhr, method, url, async, user, password);
        };

        xhr.send = function () {
            if (!xhr[TEST_CAFE_SERVICE_MSG_REQUEST_FLAG]) {
                exports.eventEmitter.emit(exports.XHR_SEND, {
                    xhr: xhr
                });

                var orscHandler = function () {
                    if (xhr.readyState === 4)
                        exports.eventEmitter.emit(exports.XHR_COMPLETED, { xhr: xhr });
                };

                //NOTE: if we're in sync mode or it's in cache and has been retrieved directly (IE6 & IE7)
                //we need to manually fire the callback
                if (xhr.readyState === 4)
                    orscHandler();
                else {
                    //NOTE: get out of current execution tick and when proxy onreadystatechange.
                    //Because e.g. jQuery assigns handler after send() was called.
                    NativeMethods.setTimeout.call(window, function () {
                        //NOTE: if state already changed we just call handler without onreadystatechange proxying
                        if (xhr.readyState === 4)
                            orscHandler();
                        else if (typeof xhr.onreadystatechange === 'function') {
                            var originalHandler = xhr.onreadystatechange;

                            xhr.onreadystatechange = function (progress) {
                                orscHandler();
                                originalHandler.call(xhr, progress);
                            };
                        } else if (xhr.addEventListener)
                            xhr.addEventListener('readystatechange', orscHandler, false);
                        else
                            xhr.attachEvent('onreadystatechange', orscHandler);

                    }, 0);
                }
            }

            /*jshint bitwise: false*/
            //NOTE: add XHR request mark, so proxy can recognize it as XHR request.
            //Due to the fact that all requests are passed to the proxy we need to perform all Same Origin Policy
            //compliance checks on server side. So we pass CORS support flag as well to inform proxy that it can
            //analyze Access-Control_Allow_Origin flag and skip "preflight" requests.
            xhr.setRequestHeader(SharedConst.XHR_REQUEST_MARKER_HEADER,
                (corsSupported ? SharedConst.XHR_CORS_SUPPORTED_FLAG : 0) |
                    (!!xhr.withCredentials ? SharedConst.XHR_WITH_CREDENTIALS_FLAG : 0)
            );
            /*jshint bitwise: true*/

            send.apply(xhr, arguments);
        };
    }

    exports.init = function (window) {
        window.XMLHttpRequest = function () {
            var xhr = new NativeMethods.XMLHttpRequest();

            proxyXhrMethods(xhr);

            corsSupported = typeof xhr.withCredentials !== 'undefined';

            //NOTE: emulate CORS, so 3rd party libs (e.g. jQuery) will allow requests with proxy host and
            //origin page host as well
            if (!corsSupported)
                xhr.withCredentials = false;

            XMLHttpRequestWrapper.prototype = xhr;

            return new XMLHttpRequestWrapper(xhr);
        };
    };
});