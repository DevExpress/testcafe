import hammerhead from './deps/hammerhead';
import * as domUtils from './utils/dom';


var nativeMethods = hammerhead.nativeMethods;


export var jQuery = null;

function exportJQuery () {
    jQuery = window.jQuery.noConflict(true);
}

export function init (window, undefined) {
    var __get$        = window.__get$,
        __set$        = window.__set$,
        __get$Loc     = window.__get$Loc,
        __call$       = window.__call$,
        __proc$Script = window.__proc$Script;

    // ------------------- Sandboxed jQuery --------------------------
    /*!
         * jQuery JavaScript Library v1.7.2
         * http://jquery.com/
         *
         * Copyright 2011, John Resig
         * Dual licensed under the MIT or GPL Version 2 licenses.
         * http://jquery.org/license
         *
         * Includes Sizzle.js
         * http://sizzlejs.com/
         * Copyright 2011, The Dojo Foundation
         * Released under the MIT, BSD, and GPL Licenses.
         *
         * Date: Wed Mar 21 12:46:34 2012 -0700
         */
    (function (window, undefined) {
        // Use the correct document accordingly with window argument (sandbox)
        var document = window.document, navigator = window.navigator, location = __get$(window, "location");
        var jQuery   = function () {
            // Define a local copy of jQuery
            var jQuery      = function (selector, context) {
                    // The jQuery object is actually just the init constructor 'enhanced'
                    return new jQuery.fn.init(selector, context, rootjQuery);
                },
                // Map over jQuery in case of overwrite
                _jQuery     = window.jQuery,
                // Map over the $ in case of overwrite
                _$          = window.$,
                // A central reference to the root jQuery(document)
                rootjQuery,
                // A simple way to check for HTML strings or ID strings
                // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
                quickExpr   = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,
                // Check if a string has a non-whitespace character in it
                rnotwhite   = /\S/,
                // Used for trimming whitespace
                trimLeft    = /^\s+/, trimRight = /\s+$/,
                // Match a standalone tag
                rsingleTag  = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
                // JSON RegExp
                rvalidchars = /^[\],:{}\s]*$/, rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
                // Useragent RegExp
                rwebkit     = /(webkit)[ \/]([\w.]+)/, ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/, rmsie = /(msie) ([\w.]+)/, rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
                // Matches dashed string for camelizing
                rdashAlpha  = /-([a-z]|[0-9])/gi, rmsPrefix = /^-ms-/,
                // Used by jQuery.camelCase as callback to replace()
                fcamelCase  = function (all, letter) {
                    return (letter + "").toUpperCase();
                },
                // Keep a UserAgent string for use with jQuery.browser
                userAgent   = navigator.userAgent,
                // For matching the engine and version of the browser
                browserMatch,
                // The deferred used on DOM ready
                readyList,
                // The ready event handler
                DOMContentLoaded,
                // Save a reference to some core methods
                toString    = Object.prototype.toString, hasOwn = Object.prototype.hasOwnProperty, push = Array.prototype.push, slice = Array.prototype.slice, trim = String.prototype.trim, indexOf = Array.prototype.indexOf,
                // [[Class]] -> type pairs
                class2type  = {};
            jQuery.fn       = jQuery.prototype = {
                constructor: jQuery,
                init:        function (selector, context, rootjQuery) {
                    var match, elem, ret, doc;
                    // Handle $(""), $(null), or $(undefined)
                    if (!selector) {
                        return this;
                    }
                    // Handle $(DOMElement)
                    if (selector.nodeType) {
                        this.context = this[0] = selector;
                        this.length = 1;
                        return this;
                    }
                    // The body element only exists once, optimize finding it
                    if (selector === "body" && !context && document.body) {
                        this.context  = document;
                        this[0]       = document.body;
                        this.selector = selector;
                        this.length   = 1;
                        return this;
                    }
                    // Handle HTML strings
                    if (typeof selector === "string") {
                        // Are we dealing with HTML string or an ID?
                        if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" &&
                            selector.length >= 3) {
                            // Assume that strings that start and end with <> are HTML and skip the regex check
                            match = [
                                null,
                                selector,
                                null
                            ];
                        }
                        else {
                            match = quickExpr.exec(selector);
                        }
                        // Verify a match, and that no context was specified for #id
                        if (match && (match[1] || !context)) {
                            // HANDLE: $(html) -> $(array)
                            if (match[1]) {
                                context = context instanceof jQuery ? context[0] : context;
                                doc     = context ? context.ownerDocument || context : document;
                                // If a single string is passed in and it's a single tag
                                // just do a createElement and skip the rest
                                ret = rsingleTag.exec(selector);
                                if (ret) {
                                    if (jQuery.isPlainObject(context)) {
                                        selector = [document.createElement(ret[1])];
                                        jQuery.fn.attr.call(selector, context, true);
                                    }
                                    else {
                                        selector = [doc.createElement(ret[1])];
                                    }
                                }
                                else {
                                    ret      = jQuery.buildFragment([match[1]], [doc]);
                                    selector = (ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment).childNodes;
                                }
                                return jQuery.merge(this, selector);    // HANDLE: $("#id")
                            }
                            else {
                                elem = document.getElementById(match[2]);
                                // Check parentNode to catch when Blackberry 4.6 returns
                                // nodes that are no longer in the document #6963
                                if (elem && elem.parentNode) {
                                    // Handle the case where IE and Opera return items
                                    // by name instead of ID
                                    if (elem.id !== match[2]) {
                                        return rootjQuery.find(selector);
                                    }
                                    // Otherwise, we inject the element directly into the jQuery object
                                    this.length = 1;
                                    this[0]     = elem;
                                }
                                this.context  = document;
                                this.selector = selector;
                                return this;
                            }    // HANDLE: $(expr, $(...))
                        }
                        else if (!context || context.jquery) {
                            return (context || rootjQuery).find(selector);    // HANDLE: $(expr, context)
                            // (which is just equivalent to: $(context).find(expr)
                        }
                        else {
                            return this.constructor(context).find(selector);
                        }    // HANDLE: $(function)
                        // Shortcut for document ready
                    }
                    else if (jQuery.isFunction(selector)) {
                        return rootjQuery.ready(selector);
                    }
                    if (selector.selector !== undefined) {
                        this.selector = selector.selector;
                        this.context  = selector.context;
                    }
                    return jQuery.makeArray(selector, this);
                },
                selector:    "",
                jquery:      "1.7.2",
                length:      0,
                size:        function () {
                    return this.length;
                },
                toArray:     function () {
                    return slice.call(this, 0);
                },
                get:         function (num) {
                    return num == null ? this.toArray() : num < 0 ? __get$(this, this.length + num) : __get$(this, num);
                },
                pushStack:   function (elems, name, selector) {
                    // Build a new jQuery matched element set
                    var ret = this.constructor();
                    if (jQuery.isArray(elems)) {
                        push.apply(ret, elems);
                    }
                    else {
                        jQuery.merge(ret, elems);
                    }
                    // Add the old object onto the stack (as a reference)
                    ret.prevObject = this;
                    ret.context    = this.context;
                    if (name === "find") {
                        ret.selector = this.selector + (this.selector ? " " : "") + selector;
                    }
                    else if (name) {
                        ret.selector = this.selector + "." + name + "(" + selector + ")";
                    }
                    // Return the newly-formed element set
                    return ret;
                },
                each:        function (callback, args) {
                    return jQuery.each(this, callback, args);
                },
                ready:       function (fn) {
                    // Attach the listeners
                    jQuery.bindReady();
                    // Add the callback
                    readyList.add(fn);
                    return this;
                },
                eq:          function (i) {
                    i = +i;
                    return i === -1 ? this.slice(i) : this.slice(i, i + 1);
                },
                first:       function () {
                    return this.eq(0);
                },
                last:        function () {
                    return this.eq(-1);
                },
                slice:       function () {
                    return this.pushStack(slice.apply(this, arguments), "slice", slice.call(arguments).join(","));
                },
                map:         function (callback) {
                    return this.pushStack(jQuery.map(this, function (elem, i) {
                        return callback.call(elem, i, elem);
                    }));
                },
                end:         function () {
                    return this.prevObject || this.constructor(null);
                },
                push:        push,
                sort:        [].sort,
                splice:      [].splice
            };
            // Give the init function the jQuery prototype for later instantiation
            jQuery.fn.init.prototype = jQuery.fn;
            jQuery.extend            = jQuery.fn.extend = function () {
                var options, name, src, copy, copyIsArray, clone, target = arguments[0] ||
                                                                           {}, i = 1, length = arguments.length, deep = false;
                // Handle a deep copy situation
                if (typeof target === "boolean") {
                    deep   = target;
                    target = arguments[1] || {};
                    // skip the boolean and the target
                    i = 2;
                }
                // Handle case when target is a string or something (possible in deep copy)
                if (typeof target !== "object" && !jQuery.isFunction(target)) {
                    target = {};
                }
                // extend jQuery itself if only one argument is passed
                if (length === i) {
                    target = this;
                    --i;
                }
                for (; i < length; i++) {
                    // Only deal with non-null/undefined values
                    if ((options = __get$(arguments, i)) != null) {
                        // Extend the base object
                        for (name in options) {
                            src  = __get$(target, name);
                            copy = __get$(options, name);
                            // Prevent never-ending loop
                            if (target === copy) {
                                continue;
                            }
                            // Recurse if we're merging plain objects or arrays
                            if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                                if (copyIsArray) {
                                    copyIsArray = false;
                                    clone       = src && jQuery.isArray(src) ? src : [];
                                }
                                else {
                                    clone = src && jQuery.isPlainObject(src) ? src : {};
                                }
                                // Never move original objects, clone them
                                __set$(target, name, jQuery.extend(deep, clone, copy));    // Don't bring in undefined values
                            }
                            else if (copy !== undefined) {
                                __set$(target, name, copy);
                            }
                        }
                    }
                }
                // Return the modified object
                return target;
            };
            jQuery.extend({
                noConflict:    function (deep) {
                    if (window.$ === jQuery) {
                        window.$ = _$;
                    }
                    if (!window.$)
                        delete window.$;
                    if (deep && window.jQuery === jQuery) {
                        window.jQuery = _jQuery;
                    }
                    if (!window.jQuery)
                        delete window.jQuery;
                    return jQuery;
                },
                isReady:       false,
                readyWait:     1,
                holdReady:     function (hold) {
                    if (hold) {
                        jQuery.readyWait++;
                    }
                    else {
                        jQuery.ready(true);
                    }
                },
                ready:         function (wait) {
                    // Either a released hold or an DOMready/load event and not yet ready
                    if (wait === true && !--jQuery.readyWait || wait !== true && !jQuery.isReady) {
                        // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                        if (!document.body) {
                            return nativeMethods.setTimeout.call(window, __proc$Script(jQuery.ready), 1);
                        }
                        // Remember that the DOM is ready
                        jQuery.isReady = true;
                        // If a normal DOM Ready event fired, decrement, and wait if need be
                        if (wait !== true && --jQuery.readyWait > 0) {
                            return;
                        }
                        // If there are functions bound, to execute
                        readyList.fireWith(document, [jQuery]);
                        // Trigger any bound ready events
                        if (jQuery.fn.trigger) {
                            jQuery(document).trigger("ready").off("ready");
                        }
                    }
                },
                bindReady:     function () {
                    if (readyList) {
                        return;
                    }
                    readyList = jQuery.Callbacks("once memory");
                    // Catch cases where $(document).ready() is called after the
                    // browser event has already occurred.
                    if (document.readyState === "complete") {
                        // Handle it asynchronously to allow scripts the opportunity to delay ready
                        return nativeMethods.setTimeout.call(window, __proc$Script(jQuery.ready), 1);
                    }
                    // Mozilla, Opera and webkit nightlies currently support this event
                    if (document.addEventListener) {
                        // Use the handy event callback
                        document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
                        // A fallback to window.onload, that will always work
                        window.addEventListener("load", jQuery.ready, false);    // If IE event model is used
                    }
                    else if (document.attachEvent) {
                        // ensure firing before onload,
                        // maybe late but safe also for iframes
                        document.attachEvent("onreadystatechange", DOMContentLoaded);
                        // A fallback to window.onload, that will always work
                        window.attachEvent("onload", jQuery.ready);
                        // If IE and not a frame
                        // continually check to see if the document is ready
                        var toplevel = false;
                        try {
                            toplevel = window.frameElement == null;
                        } catch (e) {
                        }
                        if (document.documentElement.doScroll && toplevel) {
                            doScrollCheck();
                        }
                    }
                },
                isFunction:    function (obj) {
                    return jQuery.type(obj) === "function";
                },
                isArray:       Array.isArray || function (obj) {
                    return jQuery.type(obj) === "array";
                },
                isWindow:      function (obj) {
                    return obj != null && obj == obj.window;
                },
                isNumeric:     function (obj) {
                    return !isNaN(parseFloat(obj)) && isFinite(obj);
                },
                type:          function (obj) {
                    return obj == null ? String(obj) : __get$(class2type, toString.call(obj)) || "object";
                },
                isPlainObject: function (obj) {
                    // Must be an Object.
                    // Because of IE, we also have to check the presence of the constructor property.
                    // Make sure that DOM nodes and window objects don't pass through, as well
                    if (!obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
                        return false;
                    }
                    try {
                        // Not own constructor property must be Object
                        if (obj.constructor && !hasOwn.call(obj, "constructor") &&
                            !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                            return false;
                        }
                    } catch (e) {
                        // IE8,9 Will throw exceptions on certain host objects #9897
                        return false;
                    }
                    // Own properties are enumerated firstly, so to speed up,
                    // if last one is own, then all properties are own.
                    var key;
                    for (key in obj) {
                    }
                    return key === undefined || hasOwn.call(obj, key);
                },
                isEmptyObject: function (obj) {
                    for (var name in obj) {
                        return false;
                    }
                    return true;
                },
                error:         function (msg) {
                    throw new Error(msg);
                },
                parseJSON:     function (data) {
                    if (typeof data !== "string" || !data) {
                        return null;
                    }
                    // Make sure leading/trailing whitespace is removed (IE can't handle it)
                    data = jQuery.trim(data);
                    // Attempt to parse using the native JSON parser first
                    if (window.JSON && window.JSON.parse) {
                        return window.JSON.parse(data);
                    }
                    // Make sure the incoming data is actual JSON
                    // Logic borrowed from http://json.org/json2.js
                    if (rvalidchars.test(data.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(rvalidbraces, ""))) {
                        return new Function(__proc$Script("return " + data))();
                    }
                    jQuery.error("Invalid JSON: " + data);
                },
                parseXML:      function (data) {
                    if (typeof data !== "string" || !data) {
                        return null;
                    }
                    var xml, tmp;
                    try {
                        if (window.DOMParser) {
                            // Standard
                            tmp = new DOMParser();
                            xml = tmp.parseFromString(data, "text/xml");
                        }
                        else {
                            // IE
                            xml       = new ActiveXObject("Microsoft.XMLDOM");
                            xml.async = "false";
                            xml.loadXML(data);
                        }
                    } catch (e) {
                        xml = undefined;
                    }
                    if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
                        jQuery.error("Invalid XML: " + data);
                    }
                    return xml;
                },
                noop:          function () {
                },
                globalEval:    function (data) {
                    if (data && rnotwhite.test(data)) {
                        // We use execScript on Internet Explorer
                        // We use an anonymous function so that context is window
                        // rather than jQuery in Firefox
                        (window.execScript || function (data) {
                            window["eval"].call(window, __proc$Script(data));
                        })(data);
                    }
                },
                camelCase:     function (string) {
                    return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
                },
                nodeName:      function (elem, name) {
                    return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
                },
                each:          function (object, callback, args) {
                    var name, i = 0, length = object.length, isObj = length === undefined || jQuery.isFunction(object);
                    if (args) {
                        if (isObj) {
                            for (name in object) {
                                if (callback.apply(__get$(object, name), args) === false) {
                                    break;
                                }
                            }
                        }
                        else {
                            for (; i < length;) {
                                if (callback.apply(__get$(object, i++), args) === false) {
                                    break;
                                }
                            }
                        }    // A special, fast, case for the most common use of each
                    }
                    else {
                        if (isObj) {
                            for (name in object) {
                                if (callback.call(__get$(object, name), name, __get$(object, name)) === false) {
                                    break;
                                }
                            }
                        }
                        else {
                            for (; i < length;) {
                                if (callback.call(__get$(object, i), i, __get$(object, i++)) === false) {
                                    break;
                                }
                            }
                        }
                    }
                    return object;
                },
                trim:          trim ? function (text) {
                    return text == null ? "" : trim.call(text);
                } : function (text) {
                    return text == null ? "" : text.toString().replace(trimLeft, "").replace(trimRight, "");
                },
                makeArray:     function (array, results) {
                    var ret = results || [];
                    if (array != null) {
                        // The window, strings (and functions) also have 'length'
                        // Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
                        var type = jQuery.type(array);
                        if (array.length == null || type === "string" || type === "function" || type === "regexp" ||
                            jQuery.isWindow(array)) {
                            push.call(ret, array);
                        }
                        else {
                            jQuery.merge(ret, array);
                        }
                    }
                    return ret;
                },
                inArray:       function (elem, array, i) {
                    var len;
                    if (array) {
                        if (indexOf) {
                            return indexOf.call(array, elem, i);
                        }
                        len = array.length;
                        i   = i ? i < 0 ? Math.max(0, len + i) : i : 0;
                        for (; i < len; i++) {
                            // Skip accessing in sparse arrays
                            if (i in array && __get$(array, i) === elem) {
                                return i;
                            }
                        }
                    }
                    return -1;
                },
                merge:         function (first, second) {
                    var i = first.length, j = 0;
                    if (typeof second.length === "number") {
                        for (var l = second.length; j < l; j++) {
                            __set$(first, i++, __get$(second, j));
                        }
                    }
                    else {
                        while (__get$(second, j) !== undefined) {
                            __set$(first, i++, __get$(second, j++));
                        }
                    }
                    first.length = i;
                    return first;
                },
                grep:          function (elems, callback, inv) {
                    var ret = [], retVal;
                    inv     = !!inv;
                    // Go through the array, only saving the items
                    // that pass the validator function
                    for (var i = 0, length = elems.length; i < length; i++) {
                        retVal = !!callback(__get$(elems, i), i);
                        if (inv !== retVal) {
                            ret.push(__get$(elems, i));
                        }
                    }
                    return ret;
                },
                map:           function (elems, callback, arg) {
                    var value, key, ret = [], i = 0, length = elems.length,
                        // jquery objects are treated as arrays
                        isArray         = elems instanceof jQuery ||
                                          length !== undefined && typeof length === "number" &&
                                          (length > 0 && elems[0] && __get$(elems, length - 1) || length === 0 ||
                                           jQuery.isArray(elems));
                    // Go through the array, translating each of the items to their
                    if (isArray) {
                        for (; i < length; i++) {
                            value = callback(__get$(elems, i), i, arg);
                            if (value != null) {
                                __set$(ret, ret.length, value);
                            }
                        }    // Go through every key on the object,
                    }
                    else {
                        for (key in elems) {
                            value = callback(__get$(elems, key), key, arg);
                            if (value != null) {
                                __set$(ret, ret.length, value);
                            }
                        }
                    }
                    // Flatten any nested arrays
                    return ret.concat.apply([], ret);
                },
                guid:          1,
                proxy:         function (fn, context) {
                    if (typeof context === "string") {
                        var tmp = __get$(fn, context);
                        context = fn;
                        fn      = tmp;
                    }
                    // Quick check to determine if target is callable, in the spec
                    // this throws a TypeError, but we will just return undefined.
                    if (!jQuery.isFunction(fn)) {
                        return undefined;
                    }
                    // Simulated bind
                    var args = slice.call(arguments, 2), proxy = function () {
                        return fn.apply(context, args.concat(slice.call(arguments)));
                    };
                    // Set the guid of unique handler to the same of original handler, so it can be removed
                    proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;
                    return proxy;
                },
                access:        function (elems, fn, key, value, chainable, emptyGet, pass) {
                    var exec, bulk = key == null, i = 0, length = elems.length;
                    // Sets many values
                    if (key && typeof key === "object") {
                        for (i in key) {
                            jQuery.access(elems, fn, i, __get$(key, i), 1, emptyGet, value);
                        }
                        chainable = 1;    // Sets one value
                    }
                    else if (value !== undefined) {
                        // Optionally, function values get executed if exec is true
                        exec = pass === undefined && jQuery.isFunction(value);
                        if (bulk) {
                            // Bulk operations only iterate when executing function values
                            if (exec) {
                                exec = fn;
                                fn   = function (elem, key, value) {
                                    return exec.call(jQuery(elem), value);
                                };    // Otherwise they run against the entire set
                            }
                            else {
                                fn.call(elems, value);
                                fn = null;
                            }
                        }
                        if (fn) {
                            for (; i < length; i++) {
                                fn(__get$(elems, i), key, exec ? value.call(__get$(elems, i), i, fn(__get$(elems, i), key)) : value, pass);
                            }
                        }
                        chainable = 1;
                    }
                    return chainable ? elems : bulk ? fn.call(elems) : length ? fn(elems[0], key) : emptyGet;
                },
                now:           function () {
                    return new Date().getTime();
                },
                uaMatch:       function (ua) {
                    ua        = ua.toLowerCase();
                    var match = rwebkit.exec(ua) || ropera.exec(ua) || rmsie.exec(ua) ||
                                ua.indexOf("compatible") < 0 && rmozilla.exec(ua) || [];
                    return {
                        browser: match[1] || "",
                        version: match[2] || "0"
                    };
                },
                sub:           function () {
                    function jQuerySub (selector, context) {
                        return new jQuerySub.fn.init(selector, context);
                    }

                    jQuery.extend(true, jQuerySub, this);
                    jQuerySub.superclass = this;
                    jQuerySub.fn         = jQuerySub.prototype = this();
                    jQuerySub.fn.constructor    = jQuerySub;
                    jQuerySub.sub               = this.sub;
                    jQuerySub.fn.init           = function init (selector, context) {
                        if (context && context instanceof jQuery && !(context instanceof jQuerySub)) {
                            context = jQuerySub(context);
                        }
                        return jQuery.fn.init.call(this, selector, context, rootjQuerySub);
                    };
                    jQuerySub.fn.init.prototype = jQuerySub.fn;
                    var rootjQuerySub           = jQuerySub(document);
                    return jQuerySub;
                },
                browser:       {}
            });
            // Populate the class2type map
            jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function (i, name) {
                __set$(class2type, "[object " + name + "]", name.toLowerCase());
            });
            browserMatch = jQuery.uaMatch(userAgent);
            if (browserMatch.browser) {
                __set$(jQuery.browser, browserMatch.browser, true);
                jQuery.browser.version = browserMatch.version;
            }
            // Deprecated, use jQuery.browser.webkit instead
            if (jQuery.browser.webkit) {
                jQuery.browser.safari = true;
            }
            // IE doesn't match non-breaking spaces with \s
            if (rnotwhite.test("\xa0")) {
                trimLeft  = /^[\s\xA0]+/;
                trimRight = /[\s\xA0]+$/;
            }
            // All jQuery objects should point back to these
            rootjQuery = jQuery(document);
            // Cleanup functions for the document ready method
            if (document.addEventListener) {
                DOMContentLoaded = function () {
                    document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                    jQuery.ready();
                };
            }
            else if (document.attachEvent) {
                DOMContentLoaded = function () {
                    // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                    if (document.readyState === "complete") {
                        document.detachEvent("onreadystatechange", DOMContentLoaded);
                        jQuery.ready();
                    }
                };
            }
            // The DOM ready check for Internet Explorer
            function doScrollCheck () {
                if (jQuery.isReady) {
                    return;
                }
                try {
                    // If IE is used, use the trick by Diego Perini
                    // http://javascript.nwbox.com/IEContentLoaded/
                    document.documentElement.doScroll("left");
                } catch (e) {
                    nativeMethods.setTimeout.call(window, __proc$Script(doScrollCheck), 1);
                    return;
                }
                // and execute any waiting functions
                jQuery.ready();
            }

            return jQuery;
        }();
        // String to Object flags format cache
        var flagsCache = {};
        // Convert String-formatted flags into Object-formatted ones and store in cache
        function createFlags (flags) {
            var object = __set$(flagsCache, flags, {}), i, length;
            flags      = flags.split(/\s+/);
            for (i = 0, length = flags.length; i < length; i++) {
                __set$(object, __get$(flags, i), true);
            }
            return object;
        }

        /*
             * Create a callback list using the following parameters:
             *
             *	flags:	an optional list of space-separated flags that will change how
             *			the callback list behaves
             *
             * By default a callback list will act like an event callback list and can be
             * "fired" multiple times.
             *
             * Possible flags:
             *
             *	once:			will ensure the callback list can only be fired once (like a Deferred)
             *
             *	memory:			will keep track of previous values and will call any callback added
             *					after the list has been fired right away with the latest "memorized"
             *					values (like a Deferred)
             *
             *	unique:			will ensure a callback can only be added once (no duplicate in the list)
             *
             *	stopOnFalse:	interrupt callings when a callback returns false
             *
             */
        jQuery.Callbacks = function (flags) {
            // Convert flags from String-formatted to Object-formatted
            // (we check in cache first)
            flags = flags ? __get$(flagsCache, flags) || createFlags(flags) : {};
            var
            // Actual callback list
            list  = [],
            // Stack of fire calls for repeatable lists
            stack = [],
            // Last fire value (for non-forgettable lists)
            memory,
            // Flag to know if list was already fired
            fired,
            // Flag to know if list is currently firing
            firing,
            // First callback to fire (used internally by add and fireWith)
            firingStart,
            // End of the loop when firing
            firingLength,
            // Index of currently firing callback (modified by remove if needed)
            firingIndex,
            // Add one or several callbacks to the list
            add   = function (args) {
                var i, length, elem, type, actual;
                for (i = 0, length = args.length; i < length; i++) {
                    elem = __get$(args, i);
                    type = jQuery.type(elem);
                    if (type === "array") {
                        // Inspect recursively
                        add(elem);
                    }
                    else if (type === "function") {
                        // Add if not in unique mode and callback is not in
                        if (!flags.unique || !self.has(elem)) {
                            list.push(elem);
                        }
                    }
                }
            },
            // Fire callbacks
            fire  = function (context, args) {
                args         = args || [];
                memory       = !flags.memory || [
                        context,
                        args
                    ];
                fired        = true;
                firing       = true;
                firingIndex  = firingStart || 0;
                firingStart  = 0;
                firingLength = list.length;
                for (; list && firingIndex < firingLength; firingIndex++) {
                    if (__get$(list, firingIndex).apply(context, args) === false && flags.stopOnFalse) {
                        memory = true;
                        // Mark as halted
                        break;
                    }
                }
                firing = false;
                if (list) {
                    if (!flags.once) {
                        if (stack && stack.length) {
                            memory = stack.shift();
                            self.fireWith(memory[0], memory[1]);
                        }
                    }
                    else if (memory === true) {
                        self.disable();
                    }
                    else {
                        list = [];
                    }
                }
            },
            // Actual Callbacks object
            self  = {
                add:      function () {
                    if (list) {
                        var length = list.length;
                        add(arguments);
                        // Do we need to add the callbacks to the
                        // current firing batch?
                        if (firing) {
                            firingLength = list.length;    // With memory, if we're not firing then
                            // we should call right away, unless previous
                            // firing was halted (stopOnFalse)
                        }
                        else if (memory && memory !== true) {
                            firingStart = length;
                            fire(memory[0], memory[1]);
                        }
                    }
                    return this;
                },
                remove:   function () {
                    if (list) {
                        var args = arguments, argIndex = 0, argLength = args.length;
                        for (; argIndex < argLength; argIndex++) {
                            for (var i = 0; i < list.length; i++) {
                                if (__get$(args, argIndex) === __get$(list, i)) {
                                    // Handle firingIndex and firingLength
                                    if (firing) {
                                        if (i <= firingLength) {
                                            firingLength--;
                                            if (i <= firingIndex) {
                                                firingIndex--;
                                            }
                                        }
                                    }
                                    // Remove the element
                                    list.splice(i--, 1);
                                    // If we have some unicity property then
                                    // we only need to do this once
                                    if (flags.unique) {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    return this;
                },
                has:      function (fn) {
                    if (list) {
                        var i = 0, length = list.length;
                        for (; i < length; i++) {
                            if (fn === __get$(list, i)) {
                                return true;
                            }
                        }
                    }
                    return false;
                },
                empty:    function () {
                    list = [];
                    return this;
                },
                disable:  function () {
                    list = stack = memory = undefined;
                    return this;
                },
                disabled: function () {
                    return !list;
                },
                lock:     function () {
                    stack = undefined;
                    if (!memory || memory === true) {
                        self.disable();
                    }
                    return this;
                },
                locked:   function () {
                    return !stack;
                },
                fireWith: function (context, args) {
                    if (stack) {
                        if (firing) {
                            if (!flags.once) {
                                stack.push([
                                    context,
                                    args
                                ]);
                            }
                        }
                        else if (!(flags.once && memory)) {
                            fire(context, args);
                        }
                    }
                    return this;
                },
                fire:     function () {
                    self.fireWith(this, arguments);
                    return this;
                },
                fired:    function () {
                    return !!fired;
                }
            };
            return self;
        };
        var
        // Static reference to slice
        sliceDeferred    = [].slice;
        jQuery.extend({
            Deferred: function (func) {
                var doneList = jQuery.Callbacks("once memory"), failList = jQuery.Callbacks("once memory"), progressList = jQuery.Callbacks("memory"), state = "pending", lists = {
                    resolve: doneList,
                    reject:  failList,
                    notify:  progressList
                }, promise   = {
                    done:       doneList.add,
                    fail:       failList.add,
                    progress:   progressList.add,
                    state:      function () {
                        return state;
                    },
                    isResolved: doneList.fired,
                    isRejected: failList.fired,
                    then:       function (doneCallbacks, failCallbacks, progressCallbacks) {
                        deferred.done(doneCallbacks).fail(failCallbacks).progress(progressCallbacks);
                        return this;
                    },
                    always:     function () {
                        deferred.done.apply(deferred, arguments).fail.apply(deferred, arguments);
                        return this;
                    },
                    pipe:       function (fnDone, fnFail, fnProgress) {
                        return jQuery.Deferred(function (newDefer) {
                            jQuery.each({
                                done:     [
                                    fnDone,
                                    "resolve"
                                ],
                                fail:     [
                                    fnFail,
                                    "reject"
                                ],
                                progress: [
                                    fnProgress,
                                    "notify"
                                ]
                            }, function (handler, data) {
                                var fn = data[0], action = data[1], returned;
                                if (jQuery.isFunction(fn)) {
                                    __call$(deferred, handler, [function () {
                                        returned = fn.apply(this, arguments);
                                        if (returned && jQuery.isFunction(returned.promise)) {
                                            returned.promise().then(newDefer.resolve, newDefer.reject, newDefer.notify);
                                        }
                                        else {
                                            __call$(newDefer, action + "With", [this ===
                                                                                deferred ? newDefer : this, [returned]]);
                                        }
                                    }]);
                                }
                                else {
                                    __call$(deferred, handler, [__get$(newDefer, action)]);
                                }
                            });
                        }).promise();
                    },
                    promise:    function (obj) {
                        if (obj == null) {
                            obj = promise;
                        }
                        else {
                            for (var key in promise) {
                                __set$(obj, key, __get$(promise, key));
                            }
                        }
                        return obj;
                    }
                }, deferred  = promise.promise({}), key;
                for (key in lists) {
                    __set$(deferred, key, __get$(lists, key).fire);
                    __set$(deferred, key + "With", __get$(lists, key).fireWith);
                }
                // Handle state
                deferred.done(function () {
                    state = "resolved";
                }, failList.disable, progressList.lock).fail(function () {
                    state = "rejected";
                }, doneList.disable, progressList.lock);
                // Call given func if any
                if (func) {
                    func.call(deferred, deferred);
                }
                // All done!
                return deferred;
            },
            when:     function (firstParam) {
                var args = sliceDeferred.call(arguments, 0), i = 0, length = args.length, pValues = new Array(length), count = length, pCount = length, deferred = length <=
                                                                                                                                                                   1 &&
                                                                                                                                                                   firstParam &&
                                                                                                                                                                   jQuery.isFunction(firstParam.promise) ? firstParam : jQuery.Deferred(), promise = deferred.promise();

                function resolveFunc (i) {
                    return function (value) {
                        __set$(args, i, arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value);
                        if (!--count) {
                            deferred.resolveWith(deferred, args);
                        }
                    };
                }

                function progressFunc (i) {
                    return function (value) {
                        __set$(pValues, i, arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value);
                        deferred.notifyWith(promise, pValues);
                    };
                }

                if (length > 1) {
                    for (; i < length; i++) {
                        if (__get$(args, i) && __get$(args, i).promise && jQuery.isFunction(__get$(args, i).promise)) {
                            __get$(args, i).promise().then(resolveFunc(i), deferred.reject, progressFunc(i));
                        }
                        else {
                            --count;
                        }
                    }
                    if (!count) {
                        deferred.resolveWith(deferred, args);
                    }
                }
                else if (deferred !== firstParam) {
                    deferred.resolveWith(deferred, length ? [firstParam] : []);
                }
                return promise;
            }
        });
        jQuery.support   = function () {
            var support, all, a, select, opt, input, fragment, tds, events, eventName, i, isSupported, div = document.createElement("div"), documentElement = document.documentElement;
            // Preliminary tests
            div.setAttribute("className", "t");
            __set$(div, "innerHTML", "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>");
            all                                                                                            = div.getElementsByTagName("*");
            a                                                                                              = div.getElementsByTagName("a")[0];
            // Can't get basic test support
            if (!all || !all.length || !a) {
                return {};
            }
            // First batch of supports tests
            select  = document.createElement("select");
            opt     = select.appendChild(document.createElement("option"));
            input   = div.getElementsByTagName("input")[0];
            support = {
                leadingWhitespace:      div.firstChild.nodeType === 3,
                tbody:                  !div.getElementsByTagName("tbody").length,
                htmlSerialize:          !!div.getElementsByTagName("link").length,
                style:                  /top/.test(a.getAttribute("style")),
                hrefNormalized:         a.getAttribute("href") === "/a",
                opacity:                /^0.55/.test(a.style.opacity),
                cssFloat:               !!a.style.cssFloat,
                checkOn:                __get$(input, "value") === "on",
                optSelected:            opt.selected,
                getSetAttribute:        div.className !== "t",
                enctype:                !!document.createElement("form").enctype,
                html5Clone:             document.createElement("nav").cloneNode(true).outerHTML !== "<:nav></:nav>",
                submitBubbles:          true,
                changeBubbles:          true,
                focusinBubbles:         false,
                deleteExpando:          true,
                noCloneEvent:           true,
                inlineBlockNeedsLayout: false,
                shrinkWrapBlocks:       false,
                reliableMarginRight:    true,
                pixelMargin:            true
            };
            // jQuery.boxModel DEPRECATED in 1.3, use jQuery.support.boxModel instead
            jQuery.boxModel = support.boxModel = document.compatMode === "CSS1Compat";
            // Make sure checked status is properly cloned
            input.checked          = true;
            support.noCloneChecked = input.cloneNode(true).checked;
            // Make sure that the options inside disabled selects aren't marked as disabled
            // (WebKit marks them as disabled)
            select.disabled     = true;
            support.optDisabled = !opt.disabled;
            // Test to see if it's possible to delete an expando from an element
            // Fails in Internet Explorer
            try {
                delete div.test;
            } catch (e) {
                support.deleteExpando = false;
            }
            if (!div.addEventListener && div.attachEvent && div.fireEvent) {
                div.attachEvent("onclick", function () {
                    // Cloning a node shouldn't copy over any
                    // bound event handlers (IE does this)
                    support.noCloneEvent = false;
                });
                div.cloneNode(true).fireEvent("onclick");
            }
            // Check if a radio maintains its value
            // after being appended to the DOM
            input              = document.createElement("input");
            __set$(input, "value", "t");
            input.setAttribute("type", "radio");
            support.radioValue = __get$(input, "value") === "t";
            input.setAttribute("checked", "checked");
            // #11217 - WebKit loses check when the name is after the checked attribute
            input.setAttribute("name", "t");
            div.appendChild(input);
            fragment           = document.createDocumentFragment();
            fragment.appendChild(div.lastChild);
            // WebKit doesn't clone checked state correctly in fragments
            support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;
            // Check if a disconnected checkbox will retain its checked
            // value of true after appended to the DOM (IE6/7)
            support.appendChecked = input.checked;
            fragment.removeChild(input);
            fragment.appendChild(div);
            // Technique from Juriy Zaytsev
            // http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
            // We only care about the case where non-standard event systems
            // are used, namely in IE. Short-circuiting here helps us to
            // avoid an eval call (in setAttribute) which can cause CSP
            // to go haywire. See: https://developer.mozilla.org/en/Security/CSP
            if (div.attachEvent) {
                for (i in {
                    submit:  1,
                    change:  1,
                    focusin: 1
                }) {
                    eventName   = "on" + i;
                    isSupported = eventName in div;
                    if (!isSupported) {
                        div.setAttribute(eventName, "return;");
                        isSupported = typeof __get$(div, eventName) === "function";
                    }
                    __set$(support, i + "Bubbles", isSupported);
                }
            }
            fragment.removeChild(div);
            // Null elements to avoid leaks in IE
            fragment = select = opt = div = input = null;
            // Run tests that need a body at doc ready
            jQuery(function () {
                var container, outer, inner, table, td, offsetSupport, marginDiv, conMarginTop, style, html, positionTopLeftWidthHeight, paddingMarginBorderVisibility, paddingMarginBorder, body = document.getElementsByTagName("body")[0];
                if (!body) {
                    // Return for frameset docs that don't have a body
                    return;
                }
                conMarginTop                  = 1;
                paddingMarginBorder           = "padding:0;margin:0;border:";
                positionTopLeftWidthHeight    = "position:absolute;top:0;left:0;width:1px;height:1px;";
                paddingMarginBorderVisibility = paddingMarginBorder + "0;visibility:hidden;";
                style                         = "style='" + positionTopLeftWidthHeight + paddingMarginBorder +
                                                "5px solid #000;";
                html                          = "<div " + style + "display:block;'><div style='" + paddingMarginBorder +
                                                "0;display:block;overflow:hidden;'></div></div>" + "<table " + style +
                                                "' cellpadding='0' cellspacing='0'>" + "<tr><td></td></tr></table>";
                container                     = document.createElement("div");
                __set$(container.style, "cssText", paddingMarginBorderVisibility +
                                                   "width:0;height:0;position:static;top:0;margin-top:" + conMarginTop +
                                                   "px");
                body.insertBefore(container, body.firstChild);
                // Construct the test element
                div                  = document.createElement("div");
                container.appendChild(div);
                // Check if table cells still have offsetWidth/Height when they are set
                // to display:none and there are still other visible table cells in a
                // table row; if so, offsetWidth/Height are not reliable for use when
                // determining if an element has been hidden directly using
                // display:none (it is still safe to use offsets if a parent element is
                // hidden; don safety goggles and see bug #4512 for more information).
                // (only IE 8 fails this test)
                __set$(div, "innerHTML", "<table><tr><td style='" + paddingMarginBorder +
                                         "0;display:none'></td><td>t</td></tr></table>");
                tds                  = div.getElementsByTagName("td");
                isSupported          = tds[0].offsetHeight === 0;
                tds[0].style.display = "";
                tds[1].style.display = "none";
                // Check if empty table cells still have offsetWidth/Height
                // (IE <= 8 fail this test)
                support.reliableHiddenOffsets = isSupported && tds[0].offsetHeight === 0;
                // Check if div with explicit width and no margin-right incorrectly
                // gets computed margin-right based on width of container. For more
                // info see bug #3333
                // Fails in WebKit before Feb 2011 nightlies
                // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                if (window.getComputedStyle) {
                    __set$(div, "innerHTML", "");
                    marginDiv                   = document.createElement("div");
                    marginDiv.style.width       = "0";
                    marginDiv.style.marginRight = "0";
                    div.style.width             = "2px";
                    div.appendChild(marginDiv);
                    support.reliableMarginRight = (parseInt((window.getComputedStyle(marginDiv, null) ||
                                                   { marginRight: 0 }).marginRight, 10) || 0) === 0;
                }
                if (typeof div.style.zoom !== "undefined") {
                    // Check if natively block-level elements act like inline-block
                    // elements when setting their display to 'inline' and giving
                    // them layout
                    // (IE < 8 does this)
                    __set$(div, "innerHTML", "");
                    div.style.width = div.style.padding = "1px";
                    div.style.border               = 0;
                    div.style.overflow             = "hidden";
                    div.style.display              = "inline";
                    div.style.zoom                 = 1;
                    support.inlineBlockNeedsLayout = div.offsetWidth === 3;
                    // Check if elements with layout shrink-wrap their children
                    // (IE 6 does this)
                    div.style.display        = "block";
                    div.style.overflow       = "visible";
                    __set$(div, "innerHTML", "<div style='width:5px;'></div>");
                    support.shrinkWrapBlocks = div.offsetWidth !== 3;
                }
                __set$(div.style, "cssText", positionTopLeftWidthHeight + paddingMarginBorderVisibility);
                __set$(div, "innerHTML", html);
                outer                         = div.firstChild;
                inner                         = outer.firstChild;
                td                            = outer.nextSibling.firstChild.firstChild;
                offsetSupport                 = {
                    doesNotAddBorder:              inner.offsetTop !== 5,
                    doesAddBorderForTableAndCells: td.offsetTop === 5
                };
                inner.style.position          = "fixed";
                inner.style.top               = "20px";
                // safari subtracts parent border width here which is 5px
                offsetSupport.fixedPosition = inner.offsetTop === 20 || inner.offsetTop === 15;
                inner.style.position        = inner.style.top = "";
                outer.style.overflow                               = "hidden";
                outer.style.position                               = "relative";
                offsetSupport.subtractsBorderForOverflowNotVisible = inner.offsetTop === -5;
                offsetSupport.doesNotIncludeMarginInBodyOffset     = body.offsetTop !== conMarginTop;
                if (window.getComputedStyle) {
                    div.style.marginTop = "1%";
                    support.pixelMargin = (window.getComputedStyle(div, null) || { marginTop: 0 }).marginTop !== "1%";
                }
                if (typeof container.style.zoom !== "undefined") {
                    container.style.zoom = 1;
                }
                body.removeChild(container);
                marginDiv                                          = div = container = null;
                jQuery.extend(support, offsetSupport);
            });
            return support;
        }();
        var rbrace       = /^(?:\{.*\}|\[.*\])$/, rmultiDash = /([A-Z])/g;
        jQuery.extend({
            cache:      {},
            uuid:       0,
            expando:    "jQuery" + (jQuery.fn.jquery + Math.random()).replace(/\D/g, ""),
            noData:     {
                "embed":  true,
                "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
                "applet": true
            },
            hasData:    function (elem) {
                elem = elem.nodeType ? __get$(jQuery.cache, __get$(elem, jQuery.expando)) : __get$(elem, jQuery.expando);
                return !!elem && !isEmptyDataObject(elem);
            },
            data:       function (elem, name, data, pvt) {
                if (!jQuery.acceptData(elem)) {
                    return;
                }
                var privateCache, thisCache, ret, internalKey = jQuery.expando, getByName = typeof name === "string",
                    // We have to handle DOM nodes and JS objects differently because IE6-7
                    // can't GC object references properly across the DOM-JS boundary
                    isNode = elem.nodeType,
                    // Only DOM nodes need the global jQuery cache; JS object data is
                    // attached directly to the object so GC can occur automatically
                    cache = isNode ? jQuery.cache : elem,
                    // Only defining an ID for JS objects if its cache already exists allows
                    // the code to shortcut on the same path as a DOM node with no cache
                    id = isNode ? __get$(elem, internalKey) : __get$(elem, internalKey) &&
                                                              internalKey, isEvents = name === "events";
                // Avoid doing any more work than we need to when trying to get data on an
                // object that has no data at all
                if ((!id || !__get$(cache, id) || !isEvents && !pvt && !__get$(__get$(cache, id), "data")) &&
                    getByName && data === undefined) {
                    return;
                }
                if (!id) {
                    // Only DOM nodes need a new unique ID for each element since their data
                    // ends up in the global cache
                    if (isNode) {
                        __set$(elem, internalKey, id = ++jQuery.uuid);
                    }
                    else {
                        id = internalKey;
                    }
                }
                if (!__get$(cache, id)) {
                    __set$(cache, id, {});
                    // Avoids exposing jQuery metadata on plain JS objects when the object
                    // is serialized using JSON.stringify
                    if (!isNode) {
                        __get$(cache, id).toJSON = jQuery.noop;
                    }
                }
                // An object can be passed to jQuery.data instead of a key/value pair; this gets
                // shallow copied over onto the existing cache
                if (typeof name === "object" || typeof name === "function") {
                    if (pvt) {
                        __set$(cache, id, jQuery.extend(__get$(cache, id), name));
                    }
                    else {
                        __set$(__get$(cache, id), "data", jQuery.extend(__get$(__get$(cache, id), "data"), name));
                    }
                }
                privateCache = thisCache = __get$(cache, id);
                // jQuery data() is stored in a separate object inside the object's internal data
                // cache in order to avoid key collisions between internal data and user-defined
                // data.
                if (!pvt) {
                    if (!__get$(thisCache, "data")) {
                        __set$(thisCache, "data", {});
                    }
                    thisCache = __get$(thisCache, "data");
                }
                if (data !== undefined) {
                    __set$(thisCache, jQuery.camelCase(name), data);
                }
                // Users should not attempt to inspect the internal events object using jQuery.data,
                // it is undocumented and subject to change. But does anyone listen? No.
                if (isEvents && !__get$(thisCache, name)) {
                    return privateCache.events;
                }
                // Check for both converted-to-camel and non-converted data property names
                // If a data property was specified
                if (getByName) {
                    // First Try to find as-is property data
                    ret = __get$(thisCache, name);
                    // Test for null|undefined property data
                    if (ret == null) {
                        // Try to find the camelCased property
                        ret = __get$(thisCache, jQuery.camelCase(name));
                    }
                }
                else {
                    ret = thisCache;
                }
                return ret;
            },
            removeData: function (elem, name, pvt) {
                if (!jQuery.acceptData(elem)) {
                    return;
                }
                var thisCache, i, l,
                    // Reference to internal data cache key
                    internalKey = jQuery.expando, isNode = elem.nodeType,
                    // See jQuery.data for more information
                    cache       = isNode ? jQuery.cache : elem,
                    // See jQuery.data for more information
                    id          = isNode ? __get$(elem, internalKey) : internalKey;
                // If there is already no cache entry for this object, there is no
                // purpose in continuing
                if (!__get$(cache, id)) {
                    return;
                }
                if (name) {
                    thisCache = pvt ? __get$(cache, id) : __get$(__get$(cache, id), "data");
                    if (thisCache) {
                        // Support array or space separated string names for data keys
                        if (!jQuery.isArray(name)) {
                            // try the string as a key before any manipulation
                            if (name in thisCache) {
                                name = [name];
                            }
                            else {
                                // split the camel cased version by spaces unless a key with the spaces exists
                                name = jQuery.camelCase(name);
                                if (name in thisCache) {
                                    name = [name];
                                }
                                else {
                                    name = name.split(" ");
                                }
                            }
                        }
                        for (i = 0, l = name.length; i < l; i++) {
                            delete thisCache[__get$(name, i)];
                        }
                        // If there is no data left in the cache, we want to continue
                        // and let the cache object itself get destroyed
                        if (!(pvt ? isEmptyDataObject : jQuery.isEmptyObject)(thisCache)) {
                            return;
                        }
                    }
                }
                // See jQuery.data for more information
                if (!pvt) {
                    delete __get$(cache, id).data;
                    // Don't destroy the parent cache unless the internal data object
                    // had been the only thing left in it
                    if (!isEmptyDataObject(__get$(cache, id))) {
                        return;
                    }
                }
                // Browsers that fail expando deletion also refuse to delete expandos on
                // the window, but it will allow it on all other JS objects; other browsers
                // don't care
                // Ensure that `cache` is not a window object #10080
                if (jQuery.support.deleteExpando || !cache.setInterval) {
                    delete cache[id];
                }
                else {
                    __set$(cache, id, null);
                }
                // We destroyed the cache and need to eliminate the expando on the node to avoid
                // false lookups in the cache for entries that no longer exist
                if (isNode) {
                    // IE does not allow us to delete expando properties from nodes,
                    // nor does it have a removeAttribute function on Document nodes;
                    // we must handle all of these cases
                    if (jQuery.support.deleteExpando) {
                        delete elem[internalKey];
                    }
                    else if (elem.removeAttribute) {
                        elem.removeAttribute(internalKey);
                    }
                    else {
                        __set$(elem, internalKey, null);
                    }
                }
            },
            _data:      function (elem, name, data) {
                return jQuery.data(elem, name, data, true);
            },
            acceptData: function (elem) {
                if (elem.nodeName) {
                    var match = __get$(jQuery.noData, elem.nodeName.toLowerCase());
                    if (match) {
                        return !(match === true || elem.getAttribute("classid") !== match);
                    }
                }
                return true;
            }
        });
        jQuery.fn.extend({
            data:       function (key, value) {
                var parts, part, attr, name, l, elem = this[0], i = 0, data = null;
                // Gets all values
                if (key === undefined) {
                    if (this.length) {
                        data = jQuery.data(elem);
                        if (elem.nodeType === 1 && !jQuery._data(elem, "parsedAttrs")) {
                            attr = __get$(elem, "attributes");
                            for (l = attr.length; i < l; i++) {
                                name = __get$(attr, i).name;
                                if (name.indexOf("data-") === 0) {
                                    name = jQuery.camelCase(name.substring(5));
                                    dataAttr(elem, name, __get$(data, name));
                                }
                            }
                            jQuery._data(elem, "parsedAttrs", true);
                        }
                    }
                    return data;
                }
                // Sets multiple values
                if (typeof key === "object") {
                    return this.each(function () {
                        jQuery.data(this, key);
                    });
                }
                parts    = key.split(".", 2);
                parts[1] = parts[1] ? "." + parts[1] : "";
                part     = parts[1] + "!";
                return jQuery.access(this, function (value) {
                    if (value === undefined) {
                        data = this.triggerHandler("getData" + part, [parts[0]]);
                        // Try to fetch any internally stored data first
                        if (data === undefined && elem) {
                            data = jQuery.data(elem, key);
                            data = dataAttr(elem, key, data);
                        }
                        return data === undefined && parts[1] ? this.data(parts[0]) : data;
                    }
                    parts[1] = value;
                    this.each(function () {
                        var self = jQuery(this);
                        self.triggerHandler("setData" + part, parts);
                        jQuery.data(this, key, value);
                        self.triggerHandler("changeData" + part, parts);
                    });
                }, null, value, arguments.length > 1, null, false);
            },
            removeData: function (key) {
                return this.each(function () {
                    jQuery.removeData(this, key);
                });
            }
        });
        function dataAttr (elem, key, data) {
            // If nothing was found internally, try to fetch any
            // data from the HTML5 data-* attribute
            if (data === undefined && elem.nodeType === 1) {
                var name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();
                data     = elem.getAttribute(name);
                if (typeof data === "string") {
                    try {
                        data = data === "true" ? true : data === "false" ? false : data ===
                                                                                   "null" ? null : jQuery.isNumeric(data) ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data;
                    } catch (e) {
                    }
                    // Make sure we set the data so it isn't changed later
                    jQuery.data(elem, key, data);
                }
                else {
                    data = undefined;
                }
            }
            return data;
        }

        // checks a cache object for emptiness
        function isEmptyDataObject (obj) {
            for (var name in obj) {
                // if the public data object is empty, the private is still empty
                if (name === "data" && jQuery.isEmptyObject(__get$(obj, name))) {
                    continue;
                }
                if (name !== "toJSON") {
                    return false;
                }
            }
            return true;
        }

        function handleQueueMarkDefer (elem, type, src) {
            var deferDataKey = type + "defer", queueDataKey = type + "queue", markDataKey = type +
                                                                                            "mark", defer = jQuery._data(elem, deferDataKey);
            if (defer && (src === "queue" || !jQuery._data(elem, queueDataKey)) &&
                (src === "mark" || !jQuery._data(elem, markDataKey))) {
                // Give room for hard-coded callbacks to fire first
                // and eventually mark/queue something else on the element
                nativeMethods.setTimeout.call(window, __proc$Script(function () {
                    if (!jQuery._data(elem, queueDataKey) && !jQuery._data(elem, markDataKey)) {
                        jQuery.removeData(elem, deferDataKey, true);
                        defer.fire();
                    }
                }), 0);
            }
        }

        jQuery.extend({
            _mark:   function (elem, type) {
                if (elem) {
                    type = (type || "fx") + "mark";
                    jQuery._data(elem, type, (jQuery._data(elem, type) || 0) + 1);
                }
            },
            _unmark: function (force, elem, type) {
                if (force !== true) {
                    type  = elem;
                    elem  = force;
                    force = false;
                }
                if (elem) {
                    type    = type || "fx";
                    var key = type + "mark", count = force ? 0 : (jQuery._data(elem, key) || 1) - 1;
                    if (count) {
                        jQuery._data(elem, key, count);
                    }
                    else {
                        jQuery.removeData(elem, key, true);
                        handleQueueMarkDefer(elem, type, "mark");
                    }
                }
            },
            queue:   function (elem, type, data) {
                var q;
                if (elem) {
                    type = (type || "fx") + "queue";
                    q    = jQuery._data(elem, type);
                    // Speed up dequeue by getting out quickly if this is just a lookup
                    if (data) {
                        if (!q || jQuery.isArray(data)) {
                            q = jQuery._data(elem, type, jQuery.makeArray(data));
                        }
                        else {
                            q.push(data);
                        }
                    }
                    return q || [];
                }
            },
            dequeue: function (elem, type) {
                type      = type || "fx";
                var queue = jQuery.queue(elem, type), fn = queue.shift(), hooks = {};
                // If the fx queue is dequeued, always remove the progress sentinel
                if (fn === "inprogress") {
                    fn = queue.shift();
                }
                if (fn) {
                    // Add a progress sentinel to prevent the fx queue from being
                    // automatically dequeued
                    if (type === "fx") {
                        queue.unshift("inprogress");
                    }
                    jQuery._data(elem, type + ".run", hooks);
                    fn.call(elem, function () {
                        jQuery.dequeue(elem, type);
                    }, hooks);
                }
                if (!queue.length) {
                    jQuery.removeData(elem, type + "queue " + type + ".run", true);
                    handleQueueMarkDefer(elem, type, "queue");
                }
            }
        });
        jQuery.fn.extend({
            queue:      function (type, data) {
                var setter = 2;
                if (typeof type !== "string") {
                    data = type;
                    type = "fx";
                    setter--;
                }
                if (arguments.length < setter) {
                    return jQuery.queue(this[0], type);
                }
                return data === undefined ? this : this.each(function () {
                    var queue = jQuery.queue(this, type, data);
                    if (type === "fx" && queue[0] !== "inprogress") {
                        jQuery.dequeue(this, type);
                    }
                });
            },
            dequeue:    function (type) {
                return this.each(function () {
                    jQuery.dequeue(this, type);
                });
            },
            delay:      function (time, type) {
                time = jQuery.fx ? __get$(jQuery.fx.speeds, time) || time : time;
                type = type || "fx";
                return this.queue(type, function (next, hooks) {
                    var timeout = nativeMethods.setTimeout.call(window, __proc$Script(next), time);
                    hooks.stop  = function () {
                        clearTimeout(timeout);
                    };
                });
            },
            clearQueue: function (type) {
                return this.queue(type || "fx", []);
            },
            promise:    function (type, object) {
                if (typeof type !== "string") {
                    object = type;
                    type   = undefined;
                }
                type = type || "fx";
                var defer = jQuery.Deferred(), elements = this, i = elements.length, count = 1, deferDataKey = type +
                                                                                                               "defer", queueDataKey = type +
                                                                                                                                       "queue", markDataKey = type +
                                                                                                                                                              "mark", tmp;

                function resolve () {
                    if (!--count) {
                        defer.resolveWith(elements, [elements]);
                    }
                }

                while (i--) {
                    if (tmp = jQuery.data(__get$(elements, i), deferDataKey, undefined, true) ||
                              (jQuery.data(__get$(elements, i), queueDataKey, undefined, true) ||
                               jQuery.data(__get$(elements, i), markDataKey, undefined, true)) &&
                              jQuery.data(__get$(elements, i), deferDataKey, jQuery.Callbacks("once memory"), true)) {
                        count++;
                        tmp.add(resolve);
                    }
                }
                resolve();
                return defer.promise(object);
            }
        });
        var rclass       = /[\n\t\r]/g, rspace = /\s+/, rreturn = /\r/g, rtype = /^(?:button|input)$/i, rfocusable = /^(?:button|input|object|select|textarea)$/i, rclickable = /^a(?:rea)?$/i, rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, getSetAttribute = jQuery.support.getSetAttribute, nodeHook, boolHook, fixSpecified;
        jQuery.fn.extend({
            attr:        function (name, value) {
                return jQuery.access(this, jQuery.attr, name, value, arguments.length > 1);
            },
            removeAttr:  function (name) {
                return this.each(function () {
                    jQuery.removeAttr(this, name);
                });
            },
            prop:        function (name, value) {
                return jQuery.access(this, jQuery.prop, name, value, arguments.length > 1);
            },
            removeProp:  function (name) {
                name = __get$(jQuery.propFix, name) || name;
                return this.each(function () {
                    // try/catch handles cases where IE balks (such as removing a property on window)
                    try {
                        __set$(this, name, undefined);
                        delete this[name];
                    } catch (e) {
                    }
                });
            },
            addClass:    function (value) {
                var classNames, i, l, elem, setClass, c, cl;
                if (jQuery.isFunction(value)) {
                    return this.each(function (j) {
                        jQuery(this).addClass(value.call(this, j, this.className));
                    });
                }
                if (value && typeof value === "string") {
                    classNames = value.split(rspace);
                    for (i = 0, l = this.length; i < l; i++) {
                        elem = __get$(this, i);
                        if (elem.nodeType === 1) {
                            if (!elem.className && classNames.length === 1) {
                                elem.className = value;
                            }
                            else {
                                setClass = " " + elem.className + " ";
                                for (c = 0, cl = classNames.length; c < cl; c++) {
                                    if (!~setClass.indexOf(" " + __get$(classNames, c) + " ")) {
                                        setClass = setClass + (__get$(classNames, c) + " ");
                                    }
                                }
                                elem.className = jQuery.trim(setClass);
                            }
                        }
                    }
                }
                return this;
            },
            removeClass: function (value) {
                var classNames, i, l, elem, className, c, cl;
                if (jQuery.isFunction(value)) {
                    return this.each(function (j) {
                        jQuery(this).removeClass(value.call(this, j, this.className));
                    });
                }
                if (value && typeof value === "string" || value === undefined) {
                    classNames = (value || "").split(rspace);
                    for (i = 0, l = this.length; i < l; i++) {
                        elem = this[i];
                        if (elem.nodeType === 1 && elem.className) {
                            if (value) {
                                className = (" " + elem.className + " ").replace(rclass, " ");
                                for (c = 0, cl = classNames.length; c < cl; c++) {
                                    className = className.replace(" " + __get$(classNames, c) + " ", " ");
                                }
                                elem.className = jQuery.trim(className);
                            }
                            else {
                                elem.className = "";
                            }
                        }
                    }
                }
                return this;
            },
            toggleClass: function (value, stateVal) {
                var type = typeof value, isBool = typeof stateVal === "boolean";
                if (jQuery.isFunction(value)) {
                    return this.each(function (i) {
                        jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
                    });
                }
                return this.each(function () {
                    if (type === "string") {
                        // toggle individual class names
                        var className, i = 0, self = jQuery(this), state = stateVal, classNames = value.split(rspace);
                        while (className = __get$(classNames, i++)) {
                            // check each className given, space seperated list
                            state = isBool ? state : !self.hasClass(className);
                            __call$(self, state ? "addClass" : "removeClass", [className]);
                        }
                    }
                    else if (type === "undefined" || type === "boolean") {
                        if (this.className) {
                            // store className if set
                            jQuery._data(this, "__className__", this.className);
                        }
                        // toggle whole className
                        this.className = this.className || value === false ? "" : jQuery._data(this, "__className__") ||
                                                                                  "";
                    }
                });
            },
            hasClass:    function (selector) {
                var className = " " + selector + " ", i = 0, l = this.length;
                for (; i < l; i++) {
                    if (__get$(this, i).nodeType === 1 &&
                        (" " + __get$(this, i).className + " ").replace(rclass, " ").indexOf(className) > -1) {
                        return true;
                    }
                }
                return false;
            },
            val:         function (value) {
                var hooks, ret, isFunction, elem = this[0];
                if (!arguments.length) {
                    if (elem) {
                        hooks = __get$(jQuery.valHooks, elem.type) ||
                                __get$(jQuery.valHooks, elem.nodeName.toLowerCase());
                        if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
                            return ret;
                        }
                        ret = __get$(elem, "value");
                        return typeof ret === "string" ? ret.replace(rreturn, "") : ret == null ? "" : ret;
                    }
                    return;
                }
                isFunction = jQuery.isFunction(value);
                return this.each(function (i) {
                    var self = jQuery(this), val;
                    if (this.nodeType !== 1) {
                        return;
                    }
                    if (isFunction) {
                        val = value.call(this, i, self.val());
                    }
                    else {
                        val = value;
                    }
                    // Treat null/undefined as ""; convert numbers to string
                    if (val == null) {
                        val = "";
                    }
                    else if (typeof val === "number") {
                        val = val + "";
                    }
                    else if (jQuery.isArray(val)) {
                        val = jQuery.map(val, function (value) {
                            return value == null ? "" : value + "";
                        });
                    }
                    hooks = __get$(jQuery.valHooks, this.type) || __get$(jQuery.valHooks, this.nodeName.toLowerCase());
                    // If set returns undefined, fall back to normal setting
                    if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
                        __set$(this, "value", val);
                    }
                });
            }
        });
        jQuery.extend({
            valHooks:   {
                option: {
                    get: function (elem) {
                        // attributes.value is undefined in Blackberry 4.7 but
                        // uses .value. See #6932
                        var val = __get$(__get$(elem, "attributes"), "value");
                        return !val || val.specified ? __get$(elem, "value") : __get$(elem, "text");
                    }
                },
                select: {
                    get: function (elem) {
                        var value, i, max, option, index = elem.selectedIndex, values = [], options = elem.options, one = elem.type ===
                                                                                                                          "select-one";
                        // Nothing was selected
                        if (index < 0) {
                            return null;
                        }
                        // Loop through all the selected options
                        i   = one ? index : 0;
                        max = one ? index + 1 : options.length;
                        for (; i < max; i++) {
                            option = __get$(options, i);
                            // Don't return options that are disabled or in a disabled optgroup
                            if (option.selected &&
                                (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") ===
                                                                                 null) &&
                                (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {
                                // Get the specific value for the option
                                value = jQuery(option).val();
                                // We don't need an array for one selects
                                if (one) {
                                    return value;
                                }
                                // Multi-Selects return an array
                                values.push(value);
                            }
                        }
                        // Fixes Bug #2551 -- select.val() broken in IE after form.reset()
                        if (one && !values.length && options.length) {
                            return jQuery(__get$(options, index)).val();
                        }
                        return values;
                    },
                    set: function (elem, value) {
                        var values = jQuery.makeArray(value);
                        jQuery(elem).find("option").each(function () {
                            this.selected = jQuery.inArray(jQuery(this).val(), values) >= 0;
                        });
                        if (!values.length) {
                            elem.selectedIndex = -1;
                        }
                        return values;
                    }
                }
            },
            attrFn:     {
                val:    true,
                css:    true,
                html:   true,
                text:   true,
                data:   true,
                width:  true,
                height: true,
                offset: true
            },
            attr:       function (elem, name, value, pass) {
                var ret, hooks, notxml, nType = elem.nodeType;
                // don't get/set attributes on text, comment and attribute nodes
                if (!elem || nType === 3 || nType === 8 || nType === 2) {
                    return;
                }
                if (pass && name in jQuery.attrFn) {
                    return __call$(jQuery(elem), name, [value]);
                }
                // Fallback to prop when attributes are not supported
                if (typeof elem.getAttribute === "undefined") {
                    return jQuery.prop(elem, name, value);
                }
                notxml = nType !== 1 || !jQuery.isXMLDoc(elem);
                // All attributes are lowercase
                // Grab necessary hook if one is defined
                if (notxml) {
                    name  = name.toLowerCase();
                    hooks = __get$(jQuery.attrHooks, name) || (rboolean.test(name) ? boolHook : nodeHook);
                }
                if (value !== undefined) {
                    if (value === null) {
                        jQuery.removeAttr(elem, name);
                        return;
                    }
                    else if (hooks && "set" in hooks && notxml && (ret = hooks.set(elem, value, name)) !== undefined) {
                        return ret;
                    }
                    else {
                        elem.setAttribute(name, "" + value);
                        return value;
                    }
                }
                else if (hooks && "get" in hooks && notxml && (ret = hooks.get(elem, name)) !== null) {
                    return ret;
                }
                else {
                    ret = elem.getAttribute(name);
                    // Non-existent attributes return null, we normalize to undefined
                    return ret === null ? undefined : ret;
                }
            },
            removeAttr: function (elem, value) {
                var propName, attrNames, name, l, isBool, i = 0;
                if (value && elem.nodeType === 1) {
                    attrNames = value.toLowerCase().split(rspace);
                    l         = attrNames.length;
                    for (; i < l; i++) {
                        name = __get$(attrNames, i);
                        if (name) {
                            propName = __get$(jQuery.propFix, name) || name;
                            isBool   = rboolean.test(name);
                            // See #9699 for explanation of this approach (setting first, then removal)
                            // Do not do this for boolean attributes (see #10870)
                            if (!isBool) {
                                jQuery.attr(elem, name, "");
                            }
                            elem.removeAttribute(getSetAttribute ? name : propName);
                            // Set corresponding property to false for boolean attributes
                            if (isBool && propName in elem) {
                                __set$(elem, propName, false);
                            }
                        }
                    }
                }
            },
            attrHooks:  {
                type:  {
                    set: function (elem, value) {
                        // We can't allow the type property to be changed (since it causes problems in IE)
                        if (rtype.test(elem.nodeName) && elem.parentNode) {
                            jQuery.error("type property can't be changed");
                        }
                        else if (!jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
                            // Setting the type on a radio button after the value resets the value in IE6-9
                            // Reset value to it's default in case type is set after value
                            // This is for element creation
                            var val = __get$(elem, "value");
                            elem.setAttribute("type", value);
                            if (val) {
                                __set$(elem, "value", val);
                            }
                            return value;
                        }
                    }
                },
                value: {
                    get: function (elem, name) {
                        if (nodeHook && jQuery.nodeName(elem, "button")) {
                            return nodeHook.get(elem, name);
                        }
                        return name in elem ? __get$(elem, "value") : null;
                    },
                    set: function (elem, value, name) {
                        if (nodeHook && jQuery.nodeName(elem, "button")) {
                            return nodeHook.set(elem, value, name);
                        }
                        // Does not return so that setAttribute is also used
                        __set$(elem, "value", value);
                    }
                }
            },
            propFix:    {
                tabindex:        "tabIndex",
                readonly:        "readOnly",
                "for":           "htmlFor",
                "class":         "className",
                maxlength:       "maxLength",
                cellspacing:     "cellSpacing",
                cellpadding:     "cellPadding",
                rowspan:         "rowSpan",
                colspan:         "colSpan",
                usemap:          "useMap",
                frameborder:     "frameBorder",
                contenteditable: "contentEditable"
            },
            prop:       function (elem, name, value) {
                var ret, hooks, notxml, nType = elem.nodeType;
                // don't get/set properties on text, comment and attribute nodes
                if (!elem || nType === 3 || nType === 8 || nType === 2) {
                    return;
                }
                notxml = nType !== 1 || !jQuery.isXMLDoc(elem);
                if (notxml) {
                    // Fix name and attach hooks
                    name  = __get$(jQuery.propFix, name) || name;
                    hooks = __get$(jQuery.propHooks, name);
                }
                if (value !== undefined) {
                    if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
                        return ret;
                    }
                    else {
                        return __set$(elem, name, value);
                    }
                }
                else {
                    if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
                        return ret;
                    }
                    else {
                        return __get$(elem, name);
                    }
                }
            },
            propHooks:  {
                tabIndex: {
                    get: function (elem) {
                        // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
                        // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                        var attributeNode = elem.getAttributeNode("tabindex");
                        return attributeNode &&
                               attributeNode.specified ? parseInt(__get$(attributeNode, "value"), 10) : rfocusable.test(elem.nodeName) ||
                                                                                                        rclickable.test(elem.nodeName) &&
                                                                                                        __get$(elem, "href") ? 0 : undefined;
                    }
                }
            }
        });
        // Add the tabIndex propHook to attrHooks for back-compat (different case is intentional)
        jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;
        // Hook for boolean attributes
        boolHook       = {
            get: function (elem, name) {
                // Align boolean attributes with corresponding properties
                // Fall back to attribute presence where some booleans are not supported
                var attrNode, property = jQuery.prop(elem, name);
                return property === true || typeof property !== "boolean" && (attrNode = elem.getAttributeNode(name)) &&
                                            attrNode.nodeValue !== false ? name.toLowerCase() : undefined;
            },
            set: function (elem, value, name) {
                var propName;
                if (value === false) {
                    // Remove boolean attributes when set to false
                    jQuery.removeAttr(elem, name);
                }
                else {
                    // value is true since we know at this point it's type boolean and not false
                    // Set boolean attributes to the same name and set the DOM property
                    propName = __get$(jQuery.propFix, name) || name;
                    if (propName in elem) {
                        // Only set the IDL specifically if it already exists on the element
                        __set$(elem, propName, true);
                    }
                    elem.setAttribute(name, name.toLowerCase());
                }
                return name;
            }
        };
        // IE6/7 do not support getting/setting some attributes with get/setAttribute
        if (!getSetAttribute) {
            fixSpecified = {
                name:   true,
                id:     true,
                coords: true
            };
            // Use this for any attribute in IE6/7
            // This fixes almost every IE6/7 issue
            nodeHook = jQuery.valHooks.button = {
                get: function (elem, name) {
                    var ret;
                    ret = elem.getAttributeNode(name);
                    return ret && (__get$(fixSpecified, name) ? ret.nodeValue !==
                                                                "" : ret.specified) ? ret.nodeValue : undefined;
                },
                set: function (elem, value, name) {
                    // Set the existing or create a new attribute node
                    var ret = elem.getAttributeNode(name);
                    if (!ret) {
                        ret = document.createAttribute(name);
                        elem.setAttributeNode(ret);
                    }
                    return ret.nodeValue = value + "";
                }
            };
            // Apply the nodeHook to tabindex
            jQuery.attrHooks.tabindex.set = nodeHook.set;
            // Set width and height to auto instead of 0 on empty string( Bug #8150 )
            // This is for removals
            jQuery.each([
                "width",
                "height"
            ], function (i, name) {
                __set$(jQuery.attrHooks, name, jQuery.extend(__get$(jQuery.attrHooks, name), {
                    set: function (elem, value) {
                        if (value === "") {
                            elem.setAttribute(name, "auto");
                            return value;
                        }
                    }
                }));
            });
            // Set contenteditable to false on removals(#10429)
            // Setting to empty string throws an error as an invalid value
            jQuery.attrHooks.contenteditable = {
                get: nodeHook.get,
                set: function (elem, value, name) {
                    if (value === "") {
                        value = "false";
                    }
                    nodeHook.set(elem, value, name);
                }
            };
        }
        // Some attributes require a special call on IE
        if (!jQuery.support.hrefNormalized) {
            jQuery.each([
                "href",
                "src",
                "width",
                "height"
            ], function (i, name) {
                __set$(jQuery.attrHooks, name, jQuery.extend(__get$(jQuery.attrHooks, name), {
                    get: function (elem) {
                        var ret = elem.getAttribute(name, 2);
                        return ret === null ? undefined : ret;
                    }
                }));
            });
        }
        if (!jQuery.support.style) {
            jQuery.attrHooks.style = {
                get: function (elem) {
                    // Return undefined in the case of empty string
                    // Normalize to lowercase since IE uppercases css property names
                    return __get$(elem.style, "cssText").toLowerCase() || undefined;
                },
                set: function (elem, value) {
                    return __set$(elem.style, "cssText", "" + value);
                }
            };
        }
        // Safari mis-reports the default selected property of an option
        // Accessing the parent's selectedIndex property fixes it
        if (!jQuery.support.optSelected) {
            jQuery.propHooks.selected = jQuery.extend(jQuery.propHooks.selected, {
                get: function (elem) {
                    var parent = elem.parentNode;
                    if (parent) {
                        parent.selectedIndex;
                        // Make sure that it also works with optgroups, see #5701
                        if (parent.parentNode) {
                            parent.parentNode.selectedIndex;
                        }
                    }
                    return null;
                }
            });
        }
        // IE6/7 call enctype encoding
        if (!jQuery.support.enctype) {
            jQuery.propFix.enctype = "encoding";
        }
        // Radios and checkboxes getter/setter
        if (!jQuery.support.checkOn) {
            jQuery.each([
                "radio",
                "checkbox"
            ], function () {
                __set$(jQuery.valHooks, this, {
                    get: function (elem) {
                        // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                        return elem.getAttribute("value") === null ? "on" : __get$(elem, "value");
                    }
                });
            });
        }
        jQuery.each([
            "radio",
            "checkbox"
        ], function () {
            __set$(jQuery.valHooks, this, jQuery.extend(__get$(jQuery.valHooks, this), {
                set: function (elem, value) {
                    if (jQuery.isArray(value)) {
                        return elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0;
                    }
                }
            }));
        });
        var rformElems = /^(?:textarea|input|select)$/i, rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/, rhoverHack = /(?:^|\s)hover(\.\S+)?\b/, rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|contextmenu)|click/, rfocusMorph = /^(?:focusinfocus|focusoutblur)$/, rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/, quickParse = function (selector) {
            var quick = rquickIs.exec(selector);
            if (quick) {
                //   0  1    2   3
                // [ _, tag, id, class ]
                quick[1] = (quick[1] || "").toLowerCase();
                quick[3] = quick[3] && new RegExp("(?:^|\\s)" + quick[3] + "(?:\\s|$)");
            }
            return quick;
        }, quickIs     = function (elem, m) {
            var attrs = __get$(elem, "attributes") || {};
            return (!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
                   (!m[2] || __get$(attrs.id || {}, "value") === m[2]) &&
                   (!m[3] || m[3].test(__get$(attrs["class"] || {}, "value")));
        }, hoverHack   = function (events) {
            return jQuery.event.special.hover ? events : events.replace(rhoverHack, "mouseenter$1 mouseleave$1");
        };
        /*
             * Helper functions for managing events -- not part of the public interface.
             * Props to Dean Edwards' addEvent library for many of the ideas.
             */
        jQuery.event = {
            add:         function (elem, types, handler, data, selector) {
                var elemData, eventHandle, events, t, tns, type, namespaces, handleObj, handleObjIn, quick, handlers, special;
                // Don't attach events to noData or text/comment nodes (allow plain objects tho)
                if (elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler ||
                    !(elemData = jQuery._data(elem))) {
                    return;
                }
                // Caller can pass in an object of custom data in lieu of the handler
                if (handler.handler) {
                    handleObjIn = handler;
                    handler     = handleObjIn.handler;
                    selector    = handleObjIn.selector;
                }
                // Make sure that the handler has a unique ID, used to find/remove it later
                if (!handler.guid) {
                    handler.guid = jQuery.guid++;
                }
                // Init the element's event structure and main handler, if this is the first
                events = elemData.events;
                if (!events) {
                    elemData.events = events = {};
                }
                eventHandle = elemData.handle;
                if (!eventHandle) {
                    elemData.handle = eventHandle = function (e) {
                        // Discard the second event of a jQuery.event.trigger() and
                        // when an event is called after a page has unloaded
                        return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !==
                                                                       e.type) ? jQuery.event.dispatch.apply(eventHandle.elem, arguments) : undefined;
                    };
                    // Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
                    eventHandle.elem = elem;
                }
                // Handle multiple events separated by a space
                // jQuery(...).bind("mouseover mouseout", fn);
                types = jQuery.trim(hoverHack(types)).split(" ");
                for (t = 0; t < types.length; t++) {
                    tns        = rtypenamespace.exec(__get$(types, t)) || [];
                    type       = tns[1];
                    namespaces = (tns[2] || "").split(".").sort();
                    // If event changes its type, use the special event handlers for the changed type
                    special = __get$(jQuery.event.special, type) || {};
                    // If selector defined, determine special event api type, otherwise given type
                    type = (selector ? special.delegateType : special.bindType) || type;
                    // Update special based on newly reset type
                    special = __get$(jQuery.event.special, type) || {};
                    // handleObj is passed to all event handlers
                    handleObj = jQuery.extend({
                        type:      type,
                        origType:  tns[1],
                        data:      data,
                        handler:   handler,
                        guid:      handler.guid,
                        selector:  selector,
                        quick:     selector && quickParse(selector),
                        namespace: namespaces.join(".")
                    }, handleObjIn);
                    // Init the event handler queue if we're the first
                    handlers = __get$(events, type);
                    if (!handlers) {
                        handlers               = __set$(events, type, []);
                        handlers.delegateCount = 0;
                        // Only use addEventListener/attachEvent if the special events handler returns false
                        if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                            // Bind the global event handler to the element
                            if (elem.addEventListener) {
                                elem.addEventListener(type, eventHandle, false);
                            }
                            else if (elem.attachEvent) {
                                elem.attachEvent("on" + type, eventHandle);
                            }
                        }
                    }
                    if (special.add) {
                        special.add.call(elem, handleObj);
                        if (!handleObj.handler.guid) {
                            handleObj.handler.guid = handler.guid;
                        }
                    }
                    // Add to the element's handler list, delegates in front
                    if (selector) {
                        handlers.splice(handlers.delegateCount++, 0, handleObj);
                    }
                    else {
                        handlers.push(handleObj);
                    }
                    // Keep track of which events have ever been used, for event optimization
                    __set$(jQuery.event.global, type, true);
                }
                // Nullify elem to prevent memory leaks in IE
                elem = null;
            },
            global:      {},
            remove:      function (elem, types, handler, selector, mappedTypes) {
                var elemData = jQuery.hasData(elem) &&
                               jQuery._data(elem), t, tns, type, origType, namespaces, origCount, j, events, special, handle, eventType, handleObj;
                if (!elemData || !(events = elemData.events)) {
                    return;
                }
                // Once for each type.namespace in types; type may be omitted
                types = jQuery.trim(hoverHack(types || "")).split(" ");
                for (t = 0; t < types.length; t++) {
                    tns  = rtypenamespace.exec(__get$(types, t)) || [];
                    type = origType = tns[1];
                    namespaces = tns[2];
                    // Unbind all events (on this namespace, if provided) for the element
                    if (!type) {
                        for (type in events) {
                            jQuery.event.remove(elem, type + __get$(types, t), handler, selector, true);
                        }
                        continue;
                    }
                    special    = __get$(jQuery.event.special, type) || {};
                    type       = (selector ? special.delegateType : special.bindType) || type;
                    eventType  = __get$(events, type) || [];
                    origCount  = eventType.length;
                    namespaces = namespaces ? new RegExp("(^|\\.)" +
                                                         namespaces.split(".").sort().join("\\.(?:.*\\.)?") +
                                                         "(\\.|$)") : null;
                    // Remove matching events
                    for (j = 0; j < eventType.length; j++) {
                        handleObj = __get$(eventType, j);
                        if ((mappedTypes || origType === handleObj.origType) &&
                            (!handler || handler.guid === handleObj.guid) &&
                            (!namespaces || namespaces.test(handleObj.namespace)) &&
                            (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
                            eventType.splice(j--, 1);
                            if (handleObj.selector) {
                                eventType.delegateCount--;
                            }
                            if (special.remove) {
                                special.remove.call(elem, handleObj);
                            }
                        }
                    }
                    // Remove generic event handler if we removed something and no more handlers exist
                    // (avoids potential for endless recursion during removal of special event handlers)
                    if (eventType.length === 0 && origCount !== eventType.length) {
                        if (!special.teardown || special.teardown.call(elem, namespaces) === false) {
                            jQuery.removeEvent(elem, type, elemData.handle);
                        }
                        delete events[type];
                    }
                }
                // Remove the expando if it's no longer used
                if (jQuery.isEmptyObject(events)) {
                    handle = elemData.handle;
                    if (handle) {
                        handle.elem = null;
                    }
                    // removeData also checks for emptiness and clears the expando if empty
                    // so use it instead of delete
                    jQuery.removeData(elem, [
                        "events",
                        "handle"
                    ], true);
                }
            },
            customEvent: {
                "getData":    true,
                "setData":    true,
                "changeData": true
            },
            trigger:     function (event, data, elem, onlyHandlers) {
                // Don't do events on text and comment nodes
                if (elem && (elem.nodeType === 3 || elem.nodeType === 8)) {
                    return;
                }
                // Event object or event type
                var type = event.type ||
                           event, namespaces = [], cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;
                // focus/blur morphs to focusin/out; ensure we're not firing them right now
                if (rfocusMorph.test(type + jQuery.event.triggered)) {
                    return;
                }
                if (type.indexOf("!") >= 0) {
                    // Exclusive events trigger only for the exact event (no namespaces)
                    type      = type.slice(0, -1);
                    exclusive = true;
                }
                if (type.indexOf(".") >= 0) {
                    // Namespaced trigger; create a regexp to match event type in handle()
                    namespaces = type.split(".");
                    type       = namespaces.shift();
                    namespaces.sort();
                }
                if ((!elem || __get$(jQuery.event.customEvent, type)) && !__get$(jQuery.event.global, type)) {
                    // No jQuery handlers for this event type, and it can't have inline handlers
                    return;
                }
                // Caller can pass in an Event, Object, or just an event type string
                event              = typeof event ===
                                     "object" ? __get$(event, jQuery.expando) ? event : new jQuery.Event(type, event) : new jQuery.Event(type);
                event.type         = type;
                event.isTrigger    = true;
                event.exclusive    = exclusive;
                event.namespace    = namespaces.join(".");
                event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") +
                                                                  "(\\.|$)") : null;
                ontype             = type.indexOf(":") < 0 ? "on" + type : "";
                // Handle a global trigger
                if (!elem) {
                    // TODO: Stop taunting the data cache; remove global events and always attach to document
                    cache = jQuery.cache;
                    for (i in cache) {
                        if (__get$(cache, i).events && __get$(__get$(cache, i).events, type)) {
                            jQuery.event.trigger(event, data, __get$(cache, i).handle.elem, true);
                        }
                    }
                    return;
                }
                // Clean up the event in case it is being reused
                event.result = undefined;
                if (!__get$(event, "target")) {
                    __set$(event, "target", elem);
                }
                // Clone any incoming data and prepend the event, creating the handler arg list
                data = data != null ? jQuery.makeArray(data) : [];
                data.unshift(event);
                // Allow special events to draw outside the lines
                special = __get$(jQuery.event.special, type) || {};
                if (special.trigger && special.trigger.apply(elem, data) === false) {
                    return;
                }
                // Determine event propagation path in advance, per W3C events spec (#9951)
                // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
                eventPath = [[
                    elem,
                    special.bindType || type
                ]];
                if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {
                    bubbleType = special.delegateType || type;
                    cur        = rfocusMorph.test(bubbleType + type) ? elem : elem.parentNode;
                    old        = null;
                    for (; cur; cur = cur.parentNode) {
                        eventPath.push([
                            cur,
                            bubbleType
                        ]);
                        old = cur;
                    }
                    // Only add window if we got to document (e.g., not plain obj or detached DOM)
                    if (old && old === elem.ownerDocument) {
                        eventPath.push([
                            old.defaultView || old.parentWindow || window,
                            bubbleType
                        ]);
                    }
                }
                // Fire handlers on the event path
                for (i = 0; i < eventPath.length && !event.isPropagationStopped(); i++) {
                    cur        = __get$(eventPath, i)[0];
                    event.type = __get$(eventPath, i)[1];
                    handle     = __get$(jQuery._data(cur, "events") || {}, event.type) && jQuery._data(cur, "handle");
                    if (handle) {
                        handle.apply(cur, data);
                    }
                    // Note that this is a bare JS function and not a jQuery handler
                    handle = ontype && __get$(cur, ontype);
                    if (handle && jQuery.acceptData(cur) && handle.apply(cur, data) === false) {
                        event.preventDefault();
                    }
                }
                event.type = type;
                // If nobody prevented the default action, do it now
                if (!onlyHandlers && !event.isDefaultPrevented()) {
                    if ((!special._default || special._default.apply(elem.ownerDocument, data) === false) &&
                        !(type === "click" && jQuery.nodeName(elem, "a")) && jQuery.acceptData(elem)) {
                        // Call a native DOM method on the target with the same name name as the event.
                        // Can't use an .isFunction() check here because IE6/7 fails that test.
                        // Don't do default actions on window, that's where global variables be (#6170)
                        // IE<9 dies on focus/blur to hidden element (#1486)
                        if (ontype && __get$(elem, type) &&
                            (type !== "focus" && type !== "blur" || __get$(event, "target").offsetWidth !== 0) &&
                            !jQuery.isWindow(elem)) {
                            // Don't re-trigger an onFOO event when we call its FOO() method
                            old = __get$(elem, ontype);
                            if (old) {
                                __set$(elem, ontype, null);
                            }
                            // Prevent re-triggering of the same event, since we already bubbled it above
                            jQuery.event.triggered = type;
                            if (!domUtils.isDocumentInstance(elem) || type !== 'ready')
                                __call$(elem, type, []);
                            jQuery.event.triggered = undefined;
                            if (old) {
                                __set$(elem, ontype, old);
                            }
                        }
                    }
                }
                return event.result;
            },
            dispatch:    function (event) {
                // Make a writable jQuery.Event from the native event object
                event = jQuery.event.fix(event || window.event);
                var handlers = __get$(jQuery._data(this, "events") || {}, event.type) ||
                               [], delegateCount = handlers.delegateCount, args = [].slice.call(arguments, 0), run_all = !event.exclusive &&
                                                                                                                         !event.namespace, special = __get$(jQuery.event.special, event.type) ||
                                                                                                                                                     {}, handlerQueue = [], i, j, cur, jqcur, ret, selMatch, matched, matches, handleObj, sel, related;
                // Use the fix-ed jQuery.Event rather than the (read-only) native event
                args[0]              = event;
                event.delegateTarget = this;
                // Call the preDispatch hook for the mapped type, and let it bail if desired
                if (special.preDispatch && special.preDispatch.call(this, event) === false) {
                    return;
                }
                // Determine handlers that should run if there are delegated events
                // Avoid non-left-click bubbling in Firefox (#3861)
                if (delegateCount && !(event.button && event.type === "click")) {
                    // Pregenerate a single jQuery object for reuse with .is()
                    jqcur         = jQuery(this);
                    jqcur.context = this.ownerDocument || this;
                    for (cur = __get$(event, "target"); cur != this; cur = cur.parentNode || this) {
                        // Don't process events on disabled elements (#6911, #8165)
                        if (cur.disabled !== true) {
                            selMatch = {};
                            matches  = [];
                            jqcur[0] = cur;
                            for (i = 0; i < delegateCount; i++) {
                                handleObj = __get$(handlers, i);
                                sel       = handleObj.selector;
                                if (__get$(selMatch, sel) === undefined) {
                                    __set$(selMatch, sel, handleObj.quick ? quickIs(cur, handleObj.quick) : jqcur.is(sel));
                                }
                                if (__get$(selMatch, sel)) {
                                    matches.push(handleObj);
                                }
                            }
                            if (matches.length) {
                                handlerQueue.push({
                                    elem:    cur,
                                    matches: matches
                                });
                            }
                        }
                    }
                }
                // Add the remaining (directly-bound) handlers
                if (handlers.length > delegateCount) {
                    handlerQueue.push({
                        elem:    this,
                        matches: handlers.slice(delegateCount)
                    });
                }
                // Run delegates first; they may want to stop propagation beneath us
                for (i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++) {
                    matched             = __get$(handlerQueue, i);
                    event.currentTarget = matched.elem;
                    for (j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++) {
                        handleObj = __get$(matched.matches, j);
                        // Triggered event must either 1) be non-exclusive and have no namespace, or
                        // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
                        if (run_all || !event.namespace && !handleObj.namespace ||
                            event.namespace_re && event.namespace_re.test(handleObj.namespace)) {
                            __set$(event, "data", __get$(handleObj, "data"));
                            event.handleObj = handleObj;
                            ret             = ((__get$(jQuery.event.special, handleObj.origType) || {}).handle ||
                                               handleObj.handler).apply(matched.elem, args);
                            if (ret !== undefined) {
                                event.result = ret;
                                if (ret === false) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            }
                        }
                    }
                }
                // Call the postDispatch hook for the mapped type
                if (special.postDispatch) {
                    special.postDispatch.call(this, event);
                }
                return event.result;
            },
            props:       "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
            fixHooks:    {},
            keyHooks:    {
                props:  "char charCode key keyCode".split(" "),
                filter: function (event, original) {
                    // Add which for key events
                    if (event.which == null) {
                        event.which = original.charCode != null ? original.charCode : original.keyCode;
                    }
                    return event;
                }
            },
            mouseHooks:  {
                props:  "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
                filter: function (event, original) {
                    var eventDoc, doc, body, button = original.button, fromElement = original.fromElement;
                    // Calculate pageX/Y if missing and clientX/Y available
                    if (event.pageX == null && original.clientX != null) {
                        eventDoc    = __get$(event, "target").ownerDocument || document;
                        doc         = eventDoc.documentElement;
                        body        = eventDoc.body;
                        event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                                      (doc && doc.clientLeft || body && body.clientLeft || 0);
                        event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) -
                                      (doc && doc.clientTop || body && body.clientTop || 0);
                    }
                    // Add relatedTarget, if necessary
                    if (!event.relatedTarget && fromElement) {
                        event.relatedTarget = fromElement ===
                                              __get$(event, "target") ? original.toElement : fromElement;
                    }
                    // Add which for click: 1 === left; 2 === middle; 3 === right
                    // Note: button is not normalized, so don't use it
                    if (!event.which && button !== undefined) {
                        event.which = button & 1 ? 1 : button & 2 ? 3 : button & 4 ? 2 : 0;
                    }
                    return event;
                }
            },
            fix:         function (event) {
                if (__get$(event, jQuery.expando)) {
                    return event;
                }
                // Create a writable copy of the event object and normalize some properties
                var i, prop, originalEvent = event, fixHook = __get$(jQuery.event.fixHooks, event.type) ||
                                                              {}, copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;
                event = jQuery.Event(originalEvent);
                for (i = copy.length; i;) {
                    prop = __get$(copy, --i);
                    __set$(event, prop, __get$(originalEvent, prop));
                }
                // Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
                if (!__get$(event, "target")) {
                    __set$(event, "target", originalEvent.srcElement || document);
                }
                // Target should not be a text node (#504, Safari)
                if (__get$(event, "target").nodeType === 3) {
                    __set$(event, "target", __get$(event, "target").parentNode);
                }
                // For mouse/key events; add metaKey if it's not there (#3368, IE6/7/8)
                if (event.metaKey === undefined) {
                    event.metaKey = event.ctrlKey;
                }
                return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
            },
            special:     {
                ready:        { setup: jQuery.bindReady },
                load:         { noBubble: true },
                focus:        { delegateType: "focusin" },
                blur:         { delegateType: "focusout" },
                beforeunload: {
                    setup:    function (data, namespaces, eventHandle) {
                        // We only want to do this special case on windows
                        if (jQuery.isWindow(this)) {
                            __set$(this, "onbeforeunload", eventHandle);
                        }
                    },
                    teardown: function (namespaces, eventHandle) {
                        if (__get$(this, "onbeforeunload") === eventHandle) {
                            __set$(this, "onbeforeunload", null);
                        }
                    }
                }
            },
            simulate:    function (type, elem, event, bubble) {
                // Piggyback on a donor event to simulate a different one.
                // Fake originalEvent to avoid donor's stopPropagation, but if the
                // simulated event prevents default then we do the same on the donor.
                var e = jQuery.extend(new jQuery.Event(), event, {
                    type:          type,
                    isSimulated:   true,
                    originalEvent: {}
                });
                if (bubble) {
                    jQuery.event.trigger(e, null, elem);
                }
                else {
                    jQuery.event.dispatch.call(elem, e);
                }
                if (e.isDefaultPrevented()) {
                    event.preventDefault();
                }
            }
        };
        // Some plugins are using, but it's undocumented/deprecated and will be removed.
        // The 1.7 special event interface should provide all the hooks needed now.
        jQuery.event.handle = jQuery.event.dispatch;
        jQuery.removeEvent  = document.removeEventListener ? function (elem, type, handle) {
            if (elem.removeEventListener) {
                elem.removeEventListener(type, handle, false);
            }
        } : function (elem, type, handle) {
            if (elem.detachEvent) {
                elem.detachEvent("on" + type, handle);
            }
        };
        jQuery.Event        = function (src, props) {
            // Allow instantiation without the 'new' keyword
            if (!(this instanceof jQuery.Event)) {
                return new jQuery.Event(src, props);
            }
            // Event object
            if (src && src.type) {
                this.originalEvent = src;
                this.type          = src.type;
                // Events bubbling up the document may have been marked as prevented
                // by a handler lower down the tree; reflect the correct value.
                this.isDefaultPrevented = src.defaultPrevented || src.returnValue === false ||
                                          src.getPreventDefault && src.getPreventDefault() ? returnTrue : returnFalse;    // Event type
            }
            else {
                this.type = src;
            }
            // Put explicitly provided properties onto the event object
            if (props) {
                jQuery.extend(this, props);
            }
            // Create a timestamp if incoming event doesn't have one
            this.timeStamp = src && src.timeStamp || jQuery.now();
            // Mark it as fixed
            __set$(this, jQuery.expando, true);
        };
        function returnFalse () {
            return false;
        }

        function returnTrue () {
            return true;
        }

        // jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
        // http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
        jQuery.Event.prototype = {
            preventDefault:                function () {
                this.isDefaultPrevented = returnTrue;
                var e                   = this.originalEvent;
                if (!e) {
                    return;
                }
                // if preventDefault exists run it on the original event
                if (e.preventDefault) {
                    e.preventDefault();    // otherwise set the returnValue property of the original event to false (IE)
                }
                else {
                    e.returnValue = false;
                }
            },
            stopPropagation:               function () {
                this.isPropagationStopped = returnTrue;
                var e                     = this.originalEvent;
                if (!e) {
                    return;
                }
                // if stopPropagation exists run it on the original event
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                // otherwise set the cancelBubble property of the original event to true (IE)
                e.cancelBubble = true;
            },
            stopImmediatePropagation:      function () {
                this.isImmediatePropagationStopped = returnTrue;
                this.stopPropagation();
            },
            isDefaultPrevented:            returnFalse,
            isPropagationStopped:          returnFalse,
            isImmediatePropagationStopped: returnFalse
        };
        // Create mouseenter/leave events using mouseover/out and event-time checks
        jQuery.each({
            mouseenter: "mouseover",
            mouseleave: "mouseout"
        }, function (orig, fix) {
            __set$(jQuery.event.special, orig, {
                delegateType: fix,
                bindType:     fix,
                handle:       function (event) {
                    var target = this, related = event.relatedTarget, handleObj = event.handleObj, selector = handleObj.selector, ret;
                    // For mousenter/leave call the handler if related is outside the target.
                    // NB: No relatedTarget if the mouse left/entered the browser window
                    if (!related || related !== target && !jQuery.contains(target, related)) {
                        event.type = handleObj.origType;
                        ret        = handleObj.handler.apply(this, arguments);
                        event.type = fix;
                    }
                    return ret;
                }
            });
        });
        // IE submit delegation
        if (!jQuery.support.submitBubbles) {
            jQuery.event.special.submit = {
                setup:        function () {
                    // Only need this for delegated form submit events
                    if (jQuery.nodeName(this, "form")) {
                        return false;
                    }
                    // Lazy-add a submit handler when a descendant form may potentially be submitted
                    jQuery.event.add(this, "click._submit keypress._submit", function (e) {
                        // Node name check avoids a VML-related crash in IE (#9807)
                        var elem = __get$(e, "target"), form = jQuery.nodeName(elem, "input") ||
                                                               jQuery.nodeName(elem, "button") ? elem.form : undefined;
                        if (form && !form._submit_attached) {
                            jQuery.event.add(form, "submit._submit", function (event) {
                                event._submit_bubble = true;
                            });
                            form._submit_attached = true;
                        }
                    });    // return undefined since we don't need an event listener
                },
                postDispatch: function (event) {
                    // If form was submitted by the user, bubble the event up the tree
                    if (event._submit_bubble) {
                        delete event._submit_bubble;
                        if (this.parentNode && !event.isTrigger) {
                            jQuery.event.simulate("submit", this.parentNode, event, true);
                        }
                    }
                },
                teardown:     function () {
                    // Only need this for delegated form submit events
                    if (jQuery.nodeName(this, "form")) {
                        return false;
                    }
                    // Remove delegated handlers; cleanData eventually reaps submit handlers attached above
                    jQuery.event.remove(this, "._submit");
                }
            };
        }
        // IE change delegation and checkbox/radio fix
        if (!jQuery.support.changeBubbles) {
            jQuery.event.special.change = {
                setup:    function () {
                    if (rformElems.test(this.nodeName)) {
                        // IE doesn't fire change on a check/radio until blur; trigger it on click
                        // after a propertychange. Eat the blur-change in special.change.handle.
                        // This still fires onchange a second time for check/radio after blur.
                        if (this.type === "checkbox" || this.type === "radio") {
                            jQuery.event.add(this, "propertychange._change", function (event) {
                                if (event.originalEvent.propertyName === "checked") {
                                    this._just_changed = true;
                                }
                            });
                            jQuery.event.add(this, "click._change", function (event) {
                                if (this._just_changed && !event.isTrigger) {
                                    this._just_changed = false;
                                    jQuery.event.simulate("change", this, event, true);
                                }
                            });
                        }
                        return false;
                    }
                    // Delegated event; lazy-add a change handler on descendant inputs
                    jQuery.event.add(this, "beforeactivate._change", function (e) {
                        var elem = __get$(e, "target");
                        if (rformElems.test(elem.nodeName) && !elem._change_attached) {
                            jQuery.event.add(elem, "change._change", function (event) {
                                if (this.parentNode && !event.isSimulated && !event.isTrigger) {
                                    jQuery.event.simulate("change", this.parentNode, event, true);
                                }
                            });
                            elem._change_attached = true;
                        }
                    });
                },
                handle:   function (event) {
                    var elem = __get$(event, "target");
                    // Swallow native change events from checkbox/radio, we already triggered them above
                    if (this !== elem || event.isSimulated || event.isTrigger ||
                        elem.type !== "radio" && elem.type !== "checkbox") {
                        return event.handleObj.handler.apply(this, arguments);
                    }
                },
                teardown: function () {
                    jQuery.event.remove(this, "._change");
                    return rformElems.test(this.nodeName);
                }
            };
        }
        // Create "bubbling" focus and blur events
        if (!jQuery.support.focusinBubbles) {
            jQuery.each({
                focus: "focusin",
                blur:  "focusout"
            }, function (orig, fix) {
                // Attach a single capturing handler while someone wants focusin/focusout
                var attaches = 0, handler = function (event) {
                    jQuery.event.simulate(fix, __get$(event, "target"), jQuery.event.fix(event), true);
                };
                __set$(jQuery.event.special, fix, {
                    setup:    function () {
                        if (attaches++ === 0) {
                            document.addEventListener(orig, handler, true);
                        }
                    },
                    teardown: function () {
                        if (--attaches === 0) {
                            document.removeEventListener(orig, handler, true);
                        }
                    }
                });
            });
        }
        jQuery.fn.extend({
            on:             function (types, selector, data, fn, one) {
                var origFn, type;
                // Types can be a map of types/handlers
                if (typeof types === "object") {
                    // ( types-Object, selector, data )
                    if (typeof selector !== "string") {
                        // && selector != null
                        // ( types-Object, data )
                        data     = data || selector;
                        selector = undefined;
                    }
                    for (type in types) {
                        this.on(type, selector, data, __get$(types, type), one);
                    }
                    return this;
                }
                if (data == null && fn == null) {
                    // ( types, fn )
                    fn   = selector;
                    data = selector = undefined;
                }
                else if (fn == null) {
                    if (typeof selector === "string") {
                        // ( types, selector, fn )
                        fn   = data;
                        data = undefined;
                    }
                    else {
                        // ( types, data, fn )
                        fn       = data;
                        data     = selector;
                        selector = undefined;
                    }
                }
                if (fn === false) {
                    fn = returnFalse;
                }
                else if (!fn) {
                    return this;
                }
                if (one === 1) {
                    origFn = fn;
                    fn     = function (event) {
                        // Can use an empty set, since event contains the info
                        jQuery().off(event);
                        return origFn.apply(this, arguments);
                    };
                    // Use same guid so caller can remove using origFn
                    fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
                }
                return this.each(function () {
                    jQuery.event.add(this, types, fn, data, selector);
                });
            },
            one:            function (types, selector, data, fn) {
                return this.on(types, selector, data, fn, 1);
            },
            off:            function (types, selector, fn) {
                if (types && types.preventDefault && types.handleObj) {
                    // ( event )  dispatched jQuery.Event
                    var handleObj = types.handleObj;
                    jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." +
                                                                           handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
                    return this;
                }
                if (typeof types === "object") {
                    // ( types-object [, selector] )
                    for (var type in types) {
                        this.off(type, selector, __get$(types, type));
                    }
                    return this;
                }
                if (selector === false || typeof selector === "function") {
                    // ( types [, fn] )
                    fn       = selector;
                    selector = undefined;
                }
                if (fn === false) {
                    fn = returnFalse;
                }
                return this.each(function () {
                    jQuery.event.remove(this, types, fn, selector);
                });
            },
            bind:           function (types, data, fn) {
                return this.on(types, null, data, fn);
            },
            unbind:         function (types, fn) {
                return this.off(types, null, fn);
            },
            live:           function (types, data, fn) {
                jQuery(this.context).on(types, this.selector, data, fn);
                return this;
            },
            die:            function (types, fn) {
                jQuery(this.context).off(types, this.selector || "**", fn);
                return this;
            },
            delegate:       function (selector, types, data, fn) {
                return this.on(types, selector, data, fn);
            },
            undelegate:     function (selector, types, fn) {
                // ( namespace ) or ( selector, types [, fn] )
                return arguments.length == 1 ? this.off(selector, "**") : this.off(types, selector, fn);
            },
            trigger:        function (type, data) {
                return this.each(function () {
                    jQuery.event.trigger(type, data, this);
                });
            },
            triggerHandler: function (type, data) {
                if (this[0]) {
                    return jQuery.event.trigger(type, data, this[0], true);
                }
            },
            toggle:         function (fn) {
                // Save reference to arguments for access in closure
                var args = arguments, guid = fn.guid || jQuery.guid++, i = 0, toggler = function (event) {
                    // Figure out which function to execute
                    var lastToggle = (jQuery._data(this, "lastToggle" + fn.guid) || 0) % i;
                    jQuery._data(this, "lastToggle" + fn.guid, lastToggle + 1);
                    // Make sure that clicks stop
                    event.preventDefault();
                    // and execute the function
                    return __get$(args, lastToggle).apply(this, arguments) || false;
                };
                // link all the functions, so any of them can unbind this click handler
                toggler.guid = guid;
                while (i < args.length) {
                    __get$(args, i++).guid = guid;
                }
                return this.click(toggler);
            },
            hover:          function (fnOver, fnOut) {
                return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
            }
        });
        jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
                     "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
                     "change select submit keydown keypress keyup error contextmenu").split(" "), function (i, name) {
            // Handle event binding
            __set$(jQuery.fn, name, function (data, fn) {
                if (fn == null) {
                    fn   = data;
                    data = null;
                }
                return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
            });
            if (jQuery.attrFn) {
                __set$(jQuery.attrFn, name, true);
            }
            if (rkeyEvent.test(name)) {
                __set$(jQuery.event.fixHooks, name, jQuery.event.keyHooks);
            }
            if (rmouseEvent.test(name)) {
                __set$(jQuery.event.fixHooks, name, jQuery.event.mouseHooks);
            }
        });
        /*!
             * Sizzle CSS Selector Engine
             *  Copyright 2011, The Dojo Foundation
             *  Released under the MIT, BSD, and GPL Licenses.
             *  More information: http://sizzlejs.com/
             */
        (function () {
            var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g, expando = "sizcache" +
                                                                                                                                                                           (Math.random() +
                                                                                                                                                                           "").replace(".", ""), done = 0, toString = Object.prototype.toString, hasDuplicate = false, baseHasDuplicate = true, rBackslash = /\\/g, rReturn = /\r\n/g, rNonWord = /\W/;
            // Here we check if the JavaScript engine is using some sort of
            // optimization where it does not always call our comparision
            // function. If that is the case, discard the hasDuplicate value.
            //   Thus far that includes Google Chrome.
            [
                0,
                0
            ].sort(function () {
                    baseHasDuplicate = false;
                    return 0;
                });
            var Sizzle = function (selector, context, results, seed) {
                results         = results || [];
                context         = context || document;
                var origContext = context;
                if (context.nodeType !== 1 && context.nodeType !== 9) {
                    return [];
                }
                if (!selector || typeof selector !== "string") {
                    return results;
                }
                var m, set, checkSet, extra, ret, cur, pop, i, prune = true, contextXML = Sizzle.isXML(context), parts = [], soFar = selector;
                // Reset the position of the chunker regexp (start from head)
                do {
                    chunker.exec("");
                    m = chunker.exec(soFar);
                    if (m) {
                        soFar = m[3];
                        parts.push(m[1]);
                        if (m[2]) {
                            extra = m[3];
                            break;
                        }
                    }
                } while (m);
                if (parts.length > 1 && origPOS.exec(selector)) {
                    if (parts.length === 2 && __get$(Expr.relative, parts[0])) {
                        set = posProcess(parts[0] + parts[1], context, seed);
                    }
                    else {
                        set = __get$(Expr.relative, parts[0]) ? [context] : Sizzle(parts.shift(), context);
                        while (parts.length) {
                            selector = parts.shift();
                            if (__get$(Expr.relative, selector)) {
                                selector = selector + parts.shift();
                            }
                            set = posProcess(selector, set, seed);
                        }
                    }
                }
                else {
                    // Take a shortcut and set the context if the root selector is an ID
                    // (but not if it'll be faster if the inner selector is an ID)
                    if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
                        Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(__get$(parts, parts.length - 1))) {
                        ret     = Sizzle.find(parts.shift(), context, contextXML);
                        context = ret.expr ? Sizzle.filter(ret.expr, ret.set)[0] : ret.set[0];
                    }
                    if (context) {
                        ret = seed ? {
                            expr: parts.pop(),
                            set:  makeArray(seed)
                        } : Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") &&
                                                     context.parentNode ? context.parentNode : context, contextXML);
                        set = ret.expr ? Sizzle.filter(ret.expr, ret.set) : ret.set;
                        if (parts.length > 0) {
                            checkSet = makeArray(set);
                        }
                        else {
                            prune = false;
                        }
                        while (parts.length) {
                            cur = parts.pop();
                            pop = cur;
                            if (!__get$(Expr.relative, cur)) {
                                cur = "";
                            }
                            else {
                                pop = parts.pop();
                            }
                            if (pop == null) {
                                pop = context;
                            }
                            __call$(Expr.relative, cur, [
                                checkSet,
                                pop,
                                contextXML
                            ]);
                        }
                    }
                    else {
                        checkSet = parts = [];
                    }
                }
                if (!checkSet) {
                    checkSet = set;
                }
                if (!checkSet) {
                    Sizzle.error(cur || selector);
                }
                if (toString.call(checkSet) === "[object Array]") {
                    if (!prune) {
                        results.push.apply(results, checkSet);
                    }
                    else if (context && context.nodeType === 1) {
                        for (i = 0; __get$(checkSet, i) != null; i++) {
                            if (__get$(checkSet, i) && (__get$(checkSet, i) === true ||
                                                        __get$(checkSet, i).nodeType === 1 &&
                                                        Sizzle.contains(context, __get$(checkSet, i)))) {
                                results.push(__get$(set, i));
                            }
                        }
                    }
                    else {
                        for (i = 0; __get$(checkSet, i) != null; i++) {
                            if (__get$(checkSet, i) && __get$(checkSet, i).nodeType === 1) {
                                results.push(__get$(set, i));
                            }
                        }
                    }
                }
                else {
                    makeArray(checkSet, results);
                }
                if (extra) {
                    Sizzle(extra, origContext, results, seed);
                    Sizzle.uniqueSort(results);
                }
                return results;
            };
            Sizzle.uniqueSort = function (results) {
                if (sortOrder) {
                    hasDuplicate = baseHasDuplicate;
                    results.sort(sortOrder);
                    if (hasDuplicate) {
                        for (var i = 1; i < results.length; i++) {
                            if (__get$(results, i) === __get$(results, i - 1)) {
                                results.splice(i--, 1);
                            }
                        }
                    }
                }
                return results;
            };
            Sizzle.matches = function (expr, set) {
                return Sizzle(expr, null, null, set);
            };
            Sizzle.matchesSelector = function (node, expr) {
                return Sizzle(expr, null, null, [node]).length > 0;
            };
            Sizzle.find = function (expr, context, isXML) {
                var set, i, len, match, type, left;
                if (!expr) {
                    return [];
                }
                for (i = 0, len = Expr.order.length; i < len; i++) {
                    type = __get$(Expr.order, i);
                    if (match = __get$(Expr.leftMatch, type).exec(expr)) {
                        left = match[1];
                        match.splice(1, 1);
                        if (left.substr(left.length - 1) !== "\\") {
                            match[1] = (match[1] || "").replace(rBackslash, "");
                            set      = __call$(Expr.find, type, [
                                match,
                                context,
                                isXML
                            ]);
                            if (set != null) {
                                expr = expr.replace(__get$(Expr.match, type), "");
                                break;
                            }
                        }
                    }
                }
                if (!set) {
                    set = typeof context.getElementsByTagName !== "undefined" ? context.getElementsByTagName("*") : [];
                }
                return {
                    set:  set,
                    expr: expr
                };
            };
            Sizzle.filter = function (expr, set, inplace, not) {
                var match, anyFound, type, found, item, filter, left, i, pass, old = expr, result = [], curLoop = set, isXMLFilter = set &&
                                                                                                                                     set[0] &&
                                                                                                                                     Sizzle.isXML(set[0]);
                while (expr && set.length) {
                    for (type in Expr.filter) {
                        if ((match = __get$(Expr.leftMatch, type).exec(expr)) != null && match[2]) {
                            filter   = __get$(Expr.filter, type);
                            left     = match[1];
                            anyFound = false;
                            match.splice(1, 1);
                            if (left.substr(left.length - 1) === "\\") {
                                continue;
                            }
                            if (curLoop === result) {
                                result = [];
                            }
                            if (__get$(Expr.preFilter, type)) {
                                match = __call$(Expr.preFilter, type, [
                                    match,
                                    curLoop,
                                    inplace,
                                    result,
                                    not,
                                    isXMLFilter
                                ]);
                                if (!match) {
                                    anyFound = found = true;
                                }
                                else if (match === true) {
                                    continue;
                                }
                            }
                            if (match) {
                                for (i = 0; (item = __get$(curLoop, i)) != null; i++) {
                                    if (item) {
                                        found = filter(item, match, i, curLoop);
                                        pass  = not ^ found;
                                        if (inplace && found != null) {
                                            if (pass) {
                                                anyFound = true;
                                            }
                                            else {
                                                __set$(curLoop, i, false);
                                            }
                                        }
                                        else if (pass) {
                                            result.push(item);
                                            anyFound = true;
                                        }
                                    }
                                }
                            }
                            if (found !== undefined) {
                                if (!inplace) {
                                    curLoop = result;
                                }
                                expr = expr.replace(__get$(Expr.match, type), "");
                                if (!anyFound) {
                                    return [];
                                }
                                break;
                            }
                        }
                    }
                    // Improper expression
                    if (expr === old) {
                        if (anyFound == null) {
                            Sizzle.error(expr);
                        }
                        else {
                            break;
                        }
                    }
                    old = expr;
                }
                return curLoop;
            };
            Sizzle.error = function (msg) {
                throw new Error("Syntax error, unrecognized expression: " + msg);
            };
            /**
             * Utility function for retreiving the text value of an array of DOM nodes
             * @param {Array|Element} elem
             */
            var getText = Sizzle.getText = function (elem) {
                var i, node, nodeType = elem.nodeType, ret = "";
                if (nodeType) {
                    if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                        // Use textContent || innerText for elements
                        if (typeof elem.textContent === "string") {
                            return elem.textContent;
                        }
                        else if (typeof elem.innerText === "string") {
                            // Replace IE's carriage returns
                            return elem.innerText.replace(rReturn, "");
                        }
                        else {
                            // Traverse it's children
                            for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                                ret = ret + getText(elem);
                            }
                        }
                    }
                    else if (nodeType === 3 || nodeType === 4) {
                        return elem.nodeValue;
                    }
                }
                else {
                    // If no nodeType, this is expected to be an array
                    for (i = 0; node = __get$(elem, i); i++) {
                        // Do not traverse comment nodes
                        if (node.nodeType !== 8) {
                            ret = ret + getText(node);
                        }
                    }
                }
                return ret;
            };
            var Expr = Sizzle.selectors = {
                order:      [
                    "ID",
                    "NAME",
                    "TAG"
                ],
                match:      {
                    ID:     /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                    CLASS:  /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                    NAME:   /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
                    ATTR:   /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
                    TAG:    /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
                    CHILD:  /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
                    POS:    /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
                    PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
                },
                leftMatch:  {},
                attrMap:    {
                    "class": "className",
                    "for":   "htmlFor"
                },
                attrHandle: {
                    href: function (elem) {
                        return elem.getAttribute("href");
                    },
                    type: function (elem) {
                        return elem.getAttribute("type");
                    }
                },
                relative:   {
                    "+": function (checkSet, part) {
                        var isPartStr = typeof part === "string", isTag = isPartStr &&
                                                                          !rNonWord.test(part), isPartStrNotTag = isPartStr &&
                                                                                                                  !isTag;
                        if (isTag) {
                            part = part.toLowerCase();
                        }
                        for (var i = 0, l = checkSet.length, elem; i < l; i++) {
                            if (elem = __get$(checkSet, i)) {
                                while ((elem = elem.previousSibling) && elem.nodeType !== 1) {
                                }
                                __set$(checkSet, i, isPartStrNotTag ||
                                                    elem && elem.nodeName.toLowerCase() === part ? elem ||
                                                                                                   false : elem ===
                                                                                                           part);
                            }
                        }
                        if (isPartStrNotTag) {
                            Sizzle.filter(part, checkSet, true);
                        }
                    },
                    ">": function (checkSet, part) {
                        var elem, isPartStr = typeof part === "string", i = 0, l = checkSet.length;
                        if (isPartStr && !rNonWord.test(part)) {
                            part = part.toLowerCase();
                            for (; i < l; i++) {
                                elem = __get$(checkSet, i);
                                if (elem) {
                                    var parent = elem.parentNode;
                                    __set$(checkSet, i, parent.nodeName.toLowerCase() === part ? parent : false);
                                }
                            }
                        }
                        else {
                            for (; i < l; i++) {
                                elem = __get$(checkSet, i);
                                if (elem) {
                                    __set$(checkSet, i, isPartStr ? elem.parentNode : elem.parentNode === part);
                                }
                            }
                            if (isPartStr) {
                                Sizzle.filter(part, checkSet, true);
                            }
                        }
                    },
                    "":  function (checkSet, part, isXML) {
                        var nodeCheck, doneName = done++, checkFn = dirCheck;
                        if (typeof part === "string" && !rNonWord.test(part)) {
                            part      = part.toLowerCase();
                            nodeCheck = part;
                            checkFn   = dirNodeCheck;
                        }
                        checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
                    },
                    "~": function (checkSet, part, isXML) {
                        var nodeCheck, doneName = done++, checkFn = dirCheck;
                        if (typeof part === "string" && !rNonWord.test(part)) {
                            part      = part.toLowerCase();
                            nodeCheck = part;
                            checkFn   = dirNodeCheck;
                        }
                        checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
                    }
                },
                find:       {
                    ID:   function (match, context, isXML) {
                        if (typeof context.getElementById !== "undefined" && !isXML) {
                            var m = context.getElementById(match[1]);
                            // Check parentNode to catch when Blackberry 4.6 returns
                            // nodes that are no longer in the document #6963
                            return m && m.parentNode ? [m] : [];
                        }
                    },
                    NAME: function (match, context) {
                        if (typeof context.getElementsByName !== "undefined") {
                            var ret = [], results = context.getElementsByName(match[1]);
                            for (var i = 0, l = results.length; i < l; i++) {
                                if (__get$(results, i).getAttribute("name") === match[1]) {
                                    ret.push(__get$(results, i));
                                }
                            }
                            return ret.length === 0 ? null : ret;
                        }
                    },
                    TAG:  function (match, context) {
                        if (typeof context.getElementsByTagName !== "undefined") {
                            return context.getElementsByTagName(match[1]);
                        }
                    }
                },
                preFilter:  {
                    CLASS:  function (match, curLoop, inplace, result, not, isXML) {
                        match = " " + match[1].replace(rBackslash, "") + " ";
                        if (isXML) {
                            return match;
                        }
                        for (var i = 0, elem; (elem = __get$(curLoop, i)) != null; i++) {
                            if (elem) {
                                if (not ^ (elem.className &&
                                           (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >=
                                           0)) {
                                    if (!inplace) {
                                        result.push(elem);
                                    }
                                }
                                else if (inplace) {
                                    __set$(curLoop, i, false);
                                }
                            }
                        }
                        return false;
                    },
                    ID:     function (match) {
                        return match[1].replace(rBackslash, "");
                    },
                    TAG:    function (match, curLoop) {
                        return match[1].replace(rBackslash, "").toLowerCase();
                    },
                    CHILD:  function (match) {
                        if (match[1] === "nth") {
                            if (!match[2]) {
                                Sizzle.error(match[0]);
                            }
                            match[2] = match[2].replace(/^\+|\s*/g, "");
                            // parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
                            var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(match[2] === "even" && "2n" ||
                                                                         match[2] === "odd" && "2n+1" ||
                                                                         !/\D/.test(match[2]) && "0n+" + match[2] ||
                                                                         match[2]);
                            // calculate the numbers (first)n+(last) including if they are negative
                            match[2] = test[1] + (test[2] || 1) - 0;
                            match[3] = test[3] - 0;
                        }
                        else if (match[2]) {
                            Sizzle.error(match[0]);
                        }
                        // TODO: Move to normal caching system
                        match[0] = done++;
                        return match;
                    },
                    ATTR:   function (match, curLoop, inplace, result, not, isXML) {
                        var name = match[1] = match[1].replace(rBackslash, "");
                        if (!isXML && __get$(Expr.attrMap, name)) {
                            match[1] = __get$(Expr.attrMap, name);
                        }
                        // Handle if an un-quoted value was used
                        match[4] = (match[4] || match[5] || "").replace(rBackslash, "");
                        if (match[2] === "~=") {
                            match[4] = " " + match[4] + " ";
                        }
                        return match;
                    },
                    PSEUDO: function (match, curLoop, inplace, result, not) {
                        if (match[1] === "not") {
                            // If we're dealing with a complex expression, or a simple one
                            if ((chunker.exec(match[3]) || "").length > 1 || /^\w/.test(match[3])) {
                                match[3] = Sizzle(match[3], null, null, curLoop);
                            }
                            else {
                                var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
                                if (!inplace) {
                                    result.push.apply(result, ret);
                                }
                                return false;
                            }
                        }
                        else if (Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])) {
                            return true;
                        }
                        return match;
                    },
                    POS:    function (match) {
                        match.unshift(true);
                        return match;
                    }
                },
                filters:    {
                    enabled:  function (elem) {
                        return elem.disabled === false && elem.type !== "hidden";
                    },
                    disabled: function (elem) {
                        return elem.disabled === true;
                    },
                    checked:  function (elem) {
                        return elem.checked === true;
                    },
                    selected: function (elem) {
                        // Accessing this property makes selected-by-default
                        // options in Safari work properly
                        if (elem.parentNode) {
                            elem.parentNode.selectedIndex;
                        }
                        return elem.selected === true;
                    },
                    parent:   function (elem) {
                        return !!elem.firstChild;
                    },
                    empty:    function (elem) {
                        return !elem.firstChild;
                    },
                    has:      function (elem, i, match) {
                        return !!Sizzle(match[3], elem).length;
                    },
                    header:   function (elem) {
                        return /h\d/i.test(elem.nodeName);
                    },
                    text:     function (elem) {
                        var attr = elem.getAttribute("type"), type = elem.type;
                        // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
                        // use getAttribute instead to test this case
                        return elem.nodeName.toLowerCase() === "input" && "text" === type &&
                               (attr === type || attr === null);
                    },
                    radio:    function (elem) {
                        return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
                    },
                    checkbox: function (elem) {
                        return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
                    },
                    file:     function (elem) {
                        return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
                    },
                    password: function (elem) {
                        return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
                    },
                    submit:   function (elem) {
                        var name = elem.nodeName.toLowerCase();
                        return (name === "input" || name === "button") && "submit" === elem.type;
                    },
                    image:    function (elem) {
                        return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
                    },
                    reset:    function (elem) {
                        var name = elem.nodeName.toLowerCase();
                        return (name === "input" || name === "button") && "reset" === elem.type;
                    },
                    button:   function (elem) {
                        var name = elem.nodeName.toLowerCase();
                        return name === "input" && "button" === elem.type || name === "button";
                    },
                    input:    function (elem) {
                        return /input|select|textarea|button/i.test(elem.nodeName);
                    },
                    focus:    function (elem) {
                        return elem === __get$(elem.ownerDocument, "activeElement");
                    }
                },
                setFilters: {
                    first: function (elem, i) {
                        return i === 0;
                    },
                    last:  function (elem, i, match, array) {
                        return i === array.length - 1;
                    },
                    even:  function (elem, i) {
                        return i % 2 === 0;
                    },
                    odd:   function (elem, i) {
                        return i % 2 === 1;
                    },
                    lt:    function (elem, i, match) {
                        return i < match[3] - 0;
                    },
                    gt:    function (elem, i, match) {
                        return i > match[3] - 0;
                    },
                    nth:   function (elem, i, match) {
                        return match[3] - 0 === i;
                    },
                    eq:    function (elem, i, match) {
                        return match[3] - 0 === i;
                    }
                },
                filter:     {
                    PSEUDO: function (elem, match, i, array) {
                        var name = match[1], filter = __get$(Expr.filters, name);
                        if (filter) {
                            return filter(elem, i, match, array);
                        }
                        else if (name === "contains") {
                            return (elem.textContent || elem.innerText || getText([elem]) || "").indexOf(match[3]) >= 0;
                        }
                        else if (name === "not") {
                            var not = match[3];
                            for (var j = 0, l = not.length; j < l; j++) {
                                if (__get$(not, j) === elem) {
                                    return false;
                                }
                            }
                            return true;
                        }
                        else {
                            Sizzle.error(name);
                        }
                    },
                    CHILD:  function (elem, match) {
                        var first, last, doneName, parent, cache, count, diff, type = match[1], node = elem;
                        switch (type) {
                            case "only":
                            case "first":
                                while (node = node.previousSibling) {
                                    if (node.nodeType === 1) {
                                        return false;
                                    }
                                }
                                if (type === "first") {
                                    return true;
                                }
                                node = elem;
                            /* falls through */
                            case "last":
                                while (node = node.nextSibling) {
                                    if (node.nodeType === 1) {
                                        return false;
                                    }
                                }
                                return true;
                            case "nth":
                                first = match[2];
                                last  = match[3];
                                if (first === 1 && last === 0) {
                                    return true;
                                }
                                doneName = match[0];
                                parent   = elem.parentNode;
                                if (parent && (__get$(parent, expando) !== doneName || !elem.nodeIndex)) {
                                    count = 0;
                                    for (node = parent.firstChild; node; node = node.nextSibling) {
                                        if (node.nodeType === 1) {
                                            node.nodeIndex = ++count;
                                        }
                                    }
                                    __set$(parent, expando, doneName);
                                }
                                diff = elem.nodeIndex - last;
                                if (first === 0) {
                                    return diff === 0;
                                }
                                else {
                                    return diff % first === 0 && diff / first >= 0;
                                }
                        }
                    },
                    ID:     function (elem, match) {
                        return elem.nodeType === 1 && elem.getAttribute("id") === match;
                    },
                    TAG:    function (elem, match) {
                        return match === "*" && elem.nodeType === 1 ||
                               !!elem.nodeName && elem.nodeName.toLowerCase() === match;
                    },
                    CLASS:  function (elem, match) {
                        return (" " + (elem.className || elem.getAttribute("class")) + " ").indexOf(match) > -1;
                    },
                    ATTR:   function (elem, match) {
                        var name = match[1], result = Sizzle.attr ? Sizzle.attr(elem, name) : __get$(Expr.attrHandle, name) ? __call$(Expr.attrHandle, name, [elem]) : __get$(elem, name) !=
                                                                                                                                                                       null ? __get$(elem, name) : elem.getAttribute(name), value = result +
                                                                                                                                                                                                                                    "", type = match[2], check = match[4];
                        return result == null ? type === "!=" : !type && Sizzle.attr ? result != null : type ===
                                                                                                        "=" ? value ===
                                                                                                              check : type ===
                                                                                                                      "*=" ? value.indexOf(check) >=
                                                                                                                             0 : type ===
                                                                                                                                 "~=" ? (" " +
                                                                                                                                         value +
                                                                                                                                         " ").indexOf(check) >=
                                                                                                                                        0 : !check ? value &&
                                                                                                                                                     result !==
                                                                                                                                                     false : type ===
                                                                                                                                                             "!=" ? value !==
                                                                                                                                                                    check : type ===
                                                                                                                                                                            "^=" ? value.indexOf(check) ===
                                                                                                                                                                                   0 : type ===
                                                                                                                                                                                       "$=" ? value.substr(value.length -
                                                                                                                                                                                                           check.length) ===
                                                                                                                                                                                              check : type ===
                                                                                                                                                                                                      "|=" ? value ===
                                                                                                                                                                                                             check ||
                                                                                                                                                                                                             value.substr(0, check.length +
                                                                                                                                                                                                                             1) ===
                                                                                                                                                                                                             check +
                                                                                                                                                                                                             "-" : false;
                    },
                    POS:    function (elem, match, i, array) {
                        var name = match[2], filter = __get$(Expr.setFilters, name);
                        if (filter) {
                            return filter(elem, i, match, array);
                        }
                    }
                }
            };
            var origPOS = Expr.match.POS, fescape = function (all, num) {
                return "\\" + (num - 0 + 1);
            };
            for (var type in Expr.match) {
                __set$(Expr.match, type, new RegExp(__get$(Expr.match, type).source +
                                                    /(?![^\[]*\])(?![^\(]*\))/.source));
                __set$(Expr.leftMatch, type, new RegExp(/(^(?:.|\r|\n)*?)/.source +
                                                        __get$(Expr.match, type).source.replace(/\\(\d+)/g, fescape)));
            }
            // Expose origPOS
            // "global" as in regardless of relation to brackets/parens
            Expr.match.globalPOS = origPOS;
            var makeArray        = function (array, results) {
                array = Array.prototype.slice.call(array, 0);
                if (results) {
                    results.push.apply(results, array);
                    return results;
                }
                return array;
            };
            // Perform a simple check to determine if the browser is capable of
            // converting a NodeList to an array using builtin methods.
            // Also verifies that the returned array holds DOM nodes
            // (which is not the case in the Blackberry browser)
            try {
                Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;    // Provide a fallback method if it does not work
            } catch (e) {
                makeArray = function (array, results) {
                    var i = 0, ret = results || [];
                    if (toString.call(array) === "[object Array]") {
                        Array.prototype.push.apply(ret, array);
                    }
                    else {
                        if (typeof array.length === "number") {
                            for (var l = array.length; i < l; i++) {
                                ret.push(__get$(array, i));
                            }
                        }
                        else {
                            for (; __get$(array, i); i++) {
                                ret.push(__get$(array, i));
                            }
                        }
                    }
                    return ret;
                };
            }
            var sortOrder, siblingCheck;
            if (document.documentElement.compareDocumentPosition) {
                sortOrder = function (a, b) {
                    if (a === b) {
                        hasDuplicate = true;
                        return 0;
                    }
                    if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                        return a.compareDocumentPosition ? -1 : 1;
                    }
                    return a.compareDocumentPosition(b) & 4 ? -1 : 1;
                };
            }
            else {
                sortOrder    = function (a, b) {
                    // The nodes are identical, we can exit early
                    if (a === b) {
                        hasDuplicate = true;
                        return 0;    // Fallback to using sourceIndex (in IE) if it's available on both nodes
                    }
                    else if (a.sourceIndex && b.sourceIndex) {
                        return a.sourceIndex - b.sourceIndex;
                    }
                    var al, bl, ap = [], bp = [], aup = a.parentNode, bup = b.parentNode, cur = aup;
                    // If the nodes are siblings (or identical) we can do a quick check
                    if (aup === bup) {
                        return siblingCheck(a, b);    // If no parents were found then the nodes are disconnected
                    }
                    else if (!aup) {
                        return -1;
                    }
                    else if (!bup) {
                        return 1;
                    }
                    // Otherwise they're somewhere else in the tree so we need
                    // to build up a full list of the parentNodes for comparison
                    while (cur) {
                        ap.unshift(cur);
                        cur = cur.parentNode;
                    }
                    cur = bup;
                    while (cur) {
                        bp.unshift(cur);
                        cur = cur.parentNode;
                    }
                    al = ap.length;
                    bl = bp.length;
                    // Start walking down the tree looking for a discrepancy
                    for (var i = 0; i < al && i < bl; i++) {
                        if (__get$(ap, i) !== __get$(bp, i)) {
                            return siblingCheck(__get$(ap, i), __get$(bp, i));
                        }
                    }
                    // We ended someplace up the tree so do a sibling check
                    return i === al ? siblingCheck(a, __get$(bp, i), -1) : siblingCheck(__get$(ap, i), b, 1);
                };
                siblingCheck = function (a, b, ret) {
                    if (a === b) {
                        return ret;
                    }
                    var cur = a.nextSibling;
                    while (cur) {
                        if (cur === b) {
                            return -1;
                        }
                        cur = cur.nextSibling;
                    }
                    return 1;
                };
            }
            // Check to see if the browser returns elements by name when
            // querying by getElementById (and provide a workaround)
            (function () {
                // We're going to inject a fake input element with a specified name
                var form = document.createElement("div"), id = "script" +
                                                               new Date().getTime(), root = document.documentElement;
                __set$(form, "innerHTML", "<a name='" + id + "'/>");
                // Inject it into the root element, check its status, and remove it quickly
                root.insertBefore(form, root.firstChild);
                // The workaround has to do additional checks after a getElementById
                // Which slows things down for other browsers (hence the branching)
                if (document.getElementById(id)) {
                    Expr.find.ID   = function (match, context, isXML) {
                        if (typeof context.getElementById !== "undefined" && !isXML) {
                            var m = context.getElementById(match[1]);
                            return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" &&
                                                            m.getAttributeNode("id").nodeValue ===
                                                            match[1] ? [m] : undefined : [];
                        }
                    };
                    Expr.filter.ID = function (elem, match) {
                        var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
                        return elem.nodeType === 1 && node && node.nodeValue === match;
                    };
                }
                root.removeChild(form);
                // release memory in IE
                root = form = null;
            }());
            (function () {
                // Check to see if the browser returns only elements
                // when doing getElementsByTagName("*")
                // Create a fake element
                var div = document.createElement("div");
                div.appendChild(document.createComment(""));
                // Make sure no comments are found
                if (div.getElementsByTagName("*").length > 0) {
                    Expr.find.TAG = function (match, context) {
                        var results = context.getElementsByTagName(match[1]);
                        // Filter out possible comments
                        if (match[1] === "*") {
                            var tmp = [];
                            for (var i = 0; __get$(results, i); i++) {
                                if (__get$(results, i).nodeType === 1) {
                                    tmp.push(__get$(results, i));
                                }
                            }
                            results = tmp;
                        }
                        return results;
                    };
                }
                // Check to see if an attribute returns normalized href attributes
                __set$(div, "innerHTML", "<a href='#'></a>");
                if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
                    div.firstChild.getAttribute("href") !== "#") {
                    __set$(Expr.attrHandle, "href", function (elem) {
                        return elem.getAttribute("href", 2);
                    });
                }
                // release memory in IE
                div = null;
            }());
            if (document.querySelectorAll) {
                (function () {
                    var oldSizzle = Sizzle, div = document.createElement("div"), id = "__sizzle__";
                    __set$(div, "innerHTML", "<p class='TEST'></p>");
                    // Safari can't handle uppercase or unicode characters when
                    // in quirks mode.
                    if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
                        return;
                    }
                    Sizzle = function (query, context, extra, seed) {
                        context = context || document;
                        // Only use querySelectorAll on non-XML documents
                        // (ID selectors don't work in non-HTML documents)
                        if (!seed && !Sizzle.isXML(context)) {
                            // See if we find a selector to speed up
                            var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(query);
                            if (match && (context.nodeType === 1 || context.nodeType === 9)) {
                                // Speed-up: Sizzle("TAG")
                                if (match[1]) {
                                    return makeArray(context.getElementsByTagName(query), extra);    // Speed-up: Sizzle(".CLASS")
                                }
                                else if (match[2] && Expr.find.CLASS && context.getElementsByClassName) {
                                    return makeArray(context.getElementsByClassName(match[2]), extra);
                                }
                            }
                            if (context.nodeType === 9) {
                                // Speed-up: Sizzle("body")
                                // The body element only exists once, optimize finding it
                                if (query === "body" && context.body) {
                                    return makeArray([context.body], extra);    // Speed-up: Sizzle("#ID")
                                }
                                else if (match && match[3]) {
                                    var elem = context.getElementById(match[3]);
                                    // Check parentNode to catch when Blackberry 4.6 returns
                                    // nodes that are no longer in the document #6963
                                    if (elem && elem.parentNode) {
                                        // Handle the case where IE and Opera return items
                                        // by name instead of ID
                                        if (elem.id === match[3]) {
                                            return makeArray([elem], extra);
                                        }
                                    }
                                    else {
                                        return makeArray([], extra);
                                    }
                                }
                                try {
                                    return makeArray(context.querySelectorAll(query), extra);
                                } catch (qsaError) {
                                }    // qSA works strangely on Element-rooted queries
                                // We can work around this by specifying an extra ID on the root
                                // and working up from there (Thanks to Andrew Dupont for the technique)
                                // IE 8 doesn't work on object elements
                            }
                            else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                                var oldContext = context, old = context.getAttribute("id"), nid = old ||
                                                                                                  id, hasParent = context.parentNode, relativeHierarchySelector = /^\s*[+~]/.test(query);
                                if (!old) {
                                    context.setAttribute("id", nid);
                                }
                                else {
                                    nid = nid.replace(/'/g, "\\$&");
                                }
                                if (relativeHierarchySelector && hasParent) {
                                    context = context.parentNode;
                                }
                                try {
                                    if (!relativeHierarchySelector || hasParent) {
                                        return makeArray(context.querySelectorAll("[id='" + nid + "'] " +
                                                                                  query), extra);
                                    }
                                } catch (pseudoError) {
                                } finally {
                                    if (!old) {
                                        oldContext.removeAttribute("id");
                                    }
                                }
                            }
                        }
                        return oldSizzle(query, context, extra, seed);
                    };
                    for (var prop in oldSizzle) {
                        __set$(Sizzle, prop, __get$(oldSizzle, prop));
                    }
                    // release memory in IE
                    div = null;
                }());
            }
            (function () {
                var html = document.documentElement, matches = html.matchesSelector || html.mozMatchesSelector ||
                                                               html.webkitMatchesSelector || html.msMatchesSelector;
                if (matches) {
                    // Check to see if it's possible to do matchesSelector
                    // on a disconnected node (IE 9 fails this)
                    var disconnectedMatch = !matches.call(document.createElement("div"), "div"), pseudoWorks = false;
                    try {
                        // This should fail with an exception
                        // Gecko does not error, returns false instead
                        matches.call(document.documentElement, "[test!='']:sizzle");
                    } catch (pseudoError) {
                        pseudoWorks = true;
                    }
                    Sizzle.matchesSelector = function (node, expr) {
                        // Make sure that attribute selectors are quoted
                        expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
                        if (!Sizzle.isXML(node)) {
                            try {
                                if (pseudoWorks || !Expr.match.PSEUDO.test(expr) && !/!=/.test(expr)) {
                                    var ret = matches.call(node, expr);
                                    // IE 9's matchesSelector returns false on disconnected nodes
                                    if (ret || !disconnectedMatch || node.document && node.document.nodeType !== 11) {
                                        return ret;
                                    }
                                }
                            } catch (e) {
                            }
                        }
                        return Sizzle(expr, null, null, [node]).length > 0;
                    };
                }
            }());
            (function () {
                var div = document.createElement("div");
                __set$(div, "innerHTML", "<div class='test e'></div><div class='test'></div>");
                // Opera can't find a second classname (in 9.6)
                // Also, make sure that getElementsByClassName actually exists
                if (!div.getElementsByClassName || div.getElementsByClassName("e").length === 0) {
                    return;
                }
                // Safari caches class attributes, doesn't catch changes (in 3.2)
                div.lastChild.className = "e";
                if (div.getElementsByClassName("e").length === 1) {
                    return;
                }
                Expr.order.splice(1, 0, "CLASS");
                Expr.find.CLASS         = function (match, context, isXML) {
                    if (typeof context.getElementsByClassName !== "undefined" && !isXML) {
                        return context.getElementsByClassName(match[1]);
                    }
                };
                // release memory in IE
                div = null;
            }());
            function dirNodeCheck (dir, cur, doneName, checkSet, nodeCheck, isXML) {
                for (var i = 0, l = checkSet.length; i < l; i++) {
                    var elem = __get$(checkSet, i);
                    if (elem) {
                        var match = false;
                        elem      = __get$(elem, dir);
                        while (elem) {
                            if (__get$(elem, expando) === doneName) {
                                match = __get$(checkSet, elem.sizset);
                                break;
                            }
                            if (elem.nodeType === 1 && !isXML) {
                                __set$(elem, expando, doneName);
                                elem.sizset = i;
                            }
                            if (elem.nodeName.toLowerCase() === cur) {
                                match = elem;
                                break;
                            }
                            elem = __get$(elem, dir);
                        }
                        __set$(checkSet, i, match);
                    }
                }
            }

            function dirCheck (dir, cur, doneName, checkSet, nodeCheck, isXML) {
                for (var i = 0, l = checkSet.length; i < l; i++) {
                    var elem = __get$(checkSet, i);
                    if (elem) {
                        var match = false;
                        elem      = __get$(elem, dir);
                        while (elem) {
                            if (__get$(elem, expando) === doneName) {
                                match = __get$(checkSet, elem.sizset);
                                break;
                            }
                            if (elem.nodeType === 1) {
                                if (!isXML) {
                                    __set$(elem, expando, doneName);
                                    elem.sizset = i;
                                }
                                if (typeof cur !== "string") {
                                    if (elem === cur) {
                                        match = true;
                                        break;
                                    }
                                }
                                else if (Sizzle.filter(cur, [elem]).length > 0) {
                                    match = elem;
                                    break;
                                }
                            }
                            elem = __get$(elem, dir);
                        }
                        __set$(checkSet, i, match);
                    }
                }
            }

            if (document.documentElement.contains) {
                Sizzle.contains = function (a, b) {
                    return a !== b && (a.contains ? a.contains(b) : true);
                };
            }
            else if (document.documentElement.compareDocumentPosition) {
                Sizzle.contains = function (a, b) {
                    return !!(a.compareDocumentPosition(b) & 16);
                };
            }
            else {
                Sizzle.contains = function () {
                    return false;
                };
            }
            Sizzle.isXML   = function (elem) {
                // documentElement is verified for cases where it doesn't yet exist
                // (such as loading iframes in IE - #4833)
                var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
                return documentElement ? documentElement.nodeName !== "HTML" : false;
            };
            var posProcess = function (selector, context, seed) {
                var match, tmpSet = [], later = "", root = context.nodeType ? [context] : context;
                // Position selectors must be done after the filter
                // And so must :not(positional) so we move all PSEUDOs to the end
                while (match = Expr.match.PSEUDO.exec(selector)) {
                    later    = later + match[0];
                    selector = selector.replace(Expr.match.PSEUDO, "");
                }
                selector = __get$(Expr.relative, selector) ? selector + "*" : selector;
                for (var i = 0, l = root.length; i < l; i++) {
                    Sizzle(selector, __get$(root, i), tmpSet, seed);
                }
                return Sizzle.filter(later, tmpSet);
            };
            // EXPOSE
            // Override sizzle attribute retrieval
            Sizzle.attr              = jQuery.attr;
            Sizzle.selectors.attrMap = {};
            jQuery.find              = Sizzle;
            jQuery.expr              = Sizzle.selectors;
            jQuery.expr[":"]         = jQuery.expr.filters;
            jQuery.unique            = Sizzle.uniqueSort;
            __set$(jQuery, "text", Sizzle.getText);
            jQuery.isXMLDoc          = Sizzle.isXML;
            jQuery.contains          = Sizzle.contains;
        }());
        var runtil             = /Until$/, rparentsprev = /^(?:parents|prevUntil|prevAll)/,
            // Note: This RegExp should be improved, or likely pulled from Sizzle
            rmultiselector     = /,/, isSimple = /^.[^:#\[\.,]*$/, slice = Array.prototype.slice, POS = jQuery.expr.match.globalPOS,
            // methods guaranteed to produce a unique set when starting from a unique set
            guaranteedUnique   = {
                children: true,
                contents: true,
                next:     true,
                prev:     true
            };
        jQuery.fn.extend({
            find:    function (selector) {
                var self = this, i, l;
                if (typeof selector !== "string") {
                    return jQuery(selector).filter(function () {
                        for (i = 0, l = self.length; i < l; i++) {
                            if (jQuery.contains(__get$(self, i), this)) {
                                return true;
                            }
                        }
                    });
                }
                var ret = this.pushStack("", "find", selector), length, n, r;
                for (i = 0, l = this.length; i < l; i++) {
                    length = ret.length;
                    jQuery.find(selector, __get$(this, i), ret);
                    if (i > 0) {
                        // Make sure that the results are unique
                        for (n = length; n < ret.length; n++) {
                            for (r = 0; r < length; r++) {
                                if (__get$(ret, r) === __get$(ret, n)) {
                                    ret.splice(n--, 1);
                                    break;
                                }
                            }
                        }
                    }
                }
                return ret;
            },
            has:     function (target) {
                var targets = jQuery(target);
                return this.filter(function () {
                    for (var i = 0, l = targets.length; i < l; i++) {
                        if (jQuery.contains(this, __get$(targets, i))) {
                            return true;
                        }
                    }
                });
            },
            not:     function (selector) {
                return this.pushStack(winnow(this, selector, false), "not", selector);
            },
            filter:  function (selector) {
                return this.pushStack(winnow(this, selector, true), "filter", selector);
            },
            is:      function (selector) {
                return !!selector && (typeof selector ===
                                      "string" ? POS.test(selector) ? jQuery(selector, this.context).index(this[0]) >=
                                                                      0 : jQuery.filter(selector, this).length >
                                                                          0 : this.filter(selector).length > 0);
            },
            closest: function (selectors, context) {
                var ret = [], i, l, cur = this[0];
                // Array (deprecated as of jQuery 1.7)
                if (jQuery.isArray(selectors)) {
                    var level = 1;
                    while (cur && cur.ownerDocument && cur !== context) {
                        for (i = 0; i < selectors.length; i++) {
                            if (jQuery(cur).is(__get$(selectors, i))) {
                                ret.push({
                                    selector: __get$(selectors, i),
                                    elem:     cur,
                                    level:    level
                                });
                            }
                        }
                        cur = cur.parentNode;
                        level++;
                    }
                    return ret;
                }
                // String
                var pos = POS.test(selectors) || typeof selectors !== "string" ? jQuery(selectors, context ||
                                                                                                   this.context) : 0;
                for (i = 0, l = this.length; i < l; i++) {
                    cur = __get$(this, i);
                    while (cur) {
                        if (pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors)) {
                            ret.push(cur);
                            break;
                        }
                        else {
                            cur = cur.parentNode;
                            if (!cur || !cur.ownerDocument || cur === context || cur.nodeType === 11) {
                                break;
                            }
                        }
                    }
                }
                ret = ret.length > 1 ? jQuery.unique(ret) : ret;
                return this.pushStack(ret, "closest", selectors);
            },
            index:   function (elem) {
                // No argument, return index in parent
                if (!elem) {
                    return this[0] && this[0].parentNode ? this.prevAll().length : -1;
                }
                // index in selector
                if (typeof elem === "string") {
                    return jQuery.inArray(this[0], jQuery(elem));
                }
                // Locate the position of the desired element
                return jQuery.inArray(elem.jquery ? elem[0] : elem, this);
            },
            add:     function (selector, context) {
                var set = typeof selector === "string" ? jQuery(selector, context) : jQuery.makeArray(selector &&
                                                                                                      selector.nodeType ? [selector] : selector), all = jQuery.merge(this.get(), set);
                return this.pushStack(isDisconnected(set[0]) || isDisconnected(all[0]) ? all : jQuery.unique(all));
            },
            andSelf: function () {
                return this.add(this.prevObject);
            }
        });
        // A painfully simple check to see if an element is disconnected
        // from a document (should be improved, where feasible).
        function isDisconnected (node) {
            return !node || !node.parentNode || node.parentNode.nodeType === 11;
        }

        jQuery.each({
            parent:       function (elem) {
                var parent = elem.parentNode;
                return parent && parent.nodeType !== 11 ? parent : null;
            },
            parents:      function (elem) {
                return jQuery.dir(elem, "parentNode");
            },
            parentsUntil: function (elem, i, until) {
                return jQuery.dir(elem, "parentNode", until);
            },
            next:         function (elem) {
                return jQuery.nth(elem, 2, "nextSibling");
            },
            prev:         function (elem) {
                return jQuery.nth(elem, 2, "previousSibling");
            },
            nextAll:      function (elem) {
                return jQuery.dir(elem, "nextSibling");
            },
            prevAll:      function (elem) {
                return jQuery.dir(elem, "previousSibling");
            },
            nextUntil:    function (elem, i, until) {
                return jQuery.dir(elem, "nextSibling", until);
            },
            prevUntil:    function (elem, i, until) {
                return jQuery.dir(elem, "previousSibling", until);
            },
            siblings:     function (elem) {
                return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
            },
            children:     function (elem) {
                return jQuery.sibling(elem.firstChild);
            },
            contents:     function (elem) {
                return jQuery.nodeName(elem, "iframe") ? elem.contentDocument ||
                                                         elem.contentWindow.document : jQuery.makeArray(elem.childNodes);
            }
        }, function (name, fn) {
            __set$(jQuery.fn, name, function (until, selector) {
                var ret = jQuery.map(this, fn, until);
                if (!runtil.test(name)) {
                    selector = until;
                }
                if (selector && typeof selector === "string") {
                    ret = jQuery.filter(selector, ret);
                }
                ret = this.length > 1 && !__get$(guaranteedUnique, name) ? jQuery.unique(ret) : ret;
                if ((this.length > 1 || rmultiselector.test(selector)) && rparentsprev.test(name)) {
                    ret = ret.reverse();
                }
                return this.pushStack(ret, name, slice.call(arguments).join(","));
            });
        });
        jQuery.extend({
            filter:  function (expr, elems, not) {
                if (not) {
                    expr = ":not(" + expr + ")";
                }
                return elems.length ===
                       1 ? jQuery.find.matchesSelector(elems[0], expr) ? [elems[0]] : [] : jQuery.find.matches(expr, elems);
            },
            dir:     function (elem, dir, until) {
                var matched = [], cur = __get$(elem, dir);
                while (cur && cur.nodeType !== 9 &&
                       (until === undefined || cur.nodeType !== 1 || !jQuery(cur).is(until))) {
                    if (cur.nodeType === 1) {
                        matched.push(cur);
                    }
                    cur = __get$(cur, dir);
                }
                return matched;
            },
            nth:     function (cur, result, dir, elem) {
                result  = result || 1;
                var num = 0;
                for (; cur; cur = __get$(cur, dir)) {
                    if (cur.nodeType === 1 && ++num === result) {
                        break;
                    }
                }
                return cur;
            },
            sibling: function (n, elem) {
                var r = [];
                for (; n; n = n.nextSibling) {
                    if (n.nodeType === 1 && n !== elem) {
                        r.push(n);
                    }
                }
                return r;
            }
        });
        // Implement the identical functionality for filter and not
        function winnow (elements, qualifier, keep) {
            // Can't pass null or undefined to indexOf in Firefox 4
            // Set to 0 to skip string check
            qualifier = qualifier || 0;
            if (jQuery.isFunction(qualifier)) {
                return jQuery.grep(elements, function (elem, i) {
                    var retVal = !!qualifier.call(elem, i, elem);
                    return retVal === keep;
                });
            }
            else if (qualifier.nodeType) {
                return jQuery.grep(elements, function (elem, i) {
                    return elem === qualifier === keep;
                });
            }
            else if (typeof qualifier === "string") {
                var filtered = jQuery.grep(elements, function (elem) {
                    return elem.nodeType === 1;
                });
                if (isSimple.test(qualifier)) {
                    return jQuery.filter(qualifier, filtered, !keep);
                }
                else {
                    qualifier = jQuery.filter(qualifier, filtered);
                }
            }
            return jQuery.grep(elements, function (elem, i) {
                return jQuery.inArray(elem, qualifier) >= 0 === keep;
            });
        }

        function createSafeFragment (document) {
            var list = nodeNames.split("|"), safeFrag = document.createDocumentFragment();
            if (safeFrag.createElement) {
                while (list.length) {
                    safeFrag.createElement(list.pop());
                }
            }
            return safeFrag;
        }

        var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
                        "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video", rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g, rleadingWhitespace = /^\s+/, rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, rtagName = /<([\w:]+)/, rtbody = /<tbody/i, rhtml = /<|&#?\w+;/, rnoInnerhtml = /<(?:script|style)/i, rnocache = /<(?:script|object|embed|option|style)/i, rnoshimcache = new RegExp("<(?:" +
                                                                                                                                                                                                                                                                                                                                                                                                                                                          nodeNames +
                                                                                                                                                                                                                                                                                                                                                                                                                                                          ")[\\s/>]", "i"),
            // checked="checked" or checked
            rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, rscriptType = /\/(java|ecma)script/i, rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/, wrapMap = {
                option:   [
                    1,
                    "<select multiple='multiple'>",
                    "</select>"
                ],
                legend:   [
                    1,
                    "<fieldset>",
                    "</fieldset>"
                ],
                thead:    [
                    1,
                    "<table>",
                    "</table>"
                ],
                tr:       [
                    2,
                    "<table><tbody>",
                    "</tbody></table>"
                ],
                td:       [
                    3,
                    "<table><tbody><tr>",
                    "</tr></tbody></table>"
                ],
                col:      [
                    2,
                    "<table><tbody></tbody><colgroup>",
                    "</colgroup></table>"
                ],
                area:     [
                    1,
                    "<map>",
                    "</map>"
                ],
                _default: [
                    0,
                    "",
                    ""
                ]
            }, safeFragment = createSafeFragment(document);
        wrapMap.optgroup = wrapMap.option;
        wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
        wrapMap.th = wrapMap.td;
        // IE can't serialize <link> and <script> tags normally
        if (!jQuery.support.htmlSerialize) {
            wrapMap._default = [
                1,
                "div<div>",
                "</div>"
            ];
        }
        jQuery.fn.extend({
            text:        function (value) {
                return jQuery.access(this, function (value) {
                    return value === undefined ? jQuery.text(this) : this.empty().append((this[0] &&
                                                                                          this[0].ownerDocument ||
                                                                                          document).createTextNode(value));
                }, null, value, arguments.length);
            },
            wrapAll:     function (html) {
                if (jQuery.isFunction(html)) {
                    return this.each(function (i) {
                        jQuery(this).wrapAll(html.call(this, i));
                    });
                }
                if (this[0]) {
                    // The elements to wrap the target around
                    var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);
                    if (this[0].parentNode) {
                        wrap.insertBefore(this[0]);
                    }
                    wrap.map(function () {
                        var elem = this;
                        while (elem.firstChild && elem.firstChild.nodeType === 1) {
                            elem = elem.firstChild;
                        }
                        return elem;
                    }).append(this);
                }
                return this;
            },
            wrapInner:   function (html) {
                if (jQuery.isFunction(html)) {
                    return this.each(function (i) {
                        jQuery(this).wrapInner(html.call(this, i));
                    });
                }
                return this.each(function () {
                    var self = jQuery(this), contents = self.contents();
                    if (contents.length) {
                        contents.wrapAll(html);
                    }
                    else {
                        self.append(html);
                    }
                });
            },
            wrap:        function (html) {
                var isFunction = jQuery.isFunction(html);
                return this.each(function (i) {
                    jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
                });
            },
            unwrap:      function () {
                return this.parent().each(function () {
                    if (!jQuery.nodeName(this, "body")) {
                        jQuery(this).replaceWith(this.childNodes);
                    }
                }).end();
            },
            append:      function () {
                return this.domManip(arguments, true, function (elem) {
                    if (this.nodeType === 1) {
                        this.appendChild(elem);
                    }
                });
            },
            prepend:     function () {
                return this.domManip(arguments, true, function (elem) {
                    if (this.nodeType === 1) {
                        this.insertBefore(elem, this.firstChild);
                    }
                });
            },
            before:      function () {
                if (this[0] && this[0].parentNode) {
                    return this.domManip(arguments, false, function (elem) {
                        this.parentNode.insertBefore(elem, this);
                    });
                }
                else if (arguments.length) {
                    var set = jQuery.clean(arguments);
                    set.push.apply(set, this.toArray());
                    return this.pushStack(set, "before", arguments);
                }
            },
            after:       function () {
                if (this[0] && this[0].parentNode) {
                    return this.domManip(arguments, false, function (elem) {
                        this.parentNode.insertBefore(elem, this.nextSibling);
                    });
                }
                else if (arguments.length) {
                    var set = this.pushStack(this, "after", arguments);
                    set.push.apply(set, jQuery.clean(arguments));
                    return set;
                }
            },
            remove:      function (selector, keepData) {
                for (var i = 0, elem; (elem = __get$(this, i)) != null; i++) {
                    if (!selector || jQuery.filter(selector, [elem]).length) {
                        if (!keepData && elem.nodeType === 1) {
                            jQuery.cleanData(elem.getElementsByTagName("*"));
                            jQuery.cleanData([elem]);
                        }
                        if (elem.parentNode) {
                            elem.parentNode.removeChild(elem);
                        }
                    }
                }
                return this;
            },
            empty:       function () {
                for (var i = 0, elem; (elem = __get$(this, i)) != null; i++) {
                    // Remove element nodes and prevent memory leaks
                    if (elem.nodeType === 1) {
                        jQuery.cleanData(elem.getElementsByTagName("*"));
                    }
                    // Remove any remaining nodes
                    while (elem.firstChild) {
                        elem.removeChild(elem.firstChild);
                    }
                }
                return this;
            },
            clone:       function (dataAndEvents, deepDataAndEvents) {
                dataAndEvents     = dataAndEvents == null ? false : dataAndEvents;
                deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
                return this.map(function () {
                    return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
                });
            },
            html:        function (value) {
                return jQuery.access(this, function (value) {
                    var elem = this[0] || {}, i = 0, l = this.length;
                    if (value === undefined) {
                        return elem.nodeType === 1 ? __get$(elem, "innerHTML").replace(rinlinejQuery, "") : null;
                    }
                    if (typeof value === "string" && !rnoInnerhtml.test(value) &&
                        (jQuery.support.leadingWhitespace || !rleadingWhitespace.test(value)) &&
                        !__get$(wrapMap, (rtagName.exec(value) || [
                            "",
                            ""
                        ])[1].toLowerCase())) {
                        value = value.replace(rxhtmlTag, "<$1></$2>");
                        try {
                            for (; i < l; i++) {
                                // Remove element nodes and prevent memory leaks
                                elem = __get$(this, i) || {};
                                if (elem.nodeType === 1) {
                                    jQuery.cleanData(elem.getElementsByTagName("*"));
                                    __set$(elem, "innerHTML", value);
                                }
                            }
                            elem = 0;    // If using innerHTML throws an exception, use the fallback method
                        } catch (e) {
                        }
                    }
                    if (elem) {
                        this.empty().append(value);
                    }
                }, null, value, arguments.length);
            },
            replaceWith: function (value) {
                if (this[0] && this[0].parentNode) {
                    // Make sure that the elements are removed from the DOM before they are inserted
                    // this can help fix replacing a parent with child elements
                    if (jQuery.isFunction(value)) {
                        return this.each(function (i) {
                            var self = jQuery(this), old = self.html();
                            self.replaceWith(value.call(this, i, old));
                        });
                    }
                    if (typeof value !== "string") {
                        value = jQuery(value).detach();
                    }
                    return this.each(function () {
                        var next = this.nextSibling, parent = this.parentNode;
                        jQuery(this).remove();
                        if (next) {
                            jQuery(next).before(value);
                        }
                        else {
                            jQuery(parent).append(value);
                        }
                    });
                }
                else {
                    return this.length ? this.pushStack(jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value) : this;
                }
            },
            detach:      function (selector) {
                return this.remove(selector, true);
            },
            domManip:    function (args, table, callback) {
                var results, first, fragment, parent, value = args[0], scripts = [];
                // We can't cloneNode fragments that contain checked, in WebKit
                if (!jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" &&
                    rchecked.test(value)) {
                    return this.each(function () {
                        jQuery(this).domManip(args, table, callback, true);
                    });
                }
                if (jQuery.isFunction(value)) {
                    return this.each(function (i) {
                        var self = jQuery(this);
                        args[0]  = value.call(this, i, table ? self.html() : undefined);
                        self.domManip(args, table, callback);
                    });
                }
                if (this[0]) {
                    parent = value && value.parentNode;
                    // If we're in a fragment, just use that instead of building a new one
                    if (jQuery.support.parentNode && parent && parent.nodeType === 11 &&
                        parent.childNodes.length === this.length) {
                        results = { fragment: parent };
                    }
                    else {
                        results = jQuery.buildFragment(args, this, scripts);
                    }
                    fragment = results.fragment;
                    if (fragment.childNodes.length === 1) {
                        first = fragment = fragment.firstChild;
                    }
                    else {
                        first = fragment.firstChild;
                    }
                    if (first) {
                        table = table && jQuery.nodeName(first, "tr");
                        for (var i = 0, l = this.length, lastIndex = l - 1; i < l; i++) {
                            callback.call(table ? root(__get$(this, i), first) : __get$(this, i), results.cacheable ||
                                                                                                  l > 1 && i <
                                                                                                           lastIndex ? jQuery.clone(fragment, true, true) : fragment);
                        }
                    }
                    if (scripts.length) {
                        jQuery.each(scripts, function (i, elem) {
                            if (__get$(elem, "src")) {
                                jQuery.ajax({
                                    type:     "GET",
                                    global:   false,
                                    url:      __get$(elem, "src"),
                                    async:    false,
                                    dataType: "script"
                                });
                            }
                            else {
                                jQuery.globalEval((__get$(elem, "text") || elem.textContent ||
                                                   __get$(elem, "innerHTML") || "").replace(rcleanScript, "/*$0*/"));
                            }
                            if (elem.parentNode) {
                                elem.parentNode.removeChild(elem);
                            }
                        });
                    }
                }
                return this;
            }
        });
        function root (elem, cur) {
            return jQuery.nodeName(elem, "table") ? elem.getElementsByTagName("tbody")[0] ||
                                                    elem.appendChild(elem.ownerDocument.createElement("tbody")) : elem;
        }

        function cloneCopyEvent (src, dest) {
            if (dest.nodeType !== 1 || !jQuery.hasData(src)) {
                return;
            }
            var type, i, l, oldData = jQuery._data(src), curData = jQuery._data(dest, oldData), events = oldData.events;
            if (events) {
                delete curData.handle;
                curData.events = {};
                for (type in events) {
                    for (i = 0, l = __get$(events, type).length; i < l; i++) {
                        jQuery.event.add(dest, type, __get$(__get$(events, type), i));
                    }
                }
            }
            // make the cloned public data object a copy from the original
            if (__get$(curData, "data")) {
                __set$(curData, "data", jQuery.extend({}, __get$(curData, "data")));
            }
        }

        function cloneFixAttributes (src, dest) {
            var nodeName;
            // We do not need to do anything for non-Elements
            if (dest.nodeType !== 1) {
                return;
            }
            // clearAttributes removes the attributes, which we don't want,
            // but also removes the attachEvent events, which we *do* want
            if (dest.clearAttributes) {
                dest.clearAttributes();
            }
            // mergeAttributes, in contrast, only merges back on the
            // original attributes, not the events
            if (dest.mergeAttributes) {
                dest.mergeAttributes(src);
            }
            nodeName = dest.nodeName.toLowerCase();
            // IE6-8 fail to clone children inside object elements that use
            // the proprietary classid attribute value (rather than the type
            // attribute) to identify the type of content to display
            if (nodeName === "object") {
                dest.outerHTML = src.outerHTML;
            }
            else if (nodeName === "input" && (src.type === "checkbox" || src.type === "radio")) {
                // IE6-8 fails to persist the checked state of a cloned checkbox
                // or radio button. Worse, IE6-7 fail to give the cloned element
                // a checked appearance if the defaultChecked value isn't also set
                if (src.checked) {
                    dest.defaultChecked = dest.checked = src.checked;
                }
                // IE6-7 get confused and end up setting the value of a cloned
                // checkbox/radio button to an empty string instead of "on"
                if (__get$(dest, "value") !== __get$(src, "value")) {
                    __set$(dest, "value", __get$(src, "value"));
                }
                // IE6-8 fails to return the selected option to the default selected
                // state when cloning options
            }
            else if (nodeName === "option") {
                dest.selected = src.defaultSelected;    // IE6-8 fails to set the defaultValue to the correct value when
                // cloning other types of input fields
            }
            else if (nodeName === "input" || nodeName === "textarea") {
                dest.defaultValue = src.defaultValue;    // IE blanks contents when cloning scripts
            }
            else if (nodeName === "script" && __get$(dest, "text") !== __get$(src, "text")) {
                __set$(dest, "text", __get$(src, "text"));
            }
            // Event data gets referenced instead of copied if the expando
            // gets copied too
            dest.removeAttribute(jQuery.expando);
            // Clear flags for bubbling special change/submit events, they must
            // be reattached when the newly cloned events are first activated
            dest.removeAttribute("_submit_attached");
            dest.removeAttribute("_change_attached");
        }

        jQuery.buildFragment = function (args, nodes, scripts) {
            var fragment, cacheable, cacheresults, doc, first = args[0];
            // nodes may contain either an explicit document object,
            // a jQuery collection or context object.
            // If nodes[0] contains a valid object to assign to doc
            if (nodes && nodes[0]) {
                doc = nodes[0].ownerDocument || nodes[0];
            }
            // Ensure that an attr object doesn't incorrectly stand in as a document object
            // Chrome and Firefox seem to allow this to occur and will throw exception
            // Fixes #8950
            if (!doc.createDocumentFragment) {
                doc = document;
            }
            // Only cache "small" (1/2 KB) HTML strings that are associated with the main document
            // Cloning options loses the selected state, so don't cache them
            // IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
            // Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
            // Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
            if (args.length === 1 && typeof first === "string" && first.length < 512 && doc === document &&
                first.charAt(0) === "<" && !rnocache.test(first) &&
                (jQuery.support.checkClone || !rchecked.test(first)) &&
                (jQuery.support.html5Clone || !rnoshimcache.test(first))) {
                cacheable    = true;
                cacheresults = __get$(jQuery.fragments, first);
                if (cacheresults && cacheresults !== 1) {
                    fragment = cacheresults;
                }
            }
            if (!fragment) {
                fragment = doc.createDocumentFragment();
                jQuery.clean(args, doc, fragment, scripts);
            }
            if (cacheable) {
                __set$(jQuery.fragments, first, cacheresults ? fragment : 1);
            }
            return {
                fragment:  fragment,
                cacheable: cacheable
            };
        };
        jQuery.fragments     = {};
        jQuery.each({
            appendTo:     "append",
            prependTo:    "prepend",
            insertBefore: "before",
            insertAfter:  "after",
            replaceAll:   "replaceWith"
        }, function (name, original) {
            __set$(jQuery.fn, name, function (selector) {
                var ret = [], insert = jQuery(selector), parent = this.length === 1 && this[0].parentNode;
                if (parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1) {
                    __call$(insert, original, [this[0]]);
                    return this;
                }
                else {
                    for (var i = 0, l = insert.length; i < l; i++) {
                        var elems = (i > 0 ? this.clone(true) : this).get();
                        __call$(jQuery(__get$(insert, i)), original, [elems]);
                        ret       = ret.concat(elems);
                    }
                    return this.pushStack(ret, name, insert.selector);
                }
            });
        });
        function getAll (elem) {
            if (typeof elem.getElementsByTagName !== "undefined") {
                return elem.getElementsByTagName("*");
            }
            else if (typeof elem.querySelectorAll !== "undefined") {
                return elem.querySelectorAll("*");
            }
            else {
                return [];
            }
        }

        // Used in clean, fixes the defaultChecked property
        function fixDefaultChecked (elem) {
            if (elem.type === "checkbox" || elem.type === "radio") {
                elem.defaultChecked = elem.checked;
            }
        }

        // Finds all inputs and passes them to fixDefaultChecked
        function findInputs (elem) {
            var nodeName = (elem.nodeName || "").toLowerCase();
            if (nodeName === "input") {
                fixDefaultChecked(elem);    // Skip scripts, get other children
            }
            else if (nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined") {
                jQuery.grep(elem.getElementsByTagName("input"), fixDefaultChecked);
            }
        }

        // Derived From: http://www.iecss.com/shimprove/javascript/shimprove.1-0-1.js
        function shimCloneNode (elem) {
            var div = document.createElement("div");
            safeFragment.appendChild(div);
            __set$(div, "innerHTML", elem.outerHTML);
            return div.firstChild;
        }

        jQuery.extend({
            clone:     function (elem, dataAndEvents, deepDataAndEvents) {
                var srcElements, destElements, i,
                    // IE<=8 does not properly clone detached, unknown element nodes
                    clone = jQuery.support.html5Clone || jQuery.isXMLDoc(elem) ||
                            !rnoshimcache.test("<" + elem.nodeName + ">") ? elem.cloneNode(true) : shimCloneNode(elem);
                if ((!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
                    (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {
                    // IE copies events bound via attachEvent when using cloneNode.
                    // Calling detachEvent on the clone will also remove the events
                    // from the original. In order to get around this, we use some
                    // proprietary methods to clear the events. Thanks to MooTools
                    // guys for this hotness.
                    cloneFixAttributes(elem, clone);
                    // Using Sizzle here is crazy slow, so we use getElementsByTagName instead
                    srcElements  = getAll(elem);
                    destElements = getAll(clone);
                    // Weird iteration because IE will replace the length property
                    // with an element if you are cloning the body and one of the
                    // elements on the page has a name or id of "length"
                    for (i = 0; __get$(srcElements, i); ++i) {
                        // Ensure that the destination node is not null; Fixes #9587
                        if (__get$(destElements, i)) {
                            cloneFixAttributes(__get$(srcElements, i), __get$(destElements, i));
                        }
                    }
                }
                // Copy the events from the original to the clone
                if (dataAndEvents) {
                    cloneCopyEvent(elem, clone);
                    if (deepDataAndEvents) {
                        srcElements  = getAll(elem);
                        destElements = getAll(clone);
                        for (i = 0; __get$(srcElements, i); ++i) {
                            cloneCopyEvent(__get$(srcElements, i), __get$(destElements, i));
                        }
                    }
                }
                srcElements = destElements = null;
                // Return the cloned set
                return clone;
            },
            clean:     function (elems, context, fragment, scripts) {
                var checkScriptType, script, j, ret = [];
                context                             = context || document;
                // !context.createElement fails in IE with an error but returns typeof 'object'
                if (typeof context.createElement === "undefined") {
                    context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
                }
                for (var i = 0, elem; (elem = __get$(elems, i)) != null; i++) {
                    if (typeof elem === "number") {
                        elem = elem + "";
                    }
                    if (!elem) {
                        continue;
                    }
                    // Convert html string into DOM nodes
                    if (typeof elem === "string") {
                        if (!rhtml.test(elem)) {
                            elem = context.createTextNode(elem);
                        }
                        else {
                            // Fix "XHTML"-style tags in all browsers
                            elem = elem.replace(rxhtmlTag, "<$1></$2>");
                            // Trim whitespace, otherwise indexOf won't work as expected
                            var tag = (rtagName.exec(elem) || [
                                "",
                                ""
                            ])[1].toLowerCase(), wrap = __get$(wrapMap, tag) ||
                                                        wrapMap._default, depth = wrap[0], div = context.createElement("div"), safeChildNodes = safeFragment.childNodes, remove;
                            // Append wrapper element to unknown element safe doc fragment
                            if (context === document) {
                                // Use the fragment we've already created for this document
                                safeFragment.appendChild(div);
                            }
                            else {
                                // Use a fragment created with the owner document
                                createSafeFragment(context).appendChild(div);
                            }
                            // Go to html and back, then peel off extra wrappers
                            __set$(div, "innerHTML", wrap[1] + elem + wrap[2]);
                            // Move to the right depth
                            while (depth--) {
                                div = div.lastChild;
                            }
                            // Remove IE's autoinserted <tbody> from table fragments
                            if (!jQuery.support.tbody) {
                                // String was a <table>, *may* have spurious <tbody>
                                var hasBody = rtbody.test(elem), tbody = tag === "table" && !hasBody ? div.firstChild &&
                                                                                                       div.firstChild.childNodes : wrap[1] ===
                                                                                                                                   "<table>" &&
                                                                                                                                   !hasBody ? div.childNodes : [];
                                for (j = tbody.length - 1; j >= 0; --j) {
                                    if (jQuery.nodeName(__get$(tbody, j), "tbody") &&
                                        !__get$(tbody, j).childNodes.length) {
                                        __get$(tbody, j).parentNode.removeChild(__get$(tbody, j));
                                    }
                                }
                            }
                            // IE completely kills leading whitespace when innerHTML is used
                            if (!jQuery.support.leadingWhitespace && rleadingWhitespace.test(elem)) {
                                div.insertBefore(context.createTextNode(rleadingWhitespace.exec(elem)[0]), div.firstChild);
                            }
                            elem = div.childNodes;
                            // Clear elements from DocumentFragment (safeFragment or otherwise)
                            // to avoid hoarding elements. Fixes #11356
                            if (div) {
                                div.parentNode.removeChild(div);
                                // Guard against -1 index exceptions in FF3.6
                                if (safeChildNodes.length > 0) {
                                    remove = __get$(safeChildNodes, safeChildNodes.length - 1);
                                    if (remove && remove.parentNode) {
                                        remove.parentNode.removeChild(remove);
                                    }
                                }
                            }
                        }
                    }
                    // Resets defaultChecked for any radios and checkboxes
                    // about to be appended to the DOM in IE 6/7 (#8060)
                    var len;
                    if (!jQuery.support.appendChecked) {
                        if (elem[0] && typeof (len = elem.length) === "number") {
                            for (j = 0; j < len; j++) {
                                findInputs(__get$(elem, j));
                            }
                        }
                        else {
                            findInputs(elem);
                        }
                    }
                    if (elem.nodeType) {
                        ret.push(elem);
                    }
                    else {
                        ret = jQuery.merge(ret, elem);
                    }
                }
                if (fragment) {
                    checkScriptType = function (elem) {
                        return !elem.type || rscriptType.test(elem.type);
                    };
                    for (i = 0; __get$(ret, i); i++) {
                        script = __get$(ret, i);
                        if (scripts && jQuery.nodeName(script, "script") &&
                            (!script.type || rscriptType.test(script.type))) {
                            scripts.push(script.parentNode ? script.parentNode.removeChild(script) : script);
                        }
                        else {
                            if (script.nodeType === 1) {
                                var jsTags = jQuery.grep(script.getElementsByTagName("script"), checkScriptType);
                                ret.splice.apply(ret, [
                                    i + 1,
                                    0
                                ].concat(jsTags));
                            }
                            fragment.appendChild(script);
                        }
                    }
                }
                return ret;
            },
            cleanData: function (elems) {
                var data, id, cache = jQuery.cache, special = jQuery.event.special, deleteExpando = jQuery.support.deleteExpando;
                for (var i = 0, elem; (elem = __get$(elems, i)) != null; i++) {
                    if (elem.nodeName && __get$(jQuery.noData, elem.nodeName.toLowerCase())) {
                        continue;
                    }
                    id = __get$(elem, jQuery.expando);
                    if (id) {
                        data = __get$(cache, id);
                        if (data && data.events) {
                            for (var type in data.events) {
                                if (__get$(special, type)) {
                                    jQuery.event.remove(elem, type);    // This is a shortcut to avoid jQuery.event.remove's overhead
                                }
                                else {
                                    jQuery.removeEvent(elem, type, data.handle);
                                }
                            }
                            // Null the DOM reference to avoid IE6/7/8 leak (#7054)
                            if (data.handle) {
                                data.handle.elem = null;
                            }
                        }
                        if (deleteExpando) {
                            delete elem[jQuery.expando];
                        }
                        else if (elem.removeAttribute) {
                            elem.removeAttribute(jQuery.expando);
                        }
                        delete cache[id];
                    }
                }
            }
        });
        var ralpha           = /alpha\([^)]*\)/i, ropacity = /opacity=([^)]*)/,
            // fixed for IE9, see #8346
            rupper           = /([A-Z]|^ms)/g, rnum = /^[\-+]?(?:\d*\.)?\d+$/i, rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i, rrelNum = /^([\-+])=([\-+.\de]+)/, rmargin = /^margin/, cssShow = {
                position:   "absolute",
                visibility: "hidden",
                display:    "block"
            },
            // order is important!
            cssExpand        = [
                "Top",
                "Right",
                "Bottom",
                "Left"
            ], curCSS, getComputedStyle, currentStyle;
        jQuery.fn.css        = function (name, value) {
            return jQuery.access(this, function (elem, name, value) {
                return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
            }, name, value, arguments.length > 1);
        };
        jQuery.extend({
            cssHooks:  {
                opacity: {
                    get: function (elem, computed) {
                        if (computed) {
                            // We should always get a number back from opacity
                            var ret = curCSS(elem, "opacity");
                            return ret === "" ? "1" : ret;
                        }
                        else {
                            return elem.style.opacity;
                        }
                    }
                }
            },
            cssNumber: {
                "fillOpacity": true,
                "fontWeight":  true,
                "lineHeight":  true,
                "opacity":     true,
                "orphans":     true,
                "widows":      true,
                "zIndex":      true,
                "zoom":        true
            },
            cssProps:  { "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat" },
            style:     function (elem, name, value, extra) {
                // Don't set styles on text and comment nodes
                if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
                    return;
                }
                // Make sure that we're working with the right name
                var ret, type, origName = jQuery.camelCase(name), style = elem.style, hooks = __get$(jQuery.cssHooks, origName);
                name                    = __get$(jQuery.cssProps, origName) || origName;
                // Check if we're setting a value
                if (value !== undefined) {
                    type = typeof value;
                    // convert relative number strings (+= or -=) to relative numbers. #7345
                    if (type === "string" && (ret = rrelNum.exec(value))) {
                        value = +(ret[1] + 1) * +ret[2] + parseFloat(jQuery.css(elem, name));
                        // Fixes bug #9237
                        type = "number";
                    }
                    // Make sure that NaN and null values aren't set. See: #7116
                    if (value == null || type === "number" && isNaN(value)) {
                        return;
                    }
                    // If a number was passed in, add 'px' to the (except for certain CSS properties)
                    if (type === "number" && !__get$(jQuery.cssNumber, origName)) {
                        value = value + "px";
                    }
                    // If a hook was provided, use that value, otherwise just set the specified value
                    if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value)) !== undefined) {
                        // Wrapped to prevent IE from throwing errors when 'invalid' values are provided
                        // Fixes bug #5509
                        try {
                            __set$(style, name, value);
                        } catch (e) {
                        }
                    }
                }
                else {
                    // If a hook was provided get the non-computed value from there
                    if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
                        return ret;
                    }
                    // Otherwise just get the value from the style object
                    return __get$(style, name);
                }
            },
            css:       function (elem, name, extra) {
                var ret, hooks;
                // Make sure that we're working with the right name
                name  = jQuery.camelCase(name);
                hooks = __get$(jQuery.cssHooks, name);
                name  = __get$(jQuery.cssProps, name) || name;
                // cssFloat needs a special treatment
                if (name === "cssFloat") {
                    name = "float";
                }
                // If a hook was provided get the computed value from there
                if (hooks && "get" in hooks && (ret = hooks.get(elem, true, extra)) !== undefined) {
                    return ret;    // Otherwise, if a way to get the computed value exists, use that
                }
                else if (curCSS) {
                    return curCSS(elem, name);
                }
            },
            swap:      function (elem, options, callback) {
                var old = {}, ret, name;
                // Remember the old values, and insert the new ones
                for (name in options) {
                    __set$(old, name, __get$(elem.style, name));
                    __set$(elem.style, name, __get$(options, name));
                }
                ret = callback.call(elem);
                // Revert the old values
                for (name in options) {
                    __set$(elem.style, name, __get$(old, name));
                }
                return ret;
            }
        });
        // DEPRECATED in 1.3, Use jQuery.css() instead
        jQuery.curCSS = jQuery.css;
        if (document.defaultView && document.defaultView.getComputedStyle) {
            getComputedStyle = function (elem, name) {
                var ret, defaultView, computedStyle, width, style = elem.style;
                name                                              = name.replace(rupper, "-$1").toLowerCase();
                if ((defaultView = elem.ownerDocument.defaultView) &&
                    (computedStyle = defaultView.getComputedStyle(elem, null))) {
                    ret = computedStyle.getPropertyValue(name);
                    if (ret === "" && !jQuery.contains(elem.ownerDocument.documentElement, elem)) {
                        ret = jQuery.style(elem, name);
                    }
                }
                // A tribute to the "awesome hack by Dean Edwards"
                // WebKit uses "computed value (percentage if specified)" instead of "used value" for margins
                // which is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
                if (!jQuery.support.pixelMargin && computedStyle && rmargin.test(name) && rnumnonpx.test(ret)) {
                    width       = style.width;
                    style.width = ret;
                    ret         = computedStyle.width;
                    style.width = width;
                }
                return ret;
            };
        }
        if (document.documentElement.currentStyle) {
            currentStyle = function (elem, name) {
                var left, rsLeft, uncomputed, ret = elem.currentStyle &&
                                                    __get$(elem.currentStyle, name), style = elem.style;
                // Avoid setting ret to empty string here
                // so we don't default to auto
                if (ret == null && style && (uncomputed = __get$(style, name))) {
                    ret = uncomputed;
                }
                // From the awesome hack by Dean Edwards
                // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
                // If we're not dealing with a regular pixel number
                // but a number that has a weird ending, we need to convert it to pixels
                if (rnumnonpx.test(ret)) {
                    // Remember the original values
                    left   = style.left;
                    rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;
                    // Put in the new values to get a computed value out
                    if (rsLeft) {
                        elem.runtimeStyle.left = elem.currentStyle.left;
                    }
                    style.left = name === "fontSize" ? "1em" : ret;
                    ret        = style.pixelLeft + "px";
                    // Revert the changed values
                    style.left = left;
                    if (rsLeft) {
                        elem.runtimeStyle.left = rsLeft;
                    }
                }
                return ret === "" ? "auto" : ret;
            };
        }
        curCSS             = getComputedStyle || currentStyle;
        function getWidthOrHeight (elem, name, extra) {
            // Start with offset property
            var val = name === "width" ? elem.offsetWidth : elem.offsetHeight, i = name === "width" ? 1 : 0, len = 4;
            if (val > 0) {
                if (extra !== "border") {
                    for (; i < len; i = i + 2) {
                        if (!extra) {
                            val -= parseFloat(jQuery.css(elem, "padding" + __get$(cssExpand, i))) || 0;
                        }
                        if (extra === "margin") {
                            val = val + (parseFloat(jQuery.css(elem, extra + __get$(cssExpand, i))) || 0);
                        }
                        else {
                            val -= parseFloat(jQuery.css(elem, "border" + __get$(cssExpand, i) + "Width")) || 0;
                        }
                    }
                }
                return val + "px";
            }
            // Fall back to computed then uncomputed css if necessary
            val = curCSS(elem, name);
            if (val < 0 || val == null) {
                val = __get$(elem.style, name);
            }
            // Computed unit is not pixels. Stop here and return.
            if (rnumnonpx.test(val)) {
                return val;
            }
            // Normalize "", auto, and prepare for extra
            val = parseFloat(val) || 0;
            // Add padding, border, margin
            if (extra) {
                for (; i < len; i = i + 2) {
                    val = val + (parseFloat(jQuery.css(elem, "padding" + __get$(cssExpand, i))) || 0);
                    if (extra !== "padding") {
                        val = val + (parseFloat(jQuery.css(elem, "border" + __get$(cssExpand, i) + "Width")) || 0);
                    }
                    if (extra === "margin") {
                        val = val + (parseFloat(jQuery.css(elem, extra + __get$(cssExpand, i))) || 0);
                    }
                }
            }
            return val + "px";
        }

        jQuery.each([
            "height",
            "width"
        ], function (i, name) {
            __set$(jQuery.cssHooks, name, {
                get: function (elem, computed, extra) {
                    if (computed) {
                        if (elem.offsetWidth !== 0) {
                            return getWidthOrHeight(elem, name, extra);
                        }
                        else {
                            return jQuery.swap(elem, cssShow, function () {
                                return getWidthOrHeight(elem, name, extra);
                            });
                        }
                    }
                },
                set: function (elem, value) {
                    return rnum.test(value) ? value + "px" : value;
                }
            });
        });
        if (!jQuery.support.opacity) {
            jQuery.cssHooks.opacity = {
                get: function (elem, computed) {
                    // IE uses filters for opacity
                    return ropacity.test((computed &&
                                          elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) ||
                                         "") ? parseFloat(RegExp.$1) / 100 + "" : computed ? "1" : "";
                },
                set: function (elem, value) {
                    var style = elem.style, currentStyle = elem.currentStyle, opacity = jQuery.isNumeric(value) ? "alpha(opacity=" +
                                                                                                                  value *
                                                                                                                  100 +
                                                                                                                  ")" : "", filter = currentStyle &&
                                                                                                                                     currentStyle.filter ||
                                                                                                                                     style.filter ||
                                                                                                                                     "";
                    // IE has trouble with opacity if it does not have layout
                    // Force it by setting the zoom level
                    style.zoom = 1;
                    // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
                    if (value >= 1 && jQuery.trim(filter.replace(ralpha, "")) === "") {
                        // Setting style.filter to null, "" & " " still leave "filter:" in the cssText
                        // if "filter:" is present at all, clearType is disabled, we want to avoid this
                        // style.removeAttribute is IE Only, but so apparently is this code path...
                        style.removeAttribute("filter");
                        // if there there is no filter style applied in a css rule, we are done
                        if (currentStyle && !currentStyle.filter) {
                            return;
                        }
                    }
                    // otherwise, set new filter values
                    style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : filter + " " + opacity;
                }
            };
        }
        jQuery(function () {
            // This hook cannot be added until DOM ready because the support test
            // for it is not run until after DOM ready
            if (!jQuery.support.reliableMarginRight) {
                jQuery.cssHooks.marginRight = {
                    get: function (elem, computed) {
                        // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                        // Work around by temporarily setting element display to inline-block
                        return jQuery.swap(elem, { "display": "inline-block" }, function () {
                            if (computed) {
                                return curCSS(elem, "margin-right");
                            }
                            else {
                                return elem.style.marginRight;
                            }
                        });
                    }
                };
            }
        });
        if (jQuery.expr && jQuery.expr.filters) {
            jQuery.expr.filters.hidden  = function (elem) {
                var width = elem.offsetWidth, height = elem.offsetHeight;
                return width === 0 && height === 0 || !jQuery.support.reliableHiddenOffsets &&
                                                      (elem.style && elem.style.display ||
                                                       jQuery.css(elem, "display")) === "none";
            };
            jQuery.expr.filters.visible = function (elem) {
                return !jQuery.expr.filters.hidden(elem);
            };
        }
        // These hooks are used by animate to expand properties
        jQuery.each({
            margin:  "",
            padding: "",
            border:  "Width"
        }, function (prefix, suffix) {
            __set$(jQuery.cssHooks, prefix + suffix, {
                expand: function (value) {
                    var i,
                        // assumes a single number if not a string
                        parts = typeof value === "string" ? value.split(" ") : [value], expanded = {};
                    for (i = 0; i < 4; i++) {
                        __set$(expanded, prefix + __get$(cssExpand, i) + suffix, __get$(parts, i) ||
                                                                                 __get$(parts, i - 2) || parts[0]);
                    }
                    return expanded;
                }
            });
        });
        var r20            = /%20/g, rbracket = /\[\]$/, rCRLF = /\r?\n/g, rhash = /#.*$/, rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm,
            // IE leaves an \r character at EOL
            rinput         = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
            // #7653, #8125, #8152: local protocol detection
            rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/, rnoContent = /^(?:GET|HEAD)$/, rprotocol = /^\/\//, rquery = /\?/, rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, rselectTextarea = /^(?:select|textarea)/i, rspacesAjax = /\s+/, rts = /([?&])_=[^&]*/, rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
            // Keep a copy of the old load method
            _load          = jQuery.fn.load,
            /* Prefilters
             * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
             * 2) These are called:
             *    - BEFORE asking for a transport
             *    - AFTER param serialization (s.data is a string if s.processData is true)
             * 3) key is the dataType
             * 4) the catchall symbol "*" can be used
             * 5) execution will start with transport dataType and THEN continue down to "*" if needed
             */
            prefilters     = {},
            /* Transports bindings
             * 1) key is the dataType
             * 2) the catchall symbol "*" can be used
             * 3) selection will start with transport dataType and THEN go to "*" if needed
             */
            transports     = {},
            // Document location
            ajaxLocation,
            // Document location segments
            ajaxLocParts,
            // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
            allTypes       = ["*/"] + ["*"];
        // #8138, IE may throw an exception when accessing
        // a field from window.location if document.domain has been set
        try {
            ajaxLocation = __get$(__get$Loc(location), "href");
        } catch (e) {
            // Use the href attribute of an A element
            // since IE will modify it given document.location
            ajaxLocation = document.createElement("a");
            __set$(ajaxLocation, "href", "");
            ajaxLocation = __get$(ajaxLocation, "href");
        }
        // Segment location into parts
        ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];
        // Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
        function addToPrefiltersOrTransports (structure) {
            // dataTypeExpression is optional and defaults to "*"
            return function (dataTypeExpression, func) {
                if (typeof dataTypeExpression !== "string") {
                    func               = dataTypeExpression;
                    dataTypeExpression = "*";
                }
                if (jQuery.isFunction(func)) {
                    var dataTypes = dataTypeExpression.toLowerCase().split(rspacesAjax), i = 0, length = dataTypes.length, dataType, list, placeBefore;
                    // For each dataType in the dataTypeExpression
                    for (; i < length; i++) {
                        dataType = __get$(dataTypes, i);
                        // We control if we're asked to add before
                        // any existing element
                        placeBefore = /^\+/.test(dataType);
                        if (placeBefore) {
                            dataType = dataType.substr(1) || "*";
                        }
                        list = __set$(structure, dataType, __get$(structure, dataType) || []);
                        // then we add to the structure accordingly
                        __call$(list, placeBefore ? "unshift" : "push", [func]);
                    }
                }
            };
        }

        // Base inspection function for prefilters and transports
        function inspectPrefiltersOrTransports (structure, options, originalOptions, jqXHR, dataType, inspected) {
            dataType  = dataType || options.dataTypes[0];
            inspected = inspected || {};
            __set$(inspected, dataType, true);
            var list  = __get$(structure, dataType), i = 0, length = list ? list.length : 0, executeOnly = structure ===
                                                                                                           prefilters, selection;
            for (; i < length && (executeOnly || !selection); i++) {
                selection = __call$(list, i, [
                    options,
                    originalOptions,
                    jqXHR
                ]);
                // If we got redirected to another dataType
                // we try there if executing only and not done already
                if (typeof selection === "string") {
                    if (!executeOnly || __get$(inspected, selection)) {
                        selection = undefined;
                    }
                    else {
                        options.dataTypes.unshift(selection);
                        selection = inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR, selection, inspected);
                    }
                }
            }
            // If we're only executing or nothing was selected
            // we try the catchall dataType if not done already
            if ((executeOnly || !selection) && !inspected["*"]) {
                selection = inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR, "*", inspected);
            }
            // unnecessary when only executing (prefilters)
            // but it'll be ignored by the caller in that case
            return selection;
        }

        // A special extend for ajax options
        // that takes "flat" options (not to be deep extended)
        // Fixes #9887
        function ajaxExtend (target, src) {
            var key, deep, flatOptions = jQuery.ajaxSettings.flatOptions || {};
            for (key in src) {
                if (__get$(src, key) !== undefined) {
                    __set$(__get$(flatOptions, key) ? target : deep || (deep = {}), key, __get$(src, key));
                }
            }
            if (deep) {
                jQuery.extend(true, target, deep);
            }
        }

        jQuery.fn.extend({
            load:           function (url, params, callback) {
                if (typeof url !== "string" && _load) {
                    return _load.apply(this, arguments);    // Don't do a request if no elements are being requested
                }
                else if (!this.length) {
                    return this;
                }
                var off = url.indexOf(" ");
                if (off >= 0) {
                    var selector = url.slice(off, url.length);
                    url          = url.slice(0, off);
                }
                // Default to a GET request
                var type = "GET";
                // If the second parameter was provided
                if (params) {
                    // If it's a function
                    if (jQuery.isFunction(params)) {
                        // We assume that it's the callback
                        callback = params;
                        params   = undefined;    // Otherwise, build a param string
                    }
                    else if (typeof params === "object") {
                        params = jQuery.param(params, jQuery.ajaxSettings.traditional);
                        type   = "POST";
                    }
                }
                var self = this;
                // Request the remote document
                jQuery.ajax({
                    url:      url,
                    type:     type,
                    dataType: "html",
                    data:     params,
                    complete: function (jqXHR, status, responseText) {
                        // Store the response as specified by the jqXHR object
                        responseText = jqXHR.responseText;
                        // If successful, inject the HTML into all the matched elements
                        if (jqXHR.isResolved()) {
                            // #4825: Get the actual response in case
                            // a dataFilter is present in ajaxSettings
                            jqXHR.done(function (r) {
                                responseText = r;
                            });
                            // See if a selector was specified
                            self.html(selector ? jQuery("<div>").append(responseText.replace(rscript, "")).find(selector) : responseText);
                        }
                        if (callback) {
                            self.each(callback, [
                                responseText,
                                status,
                                jqXHR
                            ]);
                        }
                    }
                });
                return this;
            },
            serialize:      function () {
                return jQuery.param(this.serializeArray());
            },
            serializeArray: function () {
                return this.map(function () {
                    return this.elements ? jQuery.makeArray(this.elements) : this;
                }).filter(function () {
                    return this.name && !this.disabled &&
                           (this.checked || rselectTextarea.test(this.nodeName) || rinput.test(this.type));
                }).map(function (i, elem) {
                    var val = jQuery(this).val();
                    return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function (val, i) {
                        return {
                            name:  elem.name,
                            value: val.replace(rCRLF, "\r\n")
                        };
                    }) : {
                        name:  elem.name,
                        value: val.replace(rCRLF, "\r\n")
                    };
                }).get();
            }
        });
        // Attach a bunch of functions for handling common AJAX events
        jQuery.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function (i, o) {
            __set$(jQuery.fn, o, function (f) {
                return this.on(o, f);
            });
        });
        jQuery.each([
            "get",
            "post"
        ], function (i, method) {
            __set$(jQuery, method, function (url, data, callback, type) {
                // shift arguments if data argument was omitted
                if (jQuery.isFunction(data)) {
                    type     = type || callback;
                    callback = data;
                    data     = undefined;
                }
                return jQuery.ajax({
                    type:     method,
                    url:      url,
                    data:     data,
                    success:  callback,
                    dataType: type
                });
            });
        });
        jQuery.extend({
            getScript:     function (url, callback) {
                return jQuery.get(url, undefined, callback, "script");
            },
            getJSON:       function (url, data, callback) {
                return jQuery.get(url, data, callback, "json");
            },
            ajaxSetup:     function (target, settings) {
                if (settings) {
                    // Building a settings object
                    ajaxExtend(target, jQuery.ajaxSettings);
                }
                else {
                    // Extending ajaxSettings
                    settings = target;
                    target   = jQuery.ajaxSettings;
                }
                ajaxExtend(target, settings);
                return target;
            },
            ajaxSettings:  {
                url:            ajaxLocation,
                isLocal:        rlocalProtocol.test(ajaxLocParts[1]),
                global:         true,
                type:           "GET",
                contentType:    "application/x-www-form-urlencoded; charset=UTF-8",
                processData:    true,
                async:          true,
                accepts:        {
                    xml:  "application/xml, text/xml",
                    html: "text/html",
                    text: "text/plain",
                    json: "application/json, text/javascript",
                    "*":  allTypes
                },
                contents:       {
                    xml:  /xml/,
                    html: /html/,
                    json: /json/
                },
                responseFields: {
                    xml:  "responseXML",
                    text: "responseText"
                },
                converters:     {
                    "* text":    window.String,
                    "text html": true,
                    "text json": jQuery.parseJSON,
                    "text xml":  jQuery.parseXML
                },
                flatOptions:    {
                    context: true,
                    url:     true
                }
            },
            ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
            ajaxTransport: addToPrefiltersOrTransports(transports),
            ajax:          function (url, options) {
                // If url is an object, simulate pre-1.5 signature
                if (typeof url === "object") {
                    options = url;
                    url     = undefined;
                }
                // Force options to be an object
                options            = options || {};
                var
                // Create the final options object
                s                  = jQuery.ajaxSetup({}, options),
                // Callbacks context
                callbackContext    = s.context || s,
                // Context for global events
                // It's the callbackContext if one was provided in the options
                // and if it's a DOM node or a jQuery collection
                globalEventContext = callbackContext !== s && (callbackContext.nodeType || callbackContext instanceof
                                                                                           jQuery) ? jQuery(callbackContext) : jQuery.event,
                // Deferreds
                deferred           = jQuery.Deferred(), completeDeferred = jQuery.Callbacks("once memory"),
                // Status-dependent callbacks
                statusCode         = s.statusCode || {},
                // ifModified key
                ifModifiedKey,
                // Headers (they are sent all at once)
                requestHeaders     = {}, requestHeadersNames = {},
                // Response headers
                responseHeadersString, responseHeaders,
                // transport
                transport,
                // timeout handle
                timeoutTimer,
                // Cross-domain detection vars
                parts,
                // The jqXHR state
                state              = 0,
                // To know if global events are to be dispatched
                fireGlobals,
                // Loop variable
                i,
                // Fake xhr
                jqXHR              = {
                    readyState:            0,
                    setRequestHeader:      function (name, value) {
                        if (!state) {
                            var lname = name.toLowerCase();
                            name      = __set$(requestHeadersNames, lname, __get$(requestHeadersNames, lname) || name);
                            __set$(requestHeaders, name, value);
                        }
                        return this;
                    },
                    getAllResponseHeaders: function () {
                        return state === 2 ? responseHeadersString : null;
                    },
                    getResponseHeader:     function (key) {
                        var match;
                        if (state === 2) {
                            if (!responseHeaders) {
                                responseHeaders = {};
                                while (match = rheaders.exec(responseHeadersString)) {
                                    __set$(responseHeaders, match[1].toLowerCase(), match[2]);
                                }
                            }
                            match = __get$(responseHeaders, key.toLowerCase());
                        }
                        return match === undefined ? null : match;
                    },
                    overrideMimeType:      function (type) {
                        if (!state) {
                            s.mimeType = type;
                        }
                        return this;
                    },
                    abort:                 function (statusText) {
                        statusText = statusText || "abort";
                        if (transport) {
                            transport.abort(statusText);
                        }
                        done(0, statusText);
                        return this;
                    }
                };
                // Callback for when everything is done
                // It is defined here because jslint complains if it is declared
                // at the end of the function (which would be more logical and readable)
                function done (status, nativeStatusText, responses, headers) {
                    // Called once
                    if (state === 2) {
                        return;
                    }
                    // State is "done" now
                    state = 2;
                    // Clear timeout if it exists
                    if (timeoutTimer) {
                        clearTimeout(timeoutTimer);
                    }
                    // Dereference transport for early garbage collection
                    // (no matter how long the jqXHR object will be used)
                    transport = undefined;
                    // Cache response headers
                    responseHeadersString = headers || "";
                    // Set readyState
                    jqXHR.readyState                          = status > 0 ? 4 : 0;
                    var isSuccess, success, error, statusText = nativeStatusText, response = responses ? ajaxHandleResponses(s, jqXHR, responses) : undefined, lastModified, etag;
                    // If successful, handle type chaining
                    if (status >= 200 && status < 300 || status === 304) {
                        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                        if (s.ifModified) {
                            if (lastModified = jqXHR.getResponseHeader("Last-Modified")) {
                                __set$(jQuery.lastModified, ifModifiedKey, lastModified);
                            }
                            if (etag = jqXHR.getResponseHeader("Etag")) {
                                __set$(jQuery.etag, ifModifiedKey, etag);
                            }
                        }
                        // If not modified
                        if (status === 304) {
                            statusText = "notmodified";
                            isSuccess  = true;    // If we have data
                        }
                        else {
                            try {
                                success    = ajaxConvert(s, response);
                                statusText = "success";
                                isSuccess  = true;
                            } catch (e) {
                                // We have a parsererror
                                statusText = "parsererror";
                                error      = e;
                            }
                        }
                    }
                    else {
                        // We extract error from statusText
                        // then normalize statusText and status for non-aborts
                        error = statusText;
                        if (!statusText || status) {
                            statusText = "error";
                            if (status < 0) {
                                status = 0;
                            }
                        }
                    }
                    // Set data for the fake xhr object
                    jqXHR.status     = status;
                    jqXHR.statusText = "" + (nativeStatusText || statusText);
                    // Success/Error
                    if (isSuccess) {
                        deferred.resolveWith(callbackContext, [
                            success,
                            statusText,
                            jqXHR
                        ]);
                    }
                    else {
                        deferred.rejectWith(callbackContext, [
                            jqXHR,
                            statusText,
                            error
                        ]);
                    }
                    // Status-dependent callbacks
                    jqXHR.statusCode(statusCode);
                    statusCode       = undefined;
                    if (fireGlobals) {
                        globalEventContext.trigger("ajax" + (isSuccess ? "Success" : "Error"), [
                            jqXHR,
                            s,
                            isSuccess ? success : error
                        ]);
                    }
                    // Complete
                    completeDeferred.fireWith(callbackContext, [
                        jqXHR,
                        statusText
                    ]);
                    if (fireGlobals) {
                        globalEventContext.trigger("ajaxComplete", [
                            jqXHR,
                            s
                        ]);
                        // Handle the global AJAX counter
                        if (!--jQuery.active) {
                            jQuery.event.trigger("ajaxStop");
                        }
                    }
                }

                // Attach deferreds
                deferred.promise(jqXHR);
                jqXHR.success      = jqXHR.done;
                jqXHR.error        = jqXHR.fail;
                jqXHR.complete     = completeDeferred.add;
                // Status-dependent callbacks
                jqXHR.statusCode = function (map) {
                    if (map) {
                        var tmp;
                        if (state < 2) {
                            for (tmp in map) {
                                __set$(statusCode, tmp, [
                                    __get$(statusCode, tmp),
                                    __get$(map, tmp)
                                ]);
                            }
                        }
                        else {
                            tmp = __get$(map, jqXHR.status);
                            jqXHR.then(tmp, tmp);
                        }
                    }
                    return this;
                };
                // Remove hash character (#7531: and string promotion)
                // Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
                // We also use the url parameter if available
                s.url = ((url || s.url) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");
                // Extract dataTypes list
                s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().split(rspacesAjax);
                // Determine if a cross-domain request is in order
                if (s.crossDomain == null) {
                    parts         = rurl.exec(s.url.toLowerCase());
                    s.crossDomain = !!(parts && (parts[1] != ajaxLocParts[1] || parts[2] != ajaxLocParts[2] ||
                                                 (parts[3] || (parts[1] === "http:" ? 80 : 443)) !=
                                                 (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))));
                }
                // Convert data if not already a string
                if (__get$(s, "data") && s.processData && typeof __get$(s, "data") !== "string") {
                    __set$(s, "data", jQuery.param(__get$(s, "data"), s.traditional));
                }
                // Apply prefilters
                inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
                // If request was aborted inside a prefilter, stop there
                if (state === 2) {
                    return false;
                }
                // We can fire global events as of now if asked to
                fireGlobals = s.global;
                // Uppercase the type
                s.type = s.type.toUpperCase();
                // Determine if request has content
                s.hasContent = !rnoContent.test(s.type);
                // Watch for a new set of requests
                if (fireGlobals && jQuery.active++ === 0) {
                    jQuery.event.trigger("ajaxStart");
                }
                // More options handling for requests with no content
                if (!s.hasContent) {
                    // If data is available, append data to url
                    if (__get$(s, "data")) {
                        s.url = s.url + ((rquery.test(s.url) ? "&" : "?") + __get$(s, "data"));
                        // #9682: remove data so that it's not used in an eventual retry
                        delete s.data;
                    }
                    // Get ifModifiedKey before adding the anti-cache parameter
                    ifModifiedKey = s.url;
                    // Add anti-cache in url if needed
                    if (s.cache === false) {
                        var ts  = jQuery.now(),
                            // try replacing _= if it is there
                            ret = s.url.replace(rts, "$1_=" + ts);
                        // if nothing was replaced, add timestamp to the end
                        s.url = ret + (ret === s.url ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : "");
                    }
                }
                // Set the correct header, if data is being sent
                if (__get$(s, "data") && s.hasContent && s.contentType !== false || options.contentType) {
                    jqXHR.setRequestHeader("Content-Type", s.contentType);
                }
                // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                if (s.ifModified) {
                    ifModifiedKey = ifModifiedKey || s.url;
                    if (__get$(jQuery.lastModified, ifModifiedKey)) {
                        jqXHR.setRequestHeader("If-Modified-Since", __get$(jQuery.lastModified, ifModifiedKey));
                    }
                    if (__get$(jQuery.etag, ifModifiedKey)) {
                        jqXHR.setRequestHeader("If-None-Match", __get$(jQuery.etag, ifModifiedKey));
                    }
                }
                // Set the Accepts header for the server, depending on the dataType
                jqXHR.setRequestHeader("Accept", s.dataTypes[0] &&
                                                 __get$(s.accepts, s.dataTypes[0]) ? __get$(s.accepts, s.dataTypes[0]) +
                                                                                     (s.dataTypes[0] !== "*" ? ", " +
                                                                                     allTypes +
                                                                                     "; q=0.01" : "") : s.accepts["*"]);
                // Check for headers option
                for (i in s.headers) {
                    jqXHR.setRequestHeader(i, __get$(s.headers, i));
                }
                // Allow custom headers/mimetypes and early abort
                if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
                    // Abort if not done already
                    jqXHR.abort();
                    return false;
                }
                // Install callbacks on deferreds
                for (i in {
                    success:  1,
                    error:    1,
                    complete: 1
                }) {
                    __call$(jqXHR, i, [__get$(s, i)]);
                }
                // Get transport
                transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
                // If no transport, we auto-abort
                if (!transport) {
                    done(-1, "No Transport");
                }
                else {
                    jqXHR.readyState = 1;
                    // Send global event
                    if (fireGlobals) {
                        globalEventContext.trigger("ajaxSend", [
                            jqXHR,
                            s
                        ]);
                    }
                    // Timeout
                    if (s.async && s.timeout > 0) {
                        timeoutTimer = nativeMethods.setTimeout.call(window, __proc$Script(function () {
                            jqXHR.abort("timeout");
                        }), s.timeout);
                    }
                    try {
                        state = 1;
                        transport.send(requestHeaders, done);
                    } catch (e) {
                        // Propagate exception as error if not done
                        if (state < 2) {
                            done(-1, e);    // Simply rethrow otherwise
                        }
                        else {
                            throw e;
                        }
                    }
                }
                return jqXHR;
            },
            param:         function (a, traditional) {
                var s = [], add = function (key, value) {
                    // If value is a function, invoke it and return its value
                    value = jQuery.isFunction(value) ? value() : value;
                    __set$(s, s.length, encodeURIComponent(key) + "=" + encodeURIComponent(value));
                };
                // Set traditional to true for jQuery <= 1.3.2 behavior.
                if (traditional === undefined) {
                    traditional = jQuery.ajaxSettings.traditional;
                }
                // If an array was passed in, assume that it is an array of form elements.
                if (jQuery.isArray(a) || a.jquery && !jQuery.isPlainObject(a)) {
                    // Serialize the form elements
                    jQuery.each(a, function () {
                        add(this.name, __get$(this, "value"));
                    });
                }
                else {
                    // If traditional, encode the "old" way (the way 1.3.2 or older
                    // did it), otherwise encode params recursively.
                    for (var prefix in a) {
                        buildParams(prefix, __get$(a, prefix), traditional, add);
                    }
                }
                // Return the resulting serialization
                return s.join("&").replace(r20, "+");
            }
        });
        function buildParams (prefix, obj, traditional, add) {
            if (jQuery.isArray(obj)) {
                // Serialize array item.
                jQuery.each(obj, function (i, v) {
                    if (traditional || rbracket.test(prefix)) {
                        // Treat each array item as a scalar.
                        add(prefix, v);
                    }
                    else {
                        // If array item is non-scalar (array or object), encode its
                        // numeric index to resolve deserialization ambiguity issues.
                        // Note that rack (as of 1.0.0) can't currently deserialize
                        // nested arrays properly, and attempting to do so may cause
                        // a server error. Possible fixes are to modify rack's
                        // deserialization algorithm or to provide an option or flag
                        // to force array serialization to be shallow.
                        buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add);
                    }
                });
            }
            else if (!traditional && jQuery.type(obj) === "object") {
                // Serialize object item.
                for (var name in obj) {
                    buildParams(prefix + "[" + name + "]", __get$(obj, name), traditional, add);
                }
            }
            else {
                // Serialize scalar item.
                add(prefix, obj);
            }
        }

        // This is still on the jQuery object... for now
        // Want to move this to jQuery.ajax some day
        jQuery.extend({
            active:       0,
            lastModified: {},
            etag:         {}
        });
        /* Handles responses to an ajax request:
             * - sets all responseXXX fields accordingly
             * - finds the right dataType (mediates between content-type and expected dataType)
             * - returns the corresponding response
             */
        function ajaxHandleResponses (s, jqXHR, responses) {
            var contents = s.contents, dataTypes = s.dataTypes, responseFields = s.responseFields, ct, type, finalDataType, firstDataType;
            // Fill responseXXX fields
            for (type in responseFields) {
                if (type in responses) {
                    __set$(jqXHR, __get$(responseFields, type), __get$(responses, type));
                }
            }
            // Remove auto dataType and get content-type in the process
            while (dataTypes[0] === "*") {
                dataTypes.shift();
                if (ct === undefined) {
                    ct = s.mimeType || jqXHR.getResponseHeader("content-type");
                }
            }
            // Check if we're dealing with a known content-type
            if (ct) {
                for (type in contents) {
                    if (__get$(contents, type) && __get$(contents, type).test(ct)) {
                        dataTypes.unshift(type);
                        break;
                    }
                }
            }
            // Check to see if we have a response for the expected dataType
            if (dataTypes[0] in responses) {
                finalDataType = dataTypes[0];
            }
            else {
                // Try convertible dataTypes
                for (type in responses) {
                    if (!dataTypes[0] || __get$(s.converters, type + " " + dataTypes[0])) {
                        finalDataType = type;
                        break;
                    }
                    if (!firstDataType) {
                        firstDataType = type;
                    }
                }
                // Or just use first one
                finalDataType = finalDataType || firstDataType;
            }
            // If we found a dataType
            // We add the dataType to the list if needed
            // and return the corresponding response
            if (finalDataType) {
                if (finalDataType !== dataTypes[0]) {
                    dataTypes.unshift(finalDataType);
                }
                return __get$(responses, finalDataType);
            }
        }

        // Chain conversions given the request and the original response
        function ajaxConvert (s, response) {
            // Apply the dataFilter if provided
            if (s.dataFilter) {
                response = s.dataFilter(response, s.dataType);
            }
            var dataTypes = s.dataTypes, converters = {}, i, key, length = dataTypes.length, tmp,
                // Current and previous dataTypes
                current   = dataTypes[0], prev,
                // Conversion expression
                conversion,
                // Conversion function
                conv,
                // Conversion functions (transitive conversion)
                conv1, conv2;
            // For each dataType in the chain
            for (i = 1; i < length; i++) {
                // Create converters map
                // with lowercased keys
                if (i === 1) {
                    for (key in s.converters) {
                        if (typeof key === "string") {
                            __set$(converters, key.toLowerCase(), __get$(s.converters, key));
                        }
                    }
                }
                // Get the dataTypes
                prev    = current;
                current = __get$(dataTypes, i);
                // If current is auto dataType, update it to prev
                if (current === "*") {
                    current = prev;    // If no auto and dataTypes are actually different
                }
                else if (prev !== "*" && prev !== current) {
                    // Get the converter
                    conversion = prev + " " + current;
                    conv       = __get$(converters, conversion) || __get$(converters, "* " + current);
                    // If there is no direct converter, search transitively
                    if (!conv) {
                        conv2 = undefined;
                        for (conv1 in converters) {
                            tmp = conv1.split(" ");
                            if (tmp[0] === prev || tmp[0] === "*") {
                                conv2 = __get$(converters, tmp[1] + " " + current);
                                if (conv2) {
                                    conv1 = __get$(converters, conv1);
                                    if (conv1 === true) {
                                        conv = conv2;
                                    }
                                    else if (conv2 === true) {
                                        conv = conv1;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    // If we found no converter, dispatch an error
                    if (!(conv || conv2)) {
                        jQuery.error("No conversion from " + conversion.replace(" ", " to "));
                    }
                    // If found converter is not an equivalence
                    if (conv !== true) {
                        // Convert with 1 or 2 converters accordingly
                        response = conv ? conv(response) : conv2(conv1(response));
                    }
                }
            }
            return response;
        }

        var jsc              = jQuery.now(), jsre = /(\=)\?(&|$)|\?\?/i;
        // Default jsonp settings
        jQuery.ajaxSetup({
            jsonp:         "callback",
            jsonpCallback: function () {
                return jQuery.expando + "_" + jsc++;
            }
        });
        // Detect, normalize options and install callbacks for jsonp requests
        jQuery.ajaxPrefilter("json jsonp", function (s, originalSettings, jqXHR) {
            var inspectData = typeof __get$(s, "data") === "string" &&
                              /^application\/x\-www\-form\-urlencoded/.test(s.contentType);
            if (s.dataTypes[0] === "jsonp" ||
                s.jsonp !== false && (jsre.test(s.url) || inspectData && jsre.test(__get$(s, "data")))) {
                var responseContainer, jsonpCallback = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback, previous = __get$(window, jsonpCallback), url = s.url, data = __get$(s, "data"), replace = "$1" +
                                                                                                                                                                                                                                              jsonpCallback +
                                                                                                                                                                                                                                              "$2";
                if (s.jsonp !== false) {
                    url = url.replace(jsre, replace);
                    if (s.url === url) {
                        if (inspectData) {
                            data = data.replace(jsre, replace);
                        }
                        if (__get$(s, "data") === data) {
                            // Add callback manually
                            url = url + ((/\?/.test(url) ? "&" : "?") + s.jsonp + "=" + jsonpCallback);
                        }
                    }
                }
                s.url = url;
                __set$(s, "data", data);
                // Install callback
                __set$(window, jsonpCallback, function (response) {
                    responseContainer = [response];
                });
                // Clean-up function
                jqXHR.always(function () {
                    // Set callback back to previous value
                    __set$(window, jsonpCallback, previous);
                    // Call if it was a function and we have a response
                    if (responseContainer && jQuery.isFunction(previous)) {
                        __call$(window, jsonpCallback, [responseContainer[0]]);
                    }
                });
                // Use data converter to retrieve json after script execution
                s.converters["script json"] = function () {
                    if (!responseContainer) {
                        jQuery.error(jsonpCallback + " was not called");
                    }
                    return responseContainer[0];
                };
                // force json dataType
                s.dataTypes[0] = "json";
                // Delegate to script
                return "script";
            }
        });
        // Install script dataType
        jQuery.ajaxSetup({
            accepts:    { script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript" },
            contents:   { script: /javascript|ecmascript/ },
            converters: {
                "text script": function (text) {
                    jQuery.globalEval(text);
                    return text;
                }
            }
        });
        // Handle cache's special case and global
        jQuery.ajaxPrefilter("script", function (s) {
            if (s.cache === undefined) {
                s.cache = false;
            }
            if (s.crossDomain) {
                s.type   = "GET";
                s.global = false;
            }
        });
        // Bind script tag hack transport
        jQuery.ajaxTransport("script", function (s) {
            // This transport only deals with cross domain requests
            if (s.crossDomain) {
                var script, head = document.head || document.getElementsByTagName("head")[0] ||
                                   document.documentElement;
                return {
                    send:  function (_, callback) {
                        script       = document.createElement("script");
                        script.async = "async";
                        if (s.scriptCharset) {
                            script.charset = s.scriptCharset;
                        }
                        __set$(script, "src", s.url);
                        // Attach handlers for all browsers
                        script.onload = script.onreadystatechange = function (_, isAbort) {
                            if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
                                // Handle memory leak in IE
                                script.onload = script.onreadystatechange = null;
                                // Remove the script
                                if (head && script.parentNode) {
                                    head.removeChild(script);
                                }
                                // Dereference the script
                                script = undefined;
                                // Callback if not abort
                                if (!isAbort) {
                                    callback(200, "success");
                                }
                            }
                        };
                        // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
                        // This arises when a base node is used (#2709 and #4378).
                        head.insertBefore(script, head.firstChild);
                    },
                    abort: function () {
                        if (script) {
                            script.onload(0, 1);
                        }
                    }
                };
            }
        });
        var
            // #5280: Internet Explorer will keep connections alive if we don't abort on unload
            xhrOnUnloadAbort = window.ActiveXObject ? function () {
                // Abort all pending requests
                for (var key in xhrCallbacks) {
                    __call$(xhrCallbacks, key, [
                        0,
                        1
                    ]);
                }
            } : false, xhrId = 0, xhrCallbacks;
        // Functions to create xhrs
        function createStandardXHR () {
            try {
                return new window.XMLHttpRequest();
            } catch (e) {
            }
        }

        function createActiveXHR () {
            try {
                return new window.ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {
            }
        }

        // Create the request object
        // (This is still attached to ajaxSettings for backward compatibility)
        jQuery.ajaxSettings.xhr = window.ActiveXObject ? function () {
            return !this.isLocal && createStandardXHR() || createActiveXHR();
        } : createStandardXHR;
        // Determine support properties
        (function (xhr) {
            jQuery.extend(jQuery.support, {
                ajax: !!xhr,
                cors: !!xhr && "withCredentials" in xhr
            });
        }(jQuery.ajaxSettings.xhr()));
        // Create transport if the browser can provide an xhr
        if (jQuery.support.ajax) {
            jQuery.ajaxTransport(function (s) {
                // Cross domain only allowed if supported through XMLHttpRequest
                if (!s.crossDomain || jQuery.support.cors) {
                    var callback;
                    return {
                        send:  function (headers, complete) {
                            // Get a new xhr
                            var xhr = s.xhr(), handle, i;
                            // Open the socket
                            // Passing null username, generates a login popup on Opera (#2865)
                            if (s.username) {
                                xhr.open(s.type, s.url, s.async, s.username, s.password);
                            }
                            else {
                                xhr.open(s.type, s.url, s.async);
                            }
                            // Apply custom fields if provided
                            if (s.xhrFields) {
                                for (i in s.xhrFields) {
                                    __set$(xhr, i, __get$(s.xhrFields, i));
                                }
                            }
                            // Override mime type if needed
                            if (s.mimeType && xhr.overrideMimeType) {
                                xhr.overrideMimeType(s.mimeType);
                            }
                            // X-Requested-With header
                            // For cross-domain requests, seeing as conditions for a preflight are
                            // akin to a jigsaw puzzle, we simply never set it to be sure.
                            // (it can always be set on a per-request basis or even using ajaxSetup)
                            // For same-domain requests, won't change header if already provided.
                            if (!s.crossDomain && !headers["X-Requested-With"]) {
                                headers["X-Requested-With"] = "XMLHttpRequest";
                            }
                            // Need an extra try/catch for cross domain requests in Firefox 3
                            try {
                                for (i in headers) {
                                    xhr.setRequestHeader(i, __get$(headers, i));
                                }
                            } catch (_) {
                            }
                            // Do send the request
                            // This may raise an exception which is actually
                            // handled in jQuery.ajax (so no try/catch here)
                            xhr.send(s.hasContent && __get$(s, "data") || null);
                            // Listener
                            callback = function (_, isAbort) {
                                var status, statusText, responseHeaders, responses, xml;
                                // Firefox throws exceptions when accessing properties
                                // of an xhr when a network error occured
                                // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
                                try {
                                    // Was never called and is aborted or complete
                                    if (callback && (isAbort || xhr.readyState === 4)) {
                                        // Only called once
                                        callback = undefined;
                                        // Do not keep as active anymore
                                        if (handle) {
                                            xhr.onreadystatechange = jQuery.noop;
                                            if (xhrOnUnloadAbort) {
                                                delete xhrCallbacks[handle];
                                            }
                                        }
                                        // If it's an abort
                                        if (isAbort) {
                                            // Abort it manually if needed
                                            if (xhr.readyState !== 4) {
                                                xhr.abort();
                                            }
                                        }
                                        else {
                                            status          = xhr.status;
                                            responseHeaders = xhr.getAllResponseHeaders();
                                            responses       = {};
                                            xml             = xhr.responseXML;
                                            // Construct response list
                                            if (xml && xml.documentElement) {
                                                responses.xml = xml;
                                            }
                                            // When requesting binary data, IE6-9 will throw an exception
                                            // on any attempt to access responseText (#11426)
                                            try {
                                                __set$(responses, "text", xhr.responseText);
                                            } catch (_) {
                                            }
                                            // Firefox throws an exception when accessing
                                            // statusText for faulty cross-domain requests
                                            try {
                                                statusText = xhr.statusText;
                                            } catch (e) {
                                                // We normalize with Webkit giving an empty statusText
                                                statusText = "";
                                            }
                                            // Filter status for non standard behaviors
                                            // If the request is local and we have data: assume a success
                                            // (success with no data won't get notified, that's the best we
                                            // can do given current implementations)
                                            if (!status && s.isLocal && !s.crossDomain) {
                                                status = __get$(responses, "text") ? 200 : 404;    // IE - #1450: sometimes returns 1223 when it should be 204
                                            }
                                            else if (status === 1223) {
                                                status = 204;
                                            }
                                        }
                                    }
                                } catch (firefoxAccessException) {
                                    if (!isAbort) {
                                        complete(-1, firefoxAccessException);
                                    }
                                }
                                // Call complete if needed
                                if (responses) {
                                    complete(status, statusText, responses, responseHeaders);
                                }
                            };
                            // if we're in sync mode or it's in cache
                            // and has been retrieved directly (IE6 & IE7)
                            // we need to manually fire the callback
                            if (!s.async || xhr.readyState === 4) {
                                callback();
                            }
                            else {
                                handle = ++xhrId;
                                if (xhrOnUnloadAbort) {
                                    // Create the active xhrs callbacks list if needed
                                    // and attach the unload handler
                                    if (!xhrCallbacks) {
                                        xhrCallbacks = {};
                                        jQuery(window).unload(xhrOnUnloadAbort);
                                    }
                                    // Add to list of active xhrs callbacks
                                    __set$(xhrCallbacks, handle, callback);
                                }
                                xhr.onreadystatechange = callback;
                            }
                        },
                        abort: function () {
                            if (callback) {
                                callback(0, 1);
                            }
                        }
                    };
                }
            });
        }
        var elemdisplay     = {}, iframe, iframeDoc, rfxtypes = /^(?:toggle|show|hide)$/, rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i, timerId, fxAttrs = [
            [
                "height",
                "marginTop",
                "marginBottom",
                "paddingTop",
                "paddingBottom"
            ],
            [
                "width",
                "marginLeft",
                "marginRight",
                "paddingLeft",
                "paddingRight"
            ],
            ["opacity"]
        ], fxNow;
        jQuery.fn.extend({
            show:    function (speed, easing, callback) {
                var elem, display;
                if (speed || speed === 0) {
                    return this.animate(genFx("show", 3), speed, easing, callback);
                }
                else {
                    for (var i = 0, j = this.length; i < j; i++) {
                        elem = __get$(this, i);
                        if (elem.style) {
                            display = elem.style.display;
                            // Reset the inline display of this element to learn if it is
                            // being hidden by cascaded rules or not
                            if (!jQuery._data(elem, "olddisplay") && display === "none") {
                                display = elem.style.display = "";
                            }
                            // Set elements which have been overridden with display: none
                            // in a stylesheet to whatever the default browser style is
                            // for such an element
                            if (display === "" && jQuery.css(elem, "display") === "none" ||
                                !jQuery.contains(elem.ownerDocument.documentElement, elem)) {
                                jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
                            }
                        }
                    }
                    // Set the display of most of the elements in a second loop
                    // to avoid the constant reflow
                    for (i = 0; i < j; i++) {
                        elem = __get$(this, i);
                        if (elem.style) {
                            display = elem.style.display;
                            if (display === "" || display === "none") {
                                elem.style.display = jQuery._data(elem, "olddisplay") || "";
                            }
                        }
                    }
                    return this;
                }
            },
            hide:    function (speed, easing, callback) {
                if (speed || speed === 0) {
                    return this.animate(genFx("hide", 3), speed, easing, callback);
                }
                else {
                    var elem, display, i = 0, j = this.length;
                    for (; i < j; i++) {
                        elem = __get$(this, i);
                        if (elem.style) {
                            display = jQuery.css(elem, "display");
                            if (display !== "none" && !jQuery._data(elem, "olddisplay")) {
                                jQuery._data(elem, "olddisplay", display);
                            }
                        }
                    }
                    // Set the display of the elements in a second loop
                    // to avoid the constant reflow
                    for (i = 0; i < j; i++) {
                        if (__get$(this, i).style) {
                            __get$(this, i).style.display = "none";
                        }
                    }
                    return this;
                }
            },
            _toggle: jQuery.fn.toggle,
            toggle:  function (fn, fn2, callback) {
                var bool = typeof fn === "boolean";
                if (jQuery.isFunction(fn) && jQuery.isFunction(fn2)) {
                    this._toggle.apply(this, arguments);
                }
                else if (fn == null || bool) {
                    this.each(function () {
                        var state = bool ? fn : jQuery(this).is(":hidden");
                        __call$(jQuery(this), state ? "show" : "hide", []);
                    });
                }
                else {
                    this.animate(genFx("toggle", 3), fn, fn2, callback);
                }
                return this;
            },
            fadeTo:  function (speed, to, easing, callback) {
                return this.filter(":hidden").css("opacity", 0).show().end().animate({ opacity: to }, speed, easing, callback);
            },
            animate: function (prop, speed, easing, callback) {
                var optall = jQuery.speed(speed, easing, callback);
                if (jQuery.isEmptyObject(prop)) {
                    return this.each(optall.complete, [false]);
                }
                // Do not change referenced properties as per-property easing will be lost
                prop = jQuery.extend({}, prop);
                function doAnimation () {
                    // XXX 'this' does not always have a nodeName when running the
                    // test suite
                    if (optall.queue === false) {
                        jQuery._mark(this);
                    }
                    var opt = jQuery.extend({}, optall), isElement = this.nodeType === 1, hidden = isElement &&
                                                                                                   jQuery(this).is(":hidden"), name, val, p, e, hooks, replace, parts, start, end, unit, method;
                    // will store per property easing and be used to determine when an animation is complete
                    opt.animatedProperties = {};
                    // first pass over propertys to expand / normalize
                    for (p in prop) {
                        name = jQuery.camelCase(p);
                        if (p !== name) {
                            __set$(prop, name, __get$(prop, p));
                            delete prop[p];
                        }
                        if ((hooks = __get$(jQuery.cssHooks, name)) && "expand" in hooks) {
                            replace = hooks.expand(__get$(prop, name));
                            delete prop[name];
                            // not quite $.extend, this wont overwrite keys already present.
                            // also - reusing 'p' from above because we have the correct "name"
                            for (p in replace) {
                                if (!(p in prop)) {
                                    __set$(prop, p, __get$(replace, p));
                                }
                            }
                        }
                    }
                    for (name in prop) {
                        val = __get$(prop, name);
                        // easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
                        if (jQuery.isArray(val)) {
                            __set$(opt.animatedProperties, name, val[1]);
                            val = __set$(prop, name, val[0]);
                        }
                        else {
                            __set$(opt.animatedProperties, name, opt.specialEasing && __get$(opt.specialEasing, name) ||
                                                                 opt.easing || "swing");
                        }
                        if (val === "hide" && hidden || val === "show" && !hidden) {
                            return opt.complete.call(this);
                        }
                        if (isElement && (name === "height" || name === "width")) {
                            // Make sure that nothing sneaks out
                            // Record all 3 overflow attributes because IE does not
                            // change the overflow attribute when overflowX and
                            // overflowY are set to the same value
                            opt.overflow = [
                                this.style.overflow,
                                this.style.overflowX,
                                this.style.overflowY
                            ];
                            // Set display property to inline-block for height/width
                            // animations on inline elements that are having width/height animated
                            if (jQuery.css(this, "display") === "inline" && jQuery.css(this, "float") === "none") {
                                // inline-level elements accept inline-block;
                                // block-level elements need to be inline with layout
                                if (!jQuery.support.inlineBlockNeedsLayout ||
                                    defaultDisplay(this.nodeName) === "inline") {
                                    this.style.display = "inline-block";
                                }
                                else {
                                    this.style.zoom = 1;
                                }
                            }
                        }
                    }
                    if (opt.overflow != null) {
                        this.style.overflow = "hidden";
                    }
                    for (p in prop) {
                        e   = new jQuery.fx(this, opt, p);
                        val = __get$(prop, p);
                        if (rfxtypes.test(val)) {
                            // Tracks whether to show or hide based on private
                            // data attached to the element
                            method = jQuery._data(this, "toggle" + p) ||
                                     (val === "toggle" ? hidden ? "show" : "hide" : 0);
                            if (method) {
                                jQuery._data(this, "toggle" + p, method === "show" ? "hide" : "show");
                                __call$(e, method, []);
                            }
                            else {
                                __call$(e, val, []);
                            }
                        }
                        else {
                            parts = rfxnum.exec(val);
                            start = e.cur();
                            if (parts) {
                                end  = parseFloat(parts[2]);
                                unit = parts[3] || (__get$(jQuery.cssNumber, p) ? "" : "px");
                                // We need to compute starting value
                                if (unit !== "px") {
                                    jQuery.style(this, p, (end || 1) + unit);
                                    start = (end || 1) / e.cur() * start;
                                    jQuery.style(this, p, start + unit);
                                }
                                // If a +=/-= token was provided, we're doing a relative animation
                                if (parts[1]) {
                                    end = (parts[1] === "-=" ? -1 : 1) * end + start;
                                }
                                e.custom(start, end, unit);
                            }
                            else {
                                e.custom(start, val, "");
                            }
                        }
                    }
                    // For JS strict compliance
                    return true;
                }

                return optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
            },
            stop:    function (type, clearQueue, gotoEnd) {
                if (typeof type !== "string") {
                    gotoEnd    = clearQueue;
                    clearQueue = type;
                    type       = undefined;
                }
                if (clearQueue && type !== false) {
                    this.queue(type || "fx", []);
                }
                return this.each(function () {
                    var index, hadTimers = false, timers = jQuery.timers, data = jQuery._data(this);
                    // clear marker counters if we know they won't be
                    if (!gotoEnd) {
                        jQuery._unmark(true, this);
                    }
                    function stopQueue (elem, data, index) {
                        var hooks = __get$(data, index);
                        jQuery.removeData(elem, index, true);
                        hooks.stop(gotoEnd);
                    }

                    if (type == null) {
                        for (index in data) {
                            if (__get$(data, index) && __get$(data, index).stop &&
                                index.indexOf(".run") === index.length - 4) {
                                stopQueue(this, data, index);
                            }
                        }
                    }
                    else if (__get$(data, index = type + ".run") && __get$(data, index).stop) {
                        stopQueue(this, data, index);
                    }
                    for (index = timers.length; index--;) {
                        if (__get$(timers, index).elem === this &&
                            (type == null || __get$(timers, index).queue === type)) {
                            if (gotoEnd) {
                                // force the next step to be the last
                                __call$(timers, index, [true]);
                            }
                            else {
                                __get$(timers, index).saveState();
                            }
                            hadTimers = true;
                            timers.splice(index, 1);
                        }
                    }
                    // start the next in the queue if the last step wasn't forced
                    // timers currently will call their complete callbacks, which will dequeue
                    // but only if they were gotoEnd
                    if (!(gotoEnd && hadTimers)) {
                        jQuery.dequeue(this, type);
                    }
                });
            }
        });
        // Animations created synchronously will run synchronously
        function createFxNow () {
            nativeMethods.setTimeout.call(window, __proc$Script(clearFxNow), 0);
            return fxNow = jQuery.now();
        }

        function clearFxNow () {
            fxNow = undefined;
        }

        // Generate parameters to create a standard animation
        function genFx (type, num) {
            var obj = {};
            jQuery.each(fxAttrs.concat.apply([], fxAttrs.slice(0, num)), function () {
                __set$(obj, this, type);
            });
            return obj;
        }

        // Generate shortcuts for custom animations
        jQuery.each({
            slideDown:   genFx("show", 1),
            slideUp:     genFx("hide", 1),
            slideToggle: genFx("toggle", 1),
            fadeIn:      { opacity: "show" },
            fadeOut:     { opacity: "hide" },
            fadeToggle:  { opacity: "toggle" }
        }, function (name, props) {
            __set$(jQuery.fn, name, function (speed, easing, callback) {
                return this.animate(props, speed, easing, callback);
            });
        });
        jQuery.extend({
            speed:  function (speed, easing, fn) {
                var opt      = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
                    complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
                    duration: speed,
                    easing:   fn && easing || easing && !jQuery.isFunction(easing) && easing
                };
                opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration : opt.duration in
                                                                                                     jQuery.fx.speeds ? __get$(jQuery.fx.speeds, opt.duration) : jQuery.fx.speeds._default;
                // normalize opt.queue - true/undefined/null -> "fx"
                if (opt.queue == null || opt.queue === true) {
                    opt.queue = "fx";
                }
                // Queueing
                opt.old      = opt.complete;
                opt.complete = function (noUnmark) {
                    if (jQuery.isFunction(opt.old)) {
                        opt.old.call(this);
                    }
                    if (opt.queue) {
                        jQuery.dequeue(this, opt.queue);
                    }
                    else if (noUnmark !== false) {
                        jQuery._unmark(this);
                    }
                };
                return opt;
            },
            easing: {
                linear: function (p) {
                    return p;
                },
                swing:  function (p) {
                    return -Math.cos(p * Math.PI) / 2 + 0.5;
                }
            },
            timers: [],
            fx:     function (elem, options, prop) {
                this.options = options;
                this.elem    = elem;
                this.prop    = prop;
                options.orig = options.orig || {};
            }
        });
        jQuery.fx.prototype = {
            update: function () {
                if (this.options.step) {
                    this.options.step.call(this.elem, this.now, this);
                }
                (__get$(jQuery.fx.step, this.prop) || jQuery.fx.step._default)(this);
            },
            cur:    function () {
                if (__get$(this.elem, this.prop) != null &&
                    (!this.elem.style || __get$(this.elem.style, this.prop) == null)) {
                    return __get$(this.elem, this.prop);
                }
                var parsed, r = jQuery.css(this.elem, this.prop);
                // Empty strings, null, undefined and "auto" are converted to 0,
                // complex values such as "rotate(1rad)" are returned as is,
                // simple values such as "10px" are parsed to Float.
                return isNaN(parsed = parseFloat(r)) ? !r || r === "auto" ? 0 : r : parsed;
            },
            custom: function (from, to, unit) {
                var self       = this, fx = jQuery.fx;
                this.startTime = fxNow || createFxNow();
                this.end       = to;
                this.now       = this.start = from;
                this.pos = this.state = 0;
                this.unit = unit || this.unit || (__get$(jQuery.cssNumber, this.prop) ? "" : "px");
                function t (gotoEnd) {
                    return self.step(gotoEnd);
                }

                t.queue     = this.options.queue;
                t.elem      = this.elem;
                t.saveState = function () {
                    if (jQuery._data(self.elem, "fxshow" + self.prop) === undefined) {
                        if (self.options.hide) {
                            jQuery._data(self.elem, "fxshow" + self.prop, self.start);
                        }
                        else if (self.options.show) {
                            jQuery._data(self.elem, "fxshow" + self.prop, self.end);
                        }
                    }
                };
                if (t() && jQuery.timers.push(t) && !timerId) {
                    timerId = nativeMethods.setInterval.call(window, __proc$Script(fx.tick), fx.interval);
                }
            },
            show:   function () {
                var dataShow      = jQuery._data(this.elem, "fxshow" + this.prop);
                // Remember where we started, so that we can go back to it later
                __set$(this.options.orig, this.prop, dataShow || jQuery.style(this.elem, this.prop));
                this.options.show = true;
                // Begin the animation
                // Make sure that we start at a small width/height to avoid any flash of content
                if (dataShow !== undefined) {
                    // This show is picking up where a previous hide or show left off
                    this.custom(this.cur(), dataShow);
                }
                else {
                    this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());
                }
                // Start by showing the element
                jQuery(this.elem).show();
            },
            hide:   function () {
                // Remember where we started, so that we can go back to it later
                __set$(this.options.orig, this.prop, jQuery._data(this.elem, "fxshow" + this.prop) ||
                                                     jQuery.style(this.elem, this.prop));
                this.options.hide = true;
                // Begin the animation
                this.custom(this.cur(), 0);
            },
            step:   function (gotoEnd) {
                var p, n, complete, t = fxNow || createFxNow(), done = true, elem = this.elem, options = this.options;
                if (gotoEnd || t >= options.duration + this.startTime) {
                    this.now = this.end;
                    this.pos = this.state = 1;
                    this.update();
                    __set$(options.animatedProperties, this.prop, true);
                    for (p in options.animatedProperties) {
                        if (__get$(options.animatedProperties, p) !== true) {
                            done = false;
                        }
                    }
                    if (done) {
                        // Reset the overflow
                        if (options.overflow != null && !jQuery.support.shrinkWrapBlocks) {
                            jQuery.each([
                                "",
                                "X",
                                "Y"
                            ], function (index, value) {
                                __set$(elem.style, "overflow" + value, __get$(options.overflow, index));
                            });
                        }
                        // Hide the element if the "hide" operation was done
                        if (options.hide) {
                            jQuery(elem).hide();
                        }
                        // Reset the properties, if the item has been hidden or shown
                        if (options.hide || options.show) {
                            for (p in options.animatedProperties) {
                                jQuery.style(elem, p, __get$(options.orig, p));
                                jQuery.removeData(elem, "fxshow" + p, true);
                                // Toggle data is no longer needed
                                jQuery.removeData(elem, "toggle" + p, true);
                            }
                        }
                        // Execute the complete function
                        // in the event that the complete function throws an exception
                        // we must ensure it won't be called twice. #5684
                        complete = options.complete;
                        if (complete) {
                            options.complete = false;
                            complete.call(elem);
                        }
                    }
                    return false;
                }
                else {
                    // classical easing cannot be used with an Infinity duration
                    if (options.duration == Infinity) {
                        this.now = t;
                    }
                    else {
                        n          = t - this.startTime;
                        this.state = n / options.duration;
                        // Perform the easing function, defaults to swing
                        this.pos = __call$(jQuery.easing, __get$(options.animatedProperties, this.prop), [
                            this.state,
                            n,
                            0,
                            1,
                            options.duration
                        ]);
                        this.now = this.start + (this.end - this.start) * this.pos;
                    }
                    // Perform the next step of the animation
                    this.update();
                }
                return true;
            }
        };
        jQuery.extend(jQuery.fx, {
            tick:     function () {
                var timer, timers = jQuery.timers, i = 0;
                for (; i < timers.length; i++) {
                    timer = __get$(timers, i);
                    // Checks the timer has not already been removed
                    if (!timer() && __get$(timers, i) === timer) {
                        timers.splice(i--, 1);
                    }
                }
                if (!timers.length) {
                    jQuery.fx.stop();
                }
            },
            interval: 13,
            stop:     function () {
                clearInterval(timerId);
                timerId = null;
            },
            speeds:   {
                slow:     600,
                fast:     200,
                _default: 400
            },
            step:     {
                opacity:  function (fx) {
                    jQuery.style(fx.elem, "opacity", fx.now);
                },
                _default: function (fx) {
                    if (fx.elem.style && __get$(fx.elem.style, fx.prop) != null) {
                        __set$(fx.elem.style, fx.prop, fx.now + fx.unit);
                    }
                    else {
                        __set$(fx.elem, fx.prop, fx.now);
                    }
                }
            }
        });
        // Ensure props that can't be negative don't go there on undershoot easing
        jQuery.each(fxAttrs.concat.apply([], fxAttrs), function (i, prop) {
            // exclude marginTop, marginLeft, marginBottom and marginRight from this list
            if (prop.indexOf("margin")) {
                __set$(jQuery.fx.step, prop, function (fx) {
                    jQuery.style(fx.elem, prop, Math.max(0, fx.now) + fx.unit);
                });
            }
        });
        if (jQuery.expr && jQuery.expr.filters) {
            jQuery.expr.filters.animated = function (elem) {
                return jQuery.grep(jQuery.timers, function (fn) {
                    return elem === fn.elem;
                }).length;
            };
        }
        // Try to restore the default display value of an element
        function defaultDisplay (nodeName) {
            if (!__get$(elemdisplay, nodeName)) {
                var body = document.body, elem = jQuery("<" + nodeName +
                                                        ">").appendTo(body), display = elem.css("display");
                elem.remove();
                // If the simple way fails,
                // get element's real default display by attaching it to a temp iframe
                if (display === "none" || display === "") {
                    // No iframe to use yet, so create it
                    if (!iframe) {
                        iframe             = document.createElement("iframe");
                        iframe.frameBorder = iframe.width = iframe.height = 0;
                    }
                    body.appendChild(iframe);
                    // Create a cacheable copy of the iframe document on first call.
                    // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
                    // document to it; WebKit & Firefox won't allow reusing the iframe document.
                    if (!iframeDoc || !iframe.createElement) {
                        iframeDoc = (iframe.contentWindow || iframe.contentDocument).document;
                        iframeDoc.write((jQuery.support.boxModel ? "<!doctype html>" : "") + "<html><body>");
                        iframeDoc.close();
                    }
                    elem    = iframeDoc.createElement(nodeName);
                    iframeDoc.body.appendChild(elem);
                    display = jQuery.css(elem, "display");
                    body.removeChild(iframe);
                }
                // Store the correct default display
                __set$(elemdisplay, nodeName, display);
            }
            return __get$(elemdisplay, nodeName);
        }

        var getOffset, rtable = /^t(?:able|d|h)$/i, rroot = /^(?:body|html)$/i;
        if ("getBoundingClientRect" in document.documentElement) {
            getOffset = function (elem, doc, docElem, box) {
                try {
                    box = elem.getBoundingClientRect();
                } catch (e) {
                }
                // Make sure we're not dealing with a disconnected DOM node
                if (!box || !jQuery.contains(docElem, elem)) {
                    return box ? {
                        top:  box.top,
                        left: box.left
                    } : {
                        top:  0,
                        left: 0
                    };
                }
                var body = doc.body, win = getWindow(doc), clientTop = docElem.clientTop || body.clientTop ||
                                                                       0, clientLeft = docElem.clientLeft ||
                                                                                       body.clientLeft ||
                                                                                       0, scrollTop = win.pageYOffset ||
                                                                                                      jQuery.support.boxModel &&
                                                                                                      docElem.scrollTop ||
                                                                                                      body.scrollTop, scrollLeft = win.pageXOffset ||
                                                                                                                                   jQuery.support.boxModel &&
                                                                                                                                   docElem.scrollLeft ||
                                                                                                                                   body.scrollLeft, top = box.top +
                                                                                                                                                          scrollTop -
                                                                                                                                                          clientTop, left = box.left +
                                                                                                                                                                            scrollLeft -
                                                                                                                                                                            clientLeft;
                return {
                    top:  top,
                    left: left
                };
            };
        }
        else {
            getOffset = function (elem, doc, docElem) {
                var computedStyle, offsetParent = elem.offsetParent, prevOffsetParent = elem, body = doc.body, defaultView = doc.defaultView, prevComputedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle, top = elem.offsetTop, left = elem.offsetLeft;
                while ((elem = elem.parentNode) && elem !== body && elem !== docElem) {
                    if (jQuery.support.fixedPosition && prevComputedStyle.position === "fixed") {
                        break;
                    }
                    computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
                    top -= elem.scrollTop;
                    left -= elem.scrollLeft;
                    if (elem === offsetParent) {
                        top  = top + elem.offsetTop;
                        left = left + elem.offsetLeft;
                        if (jQuery.support.doesNotAddBorder &&
                            !(jQuery.support.doesAddBorderForTableAndCells && rtable.test(elem.nodeName))) {
                            top  = top + (parseFloat(computedStyle.borderTopWidth) || 0);
                            left = left + (parseFloat(computedStyle.borderLeftWidth) || 0);
                        }
                        prevOffsetParent = offsetParent;
                        offsetParent     = elem.offsetParent;
                    }
                    if (jQuery.support.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible") {
                        top  = top + (parseFloat(computedStyle.borderTopWidth) || 0);
                        left = left + (parseFloat(computedStyle.borderLeftWidth) || 0);
                    }
                    prevComputedStyle = computedStyle;
                }
                if (prevComputedStyle.position === "relative" || prevComputedStyle.position === "static") {
                    top  = top + body.offsetTop;
                    left = left + body.offsetLeft;
                }
                if (jQuery.support.fixedPosition && prevComputedStyle.position === "fixed") {
                    top  = top + Math.max(docElem.scrollTop, body.scrollTop);
                    left = left + Math.max(docElem.scrollLeft, body.scrollLeft);
                }
                return {
                    top:  top,
                    left: left
                };
            };
        }
        jQuery.fn.offset = function (options) {
            if (arguments.length) {
                return options === undefined ? this : this.each(function (i) {
                    jQuery.offset.setOffset(this, options, i);
                });
            }
            var elem = this[0], doc = elem && elem.ownerDocument;
            if (!doc) {
                return null;
            }
            if (elem === doc.body) {
                return jQuery.offset.bodyOffset(elem);
            }
            return getOffset(elem, doc, doc.documentElement);
        };
        jQuery.offset    = {
            bodyOffset: function (body) {
                var top = body.offsetTop, left = body.offsetLeft;
                if (jQuery.support.doesNotIncludeMarginInBodyOffset) {
                    top  = top + (parseFloat(jQuery.css(body, "marginTop")) || 0);
                    left = left + (parseFloat(jQuery.css(body, "marginLeft")) || 0);
                }
                return {
                    top:  top,
                    left: left
                };
            },
            setOffset:  function (elem, options, i) {
                var position = jQuery.css(elem, "position");
                // set position first, in-case top/left are set even on static elem
                if (position === "static") {
                    elem.style.position = "relative";
                }
                var curElem = jQuery(elem), curOffset = curElem.offset(), curCSSTop = jQuery.css(elem, "top"), curCSSLeft = jQuery.css(elem, "left"), calculatePosition = (position ===
                                                                                                                                                                           "absolute" ||
                                                                                                                                                                           position ===
                                                                                                                                                                           "fixed") &&
                                                                                                                                                                          jQuery.inArray("auto", [
                                                                                                                                                                              curCSSTop,
                                                                                                                                                                              curCSSLeft
                                                                                                                                                                          ]) >
                                                                                                                                                                          -1, props = {}, curPosition = {}, curTop, curLeft;
                // need to be able to calculate position if either top or left is auto and position is either absolute or fixed
                if (calculatePosition) {
                    curPosition = curElem.position();
                    curTop      = curPosition.top;
                    curLeft     = curPosition.left;
                }
                else {
                    curTop  = parseFloat(curCSSTop) || 0;
                    curLeft = parseFloat(curCSSLeft) || 0;
                }
                if (jQuery.isFunction(options)) {
                    options = options.call(elem, i, curOffset);
                }
                if (options.top != null) {
                    props.top = options.top - curOffset.top + curTop;
                }
                if (options.left != null) {
                    props.left = options.left - curOffset.left + curLeft;
                }
                if ("using" in options) {
                    options.using.call(elem, props);
                }
                else {
                    curElem.css(props);
                }
            }
        };
        jQuery.fn.extend({
            position:     function () {
                if (!this[0]) {
                    return null;
                }
                var elem         = this[0],
                    // Get *real* offsetParent
                    offsetParent = this.offsetParent(),
                    // Get correct offsets
                    offset       = this.offset(), parentOffset = rroot.test(offsetParent[0].nodeName) ? {
                        top:  0,
                        left: 0
                    } : offsetParent.offset();
                // Subtract element margins
                // note: when an element has margin: auto the offsetLeft and marginLeft
                // are the same in Safari causing offset.left to incorrectly be 0
                offset.top -= parseFloat(jQuery.css(elem, "marginTop")) || 0;
                offset.left -= parseFloat(jQuery.css(elem, "marginLeft")) || 0;
                // Add offsetParent borders
                parentOffset.top  = parentOffset.top + (parseFloat(jQuery.css(offsetParent[0], "borderTopWidth")) || 0);
                parentOffset.left = parentOffset.left +
                                    (parseFloat(jQuery.css(offsetParent[0], "borderLeftWidth")) || 0);
                // Subtract the two offsets
                return {
                    top:  offset.top - parentOffset.top,
                    left: offset.left - parentOffset.left
                };
            },
            offsetParent: function () {
                return this.map(function () {
                    var offsetParent = this.offsetParent || document.body;
                    while (offsetParent &&
                           (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static")) {
                        offsetParent = offsetParent.offsetParent;
                    }
                    return offsetParent;
                });
            }
        });
        // Create scrollLeft and scrollTop methods
        jQuery.each({
            scrollLeft: "pageXOffset",
            scrollTop:  "pageYOffset"
        }, function (method, prop) {
            var top = /Y/.test(prop);
            __set$(jQuery.fn, method, function (val) {
                return jQuery.access(this, function (elem, method, val) {
                    var win = getWindow(elem);
                    if (val === undefined) {
                        return win ? prop in win ? __get$(win, prop) : jQuery.support.boxModel &&
                                                                       __get$(win.document.documentElement, method) ||
                                                                       __get$(win.document.body, method) : __get$(elem, method);
                    }
                    if (win) {
                        win.scrollTo(!top ? val : jQuery(win).scrollLeft(), top ? val : jQuery(win).scrollTop());
                    }
                    else {
                        __set$(elem, method, val);
                    }
                }, method, val, arguments.length, null);
            });
        });
        function getWindow (elem) {
            return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 ? elem.defaultView || elem.parentWindow : false;
        }

        // Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
        jQuery.each({
            Height: "height",
            Width:  "width"
        }, function (name, type) {
            var clientProp = "client" + name, scrollProp = "scroll" + name, offsetProp = "offset" + name;
            // innerHeight and innerWidth
            __set$(jQuery.fn, "inner" + name, function () {
                var elem = this[0];
                return elem ? elem.style ? parseFloat(jQuery.css(elem, type, "padding")) : __call$(this, type, []) : null;
            });
            // outerHeight and outerWidth
            __set$(jQuery.fn, "outer" + name, function (margin) {
                var elem = this[0];
                return elem ? elem.style ? parseFloat(jQuery.css(elem, type, margin ? "margin" : "border")) : __call$(this, type, []) : null;
            });
            __set$(jQuery.fn, type, function (value) {
                return jQuery.access(this, function (elem, type, value) {
                    var doc, docElemProp, orig, ret;
                    if (jQuery.isWindow(elem)) {
                        // 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
                        doc         = elem.document;
                        docElemProp = __get$(doc.documentElement, clientProp);
                        return jQuery.support.boxModel && docElemProp || doc.body && __get$(doc.body, clientProp) ||
                               docElemProp;
                    }
                    // Get document width or height
                    if (elem.nodeType === 9) {
                        // Either scroll[Width/Height] or offset[Width/Height], whichever is greater
                        doc = elem.documentElement;
                        // when a window > document, IE6 reports a offset[Width/Height] > client[Width/Height]
                        // so we can't use max, as it'll choose the incorrect offset[Width/Height]
                        // instead we use the correct client[Width/Height]
                        // support:IE6
                        if (__get$(doc, clientProp) >= __get$(doc, scrollProp)) {
                            return __get$(doc, clientProp);
                        }
                        return Math.max(__get$(elem.body, scrollProp), __get$(doc, scrollProp), __get$(elem.body, offsetProp), __get$(doc, offsetProp));
                    }
                    // Get width or height on the element
                    if (value === undefined) {
                        orig = jQuery.css(elem, type);
                        ret  = parseFloat(orig);
                        return jQuery.isNumeric(ret) ? ret : orig;
                    }
                    // Set the width or height on the element
                    jQuery(elem).css(type, value);
                }, type, value, arguments.length, null);
            });
        });
        // Expose jQuery to the global object
        window.jQuery = window.$ = jQuery;
        // Expose jQuery as an AMD module, but only for AMD loaders that
        // understand the issues with loading multiple versions of jQuery
        // in a page that all might call define(). The loader will indicate
        // they have special allowances for multiple jQuery versions by
        // specifying define.amd.jQuery = true. Register as a named module,
        // since jQuery can be concatenated with other files that may use define,
        // but not use a proper concatenation script that understands anonymous
        // AMD modules. A named AMD is safest and most robust way to register.
        // Lowercase jquery is used because AMD module names are derived from
        // file names, and jQuery is normally delivered in a lowercase file name.
        // Do this after creating the global so that if an AMD module wants to call
        // noConflict to hide this version of jQuery, it will work.
        if (typeof define === "function" && define.amd && define.amd.jQuery) {
            define("jquery", [], function () {
                return jQuery;
            });
        }
    }(window));

    exportJQuery();
}
