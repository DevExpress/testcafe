import hammerhead from './deps/hammerhead';
import * as domUtils from './utils/dom';
import Sizzle from './sandboxed-sizzle';


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
    * jQuery JavaScript Library v1.8.1
    * http://jquery.com/
    *
    * Includes Sizzle.js
    * http://sizzlejs.com/
    *
    * Copyright 2012 jQuery Foundation and other contributors
    * Released under the MIT license
    * http://jquery.org/license
    *
    * Date: Thu Aug 30 2012 17:17:22 GMT-0400 (Eastern Daylight Time)
    */
    (function (window, undefined) {
        var
        // A central reference to the root jQuery(document)
        rootjQuery,
        // The deferred used on DOM ready
        readyList,
        // Use the correct document accordingly with window argument (sandbox)
        document         = window.document, location = __get$(window, "location"), navigator = window.navigator,
        // Map over jQuery in case of overwrite
        _jQuery          = window.jQuery,
        // Map over the $ in case of overwrite
        _$               = window.$,
        // Save a reference to some core methods
        core_push        = Array.prototype.push, core_slice = Array.prototype.slice, core_indexOf = Array.prototype.indexOf, core_toString = Object.prototype.toString, core_hasOwn = Object.prototype.hasOwnProperty, core_trim = String.prototype.trim,
        // Define a local copy of jQuery
        jQuery           = function (selector, context) {
            // The jQuery object is actually just the init constructor 'enhanced'
            return new jQuery.fn.init(selector, context, rootjQuery);
        },
        // Used for matching numbers
        core_pnum        = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,
        // Used for detecting and trimming whitespace
        core_rnotwhite   = /\S/, core_rspace = /\s+/,
        // Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
        rtrim            = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
        // A simple way to check for HTML strings
        // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
        rquickExpr       = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,
        // Match a standalone tag
        rsingleTag       = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        // JSON RegExp
        rvalidchars      = /^[\],:{}\s]*$/, rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g, rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,
        // Matches dashed string for camelizing
        rmsPrefix        = /^-ms-/, rdashAlpha = /-([\da-z])/gi,
        // Used by jQuery.camelCase as callback to replace()
        fcamelCase       = function (all, letter) {
            return (letter + "").toUpperCase();
        },
        // The ready event handler and self cleanup method
        DOMContentLoaded = function () {
            if (document.addEventListener) {
                document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                jQuery.ready();
            }
            else if (document.readyState === "complete") {
                // we're here because readyState === "complete" in oldIE
                // which is good enough for us to call the dom ready!
                document.detachEvent("onreadystatechange", DOMContentLoaded);
                jQuery.ready();
            }
        },
        // [[Class]] -> type pairs
        class2type       = {};
        jQuery.fn        = jQuery.prototype = {
            constructor: jQuery,
            init:        function (selector, context, rootjQuery) {
                var match, elem, ret, doc;
                // Handle $(""), $(null), $(undefined), $(false)
                if (!selector) {
                    return this;
                }
                // Handle $(DOMElement)
                if (selector.nodeType) {
                    this.context = this[0] = selector;
                    __set$(this, "length", 1);
                    return this;
                }
                // Handle HTML strings
                if (typeof selector === "string") {
                    if (selector.charAt(0) === "<" && selector.charAt(__get$(selector, "length") - 1) === ">" &&
                        __get$(selector, "length") >= 3) {
                        // Assume that strings that start and end with <> are HTML and skip the regex check
                        match = [
                            null,
                            selector,
                            null
                        ];
                    }
                    else {
                        match = rquickExpr.exec(selector);
                    }
                    // Match html or make sure no context is specified for #id
                    if (match && (match[1] || !context)) {
                        // HANDLE: $(html) -> $(array)
                        if (match[1]) {
                            context = context instanceof jQuery ? context[0] : context;
                            doc     = context && context.nodeType ? context.ownerDocument || context : document;
                            // scripts is true for back-compat
                            selector = jQuery.parseHTML(match[1], doc, true);
                            if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
                                this.attr.call(selector, context, true);
                            }
                            return jQuery.merge(this, selector);
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
                                __set$(this, "length", 1);
                                this[0] = elem;
                            }
                            this.context  = document;
                            this.selector = selector;
                            return this;
                        }
                    }
                    else if (!context || context.jquery) {
                        return (context || rootjQuery).find(selector);
                    }
                    else {
                        return this.constructor(context).find(selector);
                    }
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
            // Start with an empty selector
            selector:    "",
            // The current version of jQuery being used
            jquery:      "1.8.1",
            // The default length of a jQuery object is 0
            length:      0,
            // The number of elements contained in the matched element set
            size:        function () {
                return __get$(this, "length");
            },
            toArray:     function () {
                return core_slice.call(this);
            },
            // Get the Nth element in the matched element set OR
            // Get the whole matched element set as a clean array
            get:         function (num) {
                return num == null ? // Return a 'clean' array
                       this.toArray() : num < 0 ? __get$(this, __get$(this, "length") + num) : __get$(this, num);
            },
            // Take an array of elements and push it onto the stack
            // (returning the new matched element set)
            pushStack:   function (elems, name, selector) {
                // Build a new jQuery matched element set
                var ret = jQuery.merge(this.constructor(), elems);
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
            // Execute a callback for every element in the matched set.
            // (You can seed the arguments with an array of args, but this is
            // only used internally.)
            each:        function (callback, args) {
                return jQuery.each(this, callback, args);
            },
            ready:       function (fn) {
                // Add the callback
                jQuery.ready.promise().done(fn);
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
                return this.pushStack(core_slice.apply(this, arguments), "slice", core_slice.call(arguments).join(","));
            },
            map:         function (callback) {
                return this.pushStack(jQuery.map(this, function (elem, i) {
                    return callback.call(elem, i, elem);
                }));
            },
            end:         function () {
                return this.prevObject || this.constructor(null);
            },
            // For internal use only.
            // Behaves like an Array's method, not like a jQuery method.
            push:        core_push,
            sort:        [].sort,
            splice:      [].splice
        };
        // Give the init function the jQuery prototype for later instantiation
        jQuery.fn.init.prototype = jQuery.fn;
        jQuery.extend            = jQuery.fn.extend = function () {
            var options, name, src, copy, copyIsArray, clone, target = arguments[0] ||
                                                                       {}, i = 1, length = __get$(arguments, "length"), deep = false;
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
                            __set$(target, name, jQuery.extend(deep, clone, copy));
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
            // Is the DOM ready to be used? Set to true once it occurs.
            isReady:       false,
            // A counter to track how many items to wait for before
            // the ready event fires. See #6781
            readyWait:     1,
            // Hold (or release) the ready event
            holdReady:     function (hold) {
                if (hold) {
                    jQuery.readyWait++;
                }
                else {
                    jQuery.ready(true);
                }
            },
            // Handle when the DOM is ready
            ready:         function (wait) {
                // Abort if there are pending holds or we're already ready
                if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
                    return;
                }
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
                readyList.resolveWith(document, [jQuery]);
                // Trigger any bound ready events
                if (jQuery.fn.trigger) {
                    jQuery(document).trigger("ready").off("ready");
                }
            },
            // See test/unit/core.js for details concerning isFunction.
            // Since version 1.3, DOM methods and functions like alert
            // aren't supported. They return false on IE (#2968).
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
                return obj == null ? String(obj) : __get$(class2type, core_toString.call(obj)) || "object";
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
                    if (obj.constructor && !core_hasOwn.call(obj, "constructor") &&
                        !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
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
                return key === undefined || core_hasOwn.call(obj, key);
            },
            isEmptyObject: function (obj) {
                var name;
                for (name in obj) {
                    return false;
                }
                return true;
            },
            error:         function (msg) {
                throw new Error(msg);
            },
            // data: string of html
            // context (optional): If specified, the fragment will be created in this context, defaults to document
            // scripts (optional): If true, will include scripts passed in the html string
            parseHTML:     function (data, context, scripts) {
                var parsed;
                if (!data || typeof data !== "string") {
                    return null;
                }
                if (typeof context === "boolean") {
                    scripts = context;
                    context = 0;
                }
                context = context || document;
                // Single tag
                if (parsed = rsingleTag.exec(data)) {
                    return [context.createElement(parsed[1])];
                }
                parsed = jQuery.buildFragment([data], context, scripts ? null : []);
                return jQuery.merge([], (parsed.cacheable ? jQuery.clone(parsed.fragment) : parsed.fragment).childNodes);
            },
            parseJSON:     function (data) {
                if (!data || typeof data !== "string") {
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
            // Cross-browser xml parsing
            parseXML:      function (data) {
                var xml, tmp;
                if (!data || typeof data !== "string") {
                    return null;
                }
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
                if (!xml || !xml.documentElement || __get$(xml.getElementsByTagName("parsererror"), "length")) {
                    jQuery.error("Invalid XML: " + data);
                }
                return xml;
            },
            noop:          function () {
            },
            // Evaluates a script in a global context
            // Workarounds based on findings by Jim Driscoll
            // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
            globalEval:    function (data) {
                if (data && core_rnotwhite.test(data)) {
                    // We use execScript on Internet Explorer
                    // We use an anonymous function so that context is window
                    // rather than jQuery in Firefox
                    (window.execScript || function (data) {
                        window["eval"].call(window, __proc$Script(data));
                    })(data);
                }
            },
            // Convert dashed to camelCase; used by the css and data modules
            // Microsoft forgot to hump their vendor prefix (#9572)
            camelCase:     function (string) {
                return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
            },
            nodeName:      function (elem, name) {
                return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
            },
            // args is for internal usage only
            each:          function (obj, callback, args) {
                var name, i = 0, length = __get$(obj, "length"), isObj = length === undefined || jQuery.isFunction(obj);
                if (args) {
                    if (isObj) {
                        for (name in obj) {
                            if (callback.apply(__get$(obj, name), args) === false) {
                                break;
                            }
                        }
                    }
                    else {
                        for (; i < length;) {
                            if (callback.apply(__get$(obj, i++), args) === false) {
                                break;
                            }
                        }
                    }
                }
                else {
                    if (isObj) {
                        for (name in obj) {
                            if (callback.call(__get$(obj, name), name, __get$(obj, name)) === false) {
                                break;
                            }
                        }
                    }
                    else {
                        for (; i < length;) {
                            if (callback.call(__get$(obj, i), i, __get$(obj, i++)) === false) {
                                break;
                            }
                        }
                    }
                }
                return obj;
            },
            // Use native String.trim function wherever possible
            trim:          core_trim && !core_trim.call("? ") ? function (text) {
                return text == null ? "" : core_trim.call(text);
            } : // Otherwise use our own trimming functionality
                           function (text) {
                               return text == null ? "" : text.toString().replace(rtrim, "");
                           },
            // results is for internal usage only
            makeArray:     function (arr, results) {
                var type, ret = results || [];
                if (arr != null) {
                    // The window, strings (and functions) also have 'length'
                    // Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
                    type = jQuery.type(arr);
                    if (__get$(arr, "length") == null || type === "string" || type === "function" ||
                        type === "regexp" || jQuery.isWindow(arr)) {
                        core_push.call(ret, arr);
                    }
                    else {
                        jQuery.merge(ret, arr);
                    }
                }
                return ret;
            },
            inArray:       function (elem, arr, i) {
                var len;
                if (arr) {
                    if (core_indexOf) {
                        return core_indexOf.call(arr, elem, i);
                    }
                    len = __get$(arr, "length");
                    i   = i ? i < 0 ? Math.max(0, len + i) : i : 0;
                    for (; i < len; i++) {
                        // Skip accessing in sparse arrays
                        if (i in arr && __get$(arr, i) === elem) {
                            return i;
                        }
                    }
                }
                return -1;
            },
            merge:         function (first, second) {
                var l = __get$(second, "length"), i = __get$(first, "length"), j = 0;
                if (typeof l === "number") {
                    for (; j < l; j++) {
                        __set$(first, i++, __get$(second, j));
                    }
                }
                else {
                    while (__get$(second, j) !== undefined) {
                        __set$(first, i++, __get$(second, j++));
                    }
                }
                __set$(first, "length", i);
                return first;
            },
            grep:          function (elems, callback, inv) {
                var retVal, ret = [], i = 0, length = __get$(elems, "length");
                inv             = !!inv;
                // Go through the array, only saving the items
                // that pass the validator function
                for (; i < length; i++) {
                    retVal = !!callback(__get$(elems, i), i);
                    if (inv !== retVal) {
                        ret.push(__get$(elems, i));
                    }
                }
                return ret;
            },
            // arg is for internal usage only
            map:           function (elems, callback, arg) {
                var value, key, ret = [], i = 0, length = __get$(elems, "length"),
                    // jquery objects are treated as arrays
                    isArray         = elems instanceof jQuery || length !== undefined && typeof length === "number" &&
                                                                 (length > 0 && elems[0] && __get$(elems, length - 1) ||
                                                                  length === 0 || jQuery.isArray(elems));
                // Go through the array, translating each of the items to their
                if (isArray) {
                    for (; i < length; i++) {
                        value = callback(__get$(elems, i), i, arg);
                        if (value != null) {
                            __set$(ret, __get$(ret, "length"), value);
                        }
                    }
                }
                else {
                    for (key in elems) {
                        value = callback(__get$(elems, key), key, arg);
                        if (value != null) {
                            __set$(ret, __get$(ret, "length"), value);
                        }
                    }
                }
                // Flatten any nested arrays
                return ret.concat.apply([], ret);
            },
            // A global GUID counter for objects
            guid:          1,
            // Bind a function to a context, optionally partially applying any
            // arguments.
            proxy:         function (fn, context) {
                var tmp, args, proxy;
                if (typeof context === "string") {
                    tmp     = __get$(fn, context);
                    context = fn;
                    fn      = tmp;
                }
                // Quick check to determine if target is callable, in the spec
                // this throws a TypeError, but we will just return undefined.
                if (!jQuery.isFunction(fn)) {
                    return undefined;
                }
                // Simulated bind
                args  = core_slice.call(arguments, 2);
                proxy = function () {
                    return fn.apply(context, args.concat(core_slice.call(arguments)));
                };
                // Set the guid of unique handler to the same of original handler, so it can be removed
                proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;
                return proxy;
            },
            // Multifunctional method to get and set values of a collection
            // The value/s can optionally be executed if it's a function
            access:        function (elems, fn, key, value, chainable, emptyGet, pass) {
                var exec, bulk = key == null, i = 0, length = __get$(elems, "length");
                // Sets many values
                if (key && typeof key === "object") {
                    for (i in key) {
                        jQuery.access(elems, fn, i, __get$(key, i), 1, emptyGet, value);
                    }
                    chainable = 1;
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
                            };
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
                return chainable ? elems : // Gets
                       bulk ? fn.call(elems) : length ? fn(elems[0], key) : emptyGet;
            },
            now:           function () {
                return new Date().getTime();
            }
        });
        jQuery.ready.promise = function (obj) {
            if (!readyList) {
                readyList = jQuery.Deferred();
                // Catch cases where $(document).ready() is called after the browser event has already occurred.
                // we once tried to use readyState "interactive" here, but it caused issues like the one
                // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
                if (document.readyState === "complete") {
                    // Handle it asynchronously to allow scripts the opportunity to delay ready
                    nativeMethods.setTimeout.call(window, __proc$Script(jQuery.ready), 1);
                }
                else if (document.addEventListener) {
                    // Use the handy event callback
                    document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
                    // A fallback to window.onload, that will always work
                    window.addEventListener("load", jQuery.ready, false);
                }
                else {
                    // Ensure firing before onload, maybe late but safe also for iframes
                    document.attachEvent("onreadystatechange", DOMContentLoaded);
                    // A fallback to window.onload, that will always work
                    window.attachEvent("onload", jQuery.ready);
                    // If IE and not a frame
                    // continually check to see if the document is ready
                    var top = false;
                    try {
                        top = window.frameElement == null && document.documentElement;
                    } catch (e) {
                    }
                    if (top && top.doScroll) {
                        (function doScrollCheck () {
                            if (!jQuery.isReady) {
                                try {
                                    // Use the trick by Diego Perini
                                    // http://javascript.nwbox.com/IEContentLoaded/
                                    top.doScroll("left");
                                } catch (e) {
                                    return nativeMethods.setTimeout.call(window, __proc$Script(doScrollCheck), 50);
                                }
                                // and execute any waiting functions
                                jQuery.ready();
                            }
                        }());
                    }
                }
            }
            return readyList.promise(obj);
        };
        // Populate the class2type map
        jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function (i, name) {
            __set$(class2type, "[object " + name + "]", name.toLowerCase());
        });
        // All jQuery objects should point back to these
        rootjQuery = jQuery(document);
        // String to Object options format cache
        var optionsCache = {};
        // Convert String-formatted options into Object-formatted ones and store in cache
        function createOptions (options) {
            var object = __set$(optionsCache, options, {});
            jQuery.each(options.split(core_rspace), function (_, flag) {
                __set$(object, flag, true);
            });
            return object;
        }

        /*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
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
        jQuery.Callbacks                             = function (options) {
            // Convert options from String-formatted to Object-formatted if needed
            // (we check in cache first)
            options = typeof options === "string" ? __get$(optionsCache, options) ||
                                                    createOptions(options) : jQuery.extend({}, options);
            var
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
            // Actual callback list
            list    = [],
            // Stack of fire calls for repeatable lists
            stack   = !options.once && [],
            // Fire callbacks
            fire    = function (data) {
                memory       = options.memory && data;
                fired        = true;
                firingIndex  = firingStart || 0;
                firingStart  = 0;
                firingLength = __get$(list, "length");
                firing       = true;
                for (; list && firingIndex < firingLength; firingIndex++) {
                    if (__get$(list, firingIndex).apply(data[0], data[1]) === false && options.stopOnFalse) {
                        memory = false;
                        // To prevent further calls using add
                        break;
                    }
                }
                firing = false;
                if (list) {
                    if (stack) {
                        if (__get$(stack, "length")) {
                            fire(stack.shift());
                        }
                    }
                    else if (memory) {
                        list = [];
                    }
                    else {
                        self.disable();
                    }
                }
            },
            // Actual Callbacks object
            self    = {
                // Add a callback or a collection of callbacks to the list
                add:      function () {
                    if (list) {
                        // First, we save the current length
                        var start = __get$(list, "length");
                        (function add (args) {
                            jQuery.each(args, function (_, arg) {
                                var type = jQuery.type(arg);
                                if (type === "function" && (!options.unique || !self.has(arg))) {
                                    list.push(arg);
                                }
                                else if (arg && __get$(arg, "length") && type !== "string") {
                                    // Inspect recursively
                                    add(arg);
                                }
                            });
                        }(arguments));
                        // Do we need to add the callbacks to the
                        // current firing batch?
                        if (firing) {
                            firingLength = __get$(list, "length");
                        }
                        else if (memory) {
                            firingStart = start;
                            fire(memory);
                        }
                    }
                    return this;
                },
                // Remove a callback from the list
                remove:   function () {
                    if (list) {
                        jQuery.each(arguments, function (_, arg) {
                            var index;
                            while ((index = jQuery.inArray(arg, list, index)) > -1) {
                                list.splice(index, 1);
                                // Handle firing indexes
                                if (firing) {
                                    if (index <= firingLength) {
                                        firingLength--;
                                    }
                                    if (index <= firingIndex) {
                                        firingIndex--;
                                    }
                                }
                            }
                        });
                    }
                    return this;
                },
                // Control if a given callback is in the list
                has:      function (fn) {
                    return jQuery.inArray(fn, list) > -1;
                },
                // Remove all callbacks from the list
                empty:    function () {
                    list = [];
                    return this;
                },
                // Have the list do nothing anymore
                disable:  function () {
                    list = stack = memory = undefined;
                    return this;
                },
                // Is it disabled?
                disabled: function () {
                    return !list;
                },
                // Lock the list in its current state
                lock:     function () {
                    stack = undefined;
                    if (!memory) {
                        self.disable();
                    }
                    return this;
                },
                // Is it locked?
                locked:   function () {
                    return !stack;
                },
                // Call all callbacks with the given context and arguments
                fireWith: function (context, args) {
                    args = args || [];
                    args = [
                        context,
                        args.slice ? args.slice() : args
                    ];
                    if (list && (!fired || stack)) {
                        if (firing) {
                            stack.push(args);
                        }
                        else {
                            fire(args);
                        }
                    }
                    return this;
                },
                // Call all the callbacks with the given arguments
                fire:     function () {
                    self.fireWith(this, arguments);
                    return this;
                },
                // To know if the callbacks have already been called at least once
                fired:    function () {
                    return !!fired;
                }
            };
            return self;
        };
        jQuery.extend({
            Deferred: function (func) {
                var tuples  = [
                    // action, add listener, listener list, final state
                    [
                        "resolve",
                        "done",
                        jQuery.Callbacks("once memory"),
                        "resolved"
                    ],
                    [
                        "reject",
                        "fail",
                        jQuery.Callbacks("once memory"),
                        "rejected"
                    ],
                    [
                        "notify",
                        "progress",
                        jQuery.Callbacks("memory")
                    ]
                ], state    = "pending", promise = {
                    state:   function () {
                        return state;
                    },
                    always:  function () {
                        deferred.done(arguments).fail(arguments);
                        return this;
                    },
                    then:    function () {
                        var fns = arguments;
                        return jQuery.Deferred(function (newDefer) {
                            jQuery.each(tuples, function (i, tuple) {
                                var action = tuple[0], fn = __get$(fns, i);
                                // deferred[ done | fail | progress ] for forwarding actions to newDefer
                                __call$(deferred, tuple[1], [jQuery.isFunction(fn) ? function () {
                                    var returned = fn.apply(this, arguments);
                                    if (returned && jQuery.isFunction(returned.promise)) {
                                        returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify);
                                    }
                                    else {
                                        __call$(newDefer, action + "With", [
                                            this === deferred ? newDefer : this,
                                            [returned]
                                        ]);
                                    }
                                } : __get$(newDefer, action)]);
                            });
                            fns = null;
                        }).promise();
                    },
                    // Get a promise for this deferred
                    // If obj is provided, the promise aspect is added to the object
                    promise: function (obj) {
                        return typeof obj === "object" ? jQuery.extend(obj, promise) : promise;
                    }
                }, deferred = {};
                // Keep pipe for back-compat
                promise.pipe = promise.then;
                // Add list-specific methods
                jQuery.each(tuples, function (i, tuple) {
                    var list = tuple[2], stateString = tuple[3];
                    // promise[ done | fail | progress ] = list.add
                    __set$(promise, tuple[1], list.add);
                    if (stateString) {
                        list.add(function () {
                            // state = [ resolved | rejected ]
                            state = stateString;
                        }, __get$(tuples, i ^ 1)[2].disable, tuples[2][2].lock);
                    }
                    // deferred[ resolve | reject | notify ] = list.fire
                    __set$(deferred, tuple[0], list.fire);
                    __set$(deferred, tuple[0] + "With", list.fireWith);
                });
                // Make the deferred a promise
                promise.promise(deferred);
                // Call given func if any
                if (func) {
                    func.call(deferred, deferred);
                }
                // All done!
                return deferred;
            },
            // Deferred helper
            when:     function (subordinate) {
                var i          = 0, resolveValues = core_slice.call(arguments), length = __get$(resolveValues, "length"),
                    // the count of uncompleted subordinates
                    remaining  = length !== 1 || subordinate && jQuery.isFunction(subordinate.promise) ? length : 0,
                    // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
                    deferred   = remaining === 1 ? subordinate : jQuery.Deferred(),
                    // Update function for both resolve and progress values
                    updateFunc = function (i, contexts, values) {
                        return function (value) {
                            __set$(contexts, i, this);
                            __set$(values, i, __get$(arguments, "length") > 1 ? core_slice.call(arguments) : value);
                            if (values === progressValues) {
                                deferred.notifyWith(contexts, values);
                            }
                            else if (!--remaining) {
                                deferred.resolveWith(contexts, values);
                            }
                        };
                    }, progressValues, progressContexts, resolveContexts;
                // add listeners to Deferred subordinates; treat others as resolved
                if (length > 1) {
                    progressValues   = new Array(length);
                    progressContexts = new Array(length);
                    resolveContexts  = new Array(length);
                    for (; i < length; i++) {
                        if (__get$(resolveValues, i) && jQuery.isFunction(__get$(resolveValues, i).promise)) {
                            __get$(resolveValues, i).promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFunc(i, progressContexts, progressValues));
                        }
                        else {
                            --remaining;
                        }
                    }
                }
                // if we're not waiting on anything, resolve the master
                if (!remaining) {
                    deferred.resolveWith(resolveContexts, resolveValues);
                }
                return deferred.promise();
            }
        });
        jQuery.support                               = function () {
            var support, all, a, select, opt, input, fragment, eventName, i, isSupported, clickFn, div = document.createElement("div");
            // Preliminary tests
            div.setAttribute("className", "t");
            __set$(div, "innerHTML", "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>");
            all                                                                                        = div.getElementsByTagName("*");
            a                                                                                          = div.getElementsByTagName("a")[0];
            __set$(a.style, "cssText", "top:1px;float:left;opacity:.5");
            if (!all || !__get$(all, "length") || !a) {
                return {};
            }
            // First batch of supports tests
            select  = document.createElement("select");
            opt     = select.appendChild(document.createElement("option"));
            input   = div.getElementsByTagName("input")[0];
            support = {
                // IE strips leading whitespace when .innerHTML is used
                leadingWhitespace:      __get$(div, "firstChild").nodeType === 3,
                // Make sure that tbody elements aren't automatically inserted
                // IE will insert them into empty tables
                tbody:                  !__get$(div.getElementsByTagName("tbody"), "length"),
                // Make sure that link elements get serialized correctly by innerHTML
                // This requires a wrapper element in IE
                htmlSerialize:          !!__get$(div.getElementsByTagName("link"), "length"),
                // Get the style information from getAttribute
                // (IE uses .cssText instead)
                style:                  /top/.test(a.getAttribute("style")),
                // Make sure that URLs aren't manipulated
                // (IE normalizes it by default)
                hrefNormalized:         a.getAttribute("href") === "/a",
                // Make sure that element opacity exists
                // (IE uses filter instead)
                // Use a regex to work around a WebKit issue. See #5145
                opacity:                /^0.5/.test(a.style.opacity),
                // Verify style float existence
                // (IE uses styleFloat instead of cssFloat)
                cssFloat:               !!a.style.cssFloat,
                // Make sure that if no value is specified for a checkbox
                // that it defaults to "on".
                // (WebKit defaults to "" instead)
                checkOn:                __get$(input, "value") === "on",
                // Make sure that a selected-by-default option has a working selected property.
                // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
                optSelected:            opt.selected,
                // Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
                getSetAttribute:        div.className !== "t",
                // Tests for enctype support on a form(#6743)
                enctype:                !!document.createElement("form").enctype,
                // Makes sure cloning an html5 element does not cause problems
                // Where outerHTML is undefined, this still works
                html5Clone:             document.createElement("nav").cloneNode(true).outerHTML !== "<:nav></:nav>",
                // jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
                boxModel:               document.compatMode === "CSS1Compat",
                // Will be defined later
                submitBubbles:          true,
                changeBubbles:          true,
                focusinBubbles:         false,
                deleteExpando:          true,
                noCloneEvent:           true,
                inlineBlockNeedsLayout: false,
                shrinkWrapBlocks:       false,
                reliableMarginRight:    true,
                boxSizingReliable:      true,
                pixelPosition:          false
            };
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
                div.attachEvent("onclick", clickFn = function () {
                    // Cloning a node shouldn't copy over any
                    // bound event handlers (IE does this)
                    support.noCloneEvent = false;
                });
                div.cloneNode(true).fireEvent("onclick");
                div.detachEvent("onclick", clickFn);
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
            fragment.appendChild(__get$(div, "lastChild"));
            // WebKit doesn't clone checked state correctly in fragments
            support.checkClone = __get$(fragment.cloneNode(true).cloneNode(true), "lastChild").checked;
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
                    submit:  true,
                    change:  true,
                    focusin: true
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
            // Run tests that need a body at doc ready
            jQuery(function () {
                var container, div, tds, marginDiv, divReset = "padding:0;margin:0;border:0;display:block;overflow:hidden;", body = document.getElementsByTagName("body")[0];
                if (!body) {
                    // Return for frameset docs that don't have a body
                    return;
                }
                container = document.createElement("div");
                __set$(container.style, "cssText", "visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px");
                body.insertBefore(container, __get$(body, "firstChild"));
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
                __set$(div, "innerHTML", "<table><tr><td></td><td>t</td></tr></table>");
                tds                  = div.getElementsByTagName("td");
                __set$(tds[0].style, "cssText", "padding:0;margin:0;border:0;display:none");
                isSupported          = tds[0].offsetHeight === 0;
                tds[0].style.display = "";
                tds[1].style.display = "none";
                // Check if empty table cells still have offsetWidth/Height
                // (IE <= 8 fail this test)
                support.reliableHiddenOffsets            = isSupported && tds[0].offsetHeight === 0;
                // Check box-sizing and margin behavior
                __set$(div, "innerHTML", "");
                __set$(div.style, "cssText", "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;");
                support.boxSizing                        = div.offsetWidth === 4;
                support.doesNotIncludeMarginInBodyOffset = body.offsetTop !== 1;
                // NOTE: To any future maintainer, we've window.getComputedStyle
                // because jsdom on node.js will break without it.
                if (window.getComputedStyle) {
                    support.pixelPosition     = (window.getComputedStyle(div, null) || {}).top !== "1%";
                    support.boxSizingReliable = (window.getComputedStyle(div, null) || { width: "4px" }).width ===
                                                "4px";
                    // Check if div with explicit width and no margin-right incorrectly
                    // gets computed margin-right based on width of container. For more
                    // info see bug #3333
                    // Fails in WebKit before Feb 2011 nightlies
                    // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                    marginDiv                   = document.createElement("div");
                    __set$(marginDiv.style, "cssText", __set$(div.style, "cssText", divReset));
                    marginDiv.style.marginRight = marginDiv.style.width = "0";
                    div.style.width             = "1px";
                    div.appendChild(marginDiv);
                    support.reliableMarginRight = !parseFloat((window.getComputedStyle(marginDiv, null) ||
                                                               {}).marginRight);
                }
                if (typeof div.style.zoom !== "undefined") {
                    // Check if natively block-level elements act like inline-block
                    // elements when setting their display to 'inline' and giving
                    // them layout
                    // (IE < 8 does this)
                    __set$(div, "innerHTML", "");
                    __set$(div.style, "cssText", divReset + "width:1px;padding:1px;display:inline;zoom:1");
                    support.inlineBlockNeedsLayout = div.offsetWidth === 3;
                    // Check if elements with layout shrink-wrap their children
                    // (IE 6 does this)
                    div.style.display                     = "block";
                    div.style.overflow                    = "visible";
                    __set$(div, "innerHTML", "<div></div>");
                    __get$(div, "firstChild").style.width = "5px";
                    support.shrinkWrapBlocks              = div.offsetWidth !== 3;
                    container.style.zoom                  = 1;
                }
                // Null elements to avoid leaks in IE
                body.removeChild(container);
                container                                = div = tds = marginDiv = null;
            });
            // Null elements to avoid leaks in IE
            fragment.removeChild(div);
            all                   = a = select = opt = input = fragment = div = null;
            return support;
        }();
        var rbrace                                   = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/, rmultiDash = /([A-Z])/g;
        jQuery.extend({
            cache:      {},
            deletedIds: [],
            // Please use with caution
            uuid:       0,
            // Unique for each copy of jQuery on the page
            // Non-digits removed to match rinlinejQuery
            expando:    "jQuery" + (jQuery.fn.jquery + Math.random()).replace(/\D/g, ""),
            // The following elements throw uncatchable exceptions if you
            // attempt to add expando properties to them.
            noData:     {
                "embed":  true,
                // Ban all objects except for Flash (which handle expandos)
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
                var thisCache, ret, internalKey = jQuery.expando, getByName = typeof name === "string",
                    // We have to handle DOM nodes and JS objects differently because IE6-7
                    // can't GC object references properly across the DOM-JS boundary
                    isNode                      = elem.nodeType,
                    // Only DOM nodes need the global jQuery cache; JS object data is
                    // attached directly to the object so GC can occur automatically
                    cache                       = isNode ? jQuery.cache : elem,
                    // Only defining an ID for JS objects if its cache already exists allows
                    // the code to shortcut on the same path as a DOM node with no cache
                    id                          = isNode ? __get$(elem, internalKey) : __get$(elem, internalKey) &&
                                                                                       internalKey;
                // Avoid doing any more work than we need to when trying to get data on an
                // object that has no data at all
                if ((!id || !__get$(cache, id) || !pvt && !__get$(__get$(cache, id), "data")) && getByName &&
                    data === undefined) {
                    return;
                }
                if (!id) {
                    // Only DOM nodes need a new unique ID for each element since their data
                    // ends up in the global cache
                    if (isNode) {
                        __set$(elem, internalKey, id = jQuery.deletedIds.pop() || ++jQuery.uuid);
                    }
                    else {
                        id = internalKey;
                    }
                }
                if (!__get$(cache, id)) {
                    __set$(cache, id, {});
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
                thisCache = __get$(cache, id);
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
                var thisCache, i, l, isNode = elem.nodeType,
                    // See jQuery.data for more information
                    cache                   = isNode ? jQuery.cache : elem, id = isNode ? __get$(elem, jQuery.expando) : jQuery.expando;
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
                        for (i = 0, l = __get$(name, "length"); i < l; i++) {
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
                // Destroy the cache
                if (isNode) {
                    jQuery.cleanData([elem], true);
                }
                else if (jQuery.support.deleteExpando || cache != cache.window) {
                    delete cache[id];
                }
                else {
                    __set$(cache, id, null);
                }
            },
            // For internal use only.
            _data:      function (elem, name, data) {
                return jQuery.data(elem, name, data, true);
            },
            // A method for determining if a DOM node can handle the data expando
            acceptData: function (elem) {
                var noData = elem.nodeName && __get$(jQuery.noData, elem.nodeName.toLowerCase());
                // nodes accept data unless otherwise specified; rejection can be conditional
                return !noData || noData !== true && elem.getAttribute("classid") === noData;
            }
        });
        jQuery.fn.extend({
            data:       function (key, value) {
                var parts, part, attr, name, l, elem = this[0], i = 0, data = null;
                // Gets all values
                if (key === undefined) {
                    if (__get$(this, "length")) {
                        data = jQuery.data(elem);
                        if (elem.nodeType === 1 && !jQuery._data(elem, "parsedAttrs")) {
                            attr = __get$(elem, "attributes");
                            for (l = __get$(attr, "length"); i < l; i++) {
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
                }, null, value, __get$(arguments, "length") > 1, null, false);
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
                        data = data === "true" ? true : data === "false" ? false : data === "null" ? null : // Only convert to a number if it doesn't change the string
                                                                                   +data + "" ===
                                                                                   data ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data;
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
            var name;
            for (name in obj) {
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

        jQuery.extend({
            queue:       function (elem, type, data) {
                var queue;
                if (elem) {
                    type  = (type || "fx") + "queue";
                    queue = jQuery._data(elem, type);
                    // Speed up dequeue by getting out quickly if this is just a lookup
                    if (data) {
                        if (!queue || jQuery.isArray(data)) {
                            queue = jQuery._data(elem, type, jQuery.makeArray(data));
                        }
                        else {
                            queue.push(data);
                        }
                    }
                    return queue || [];
                }
            },
            dequeue:     function (elem, type) {
                type      = type || "fx";
                var queue = jQuery.queue(elem, type), startLength = __get$(queue, "length"), fn = queue.shift(), hooks = jQuery._queueHooks(elem, type), next = function () {
                    jQuery.dequeue(elem, type);
                };
                // If the fx queue is dequeued, always remove the progress sentinel
                if (fn === "inprogress") {
                    fn = queue.shift();
                    startLength--;
                }
                if (fn) {
                    // Add a progress sentinel to prevent the fx queue from being
                    // automatically dequeued
                    if (type === "fx") {
                        queue.unshift("inprogress");
                    }
                    // clear up the last queue stop function
                    delete hooks.stop;
                    fn.call(elem, next, hooks);
                }
                if (!startLength && hooks) {
                    hooks.empty.fire();
                }
            },
            // not intended for public consumption - generates a queueHooks object, or returns the current one
            _queueHooks: function (elem, type) {
                var key = type + "queueHooks";
                return jQuery._data(elem, key) || jQuery._data(elem, key, {
                        empty: jQuery.Callbacks("once memory").add(function () {
                            jQuery.removeData(elem, type + "queue", true);
                            jQuery.removeData(elem, key, true);
                        })
                    });
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
                if (__get$(arguments, "length") < setter) {
                    return jQuery.queue(this[0], type);
                }
                return data === undefined ? this : this.each(function () {
                    var queue = jQuery.queue(this, type, data);
                    // ensure a hooks for this queue
                    jQuery._queueHooks(this, type);
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
            // Based off of the plugin by Clint Helfers, with permission.
            // http://blindsignals.com/index.php/2009/07/jquery-delay/
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
            // Get a promise resolved when queues of a certain type
            // are emptied (fx is the type by default)
            promise:    function (type, obj) {
                var tmp, count = 1, defer = jQuery.Deferred(), elements = this, i = __get$(this, "length"), resolve = function () {
                    if (!--count) {
                        defer.resolveWith(elements, [elements]);
                    }
                };
                if (typeof type !== "string") {
                    obj  = type;
                    type = undefined;
                }
                type = type || "fx";
                while (i--) {
                    tmp = jQuery._data(__get$(elements, i), type + "queueHooks");
                    if (tmp && tmp.empty) {
                        count++;
                        tmp.empty.add(resolve);
                    }
                }
                resolve();
                return defer.promise(obj);
            }
        });
        var nodeHook, boolHook, fixSpecified, rclass = /[\t\r\n]/g, rreturn = /\r/g, rtype = /^(?:button|input)$/i, rfocusable = /^(?:button|input|object|select|textarea)$/i, rclickable = /^a(?:rea|)$/i, rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, getSetAttribute = jQuery.support.getSetAttribute;
        jQuery.fn.extend({
            attr:        function (name, value) {
                return jQuery.access(this, jQuery.attr, name, value, __get$(arguments, "length") > 1);
            },
            removeAttr:  function (name) {
                return this.each(function () {
                    jQuery.removeAttr(this, name);
                });
            },
            prop:        function (name, value) {
                return jQuery.access(this, jQuery.prop, name, value, __get$(arguments, "length") > 1);
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
                    classNames = value.split(core_rspace);
                    for (i = 0, l = __get$(this, "length"); i < l; i++) {
                        elem = __get$(this, i);
                        if (elem.nodeType === 1) {
                            if (!elem.className && __get$(classNames, "length") === 1) {
                                elem.className = value;
                            }
                            else {
                                setClass = " " + elem.className + " ";
                                for (c = 0, cl = __get$(classNames, "length"); c < cl; c++) {
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
                var removes, className, elem, c, cl, i, l;
                if (jQuery.isFunction(value)) {
                    return this.each(function (j) {
                        jQuery(this).removeClass(value.call(this, j, this.className));
                    });
                }
                if (value && typeof value === "string" || value === undefined) {
                    removes = (value || "").split(core_rspace);
                    for (i = 0, l = __get$(this, "length"); i < l; i++) {
                        elem = __get$(this, i);
                        if (elem.nodeType === 1 && elem.className) {
                            className = (" " + elem.className + " ").replace(rclass, " ");
                            // loop over each item in the removal list
                            for (c = 0, cl = __get$(removes, "length"); c < cl; c++) {
                                // Remove until there is nothing to remove,
                                while (className.indexOf(" " + __get$(removes, c) + " ") > -1) {
                                    className = className.replace(" " + __get$(removes, c) + " ", " ");
                                }
                            }
                            elem.className = value ? jQuery.trim(className) : "";
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
                        var className, i = 0, self = jQuery(this), state = stateVal, classNames = value.split(core_rspace);
                        while (className = __get$(classNames, i++)) {
                            // check each className given, space separated list
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
                var className = " " + selector + " ", i = 0, l = __get$(this, "length");
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
                if (!__get$(arguments, "length")) {
                    if (elem) {
                        hooks = __get$(jQuery.valHooks, elem.type) ||
                                __get$(jQuery.valHooks, elem.nodeName.toLowerCase());
                        if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
                            return ret;
                        }
                        ret = __get$(elem, "value");
                        return typeof ret === "string" ? // handle most common string cases
                               ret.replace(rreturn, "") : // handle cases where value is null/undef or number
                               ret == null ? "" : ret;
                    }
                    return;
                }
                isFunction = jQuery.isFunction(value);
                return this.each(function (i) {
                    var val, self = jQuery(this);
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
                        max = one ? index + 1 : __get$(options, "length");
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
                        if (one && !__get$(values, "length") && __get$(options, "length")) {
                            return jQuery(__get$(options, index)).val();
                        }
                        return values;
                    },
                    set: function (elem, value) {
                        var values = jQuery.makeArray(value);
                        jQuery(elem).find("option").each(function () {
                            this.selected = jQuery.inArray(jQuery(this).val(), values) >= 0;
                        });
                        if (!__get$(values, "length")) {
                            elem.selectedIndex = -1;
                        }
                        return values;
                    }
                }
            },
            // Unused in 1.8, left in so attrFn-stabbers won't die; remove in 1.9
            attrFn:     {},
            attr:       function (elem, name, value, pass) {
                var ret, hooks, notxml, nType = elem.nodeType;
                // don't get/set attributes on text, comment and attribute nodes
                if (!elem || nType === 3 || nType === 8 || nType === 2) {
                    return;
                }
                if (pass && jQuery.isFunction(__get$(jQuery.fn, name))) {
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
                var propName, attrNames, name, isBool, i = 0;
                if (value && elem.nodeType === 1) {
                    attrNames = value.split(core_rspace);
                    for (; i < __get$(attrNames, "length"); i++) {
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
                // Use the value property for back compat
                // Use the nodeHook for button elements in IE6/7 (#1954)
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
                    return ret && (__get$(fixSpecified, name) ? __get$(ret, "value") !==
                                                                "" : ret.specified) ? __get$(ret, "value") : undefined;
                },
                set: function (elem, value, name) {
                    // Set the existing or create a new attribute node
                    var ret = elem.getAttributeNode(name);
                    if (!ret) {
                        ret = document.createAttribute(name);
                        elem.setAttributeNode(ret);
                    }
                    return __set$(ret, "value", value + "");
                }
            };
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
        var rformElems = /^(?:textarea|input|select)$/i, rtypenamespace = /^([^\.]*|)(?:\.(.+)|)$/, rhoverHack = /(?:^|\s)hover(\.\S+|)\b/, rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|contextmenu)|click/, rfocusMorph = /^(?:focusinfocus|focusoutblur)$/, hoverHack = function (events) {
            return jQuery.event.special.hover ? events : events.replace(rhoverHack, "mouseenter$1 mouseleave$1");
        };
        /*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
        jQuery.event = {
            add:         function (elem, types, handler, data, selector) {
                var elemData, eventHandle, events, t, tns, type, namespaces, handleObj, handleObjIn, handlers, special;
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
                for (t = 0; t < __get$(types, "length"); t++) {
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
            // Detach an event or set of events from an element
            remove:      function (elem, types, handler, selector, mappedTypes) {
                var t, tns, type, origType, namespaces, origCount, j, events, special, eventType, handleObj, elemData = jQuery.hasData(elem) &&
                                                                                                                        jQuery._data(elem);
                if (!elemData || !(events = elemData.events)) {
                    return;
                }
                // Once for each type.namespace in types; type may be omitted
                types = jQuery.trim(hoverHack(types || "")).split(" ");
                for (t = 0; t < __get$(types, "length"); t++) {
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
                    origCount  = __get$(eventType, "length");
                    namespaces = namespaces ? new RegExp("(^|\\.)" +
                                                         namespaces.split(".").sort().join("\\.(?:.*\\.|)") +
                                                         "(\\.|$)") : null;
                    // Remove matching events
                    for (j = 0; j < __get$(eventType, "length"); j++) {
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
                    if (__get$(eventType, "length") === 0 && origCount !== __get$(eventType, "length")) {
                        if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                            jQuery.removeEvent(elem, type, elemData.handle);
                        }
                        delete events[type];
                    }
                }
                // Remove the expando if it's no longer used
                if (jQuery.isEmptyObject(events)) {
                    delete elemData.handle;
                    // removeData also checks for emptiness and clears the expando if empty
                    // so use it instead of delete
                    jQuery.removeData(elem, "events", true);
                }
            },
            // Events that are safe to short-circuit if no handlers are attached.
            // Native DOM events should not be added, they may have inline handlers.
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
                var cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType, type = event.type ||
                                                                                                          event, namespaces = [];
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
                event              = typeof event === "object" ? // jQuery.Event object
                                     __get$(event, jQuery.expando) ? event : new jQuery.Event(type, event) : // Just the event type (string)
                                     new jQuery.Event(type);
                event.type         = type;
                event.isTrigger    = true;
                event.exclusive    = exclusive;
                event.namespace    = namespaces.join(".");
                event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") +
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
                    for (old = elem; cur; cur = cur.parentNode) {
                        eventPath.push([
                            cur,
                            bubbleType
                        ]);
                        old = cur;
                    }
                    // Only add window if we got to document (e.g., not plain obj or detached DOM)
                    if (old === (elem.ownerDocument || document)) {
                        eventPath.push([
                            old.defaultView || old.parentWindow || window,
                            bubbleType
                        ]);
                    }
                }
                // Fire handlers on the event path
                for (i = 0; i < __get$(eventPath, "length") && !event.isPropagationStopped(); i++) {
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
                            if (!(window['%hammerhead%'] && window['%hammerhead%'].utils.dom.isDocument(elem)) ||
                                type !== 'ready')
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
                var i, j, cur, ret, selMatch, matched, matches, handleObj, sel, related, handlers = __get$(jQuery._data(this, "events") ||
                                                                                                    {}, event.type) ||
                                                                                                    [], delegateCount = handlers.delegateCount, args = [].slice.call(arguments), run_all = !event.exclusive &&
                                                                                                                                                                                           !event.namespace, special = __get$(jQuery.event.special, event.type) ||
                                                                                                                                                                                                                       {}, handlerQueue = [];
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
                    for (cur = __get$(event, "target"); cur != this; cur = cur.parentNode || this) {
                        // Don't process clicks (ONLY) on disabled elements (#6911, #8165, #11382, #11764)
                        if (cur.disabled !== true || event.type !== "click") {
                            selMatch = {};
                            matches  = [];
                            for (i = 0; i < delegateCount; i++) {
                                handleObj = __get$(handlers, i);
                                sel       = handleObj.selector;
                                if (__get$(selMatch, sel) === undefined) {
                                    __set$(selMatch, sel, jQuery(sel, this).index(cur) >= 0);
                                }
                                if (__get$(selMatch, sel)) {
                                    matches.push(handleObj);
                                }
                            }
                            if (__get$(matches, "length")) {
                                handlerQueue.push({
                                    elem:    cur,
                                    matches: matches
                                });
                            }
                        }
                    }
                }
                // Add the remaining (directly-bound) handlers
                if (__get$(handlers, "length") > delegateCount) {
                    handlerQueue.push({
                        elem:    this,
                        matches: handlers.slice(delegateCount)
                    });
                }
                // Run delegates first; they may want to stop propagation beneath us
                for (i = 0; i < __get$(handlerQueue, "length") && !event.isPropagationStopped(); i++) {
                    matched             = __get$(handlerQueue, i);
                    event.currentTarget = matched.elem;
                    for (j = 0; j < __get$(matched.matches, "length") && !event.isImmediatePropagationStopped(); j++) {
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
            // Includes some event props shared by KeyEvent and MouseEvent
            // *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
            props:       "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
            fixHooks:    {},
            keyHooks:    {
                props:  "char charCode key keyCode".split(" "),
                filter: function (event, original) {
                    // Add which for key events
                    if (__get$(event, "which") == null) {
                        __set$(event, "which", original.charCode != null ? original.charCode : original.keyCode);
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
                    if (!__get$(event, "which") && button !== undefined) {
                        __set$(event, "which", button & 1 ? 1 : button & 2 ? 3 : button & 4 ? 2 : 0);
                    }
                    return event;
                }
            },
            fix:         function (event) {
                if (__get$(event, jQuery.expando)) {
                    return event;
                }
                var i, prop, originalEvent = event, fixHook = __get$(jQuery.event.fixHooks, event.type) ||
                                                              {}, copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;
                event = jQuery.Event(originalEvent);
                for (i = __get$(copy, "length"); i;) {
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
                // For mouse/key events, metaKey==false if it's undefined (#3368, #11328; IE6/7/8)
                event.metaKey = !!event.metaKey;
                return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
            },
            special:     {
                load:         {
                    // Prevent triggered image.load events from bubbling to window.load
                    noBubble: true
                },
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
            var name = "on" + type;
            if (elem.detachEvent) {
                // #8545, #7054, preventing memory leaks for custom events in IE6-8 вЂ“
                // detachEvent needed property on element, by name of that event, to properly expose it to GC
                if (typeof __get$(elem, name) === "undefined") {
                    __set$(elem, name, null);
                }
                elem.detachEvent(name, handle);
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
                                          src.getPreventDefault && src.getPreventDefault() ? returnTrue : returnFalse;
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
                    e.preventDefault();
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
                    var ret, target = this, related = event.relatedTarget, handleObj = event.handleObj, selector = handleObj.selector;
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
                        if (form && !jQuery._data(form, "_submit_attached")) {
                            jQuery.event.add(form, "submit._submit", function (event) {
                                event._submit_bubble = true;
                            });
                            jQuery._data(form, "_submit_attached", true);
                        }
                    });
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
                                }
                                // Allow triggered, simulated change events (#11500)
                                jQuery.event.simulate("change", this, event, true);
                            });
                        }
                        return false;
                    }
                    // Delegated event; lazy-add a change handler on descendant inputs
                    jQuery.event.add(this, "beforeactivate._change", function (e) {
                        var elem = __get$(e, "target");
                        if (rformElems.test(elem.nodeName) && !jQuery._data(elem, "_change_attached")) {
                            jQuery.event.add(elem, "change._change", function (event) {
                                if (this.parentNode && !event.isSimulated && !event.isTrigger) {
                                    jQuery.event.simulate("change", this.parentNode, event, true);
                                }
                            });
                            jQuery._data(elem, "_change_attached", true);
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
                    return !rformElems.test(this.nodeName);
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
                var handleObj, type;
                if (types && types.preventDefault && types.handleObj) {
                    // ( event )  dispatched jQuery.Event
                    handleObj = types.handleObj;
                    jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." +
                                                                           handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
                    return this;
                }
                if (typeof types === "object") {
                    // ( types-object [, selector] )
                    for (type in types) {
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
                return __get$(arguments, "length") == 1 ? this.off(selector, "**") : this.off(types, selector ||
                                                                                                     "**", fn);
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
                while (i < __get$(args, "length")) {
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
                return __get$(arguments, "length") > 0 ? this.on(name, null, data, fn) : this.trigger(name);
            });
            if (rkeyEvent.test(name)) {
                __set$(jQuery.event.fixHooks, name, jQuery.event.keyHooks);
            }
            if (rmouseEvent.test(name)) {
                __set$(jQuery.event.fixHooks, name, jQuery.event.mouseHooks);
            }
        });
        //Sizzle
        // Override sizzle attribute retrieval
        Sizzle.attr      = jQuery.attr;
        jQuery.find      = Sizzle;
        jQuery.expr      = Sizzle.selectors;
        jQuery.expr[":"] = jQuery.expr.pseudos;
        jQuery.unique    = Sizzle.uniqueSort;
        __set$(jQuery, "text", Sizzle.getText);
        jQuery.isXMLDoc  = Sizzle.isXML;
        jQuery.contains  = Sizzle.contains;
        var runtil             = /Until$/, rparentsprev = /^(?:parents|prev(?:Until|All))/, isSimple = /^.[^:#\[\.,]*$/, rneedsContext = jQuery.expr.match.needsContext,
            // methods guaranteed to produce a unique set when starting from a unique set
            guaranteedUnique   = {
                children: true,
                contents: true,
                next:     true,
                prev:     true
            };
        jQuery.fn.extend({
            find:    function (selector) {
                var i, l, length, n, r, ret, self = this;
                if (typeof selector !== "string") {
                    return jQuery(selector).filter(function () {
                        for (i = 0, l = __get$(self, "length"); i < l; i++) {
                            if (jQuery.contains(__get$(self, i), this)) {
                                return true;
                            }
                        }
                    });
                }
                ret = this.pushStack("", "find", selector);
                for (i = 0, l = __get$(this, "length"); i < l; i++) {
                    length = __get$(ret, "length");
                    jQuery.find(selector, __get$(this, i), ret);
                    if (i > 0) {
                        // Make sure that the results are unique
                        for (n = length; n < __get$(ret, "length"); n++) {
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
                var i, targets = jQuery(target, this), len = __get$(targets, "length");
                return this.filter(function () {
                    for (i = 0; i < len; i++) {
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
                return !!selector && (typeof selector === "string" ? // If this is a positional/relative selector, check membership in the returned set
                        // so $("p:first").is("p:last") won't return true for a doc with two "p".
                                      rneedsContext.test(selector) ? jQuery(selector, this.context).index(this[0]) >=
                                                                     0 : __get$(jQuery.filter(selector, this), "length") >
                                                                         0 : __get$(this.filter(selector), "length") >
                                                                             0);
            },
            closest: function (selectors, context) {
                var cur, i = 0, l = __get$(this, "length"), ret = [], pos = rneedsContext.test(selectors) ||
                                                                            typeof selectors !==
                                                                            "string" ? jQuery(selectors, context ||
                                                                                                         this.context) : 0;
                for (; i < l; i++) {
                    cur = __get$(this, i);
                    while (cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11) {
                        if (pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors)) {
                            ret.push(cur);
                            break;
                        }
                        cur = cur.parentNode;
                    }
                }
                ret = __get$(ret, "length") > 1 ? jQuery.unique(ret) : ret;
                return this.pushStack(ret, "closest", selectors);
            },
            // Determine the position of an element within
            // the matched set of elements
            index:   function (elem) {
                // No argument, return index in parent
                if (!elem) {
                    return this[0] && this[0].parentNode ? __get$(this.prevAll(), "length") : -1;
                }
                // index in selector
                if (typeof elem === "string") {
                    return jQuery.inArray(this[0], jQuery(elem));
                }
                // Locate the position of the desired element
                return jQuery.inArray(// If it receives a jQuery object, the first element is used
                    elem.jquery ? elem[0] : elem, this);
            },
            add:     function (selector, context) {
                var set = typeof selector === "string" ? jQuery(selector, context) : jQuery.makeArray(selector &&
                                                                                                      selector.nodeType ? [selector] : selector), all = jQuery.merge(this.get(), set);
                return this.pushStack(isDisconnected(set[0]) || isDisconnected(all[0]) ? all : jQuery.unique(all));
            },
            addBack: function (selector) {
                return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
            }
        });
        jQuery.fn.andSelf      = jQuery.fn.addBack;
        // A painfully simple check to see if an element is disconnected
        // from a document (should be improved, where feasible).
        function isDisconnected (node) {
            return !node || !node.parentNode || node.parentNode.nodeType === 11;
        }

        function sibling (cur, dir) {
            do {
                cur = __get$(cur, dir);
            } while (cur && cur.nodeType !== 1);
            return cur;
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
                return sibling(elem, "nextSibling");
            },
            prev:         function (elem) {
                return sibling(elem, "previousSibling");
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
                return jQuery.sibling(__get$(elem.parentNode || {}, "firstChild"), elem);
            },
            children:     function (elem) {
                return jQuery.sibling(__get$(elem, "firstChild"));
            },
            contents:     function (elem) {
                return jQuery.nodeName(elem, "iframe") ? elem.contentDocument ||
                                                         elem.contentWindow.document : jQuery.merge([], elem.childNodes);
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
                ret = __get$(this, "length") > 1 && !__get$(guaranteedUnique, name) ? jQuery.unique(ret) : ret;
                if (__get$(this, "length") > 1 && rparentsprev.test(name)) {
                    ret = ret.reverse();
                }
                return this.pushStack(ret, name, core_slice.call(arguments).join(","));
            });
        });
        jQuery.extend({
            filter:  function (expr, elems, not) {
                if (not) {
                    expr = ":not(" + expr + ")";
                }
                return __get$(elems, "length") ===
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
                while (__get$(list, "length")) {
                    safeFrag.createElement(list.pop());
                }
            }
            return safeFrag;
        }

        var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
                        "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video", rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g, rleadingWhitespace = /^\s+/, rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, rtagName = /<([\w:]+)/, rtbody = /<tbody/i, rhtml = /<|&#?\w+;/, rnoInnerhtml = /<(?:script|style|link)/i, rnocache = /<(?:script|object|embed|option|style)/i, rnoshimcache = new RegExp("<(?:" +
                                                                                                                                                                                                                                                                                                                                                                                                                                                               nodeNames +
                                                                                                                                                                                                                                                                                                                                                                                                                                                               ")[\\s/>]", "i"), rcheckableType = /^(?:checkbox|radio)$/,
            // checked="checked" or checked
            rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, rscriptType = /\/(java|ecma)script/i, rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g, wrapMap = {
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
            }, safeFragment = createSafeFragment(document), fragmentDiv = safeFragment.appendChild(document.createElement("div"));
        wrapMap.optgroup = wrapMap.option;
        wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
        wrapMap.th = wrapMap.td;
        // IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
        // unless wrapped in a div with non-breaking characters in front of it.
        if (!jQuery.support.htmlSerialize) {
            wrapMap._default = [
                1,
                "X<div>",
                "</div>"
            ];
        }
        jQuery.fn.extend({
            text:        function (value) {
                return jQuery.access(this, function (value) {
                    return value === undefined ? jQuery.text(this) : this.empty().append((this[0] &&
                                                                                          this[0].ownerDocument ||
                                                                                          document).createTextNode(value));
                }, null, value, __get$(arguments, "length"));
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
                        while (__get$(elem, "firstChild") && __get$(elem, "firstChild").nodeType === 1) {
                            elem = __get$(elem, "firstChild");
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
                    if (__get$(contents, "length")) {
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
                    if (this.nodeType === 1 || this.nodeType === 11) {
                        this.appendChild(elem);
                    }
                });
            },
            prepend:     function () {
                return this.domManip(arguments, true, function (elem) {
                    if (this.nodeType === 1 || this.nodeType === 11) {
                        this.insertBefore(elem, __get$(this, "firstChild"));
                    }
                });
            },
            before:      function () {
                if (!isDisconnected(this[0])) {
                    return this.domManip(arguments, false, function (elem) {
                        this.parentNode.insertBefore(elem, this);
                    });
                }
                if (__get$(arguments, "length")) {
                    var set = jQuery.clean(arguments);
                    return this.pushStack(jQuery.merge(set, this), "before", this.selector);
                }
            },
            after:       function () {
                if (!isDisconnected(this[0])) {
                    return this.domManip(arguments, false, function (elem) {
                        this.parentNode.insertBefore(elem, this.nextSibling);
                    });
                }
                if (__get$(arguments, "length")) {
                    var set = jQuery.clean(arguments);
                    return this.pushStack(jQuery.merge(this, set), "after", this.selector);
                }
            },
            // keepData is for internal use only--do not document
            remove:      function (selector, keepData) {
                var elem, i = 0;
                for (; (elem = __get$(this, i)) != null; i++) {
                    if (!selector || __get$(jQuery.filter(selector, [elem]), "length")) {
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
                var elem, i = 0;
                for (; (elem = __get$(this, i)) != null; i++) {
                    // Remove element nodes and prevent memory leaks
                    if (elem.nodeType === 1) {
                        jQuery.cleanData(elem.getElementsByTagName("*"));
                    }
                    // Remove any remaining nodes
                    while (__get$(elem, "firstChild")) {
                        elem.removeChild(__get$(elem, "firstChild"));
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
                    var elem = this[0] || {}, i = 0, l = __get$(this, "length");
                    if (value === undefined) {
                        return elem.nodeType === 1 ? __get$(elem, "innerHTML").replace(rinlinejQuery, "") : undefined;
                    }
                    // See if we can take a shortcut and just use innerHTML
                    if (typeof value === "string" && !rnoInnerhtml.test(value) &&
                        (jQuery.support.htmlSerialize || !rnoshimcache.test(value)) &&
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
                            elem = 0;
                        } catch (e) {
                        }
                    }
                    if (elem) {
                        this.empty().append(value);
                    }
                }, null, value, __get$(arguments, "length"));
            },
            replaceWith: function (value) {
                if (!isDisconnected(this[0])) {
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
                return __get$(this, "length") ? this.pushStack(jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value) : this;
            },
            detach:      function (selector) {
                return this.remove(selector, true);
            },
            domManip:    function (args, table, callback) {
                // Flatten any nested arrays
                args                                      = [].concat.apply([], args);
                var results, first, fragment, iNoClone, i = 0, value = args[0], scripts = [], l = __get$(this, "length");
                // We can't cloneNode fragments that contain checked, in WebKit
                if (!jQuery.support.checkClone && l > 1 && typeof value === "string" && rchecked.test(value)) {
                    return this.each(function () {
                        jQuery(this).domManip(args, table, callback);
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
                    results  = jQuery.buildFragment(args, this, scripts);
                    fragment = results.fragment;
                    first    = __get$(fragment, "firstChild");
                    if (__get$(fragment.childNodes, "length") === 1) {
                        fragment = first;
                    }
                    if (first) {
                        table = table && jQuery.nodeName(first, "tr");
                        // Use the original fragment for the last item instead of the first because it can end up
                        // being emptied incorrectly in certain situations (#8070).
                        // Fragments from the fragment cache must always be cloned and never used in place.
                        for (iNoClone = results.cacheable || l - 1; i < l; i++) {
                            callback.call(table &&
                                          jQuery.nodeName(__get$(this, i), "table") ? findOrAppend(__get$(this, i), "tbody") : __get$(this, i), i ===
                                                                                                                                                iNoClone ? fragment : jQuery.clone(fragment, true, true));
                        }
                    }
                    // Fix #11809: Avoid leaking memory
                    fragment = first = null;
                    if (__get$(scripts, "length")) {
                        jQuery.each(scripts, function (i, elem) {
                            if (__get$(elem, "src")) {
                                if (jQuery.ajax) {
                                    jQuery.ajax({
                                        url:      __get$(elem, "src"),
                                        type:     "GET",
                                        dataType: "script",
                                        async:    false,
                                        global:   false,
                                        "throws": true
                                    });
                                }
                                else {
                                    jQuery.error("no ajax");
                                }
                            }
                            else {
                                jQuery.globalEval((__get$(elem, "text") || __get$(elem, "textContent") ||
                                                   __get$(elem, "innerHTML") || "").replace(rcleanScript, ""));
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
        function findOrAppend (elem, tag) {
            return elem.getElementsByTagName(tag)[0] || elem.appendChild(elem.ownerDocument.createElement(tag));
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
                    for (i = 0, l = __get$(__get$(events, type), "length"); i < l; i++) {
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
            if (nodeName === "object") {
                // IE6-10 improperly clones children of object elements using classid.
                // IE10 throws NoModificationAllowedError if parent is null, #12132.
                if (dest.parentNode) {
                    dest.outerHTML = src.outerHTML;
                }
                // This path appears unavoidable for IE9. When cloning an object
                // element in IE9, the outerHTML strategy above is not sufficient.
                // If the src has innerHTML and the destination does not,
                // copy the src.innerHTML into the dest.innerHTML. #10324
                if (jQuery.support.html5Clone &&
                    (__get$(src, "innerHTML") && !jQuery.trim(__get$(dest, "innerHTML")))) {
                    __set$(dest, "innerHTML", __get$(src, "innerHTML"));
                }
            }
            else if (nodeName === "input" && rcheckableType.test(src.type)) {
                // IE6-8 fails to persist the checked state of a cloned checkbox
                // or radio button. Worse, IE6-7 fail to give the cloned element
                // a checked appearance if the defaultChecked value isn't also set
                dest.defaultChecked = dest.checked = src.checked;
                // IE6-7 get confused and end up setting the value of a cloned
                // checkbox/radio button to an empty string instead of "on"
                if (__get$(dest, "value") !== __get$(src, "value")) {
                    __set$(dest, "value", __get$(src, "value"));
                }
            }
            else if (nodeName === "option") {
                dest.selected = src.defaultSelected;
            }
            else if (nodeName === "input" || nodeName === "textarea") {
                dest.defaultValue = src.defaultValue;
            }
            else if (nodeName === "script" && __get$(dest, "text") !== __get$(src, "text")) {
                __set$(dest, "text", __get$(src, "text"));
            }
            // Event data gets referenced instead of copied if the expando
            // gets copied too
            dest.removeAttribute(jQuery.expando);
        }

        jQuery.buildFragment = function (args, context, scripts) {
            var fragment, cacheable, cachehit, first = args[0];
            // Set context from what may come in as undefined or a jQuery collection or a node
            // Updated to fix #12266 where accessing context[0] could throw an exception in IE9/10 &
            // also doubles as fix for #8950 where plain objects caused createDocumentFragment exception
            context = context || document;
            context = !context.nodeType && context[0] || context;
            context = context.ownerDocument || context;
            // Only cache "small" (1/2 KB) HTML strings that are associated with the main document
            // Cloning options loses the selected state, so don't cache them
            // IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
            // Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
            // Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
            if (__get$(args, "length") === 1 && typeof first === "string" && __get$(first, "length") < 512 &&
                context === document && first.charAt(0) === "<" && !rnocache.test(first) &&
                (jQuery.support.checkClone || !rchecked.test(first)) &&
                (jQuery.support.html5Clone || !rnoshimcache.test(first))) {
                // Mark cacheable and look for a hit
                cacheable = true;
                fragment  = __get$(jQuery.fragments, first);
                cachehit  = fragment !== undefined;
            }
            if (!fragment) {
                fragment = context.createDocumentFragment();
                jQuery.clean(args, context, fragment, scripts);
                // Update the cache, but only store false
                // unless this is a second parsing of the same content
                if (cacheable) {
                    __set$(jQuery.fragments, first, cachehit && fragment);
                }
            }
            return {
                fragment: fragment,
                cacheable: cacheable
            };
        };
        jQuery.fragments = {};
        jQuery.each({
            appendTo:     "append",
            prependTo:    "prepend",
            insertBefore: "before",
            insertAfter:  "after",
            replaceAll:   "replaceWith"
        }, function (name, original) {
            __set$(jQuery.fn, name, function (selector) {
                var elems, i = 0, ret = [], insert = jQuery(selector), l = __get$(insert, "length"), parent = __get$(this, "length") ===
                                                                                                              1 &&
                                                                                                              this[0].parentNode;
                if ((parent == null || parent && parent.nodeType === 11 && __get$(parent.childNodes, "length") === 1) &&
                    l === 1) {
                    __call$(insert, original, [this[0]]);
                    return this;
                }
                else {
                    for (; i < l; i++) {
                        elems = (i > 0 ? this.clone(true) : this).get();
                        __call$(jQuery(__get$(insert, i)), original, [elems]);
                        ret   = ret.concat(elems);
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
                return __call$(elem, "querySelectorAll", ["*"]);
            }
            else {
                return [];
            }
        }

        // Used in clean, fixes the defaultChecked property
        function fixDefaultChecked (elem) {
            if (rcheckableType.test(elem.type)) {
                elem.defaultChecked = elem.checked;
            }
        }

        jQuery.extend({
            clone:     function (elem, dataAndEvents, deepDataAndEvents) {
                var srcElements, destElements, i, clone;
                if (jQuery.support.html5Clone || jQuery.isXMLDoc(elem) ||
                    !rnoshimcache.test("<" + elem.nodeName + ">")) {
                    clone = elem.cloneNode(true);
                }
                else {
                    __set$(fragmentDiv, "innerHTML", elem.outerHTML);
                    fragmentDiv.removeChild(clone = __get$(fragmentDiv, "firstChild"));
                }
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
                var i, j, elem, tag, wrap, depth, div, hasBody, tbody, len, handleScript, jsTags, safe = context ===
                                                                                                         document &&
                                                                                                         safeFragment, ret = [];
                // Ensure that context is a document
                if (!context || typeof context.createDocumentFragment === "undefined") {
                    context = document;
                }
                // Use the already-created safe fragment if context permits
                for (i = 0; (elem = __get$(elems, i)) != null; i++) {
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
                            // Ensure a safe container in which to render the html
                            safe = safe || createSafeFragment(context);
                            div  = context.createElement("div");
                            safe.appendChild(div);
                            // Fix "XHTML"-style tags in all browsers
                            elem = elem.replace(rxhtmlTag, "<$1></$2>");
                            // Go to html and back, then peel off extra wrappers
                            tag   = (rtagName.exec(elem) || [
                                "",
                                ""
                            ])[1].toLowerCase();
                            wrap  = __get$(wrapMap, tag) || wrapMap._default;
                            depth = wrap[0];
                            __set$(div, "innerHTML", wrap[1] + elem + wrap[2]);
                            while (depth--) {
                                div = __get$(div, "lastChild");
                            }
                            // Remove IE's autoinserted <tbody> from table fragments
                            if (!jQuery.support.tbody) {
                                // String was a <table>, *may* have spurious <tbody>
                                hasBody = rtbody.test(elem);
                                tbody   = tag === "table" && !hasBody ? __get$(div, "firstChild") &&
                                                                        __get$(div, "firstChild").childNodes : // String was a bare <thead> or <tfoot>
                                          wrap[1] === "<table>" && !hasBody ? div.childNodes : [];
                                for (j = __get$(tbody, "length") - 1; j >= 0; --j) {
                                    if (jQuery.nodeName(__get$(tbody, j), "tbody") &&
                                        !__get$(__get$(tbody, j).childNodes, "length")) {
                                        __get$(tbody, j).parentNode.removeChild(__get$(tbody, j));
                                    }
                                }
                            }
                            // IE completely kills leading whitespace when innerHTML is used
                            if (!jQuery.support.leadingWhitespace && rleadingWhitespace.test(elem)) {
                                div.insertBefore(context.createTextNode(rleadingWhitespace.exec(elem)[0]), __get$(div, "firstChild"));
                            }
                            elem = div.childNodes;
                            // Take out of fragment container (we need a fresh div each time)
                            div.parentNode.removeChild(div);
                        }
                    }
                    if (elem.nodeType) {
                        ret.push(elem);
                    }
                    else {
                        jQuery.merge(ret, elem);
                    }
                }
                // Fix #11356: Clear elements from safeFragment
                if (div) {
                    elem = div = safe = null;
                }
                // Reset defaultChecked for any radios and checkboxes
                // about to be appended to the DOM in IE 6/7 (#8060)
                if (!jQuery.support.appendChecked) {
                    for (i = 0; (elem = __get$(ret, i)) != null; i++) {
                        if (jQuery.nodeName(elem, "input")) {
                            fixDefaultChecked(elem);
                        }
                        else if (typeof elem.getElementsByTagName !== "undefined") {
                            jQuery.grep(elem.getElementsByTagName("input"), fixDefaultChecked);
                        }
                    }
                }
                // Append elements to a provided document fragment
                if (fragment) {
                    // Special handling of each script element
                    handleScript = function (elem) {
                        // Check if we consider it executable
                        if (!elem.type || rscriptType.test(elem.type)) {
                            // Detach the script and store it in the scripts array (if provided) or the fragment
                            // Return truthy to indicate that it has been handled
                            return scripts ? scripts.push(elem.parentNode ? elem.parentNode.removeChild(elem) : elem) : fragment.appendChild(elem);
                        }
                    };
                    for (i = 0; (elem = __get$(ret, i)) != null; i++) {
                        // Check if we're done after handling an executable script
                        if (!(jQuery.nodeName(elem, "script") && handleScript(elem))) {
                            // Append to fragment and handle embedded scripts
                            fragment.appendChild(elem);
                            if (typeof elem.getElementsByTagName !== "undefined") {
                                // handleScript alters the DOM, so use jQuery.merge to ensure snapshot iteration
                                jsTags = jQuery.grep(jQuery.merge([], elem.getElementsByTagName("script")), handleScript);
                                // Splice the scripts into ret after their former ancestor and advance our index beyond them
                                ret.splice.apply(ret, [
                                    i + 1,
                                    0
                                ].concat(jsTags));
                                i      = i + __get$(jsTags, "length");
                            }
                        }
                    }
                }
                return ret;
            },
            cleanData: function (elems, acceptData) {
                var data, id, elem, type, i = 0, internalKey = jQuery.expando, cache = jQuery.cache, deleteExpando = jQuery.support.deleteExpando, special = jQuery.event.special;
                for (; (elem = __get$(elems, i)) != null; i++) {
                    if (acceptData || jQuery.acceptData(elem)) {
                        id   = __get$(elem, internalKey);
                        data = id && __get$(cache, id);
                        if (data) {
                            if (data.events) {
                                for (type in data.events) {
                                    if (__get$(special, type)) {
                                        jQuery.event.remove(elem, type);
                                    }
                                    else {
                                        jQuery.removeEvent(elem, type, data.handle);
                                    }
                                }
                            }
                            // Remove cache only if it was not already removed by jQuery.event.remove
                            if (__get$(cache, id)) {
                                delete cache[id];
                                if (deleteExpando) {
                                    delete elem[internalKey];
                                }
                                else if (elem.removeAttribute) {
                                    elem.removeAttribute(internalKey);
                                }
                                else {
                                    __set$(elem, internalKey, null);
                                }
                                jQuery.deletedIds.push(id);
                            }
                        }
                    }
                }
            }
        });
        // Limit scope pollution from any deprecated API
        (function () {
            var matched, browser;
            // Use of jQuery.browser is frowned upon.
            // More details: http://api.jquery.com/jQuery.browser
            // jQuery.uaMatch maintained for back-compat
            jQuery.uaMatch = function (ua) {
                ua        = ua.toLowerCase();
                var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) ||
                            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
                return {
                    browser: match[1] || "",
                    version: match[2] || "0"
                };
            };
            matched        = jQuery.uaMatch(navigator.userAgent);
            browser        = {};
            if (matched.browser) {
                __set$(browser, matched.browser, true);
                browser.version = matched.version;
            }
            // Chrome is Webkit, but Webkit is also Safari.
            if (browser.chrome) {
                browser.webkit = true;
            }
            else if (browser.webkit) {
                browser.safari = true;
            }
            jQuery.browser = browser;
            jQuery.sub     = function () {
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
            };
        }());
        var curCSS, iframe, iframeDoc, ralpha = /alpha\([^)]*\)/i, ropacity = /opacity=([^)]*)/, rposition = /^(top|right|bottom|left)$/,
            // swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
            // see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
            rdisplayswap = /^(none|table(?!-c[ea]).+)/, rmargin = /^margin/, rnumsplit = new RegExp("^(" + core_pnum +
                                                                                                    ")(.*)$", "i"), rnumnonpx = new RegExp("^(" +
                                                                                                                                           core_pnum +
                                                                                                                                           ")(?!px)[a-z%]+$", "i"), rrelNum = new RegExp("^([-+])=(" +
                                                                                                                                                                                         core_pnum +
                                                                                                                                                                                         ")", "i"), elemdisplay = {}, cssShow = {
                position:   "absolute",
                visibility: "hidden",
                display:    "block"
            }, cssNormalTransform = {
                letterSpacing: 0,
                fontWeight:    400
            }, cssExpand = [
                "Top",
                "Right",
                "Bottom",
                "Left"
            ], cssPrefixes = [
                "Webkit",
                "O",
                "Moz",
                "ms"
            ], eventsToggle = jQuery.fn.toggle;
        // return a css property mapped to a potentially vendor prefixed property
        function vendorPropName (style, name) {
            // shortcut for names that are not vendor prefixed
            if (name in style) {
                return name;
            }
            // check for vendor prefixed names
            var capName = name.charAt(0).toUpperCase() +
                          name.slice(1), origName = name, i = __get$(cssPrefixes, "length");
            while (i--) {
                name = __get$(cssPrefixes, i) + capName;
                if (name in style) {
                    return name;
                }
            }
            return origName;
        }

        function isHidden (elem, el) {
            elem = el || elem;
            return jQuery.css(elem, "display") === "none" || !jQuery.contains(elem.ownerDocument, elem);
        }

        function showHide (elements, show) {
            var elem, display, values = [], index = 0, length = __get$(elements, "length");
            for (; index < length; index++) {
                elem = __get$(elements, index);
                if (!elem.style) {
                    continue;
                }
                __set$(values, index, jQuery._data(elem, "olddisplay"));
                if (show) {
                    // Reset the inline display of this element to learn if it is
                    // being hidden by cascaded rules or not
                    if (!__get$(values, index) && elem.style.display === "none") {
                        elem.style.display = "";
                    }
                    // Set elements which have been overridden with display: none
                    // in a stylesheet to whatever the default browser style is
                    // for such an element
                    if (elem.style.display === "" && isHidden(elem)) {
                        __set$(values, index, jQuery._data(elem, "olddisplay", css_defaultDisplay(elem.nodeName)));
                    }
                }
                else {
                    display = curCSS(elem, "display");
                    if (!__get$(values, index) && display !== "none") {
                        jQuery._data(elem, "olddisplay", display);
                    }
                }
            }
            // Set the display of most of the elements in a second loop
            // to avoid the constant reflow
            for (index = 0; index < length; index++) {
                elem = __get$(elements, index);
                if (!elem.style) {
                    continue;
                }
                if (!show || elem.style.display === "none" || elem.style.display === "") {
                    elem.style.display = show ? __get$(values, index) || "" : "none";
                }
            }
            return elements;
        }

        jQuery.fn.extend({
            css:    function (name, value) {
                return jQuery.access(this, function (elem, name, value) {
                    return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
                }, name, value, __get$(arguments, "length") > 1);
            },
            show:   function () {
                return showHide(this, true);
            },
            hide:   function () {
                return showHide(this);
            },
            toggle: function (state, fn2) {
                var bool = typeof state === "boolean";
                if (jQuery.isFunction(state) && jQuery.isFunction(fn2)) {
                    return eventsToggle.apply(this, arguments);
                }
                return this.each(function () {
                    if (bool ? state : isHidden(this)) {
                        jQuery(this).show();
                    }
                    else {
                        jQuery(this).hide();
                    }
                });
            }
        });
        jQuery.extend({
            // Add in style property hooks for overriding the default
            // behavior of getting and setting a style property
            cssHooks:  {
                opacity: {
                    get: function (elem, computed) {
                        if (computed) {
                            // We should always get a number back from opacity
                            var ret = curCSS(elem, "opacity");
                            return ret === "" ? "1" : ret;
                        }
                    }
                }
            },
            // Exclude the following css properties to add px
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
            // Add in properties whose names you wish to fix before
            // setting or getting the value
            cssProps:  {
                // normalize float css property
                "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
            },
            // Get and set the style property on a DOM Node
            style:     function (elem, name, value, extra) {
                // Don't set styles on text and comment nodes
                if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
                    return;
                }
                // Make sure that we're working with the right name
                var ret, type, hooks, origName = jQuery.camelCase(name), style = elem.style;
                name                           = __get$(jQuery.cssProps, origName) ||
                                                 __set$(jQuery.cssProps, origName, vendorPropName(style, origName));
                // gets hook for the prefixed version
                // followed by the unprefixed version
                hooks = __get$(jQuery.cssHooks, name) || __get$(jQuery.cssHooks, origName);
                // Check if we're setting a value
                if (value !== undefined) {
                    type = typeof value;
                    // convert relative number strings (+= or -=) to relative numbers. #7345
                    if (type === "string" && (ret = rrelNum.exec(value))) {
                        value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem, name));
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
                    if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
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
            css:       function (elem, name, numeric, extra) {
                var val, num, hooks, origName = jQuery.camelCase(name);
                // Make sure that we're working with the right name
                name = __get$(jQuery.cssProps, origName) ||
                       __set$(jQuery.cssProps, origName, vendorPropName(elem.style, origName));
                // gets hook for the prefixed version
                // followed by the unprefixed version
                hooks = __get$(jQuery.cssHooks, name) || __get$(jQuery.cssHooks, origName);
                // If a hook was provided get the computed value from there
                if (hooks && "get" in hooks) {
                    val = hooks.get(elem, true, extra);
                }
                // Otherwise, if a way to get the computed value exists, use that
                if (val === undefined) {
                    val = curCSS(elem, name);
                }
                //convert "normal" to computed value
                if (val === "normal" && name in cssNormalTransform) {
                    val = __get$(cssNormalTransform, name);
                }
                // Return, converting to number if forced or a qualifier was provided and val looks numeric
                if (numeric || extra !== undefined) {
                    num = parseFloat(val);
                    return numeric || jQuery.isNumeric(num) ? num || 0 : val;
                }
                return val;
            },
            // A method for quickly swapping in/out CSS properties to get correct calculations
            swap:      function (elem, options, callback) {
                var ret, name, old = {};
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
        // NOTE: To any future maintainer, we've window.getComputedStyle
        // because jsdom on node.js will break without it.
        if (window.getComputedStyle) {
            curCSS = function (elem, name) {
                var ret, width, minWidth, maxWidth, computed = window.getComputedStyle(elem, null), style = elem.style;
                if (computed) {
                    ret = __get$(computed, name);
                    if (ret === "" && !jQuery.contains(elem.ownerDocument, elem)) {
                        ret = jQuery.style(elem, name);
                    }
                    // A tribute to the "awesome hack by Dean Edwards"
                    // Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
                    // Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
                    // this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
                    if (rnumnonpx.test(ret) && rmargin.test(name)) {
                        width          = style.width;
                        minWidth       = style.minWidth;
                        maxWidth       = style.maxWidth;
                        style.minWidth = style.maxWidth = style.width = ret;
                        ret            = computed.width;
                        style.width    = width;
                        style.minWidth = minWidth;
                        style.maxWidth = maxWidth;
                    }
                }
                return ret;
            };
        }
        else if (document.documentElement.currentStyle) {
            curCSS = function (elem, name) {
                var left, rsLeft, ret = elem.currentStyle && __get$(elem.currentStyle, name), style = elem.style;
                // Avoid setting ret to empty string here
                // so we don't default to auto
                if (ret == null && style && __get$(style, name)) {
                    ret = __get$(style, name);
                }
                // From the awesome hack by Dean Edwards
                // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
                // If we're not dealing with a regular pixel number
                // but a number that has a weird ending, we need to convert it to pixels
                // but not position css attributes, as those are proportional to the parent element instead
                // and we can't measure the parent instead because it might trigger a "stacking dolls" problem
                if (rnumnonpx.test(ret) && !rposition.test(name)) {
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
        function setPositiveNumber (elem, value, subtract) {
            var matches = rnumsplit.exec(value);
            return matches ? Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") : value;
        }

        function augmentWidthOrHeight (elem, name, extra, isBorderBox) {
            var i = extra === (isBorderBox ? "border" : "content") ? // If we already have the right measurement, avoid augmentation
                    4 : // Otherwise initialize for horizontal or vertical properties
                    name === "width" ? 1 : 0, val = 0;
            for (; i < 4; i = i + 2) {
                if (extra === "margin") {
                    val = val + jQuery.css(elem, extra + __get$(cssExpand, i), true);
                }
                if (isBorderBox) {
                    if (extra === "content") {
                        val -= parseFloat(curCSS(elem, "padding" + __get$(cssExpand, i))) || 0;
                    }
                    if (extra !== "margin") {
                        val -= parseFloat(curCSS(elem, "border" + __get$(cssExpand, i) + "Width")) || 0;
                    }
                }
                else {
                    val = val + (parseFloat(curCSS(elem, "padding" + __get$(cssExpand, i))) || 0);
                    if (extra !== "padding") {
                        val = val + (parseFloat(curCSS(elem, "border" + __get$(cssExpand, i) + "Width")) || 0);
                    }
                }
            }
            return val;
        }

        function getWidthOrHeight (elem, name, extra) {
            // Start with offset property, which is equivalent to the border-box value
            var val = name ===
                      "width" ? elem.offsetWidth : elem.offsetHeight, valueIsBorderBox = true, isBorderBox = jQuery.support.boxSizing &&
                                                                                                             jQuery.css(elem, "boxSizing") ===
                                                                                                             "border-box";
            // some non-html elements return undefined for offsetWidth, so check for null/undefined
            // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
            // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
            if (val <= 0 || val == null) {
                // Fall back to computed then uncomputed css if necessary
                val = curCSS(elem, name);
                if (val < 0 || val == null) {
                    val = __get$(elem.style, name);
                }
                // Computed unit is not pixels. Stop here and return.
                if (rnumnonpx.test(val)) {
                    return val;
                }
                // we need the check for style in case a browser which returns unreliable values
                // for getComputedStyle silently falls back to the reliable elem.style
                valueIsBorderBox = isBorderBox &&
                                   (jQuery.support.boxSizingReliable || val === __get$(elem.style, name));
                // Normalize "", auto, and prepare for extra
                val = parseFloat(val) || 0;
            }
            // use the active box-sizing model to add/subtract irrelevant styles
            return val +
                   augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox) +
                   "px";
        }

        // Try to determine the default display value of an element
        function css_defaultDisplay (nodeName) {
            if (__get$(elemdisplay, nodeName)) {
                return __get$(elemdisplay, nodeName);
            }
            var elem = jQuery("<" + nodeName + ">").appendTo(document.body), display = elem.css("display");
            elem.remove();
            // If the simple way fails,
            // get element's real default display by attaching it to a temp iframe
            if (display === "none" || display === "") {
                // Use the already-created iframe if possible
                iframe = document.body.appendChild(iframe || jQuery.extend(document.createElement("iframe"), {
                        frameBorder: 0,
                        width:       0,
                        height:      0
                    }));
                // Create a cacheable copy of the iframe document on first call.
                // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
                // document to it; WebKit & Firefox won't allow reusing the iframe document.
                if (!iframeDoc || !iframe.createElement) {
                    iframeDoc = (iframe.contentWindow || iframe.contentDocument).document;
                    __call$(iframeDoc, "write", ["<!doctype html><html><body>"]);
                    iframeDoc.close();
                }
                elem    = iframeDoc.body.appendChild(iframeDoc.createElement(nodeName));
                display = curCSS(elem, "display");
                document.body.removeChild(iframe);
            }
            // Store the correct default display
            __set$(elemdisplay, nodeName, display);
            return display;
        }

        jQuery.each([
            "height",
            "width"
        ], function (i, name) {
            __set$(jQuery.cssHooks, name, {
                get: function (elem, computed, extra) {
                    if (computed) {
                        if (elem.offsetWidth === 0 && rdisplayswap.test(curCSS(elem, "display"))) {
                            return jQuery.swap(elem, cssShow, function () {
                                return getWidthOrHeight(elem, name, extra);
                            });
                        }
                        else {
                            return getWidthOrHeight(elem, name, extra);
                        }
                    }
                },
                set: function (elem, value, extra) {
                    return setPositiveNumber(elem, value, extra ? augmentWidthOrHeight(elem, name, extra, jQuery.support.boxSizing &&
                                                                                                          jQuery.css(elem, "boxSizing") ===
                                                                                                          "border-box") : 0);
                }
            });
        });
        if (!jQuery.support.opacity) {
            jQuery.cssHooks.opacity = {
                get: function (elem, computed) {
                    // IE uses filters for opacity
                    return ropacity.test((computed &&
                                          elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) ||
                                         "") ? 0.01 * parseFloat(RegExp.$1) + "" : computed ? "1" : "";
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
                    if (value >= 1 && jQuery.trim(filter.replace(ralpha, "")) === "" && style.removeAttribute) {
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
        // These hooks cannot be added until DOM ready because the support test
        // for it is not run until after DOM ready
        jQuery(function () {
            if (!jQuery.support.reliableMarginRight) {
                jQuery.cssHooks.marginRight = {
                    get: function (elem, computed) {
                        // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                        // Work around by temporarily setting element display to inline-block
                        return jQuery.swap(elem, { "display": "inline-block" }, function () {
                            if (computed) {
                                return curCSS(elem, "marginRight");
                            }
                        });
                    }
                };
            }
            // Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
            // getComputedStyle returns percent when specified for top/left/bottom/right
            // rather than make the css module depend on the offset module, we just check for it here
            if (!jQuery.support.pixelPosition && jQuery.fn.position) {
                jQuery.each([
                    "top",
                    "left"
                ], function (i, prop) {
                    __set$(jQuery.cssHooks, prop, {
                        get: function (elem, computed) {
                            if (computed) {
                                var ret = curCSS(elem, prop);
                                return rnumnonpx.test(ret) ? __get$(jQuery(elem).position(), prop) + "px" : ret;
                            }
                        }
                    });
                });
            }
        });
        if (jQuery.expr && jQuery.expr.filters) {
            jQuery.expr.filters.hidden  = function (elem) {
                return elem.offsetWidth === 0 && elem.offsetHeight === 0 || !jQuery.support.reliableHiddenOffsets &&
                                                                            (elem.style && elem.style.display ||
                                                                             curCSS(elem, "display")) === "none";
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
                    var i, parts = typeof value === "string" ? value.split(" ") : [value], expanded = {};
                    for (i = 0; i < 4; i++) {
                        __set$(expanded, prefix + __get$(cssExpand, i) + suffix, __get$(parts, i) ||
                                                                                 __get$(parts, i - 2) || parts[0]);
                    }
                    return expanded;
                }
            });
            if (!rmargin.test(prefix)) {
                __get$(jQuery.cssHooks, prefix + suffix).set = setPositiveNumber;
            }
        });
        var r20 = /%20/g, rbracket = /\[\]$/, rCRLF = /\r?\n/g, rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i, rselectTextarea = /^(?:select|textarea)/i;
        jQuery.fn.extend({
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
        //Serialize an array of form elements or a set of
        //key/values into a query string
        jQuery.param = function (a, traditional) {
            var prefix, s = [], add = function (key, value) {
                // If value is a function, invoke it and return its value
                value = jQuery.isFunction(value) ? value() : value == null ? "" : value;
                __set$(s, __get$(s, "length"), encodeURIComponent(key) + "=" + encodeURIComponent(value));
            };
            // Set traditional to true for jQuery <= 1.3.2 behavior.
            if (traditional === undefined) {
                traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
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
                for (prefix in a) {
                    buildParams(prefix, __get$(a, prefix), traditional, add);
                }
            }
            // Return the resulting serialization
            return s.join("&").replace(r20, "+");
        };
        function buildParams (prefix, obj, traditional, add) {
            var name;
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
                for (name in obj) {
                    buildParams(prefix + "[" + name + "]", __get$(obj, name), traditional, add);
                }
            }
            else {
                // Serialize scalar item.
                add(prefix, obj);
            }
        }

        var
        // Document location
        ajaxLocation,
        // Document location segments
        ajaxLocParts, rhash = /#.*$/, rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm,
        // IE leaves an \r character at EOL
        // #7653, #8125, #8152: local protocol detection
        rlocalProtocol      = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/, rnoContent = /^(?:GET|HEAD)$/, rprotocol = /^\/\//, rquery = /\?/, rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, rts = /([?&])_=[^&]*/, rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
        // Keep a copy of the old load method
        _load               = jQuery.fn.load,
        /* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
        prefilters          = {},
        /* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
        transports          = {},
        // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
        allTypes            = ["*/"] + ["*"];
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
                var dataType, list, placeBefore, dataTypes = dataTypeExpression.toLowerCase().split(core_rspace), i = 0, length = __get$(dataTypes, "length");
                if (jQuery.isFunction(func)) {
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
            dataType            = dataType || options.dataTypes[0];
            inspected           = inspected || {};
            __set$(inspected, dataType, true);
            var selection, list = __get$(structure, dataType), i = 0, length = list ? __get$(list, "length") : 0, executeOnly = structure ===
                                                                                                                                prefilters;
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

        jQuery.fn.load = function (url, params, callback) {
            if (typeof url !== "string" && _load) {
                return _load.apply(this, arguments);
            }
            // Don't do a request if no elements are being requested
            if (!__get$(this, "length")) {
                return this;
            }
            var selector, type, response, self = this, off = url.indexOf(" ");
            if (off >= 0) {
                selector = url.slice(off, __get$(url, "length"));
                url      = url.slice(0, off);
            }
            // If it's a function
            if (jQuery.isFunction(params)) {
                // We assume that it's the callback
                callback = params;
                params   = undefined;
            }
            else if (params && typeof params === "object") {
                type = "POST";
            }
            // Request the remote document
            jQuery.ajax({
                url:      url,
                // if "type" variable is undefined, then "GET" method will be used
                type:     type,
                dataType: "html",
                data:     params,
                complete: function (jqXHR, status) {
                    if (callback) {
                        self.each(callback, response || [
                                jqXHR.responseText,
                                status,
                                jqXHR
                            ]);
                    }
                }
            }).done(function (responseText) {
                // Save response for use in complete callback
                response = arguments;
                // See if a selector was specified
                self.html(selector ? // Create a dummy div to hold the results
                          jQuery("<div>").append(responseText.replace(rscript, "")).find(selector) : // If not, just inject the full result
                          responseText);
            });
            return this;
        };
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
            // Creates a full fledged settings object into target
            // with both ajaxSettings and settings fields.
            // If target is omitted, writes into ajaxSettings.
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
                /*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/
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
                // List of data converters
                // 1) key format is "source_type destination_type" (a single space in-between)
                // 2) the catchall symbol "*" can be used for source_type
                converters:     {
                    // Convert anything to text
                    "* text":    window.String,
                    // Text to html (true = no transformation)
                    "text html": true,
                    // Evaluate text as a json expression
                    "text json": jQuery.parseJSON,
                    // Parse text as xml
                    "text xml":  jQuery.parseXML
                },
                // For options that shouldn't be deep extended:
                // you can add your own custom options here if
                // and when you create one that shouldn't be
                // deep extended (see ajaxExtend)
                flatOptions:    {
                    context: true,
                    url:     true
                }
            },
            ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
            ajaxTransport: addToPrefiltersOrTransports(transports),
            // Main method
            ajax:          function (url, options) {
                // If url is an object, simulate pre-1.5 signature
                if (typeof url === "object") {
                    options = url;
                    url     = undefined;
                }
                // Force options to be an object
                options            = options || {};
                var
                // ifModified key
                ifModifiedKey,
                // Response headers
                responseHeadersString, responseHeaders,
                // transport
                transport,
                // timeout handle
                timeoutTimer,
                // Cross-domain detection vars
                parts,
                // To know if global events are to be dispatched
                fireGlobals,
                // Loop variable
                i,
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
                // Headers (they are sent all at once)
                requestHeaders     = {}, requestHeadersNames = {},
                // The jqXHR state
                state              = 0,
                // Default abort message
                strAbort           = "canceled",
                // Fake xhr
                jqXHR              = {
                    readyState:            0,
                    // Caches the header
                    setRequestHeader:      function (name, value) {
                        if (!state) {
                            var lname = name.toLowerCase();
                            name      = __set$(requestHeadersNames, lname, __get$(requestHeadersNames, lname) || name);
                            __set$(requestHeaders, name, value);
                        }
                        return this;
                    },
                    // Raw string
                    getAllResponseHeaders: function () {
                        return state === 2 ? responseHeadersString : null;
                    },
                    // Builds headers hashtable if needed
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
                    // Overrides response content-type header
                    overrideMimeType:      function (type) {
                        if (!state) {
                            s.mimeType = type;
                        }
                        return this;
                    },
                    // Cancel the request
                    abort:                 function (statusText) {
                        statusText = statusText || strAbort;
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
                    var isSuccess, success, error, response, modified, statusText = nativeStatusText;
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
                    jqXHR.readyState = status > 0 ? 4 : 0;
                    // Get response data
                    if (responses) {
                        response = ajaxHandleResponses(s, jqXHR, responses);
                    }
                    // If successful, handle type chaining
                    if (status >= 200 && status < 300 || status === 304) {
                        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                        if (s.ifModified) {
                            modified = jqXHR.getResponseHeader("Last-Modified");
                            if (modified) {
                                __set$(jQuery.lastModified, ifModifiedKey, modified);
                            }
                            modified = jqXHR.getResponseHeader("Etag");
                            if (modified) {
                                __set$(jQuery.etag, ifModifiedKey, modified);
                            }
                        }
                        // If not modified
                        if (status === 304) {
                            statusText = "notmodified";
                            isSuccess  = true;
                        }
                        else {
                            isSuccess  = ajaxConvert(s, response);
                            statusText = isSuccess.state;
                            success    = __get$(isSuccess, "data");
                            error      = isSuccess.error;
                            isSuccess  = !error;
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
                            jqXHR.always(tmp);
                        }
                    }
                    return this;
                };
                // Remove hash character (#7531: and string promotion)
                // Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
                // We also use the url parameter if available
                s.url = ((url || s.url) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");
                // Extract dataTypes list
                s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().split(core_rspace);
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
                    return jqXHR;
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
                        delete s.data;
                    }
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
                    // Abort if not done already and return
                    return jqXHR.abort();
                }
                // aborting is no longer a cancellation
                strAbort = "abort";
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
                            done(-1, e);
                        }
                        else {
                            throw e;
                        }
                    }
                }
                return jqXHR;
            },
            // Counter for holding the number of active queries
            active:        0,
            // Last-Modified header cache for next request
            lastModified:  {},
            etag:          {}
        });
         /* Handles responses to an ajax request:
         * - sets all responseXXX fields accordingly
         * - finds the right dataType (mediates between content-type and expected dataType)
         * - returns the corresponding response
         */
        function ajaxHandleResponses (s, jqXHR, responses) {
            var ct, type, finalDataType, firstDataType, contents = s.contents, dataTypes = s.dataTypes, responseFields = s.responseFields;
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
            var conv, conv2, current, tmp,
                // Work with a copy of dataTypes in case we need to modify it for conversion
                dataTypes = s.dataTypes.slice(), prev = dataTypes[0], converters = {}, i = 0;
            // Apply the dataFilter if provided
            if (s.dataFilter) {
                response = s.dataFilter(response, s.dataType);
            }
            // Create converters map with lowercased keys
            if (dataTypes[1]) {
                for (conv in s.converters) {
                    __set$(converters, conv.toLowerCase(), __get$(s.converters, conv));
                }
            }
            // Convert to each sequential dataType, tolerating list modification
            for (; current = __get$(dataTypes, ++i);) {
                // There's only work to do if current dataType is non-auto
                if (current !== "*") {
                    // Convert response if prev dataType is non-auto and differs from current
                    if (prev !== "*" && prev !== current) {
                        // Seek a direct converter
                        conv = __get$(converters, prev + " " + current) || __get$(converters, "* " + current);
                        // If none found, seek a pair
                        if (!conv) {
                            for (conv2 in converters) {
                                // If conv2 outputs current
                                tmp = conv2.split(" ");
                                if (tmp[1] === current) {
                                    // If prev can be converted to accepted input
                                    conv = __get$(converters, prev + " " + tmp[0]) || __get$(converters, "* " + tmp[0]);
                                    if (conv) {
                                        // Condense equivalence converters
                                        if (conv === true) {
                                            conv = __get$(converters, conv2);
                                        }
                                        else if (__get$(converters, conv2) !== true) {
                                            current = tmp[0];
                                            dataTypes.splice(i--, 0, current);
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                        // Apply converter (if not an equivalence)
                        if (conv !== true) {
                            // Unless errors are allowed to bubble, catch and return them
                            if (conv && s["throws"]) {
                                response = conv(response);
                            }
                            else {
                                try {
                                    response = conv(response);
                                } catch (e) {
                                    return {
                                        state: "parsererror",
                                        error: conv ? e : "No conversion from " + prev + " to " + current
                                    };
                                }
                            }
                        }
                    }
                    // Update prev for next iteration
                    prev = current;
                }
            }
            return {
                state: "success",
                data:  response
            };
        }

        var oldCallbacks     = [], rquestion = /\?/, rjsonp = /(=)\?(?=&|$)|\?\?/, nonce = jQuery.now();
        // Default jsonp settings
        jQuery.ajaxSetup({
            jsonp:         "callback",
            jsonpCallback: function () {
                var callback = oldCallbacks.pop() || jQuery.expando + "_" + nonce++;
                __set$(this, callback, true);
                return callback;
            }
        });
        // Detect, normalize options and install callbacks for jsonp requests
        jQuery.ajaxPrefilter("json jsonp", function (s, originalSettings, jqXHR) {
            var callbackName, overwritten, responseContainer, data = __get$(s, "data"), url = s.url, hasCallback = s.jsonp !==
                                                                                                                   false, replaceInUrl = hasCallback &&
                                                                                                                                         rjsonp.test(url), replaceInData = hasCallback &&
                                                                                                                                                                           !replaceInUrl &&
                                                                                                                                                                           typeof data ===
                                                                                                                                                                           "string" &&
                                                                                                                                                                           !(s.contentType ||
                                                                                                                                                                             "").indexOf("application/x-www-form-urlencoded") &&
                                                                                                                                                                           rjsonp.test(data);
            // Handle iff the expected data type is "jsonp" or we have a parameter to set
            if (s.dataTypes[0] === "jsonp" || replaceInUrl || replaceInData) {
                // Get callback name, remembering preexisting value associated with it
                callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
                overwritten = __get$(window, callbackName);
                // Insert callback into url or form data
                if (replaceInUrl) {
                    s.url = url.replace(rjsonp, "$1" + callbackName);
                }
                else if (replaceInData) {
                    __set$(s, "data", data.replace(rjsonp, "$1" + callbackName));
                }
                else if (hasCallback) {
                    s.url = s.url + ((rquestion.test(url) ? "&" : "?") + s.jsonp + "=" + callbackName);
                }
                // Use data converter to retrieve json after script execution
                s.converters["script json"] = function () {
                    if (!responseContainer) {
                        jQuery.error(callbackName + " was not called");
                    }
                    return responseContainer[0];
                };
                // force json dataType
                s.dataTypes[0] = "json";
                // Install callback
                __set$(window, callbackName, function () {
                    responseContainer = arguments;
                });
                jqXHR.always(function () {
                    // Restore preexisting value
                    __set$(window, callbackName, overwritten);
                    if (__get$(s, callbackName)) {
                        s.jsonpCallback = originalSettings.jsonpCallback;
                        oldCallbacks.push(callbackName);
                    }
                    if (responseContainer && jQuery.isFunction(overwritten)) {
                        overwritten(responseContainer[0]);
                    }
                    responseContainer = overwritten = undefined;
                });
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
                        script        = document.createElement("script");
                        script.async  = "async";
                        if (s.scriptCharset) {
                            script.charset = s.scriptCharset;
                        }
                        __set$(script, "src", s.url);
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
                        head.insertBefore(script, __get$(head, "firstChild"));
                    },
                    abort: function () {
                        if (script) {
                            script.onload(0, 1);
                        }
                    }
                };
            }
        });
        var xhrCallbacks,
            // #5280: Internet Explorer will keep connections alive if we don't abort on unload
            xhrOnUnloadAbort = window.ActiveXObject ? function () {
                // Abort all pending requests
                for (var key in xhrCallbacks) {
                    __call$(xhrCallbacks, key, [
                        0,
                        1
                    ]);
                }
            } : false, xhrId = 0;
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
        jQuery.ajaxSettings.xhr = window.ActiveXObject ? /* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
                                  function () {
                                      return !this.isLocal && createStandardXHR() || createActiveXHR();
                                  } : // For all other browsers, use the standard XMLHttpRequest object
                                  createStandardXHR;
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
                            var handle, i, xhr = s.xhr();
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
                                // of an xhr when a network error occurred
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
                                                status = __get$(responses, "text") ? 200 : 404;
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
                            if (!s.async) {
                                // if we're in sync mode we fire the callback
                                callback();
                            }
                            else if (xhr.readyState === 4) {
                                // (IE6 & IE7) if it's in cache and has been
                                // retrieved directly we need to fire the callback
                                nativeMethods.setTimeout.call(window, __proc$Script(callback), 0);
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
        var fxNow, timerId, rfxtypes = /^(?:toggle|show|hide)$/, rfxnum = new RegExp("^(?:([-+])=|)(" + core_pnum +
                                                                                     ")([a-z%]*)$", "i"), rrun = /queueHooks$/, animationPrefilters = [defaultPrefilter], tweeners = {
            "*": [function (prop, value) {
                var end, unit, prevScale, tween = this.createTween(prop, value), parts = rfxnum.exec(value), target = tween.cur(), start = +target ||
                                                                                                                                           0, scale = 1;
                if (parts) {
                    end  = +parts[2];
                    unit = parts[3] || (__get$(jQuery.cssNumber, prop) ? "" : "px");
                    // We need to compute starting value
                    if (unit !== "px" && start) {
                        // Iteratively approximate from a nonzero starting point
                        // Prefer the current property, because this process will be trivial if it uses the same units
                        // Fallback to end or a simple constant
                        start = jQuery.css(tween.elem, prop, true) || end || 1;
                        do {
                            // If previous iteration zeroed out, double until we get *something*
                            // Use a string for doubling factor so we don't accidentally see scale as unchanged below
                            prevScale = scale = scale || ".5";
                            // Adjust and apply
                            start = start / scale;
                            jQuery.style(tween.elem, prop, start + unit);
                            // Update scale, tolerating zeroes from tween.cur()
                            scale = tween.cur() / target;
                        } while (scale !== 1 && scale !== prevScale);
                    }
                    tween.unit  = unit;
                    tween.start = start;
                    // If a +=/-= token was provided, we're doing a relative animation
                    tween.end = parts[1] ? start + (parts[1] + 1) * end : end;
                }
                return tween;
            }]
        };
        // Animations created synchronously will run synchronously
        function createFxNow () {
            nativeMethods.setTimeout.call(window, __proc$Script(function(){
                fxNow = undefined;
            }), 0);
            return fxNow = jQuery.now();
        }

        function createTweens (animation, props) {
            jQuery.each(props, function (prop, value) {
                var collection = (__get$(tweeners, prop) ||
                                  []).concat(tweeners["*"]), index = 0, length = __get$(collection, "length");
                for (; index < length; index++) {
                    if (__get$(collection, index).call(animation, prop, value)) {
                        // we're done with this property
                        return;
                    }
                }
            });
        }

        function Animation (elem, properties, options) {
            var result, index = 0, tweenerIndex = 0, length = __get$(animationPrefilters, "length"), deferred = jQuery.Deferred().always(function () {
                // don't match elem in the :animated selector
                delete tick.elem;
            }), tick          = function () {
                var currentTime = fxNow || createFxNow(), remaining = Math.max(0, animation.startTime +
                                                                                  animation.duration -
                                                                                  currentTime), percent = 1 -
                                                                                                          (remaining /
                                                                                                           animation.duration ||
                                                                                                           0), index = 0, length = __get$(animation.tweens, "length");
                for (; index < length; index++) {
                    __get$(animation.tweens, index).run(percent);
                }
                deferred.notifyWith(elem, [
                    animation,
                    percent,
                    remaining
                ]);
                if (percent < 1 && length) {
                    return remaining;
                }
                else {
                    deferred.resolveWith(elem, [animation]);
                    return false;
                }
            }, animation      = deferred.promise({
                elem:               elem,
                props:              jQuery.extend({}, properties),
                opts:               jQuery.extend(true, { specialEasing: {} }, options),
                originalProperties: properties,
                originalOptions:    options,
                startTime:          fxNow || createFxNow(),
                duration:           options.duration,
                tweens:             [],
                createTween:        function (prop, end, easing) {
                    var tween = jQuery.Tween(elem, animation.opts, prop, end, __get$(animation.opts.specialEasing, prop) ||
                                                                              animation.opts.easing);
                    animation.tweens.push(tween);
                    return tween;
                },
                stop:               function (gotoEnd) {
                    var index  = 0,
                        // if we are going to the end, we want to run all the tweens
                        // otherwise we skip this part
                        length = gotoEnd ? __get$(animation.tweens, "length") : 0;
                    for (; index < length; index++) {
                        __get$(animation.tweens, index).run(1);
                    }
                    // resolve when we played the last frame
                    // otherwise, reject
                    if (gotoEnd) {
                        deferred.resolveWith(elem, [
                            animation,
                            gotoEnd
                        ]);
                    }
                    else {
                        deferred.rejectWith(elem, [
                            animation,
                            gotoEnd
                        ]);
                    }
                    return this;
                }
            }), props         = animation.props;
            propFilter(props, animation.opts.specialEasing);
            for (; index < length; index++) {
                result = __get$(animationPrefilters, index).call(animation, elem, props, animation.opts);
                if (result) {
                    return result;
                }
            }
            createTweens(animation, props);
            if (jQuery.isFunction(animation.opts.start)) {
                animation.opts.start.call(elem, animation);
            }
            jQuery.fx.timer(jQuery.extend(tick, {
                anim:  animation,
                queue: animation.opts.queue,
                elem:  elem
            }));
            // attach callbacks from options
            return animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
        }

        function propFilter (props, specialEasing) {
            var index, name, easing, value, hooks;
            // camelCase, specialEasing and expand cssHook pass
            for (index in props) {
                name   = jQuery.camelCase(index);
                easing = __get$(specialEasing, name);
                value  = __get$(props, index);
                if (jQuery.isArray(value)) {
                    easing = value[1];
                    value  = __set$(props, index, value[0]);
                }
                if (index !== name) {
                    __set$(props, name, value);
                    delete props[index];
                }
                hooks = __get$(jQuery.cssHooks, name);
                if (hooks && "expand" in hooks) {
                    value = hooks.expand(value);
                    delete props[name];
                    // not quite $.extend, this wont overwrite keys already present.
                    // also - reusing 'index' from above because we have the correct "name"
                    for (index in value) {
                        if (!(index in props)) {
                            __set$(props, index, __get$(value, index));
                            __set$(specialEasing, index, easing);
                        }
                    }
                }
                else {
                    __set$(specialEasing, name, easing);
                }
            }
        }

        jQuery.Animation = jQuery.extend(Animation, {
            tweener:   function (props, callback) {
                if (jQuery.isFunction(props)) {
                    callback = props;
                    props    = ["*"];
                }
                else {
                    props = props.split(" ");
                }
                var prop, index = 0, length = __get$(props, "length");
                for (; index < length; index++) {
                    prop = __get$(props, index);
                    __set$(tweeners, prop, __get$(tweeners, prop) || []);
                    __get$(tweeners, prop).unshift(callback);
                }
            },
            prefilter: function (callback, prepend) {
                if (prepend) {
                    animationPrefilters.unshift(callback);
                }
                else {
                    animationPrefilters.push(callback);
                }
            }
        });
        function defaultPrefilter (elem, props, opts) {
            var index, prop, value, length, dataShow, tween, hooks, oldfire, anim = this, style = elem.style, orig = {}, handled = [], hidden = elem.nodeType &&
                                                                                                                                                isHidden(elem);
            // handle queue: false promises
            if (!opts.queue) {
                hooks = jQuery._queueHooks(elem, "fx");
                if (hooks.unqueued == null) {
                    hooks.unqueued   = 0;
                    oldfire          = hooks.empty.fire;
                    hooks.empty.fire = function () {
                        if (!hooks.unqueued) {
                            oldfire();
                        }
                    };
                }
                hooks.unqueued++;
                anim.always(function () {
                    // doing this makes sure that the complete handler will be called
                    // before this completes
                    anim.always(function () {
                        hooks.unqueued--;
                        if (!__get$(jQuery.queue(elem, "fx"), "length")) {
                            hooks.empty.fire();
                        }
                    });
                });
            }
            // height/width overflow pass
            if (elem.nodeType === 1 && ("height" in props || "width" in props)) {
                // Make sure that nothing sneaks out
                // Record all 3 overflow attributes because IE does not
                // change the overflow attribute when overflowX and
                // overflowY are set to the same value
                opts.overflow = [
                    style.overflow,
                    style.overflowX,
                    style.overflowY
                ];
                // Set display property to inline-block for height/width
                // animations on inline elements that are having width/height animated
                if (jQuery.css(elem, "display") === "inline" && jQuery.css(elem, "float") === "none") {
                    // inline-level elements accept inline-block;
                    // block-level elements need to be inline with layout
                    if (!jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay(elem.nodeName) === "inline") {
                        style.display = "inline-block";
                    }
                    else {
                        style.zoom = 1;
                    }
                }
            }
            if (opts.overflow) {
                style.overflow = "hidden";
                if (!jQuery.support.shrinkWrapBlocks) {
                    anim.done(function () {
                        style.overflow  = opts.overflow[0];
                        style.overflowX = opts.overflow[1];
                        style.overflowY = opts.overflow[2];
                    });
                }
            }
            // show/hide pass
            for (index in props) {
                value = __get$(props, index);
                if (rfxtypes.exec(value)) {
                    delete props[index];
                    if (value === (hidden ? "hide" : "show")) {
                        continue;
                    }
                    handled.push(index);
                }
            }
            length = __get$(handled, "length");
            if (length) {
                dataShow = jQuery._data(elem, "fxshow") || jQuery._data(elem, "fxshow", {});
                if (hidden) {
                    jQuery(elem).show();
                }
                else {
                    anim.done(function () {
                        jQuery(elem).hide();
                    });
                }
                anim.done(function () {
                    var prop;
                    jQuery.removeData(elem, "fxshow", true);
                    for (prop in orig) {
                        jQuery.style(elem, prop, __get$(orig, prop));
                    }
                });
                for (index = 0; index < length; index++) {
                    prop  = __get$(handled, index);
                    tween = anim.createTween(prop, hidden ? __get$(dataShow, prop) : 0);
                    __set$(orig, prop, __get$(dataShow, prop) || jQuery.style(elem, prop));
                    if (!(prop in dataShow)) {
                        __set$(dataShow, prop, tween.start);
                        if (hidden) {
                            tween.end   = tween.start;
                            tween.start = prop === "width" || prop === "height" ? 1 : 0;
                        }
                    }
                }
            }
        }

        function Tween (elem, options, prop, end, easing) {
            return new Tween.prototype.init(elem, options, prop, end, easing);
        }

        jQuery.Tween                   = Tween;
        Tween.prototype                = {
            constructor: Tween,
            init:        function (elem, options, prop, end, easing, unit) {
                this.elem    = elem;
                this.prop    = prop;
                this.easing  = easing || "swing";
                this.options = options;
                this.start   = this.now = this.cur();
                this.end  = end;
                this.unit = unit || (__get$(jQuery.cssNumber, prop) ? "" : "px");
            },
            cur:         function () {
                var hooks = __get$(Tween.propHooks, this.prop);
                return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
            },
            run:         function (percent) {
                var eased, hooks = __get$(Tween.propHooks, this.prop);
                if (this.options.duration) {
                    this.pos = eased = __call$(jQuery.easing, this.easing, [
                        percent,
                        this.options.duration * percent,
                        0,
                        1,
                        this.options.duration
                    ]);
                }
                else {
                    this.pos = eased = percent;
                }
                this.now = (this.end - this.start) * eased + this.start;
                if (this.options.step) {
                    this.options.step.call(this.elem, this.now, this);
                }
                if (hooks && hooks.set) {
                    hooks.set(this);
                }
                else {
                    Tween.propHooks._default.set(this);
                }
                return this;
            }
        };
        Tween.prototype.init.prototype = Tween.prototype;
        Tween.propHooks                = {
            _default: {
                get: function (tween) {
                    var result;
                    if (__get$(tween.elem, tween.prop) != null &&
                        (!tween.elem.style || __get$(tween.elem.style, tween.prop) == null)) {
                        return __get$(tween.elem, tween.prop);
                    }
                    // passing any value as a 4th parameter to .css will automatically
                    // attempt a parseFloat and fallback to a string if the parse fails
                    // so, simple values such as "10px" are parsed to Float.
                    // complex values such as "rotate(1rad)" are returned as is.
                    result = jQuery.css(tween.elem, tween.prop, false, "");
                    // Empty strings, null, undefined and "auto" are converted to 0.
                    return !result || result === "auto" ? 0 : result;
                },
                set: function (tween) {
                    // use step hook for back compat - use cssHook if its there - use .style if its
                    // available and use plain properties where available
                    if (__get$(jQuery.fx.step, tween.prop)) {
                        __call$(jQuery.fx.step, tween.prop, [tween]);
                    }
                    else if (tween.elem.style &&
                             (__get$(tween.elem.style, __get$(jQuery.cssProps, tween.prop)) != null ||
                              __get$(jQuery.cssHooks, tween.prop))) {
                        jQuery.style(tween.elem, tween.prop, tween.now + tween.unit);
                    }
                    else {
                        __set$(tween.elem, tween.prop, tween.now);
                    }
                }
            }
        };
        // Remove in 2.0 - this supports IE8's panic based approach
        // to setting things on disconnected nodes
        Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
            set: function (tween) {
                if (tween.elem.nodeType && tween.elem.parentNode) {
                    __set$(tween.elem, tween.prop, tween.now);
                }
            }
        };
        jQuery.each([
            "toggle",
            "show",
            "hide"
        ], function (i, name) {
            var cssFn = __get$(jQuery.fn, name);
            __set$(jQuery.fn, name, function (speed, easing, callback) {
                return speed == null || typeof speed === "boolean" || !i && jQuery.isFunction(speed) &&
                                                                      jQuery.isFunction(easing) ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
            });
        });
        jQuery.fn.extend({
            fadeTo:  function (speed, to, easing, callback) {
                // show any hidden elements after setting opacity to 0
                return this.filter(isHidden).css("opacity", 0).show().end().animate({ opacity: to }, speed, easing, callback);
            },
            animate: function (prop, speed, easing, callback) {
                var empty = jQuery.isEmptyObject(prop), optall = jQuery.speed(speed, easing, callback), doAnimation = function () {
                    // Operate on a copy of prop so per-property easing won't be lost
                    var anim = Animation(this, jQuery.extend({}, prop), optall);
                    // Empty animations resolve immediately
                    if (empty) {
                        anim.stop(true);
                    }
                };
                return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
            },
            stop:    function (type, clearQueue, gotoEnd) {
                var stopQueue = function (hooks) {
                    var stop = hooks.stop;
                    delete hooks.stop;
                    stop(gotoEnd);
                };
                if (typeof type !== "string") {
                    gotoEnd    = clearQueue;
                    clearQueue = type;
                    type       = undefined;
                }
                if (clearQueue && type !== false) {
                    this.queue(type || "fx", []);
                }
                return this.each(function () {
                    var dequeue                                             = true, index = type != null && type +
                                                                                                            "queueHooks", timers = jQuery.timers, data = jQuery._data(this);
                    if (index) {
                        if (__get$(data, index) && __get$(data, index).stop) {
                            stopQueue(__get$(data, index));
                        }
                    }
                    else {
                        for (index in data) {
                            if (__get$(data, index) && __get$(data, index).stop && rrun.test(index)) {
                                stopQueue(__get$(data, index));
                            }
                        }
                    }
                    for (index = __get$(timers, "length"); index--;) {
                        if (__get$(timers, index).elem === this &&
                            (type == null || __get$(timers, index).queue === type)) {
                            __get$(timers, index).anim.stop(gotoEnd);
                            dequeue = false;
                            timers.splice(index, 1);
                        }
                    }
                    // start the next in the queue if the last step wasn't forced
                    // timers currently will call their complete callbacks, which will dequeue
                    // but only if they were gotoEnd
                    if (dequeue || !gotoEnd) {
                        jQuery.dequeue(this, type);
                    }
                });
            }
        });
        // Generate parameters to create a standard animation
        function genFx (type, includeWidth) {
            var which, attrs = { height: type }, i = 0;
            // if we include width, step value is 1 to do all cssExpand values,
            // if we don't include width, step value is 2 to skip over Left and Right
            includeWidth = includeWidth ? 1 : 0;
            for (; i < 4; i = i + (2 - includeWidth)) {
                which = __get$(cssExpand, i);
                __set$(attrs, "margin" + which, __set$(attrs, "padding" + which, type));
            }
            if (includeWidth) {
                attrs.opacity = attrs.width = type;
            }
            return attrs;
        }

        // Generate shortcuts for custom animations
        jQuery.each({
            slideDown:   genFx("show"),
            slideUp:     genFx("hide"),
            slideToggle: genFx("toggle"),
            fadeIn:      { opacity: "show" },
            fadeOut:     { opacity: "hide" },
            fadeToggle:  { opacity: "toggle" }
        }, function (name, props) {
            __set$(jQuery.fn, name, function (speed, easing, callback) {
                return this.animate(props, speed, easing, callback);
            });
        });
        jQuery.speed       = function (speed, easing, fn) {
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
            opt.complete = function () {
                if (jQuery.isFunction(opt.old)) {
                    opt.old.call(this);
                }
                if (opt.queue) {
                    jQuery.dequeue(this, opt.queue);
                }
            };
            return opt;
        };
        jQuery.easing      = {
            linear: function (p) {
                return p;
            },
            swing:  function (p) {
                return 0.5 - Math.cos(p * Math.PI) / 2;
            }
        };
        jQuery.timers      = [];
        jQuery.fx          = Tween.prototype.init;
        jQuery.fx.tick     = function () {
            var timer, timers = jQuery.timers, i = 0;
            for (; i < __get$(timers, "length"); i++) {
                timer = __get$(timers, i);
                // Checks the timer has not already been removed
                if (!timer() && __get$(timers, i) === timer) {
                    timers.splice(i--, 1);
                }
            }
            if (!__get$(timers, "length")) {
                jQuery.fx.stop();
            }
        };
        jQuery.fx.timer    = function (timer) {
            if (timer() && jQuery.timers.push(timer) && !timerId) {
                timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval);
            }
        };
        jQuery.fx.interval = 13;
        jQuery.fx.stop     = function () {
            clearInterval(timerId);
            timerId = null;
        };
        jQuery.fx.speeds   = {
            slow:     600,
            fast:     200,
            // Default speed
            _default: 400
        };
        // Back Compat <1.8 extension point
        jQuery.fx.step = {};
        if (jQuery.expr && jQuery.expr.filters) {
            jQuery.expr.filters.animated = function (elem) {
                return __get$(jQuery.grep(jQuery.timers, function (fn) {
                    return elem === fn.elem;
                }), "length");
            };
        }
        var rroot        = /^(?:body|html)$/i;
        jQuery.fn.offset = function (options) {
            if (__get$(arguments, "length")) {
                return options === undefined ? this : this.each(function (i) {
                    jQuery.offset.setOffset(this, options, i);
                });
            }
            var box, docElem, body, win, clientTop, clientLeft, scrollTop, scrollLeft, top, left, elem = this[0], doc = elem &&
                                                                                                                        elem.ownerDocument;
            if (!doc) {
                return;
            }
            if ((body = doc.body) === elem) {
                return jQuery.offset.bodyOffset(elem);
            }
            docElem = doc.documentElement;
            // Make sure we're not dealing with a disconnected DOM node
            if (!jQuery.contains(docElem, elem)) {
                return {
                    top:  0,
                    left: 0
                };
            }
            box        = elem.getBoundingClientRect();
            win        = getWindow(doc);
            clientTop  = docElem.clientTop || body.clientTop || 0;
            clientLeft = docElem.clientLeft || body.clientLeft || 0;
            scrollTop  = win.pageYOffset || docElem.scrollTop;
            scrollLeft = win.pageXOffset || docElem.scrollLeft;
            top        = box.top + scrollTop - clientTop;
            left       = box.left + scrollLeft - clientLeft;
            return {
                top:  top,
                left: left
            };
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
                    return;
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
                    return offsetParent || document.body;
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
                        return win ? prop in
                                     win ? __get$(win, prop) : __get$(win.document.documentElement, method) : __get$(elem, method);
                    }
                    if (win) {
                        win.scrollTo(!top ? val : jQuery(win).scrollLeft(), top ? val : jQuery(win).scrollTop());
                    }
                    else {
                        __set$(elem, method, val);
                    }
                }, method, val, __get$(arguments, "length"), null);
            });
        });
        function getWindow (elem) {
            return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 ? elem.defaultView || elem.parentWindow : false;
        }

        // Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
        jQuery.each({
            Height: "height",
            Width:  "width"
        }, function (name, type) {
            jQuery.each({
                padding: "inner" + name,
                content: type,
                "":      "outer" + name
            }, function (defaultExtra, funcName) {
                // margin is only for outerHeight, outerWidth
                __set$(jQuery.fn, funcName, function (margin, value) {
                    var chainable = __get$(arguments, "length") &&
                                    (defaultExtra || typeof margin !== "boolean"), extra = defaultExtra ||
                                                                                           (margin === true || value ===
                                                                                                               true ? "margin" : "border");
                    return jQuery.access(this, function (elem, type, value) {
                        var doc;
                        if (jQuery.isWindow(elem)) {
                            return __get$(elem.document.documentElement, "client" + name);
                        }
                        if (elem.nodeType === 9) {
                            doc = elem.documentElement;
                            return Math.max(__get$(elem.body, "scroll" + name), __get$(doc, "scroll" +
                                                                                            name), __get$(elem.body, "offset" +
                                                                                                                     name), __get$(doc, "offset" +
                                                                                                                                        name), __get$(doc, "client" +
                                                                                                                                                           name));
                        }
                        return value ===
                               undefined ? jQuery.css(elem, type, value, extra) : jQuery.style(elem, type, value, extra);
                    }, type, chainable ? margin : undefined, chainable, null);
                });
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
