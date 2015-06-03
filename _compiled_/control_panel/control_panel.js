/*!
 mods v0.1.0 
 Copyright (c) 2013 Ivan Nikulin (ifaaan@gmail.com, https://github.com/inikulin)
 Released under the MIT license
 */
//NOTE: declare Mods without a 'var', so it will be placed inside global object.
//Just a 'bad practice'-way to say 'window.Mods = ...'
Mods = function () {

    //Internals
    //---------------------------------------------------------------------------
    var EXPORTS_PROP = 'exports',
        FUNC_TYPE = 'function',
        FUNC_AS_EXPORTS_FLAG = '%E%',
        modules = {};


    //NOTE: error emitter. Just throw error string prefixed with 'Mods: '
    function err(msg) {
        throw 'Mods: ' + msg;
    }

    //NOTE: this is there all magic is happening, this function is a factory-method for the 'require'-functions.
    //'require' function passed to the module initializer and also used in 'get' API method.
    //'require' function used to fetch module by given 'id', initialize it if necessary,
    //and perform error checks (e.g. circular dependencies).
    function createRequireFunc(stack) {
        //NOTE: newly created function has a closure on a 'stack' parameter.
        //'stack' parameter contains call chain of the module initializers which lead to the current module
        //initialization.
        return function (id) {
            var mod = modules[id],
                circularDependencyErr,
                i = 0;

            //NOTE: we don't have module with given 'id', fail.
            if (!mod)
                err('required "' + id + '" is undefined');

            for (; i < stack.length; i++) {
                //NOTE: we have required module in call chain, so this is a circular dependency.
                //Initialize 'circularDependencyErr' variable, so now we have a circular dependency flag and error
                //message, all in one.
                if (stack[i] == id)
                    circularDependencyErr = 'circular dependency: ';

                //NOTE: if we have error, append current stack item to the error message, so we have whole call chain
                //that lead to this error.
                if (circularDependencyErr)
                    circularDependencyErr += '"' + stack[i] + '" -> ';
            }

            //NOTE: finally, if we have error append required module id to the error message, then fail
            if (circularDependencyErr)
                err(circularDependencyErr + '"' + id + '"');

            //NOTE: module is not initialized yet
            if (typeof mod == FUNC_TYPE && !mod[FUNC_AS_EXPORTS_FLAG]) {
                //NOTE: initialize 'exports' object, reuse 'mod' variable as a host for this object
                mod[EXPORTS_PROP] = {};

                //NOTE: copy stack and required module to the copy, so new require function will contain current module.
                //Initialize module with new require function and pass 'mod' as a context, so
                //'exports' object can be accessed both via 'exports' parameter and via 'this.exports'.
                mod.call(mod, createRequireFunc(stack.concat(id)), mod[EXPORTS_PROP]);

                //NOTE: save 'exports' as a module
                mod = modules[id] = mod[EXPORTS_PROP];

                //NOTE: if we have function as exports - mark it with special flag to avoid re-init
                if (typeof mod == FUNC_TYPE)
                    mod[FUNC_AS_EXPORTS_FLAG] = FUNC_AS_EXPORTS_FLAG;
            }

            return mod;
        };
    }

    //API
    //---------------------------------------------------------------------------
    return {
        define: function (id, mod) {
            //NOTE: fail if we have redefinition
            if (modules[id])
                err('"' + id + '" is already defined');

            modules[id] = mod;
        },

        //NOTE: 'get' is just require function with empty call stack
        get: createRequireFunc([])
    };
};

/* global Mods:true */
/* global jQuery */

var ControlPanel = new Mods();

ControlPanel.define('jQuery', function() {
    this.exports = jQuery.noConflict();
});

document.addEventListener("DOMContentLoaded", function() {
    ControlPanel.get('CheckUpdates').check();
});
/*! json2.js 2013-05-26 Public Domain. */

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
 call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
 getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
 lastIndex, length, parse, prototype, push, replace, slice, stringify,
 test, toJSON, toString, valueOf
 */


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                  f(this.getUTCMonth() + 1) + '-' +
                  f(this.getUTCDate()) + 'T' +
                  f(this.getUTCHours()) + ':' +
                  f(this.getUTCMinutes()) + ':' +
                  f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

            case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                if (!value) {
                    return 'null';
                }

// Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

// Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                    v = partial.length === 0
                        ? '[]'
                        : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

// If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                v = partial.length === 0
                    ? '{}'
                    : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                 typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                           ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
/*!
 * jQuery JavaScript Library v2.1.3
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-12-18T15:11Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//

var arr = [];

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,

	version = "2.1.3",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {
		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
	},

	isPlainObject: function( obj ) {
		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		if ( obj.constructor &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		// Support: Android<4.0, iOS<6 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call(obj) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script,
			indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {
			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			if ( code.indexOf("use strict") === 1 ) {
				script = document.createElement("script");
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {
			// Otherwise, avoid the DOM node creation, insertion
			// and removal by using an indirect global eval
				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE9-11+
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.0-pre
 * http://sizzlejs.com/
 *
 * Copyright 2008, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-12-16
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + characterEncoding + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];
	nodeType = context.nodeType;

	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	if ( !seed && documentIsHTML ) {

		// Try to shortcut find operations when possible (e.g., not under DocumentFragment)
		if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document (jQuery #6963)
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType !== 1 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;
	parent = doc.defaultView;

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent !== parent.top ) {
		// IE11 does not have attachEvent, so all must suffer
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Support tests
	---------------------------------------------------------------------- */
	documentIsHTML = !isXML( doc );

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( doc.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\f]' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.2+, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.7+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (oldCache = outerCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							outerCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context !== document && context;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is no seed and only one group
	if ( match.length === 1 ) {

		// Take a shortcut and set the context if the root selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		});

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		});

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( indexOf.call( qualifier, elem ) >= 0 ) !== not;
	});
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		}));
};

jQuery.fn.extend({
	find: function( selector ) {
		var i,
			len = this.length,
			ret = [],
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow(this, selector || [], false) );
	},
	not: function( selector ) {
		return this.pushStack( winnow(this, selector || [], true) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
});


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[0] === "<" && selector[ selector.length - 1 ] === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Support: Blackberry 4.6
					// gEBID returns nodes no longer in the document (#6963)
					if ( elem && elem.parentNode ) {
						// Inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof rootjQuery.ready !== "undefined" ?
				rootjQuery.ready( selector ) :
				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.extend({
	dir: function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	}
});

jQuery.fn.extend({
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter(function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.unique(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {
			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.unique( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
});
var rnotwhite = (/\S+/g);



// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
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
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
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
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( list && ( !fired || stack ) ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ tuple[ 0 ] + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// Add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// If we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {
	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend({
	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
});

/**
 * The ready event handler and self cleanup method
 */
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed, false );
	window.removeEventListener( "load", completed, false );
	jQuery.ready();
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// We once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {
			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			len ? fn( elems[0], key ) : emptyGet;
};


/**
 * Determines whether an object can have data
 */
jQuery.acceptData = function( owner ) {
	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	/* jshint -W018 */
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};


function Data() {
	// Support: Android<4,
	// Old WebKit does not have Object.preventExtensions/freeze method,
	// return new empty object instead with no [[set]] accessor
	Object.defineProperty( this.cache = {}, 0, {
		get: function() {
			return {};
		}
	});

	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;
Data.accepts = jQuery.acceptData;

Data.prototype = {
	key: function( owner ) {
		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return the key for a frozen object.
		if ( !Data.accepts( owner ) ) {
			return 0;
		}

		var descriptor = {},
			// Check if the owner object already has a cache key
			unlock = owner[ this.expando ];

		// If not, create one
		if ( !unlock ) {
			unlock = Data.uid++;

			// Secure it in a non-enumerable, non-writable property
			try {
				descriptor[ this.expando ] = { value: unlock };
				Object.defineProperties( owner, descriptor );

			// Support: Android<4
			// Fallback to a less secure definition
			} catch ( e ) {
				descriptor[ this.expando ] = unlock;
				jQuery.extend( owner, descriptor );
			}
		}

		// Ensure the cache object
		if ( !this.cache[ unlock ] ) {
			this.cache[ unlock ] = {};
		}

		return unlock;
	},
	set: function( owner, data, value ) {
		var prop,
			// There may be an unlock assigned to this node,
			// if there is no entry for this "owner", create one inline
			// and set the unlock as though an owner entry had always existed
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {
			// Fresh assignments by object are shallow copied
			if ( jQuery.isEmptyObject( cache ) ) {
				jQuery.extend( this.cache[ unlock ], data );
			// Otherwise, copy the properties one-by-one to the cache object
			} else {
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		// Either a valid cache is found, or will be created.
		// New caches will be created and the unlock returned,
		// allowing direct access to the newly created
		// empty data object. A valid owner object must be provided.
		var cache = this.cache[ this.key( owner ) ];

		return key === undefined ?
			cache : cache[ key ];
	},
	access: function( owner, key, value ) {
		var stored;
		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				((key && typeof key === "string") && value === undefined) ) {

			stored = this.get( owner, key );

			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase(key) );
		}

		// [*]When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name, camel,
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		if ( key === undefined ) {
			this.cache[ unlock ] = {};

		} else {
			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				camel = jQuery.camelCase( key );
				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key, camel ];
				} else {
					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = camel;
					name = name in cache ?
						[ name ] : ( name.match( rnotwhite ) || [] );
				}
			}

			i = name.length;
			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}
	},
	hasData: function( owner ) {
		return !jQuery.isEmptyObject(
			this.cache[ owner[ this.expando ] ] || {}
		);
	},
	discard: function( owner ) {
		if ( owner[ this.expando ] ) {
			delete this.cache[ owner[ this.expando ] ];
		}
	}
};
var data_priv = new Data();

var data_user = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			data_user.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend({
	hasData: function( elem ) {
		return data_user.hasData( elem ) || data_priv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return data_user.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		data_user.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to data_priv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return data_priv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		data_priv.remove( elem, name );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = data_user.get( elem );

				if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice(5) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					data_priv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				data_user.set( this, key );
			});
		}

		return access( this, function( value ) {
			var data,
				camelKey = jQuery.camelCase( key );

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {
				// Attempt to get data from the cache
				// with the key as-is
				data = data_user.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to get data from the cache
				// with the key camelized
				data = data_user.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each(function() {
				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = data_user.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				data_user.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf("-") !== -1 && data !== undefined ) {
					data_user.set( this, key, value );
				}
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			data_user.remove( this, key );
		});
	}
});


jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = data_priv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = data_priv.access( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return data_priv.get( elem, key ) || data_priv.access( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				data_priv.remove( elem, [ type + "queue", key ] );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = data_priv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;

var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {
		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
	};

var rcheckableType = (/^(?:checkbox|radio)$/i);



(function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Safari<=5.1
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari<=5.1, Android<4.2
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<=11+
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
})();
var strundefined = typeof undefined;



support.focusinBubbles = "onfocusin" in window;


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.hasData( elem ) && data_priv.get( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;
			data_priv.remove( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && jQuery.acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Cordova 2.5 (WebKit) (#13255)
		// All events should have a target; Cordova deviceready doesn't
		if ( !event.target ) {
			event.target = document;
		}

		// Support: Safari 6.0+, Chrome<28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle, false );
	}
};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&
				// Support: Android<4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && e.preventDefault ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && e.stopPropagation ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// Support: Firefox, Chrome, Safari
// Create "bubbling" focus and blur events
if ( !support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				data_priv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					data_priv.remove( doc, fix );

				} else {
					data_priv.access( doc, fix, attaches );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});


var
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {

		// Support: IE9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

// Support: IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support: 1.x compatibility
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute("type");
	}

	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		data_priv.set(
			elems[ i ], "globalEval", !refElements || data_priv.get( refElements[ i ], "globalEval" )
		);
	}
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( data_priv.hasData( src ) ) {
		pdataOld = data_priv.access( src );
		pdataCur = data_priv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( data_user.hasData( src ) ) {
		udataOld = data_user.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		data_user.set( dest, udataCur );
	}
}

function getAll( context, tag ) {
	var ret = context.getElementsByTagName ? context.getElementsByTagName( tag || "*" ) :
			context.querySelectorAll ? context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					// Support: QtWebKit, PhantomJS
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: QtWebKit, PhantomJS
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	},

	cleanData: function( elems ) {
		var data, elem, type, key,
			special = jQuery.event.special,
			i = 0;

		for ( ; (elem = elems[ i ]) !== undefined; i++ ) {
			if ( jQuery.acceptData( elem ) ) {
				key = elem[ data_priv.expando ];

				if ( key && (data = data_priv.cache[ key ]) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}
					if ( data_priv.cache[ key ] ) {
						// Discard any remaining `private` data
						delete data_priv.cache[ key ];
					}
				}
			}
			// Discard any remaining `user` data
			delete data_user.cache[ elem[ data_user.expando ] ];
		}
	}
});

jQuery.fn.extend({
	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each(function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				});
		}, null, value, arguments.length );
	},

	append: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	remove: function( selector, keepData /* Internal Use Only */ ) {
		var elem,
			elems = selector ? jQuery.filter( selector, this ) : this,
			i = 0;

		for ( ; (elem = elems[i]) != null; i++ ) {
			if ( !keepData && elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem ) );
			}

			if ( elem.parentNode ) {
				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
					setGlobalEval( getAll( elem, "script" ) );
				}
				elem.parentNode.removeChild( elem );
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map(function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var arg = arguments[ 0 ];

		// Make the changes, replacing each context element with the new content
		this.domManip( arguments, function( elem ) {
			arg = this.parentNode;

			jQuery.cleanData( getAll( this ) );

			if ( arg ) {
				arg.replaceChild( elem, this );
			}
		});

		// Force removal if there was no new content (e.g., from empty arguments)
		return arg && (arg.length || arg.nodeType) ? this : this.remove();
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				self.domManip( args, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							// Support: QtWebKit
							// jQuery.merge because push.apply(_, arraylike) throws
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( this[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!data_priv.access( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return this;
	}
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because push.apply(_, arraylike) throws
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});


var iframe,
	elemdisplay = {};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */
// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var style,
		elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		// getDefaultComputedStyle might be reliably used only on attached element
		display = window.getDefaultComputedStyle && ( style = window.getDefaultComputedStyle( elem[ 0 ] ) ) ?

			// Use of this method is a temporary fix (more like optimization) until something better comes along,
			// since it was removed from specification and supported only in FF
			style.display : jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = (iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" )).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = iframe[ 0 ].contentDocument;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = (/^margin/);

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {
		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		if ( elem.ownerDocument.defaultView.opener ) {
			return elem.ownerDocument.defaultView.getComputedStyle( elem, null );
		}

		return window.getComputedStyle( elem, null );
	};



function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		style = elem.style;

	computed = computed || getStyles( elem );

	// Support: IE9
	// getPropertyValue is only needed for .css('filter') (#12537)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];
	}

	if ( computed ) {

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: iOS < 6
		// A tribute to the "awesome hack by Dean Edwards"
		// iOS < 6 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
		// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
		if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?
		// Support: IE
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {
	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {
				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return (this.get = hookFn).apply( this, arguments );
		}
	};
}


(function() {
	var pixelPositionVal, boxSizingReliableVal,
		docElem = document.documentElement,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	if ( !div.style ) {
		return;
	}

	// Support: IE9-11+
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" +
		"position:absolute";
	container.appendChild( div );

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computePixelPositionAndBoxSizingReliable() {
		div.style.cssText =
			// Support: Firefox<29, Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
			"box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
			"border:1px;padding:1px;width:4px;position:absolute";
		div.innerHTML = "";
		docElem.appendChild( container );

		var divStyle = window.getComputedStyle( div, null );
		pixelPositionVal = divStyle.top !== "1%";
		boxSizingReliableVal = divStyle.width === "4px";

		docElem.removeChild( container );
	}

	// Support: node.js jsdom
	// Don't assume that getComputedStyle is a property of the global object
	if ( window.getComputedStyle ) {
		jQuery.extend( support, {
			pixelPosition: function() {

				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computePixelPositionAndBoxSizingReliable();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computePixelPositionAndBoxSizingReliable();
				}
				return boxSizingReliableVal;
			},
			reliableMarginRight: function() {

				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );

				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =
					// Support: Firefox<29, Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
					"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				docElem.appendChild( container );

				ret = !parseFloat( window.getComputedStyle( marginDiv, null ).marginRight );

				docElem.removeChild( container );
				div.removeChild( marginDiv );

				return ret;
			}
		});
	}
})();


// A method for quickly swapping in/out CSS properties to get correct calculations.
jQuery.swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var
	// Swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + pnum + ")", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[0].toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// Both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// At this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// At this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// At this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// Some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// Check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// Use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = data_priv.get( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = data_priv.access( elem, "olddisplay", defaultDisplay(elem.nodeName) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display !== "none" || !hidden ) {
				data_priv.set( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.extend({

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Support: IE9-11+
			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				style[ name ] = value;
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	}
});

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) && elem.offsetWidth === 0 ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

// Support: Android 2.3
jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return jQuery.swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});

jQuery.fn.extend({
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each(function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	}
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value ),
				target = tween.cur(),
				parts = rfxnum.exec( value ),
				unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

				// Starting value computation is required for potential unit mismatches
				start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
					rfxnum.exec( jQuery.css( tween.elem, prop ) ),
				scale = 1,
				maxIterations = 20;

			if ( start && start[ 3 ] !== unit ) {
				// Trust units reported by jQuery.css
				unit = unit || start[ 3 ];

				// Make sure we update the tween properties later on
				parts = parts || [];

				// Iteratively approximate from a nonzero starting point
				start = +target || 1;

				do {
					// If previous iteration zeroed out, double until we get *something*.
					// Use string for doubling so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					start = start / scale;
					jQuery.style( tween.elem, prop, start + unit );

				// Update scale, tolerating zero or NaN from tween.cur(),
				// break the loop if scale is unchanged or perfect, or if we've just had enough
				} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
			}

			// Update tween properties
			if ( parts ) {
				start = tween.start = +start || +target || 0;
				tween.unit = unit;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[ 1 ] ?
					start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
					+parts[ 2 ];
			}

			return tween;
		} ]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( (tween = collection[ index ].call( animation, prop, value )) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = data_priv.get( elem, "fxshow" );

	// Handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// Ensure the complete handler is called before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// Height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			data_priv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always(function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		});
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = data_priv.access( elem, "fxshow", {} );
		}

		// Store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;

			data_priv.remove( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( (display === "none" ? defaultDisplay( elem.nodeName ) : display) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// Don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || data_priv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = data_priv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = data_priv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		});
	}
});

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = setTimeout( next, time );
		hooks.stop = function() {
			clearTimeout( timeout );
		};
	});
};


(function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: iOS<=5.1, Android<=4.2+
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE<=11+
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: Android<=2.3
	// Options inside disabled selects are incorrectly marked as disabled
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<=11+
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
})();


var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend({
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	}
});

jQuery.extend({
	attr: function( elem, name, value ) {
		var hooks, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {
			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {
					// Set corresponding property to false
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	}
});

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle;
		if ( !isXML ) {
			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ name ];
			attrHandle[ name ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				name.toLowerCase() :
				null;
			attrHandle[ name ] = handle;
		}
		return ret;
	};
});




var rfocusable = /^(?:input|select|textarea|button)$/i;

jQuery.fn.extend({
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each(function() {
			delete this[ jQuery.propFix[ name ] || name ];
		});
	}
});

jQuery.extend({
	propFix: {
		"for": "htmlFor",
		"class": "className"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
				ret :
				( elem[ name ] = value );

		} else {
			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
				ret :
				elem[ name ];
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				return elem.hasAttribute( "tabindex" ) || rfocusable.test( elem.nodeName ) || elem.href ?
					elem.tabIndex :
					-1;
			}
		}
	}
});

if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		}
	};
}

jQuery.each([
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
});




var rclass = /[\t\r\n\f]/g;

jQuery.fn.extend({
	addClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = arguments.length === 0 || typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = value ? jQuery.trim( cur ) : "";
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// Toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					classNames = value.match( rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( type === strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					data_priv.set( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	}
});




var rreturn = /\r/g;

jQuery.fn.extend({
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// Handle most common string cases
					ret.replace(rreturn, "") :
					// Handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :
					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					jQuery.trim( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// IE6-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ? !option.disabled : option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( (option.selected = jQuery.inArray( option.value, values ) >= 0) ) {
						optionSet = true;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
});

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute("value") === null ? "on" : elem.value;
		};
	}
});




// Return jQuery for attributes-only inclusion


jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});


var nonce = jQuery.now();

var rquery = (/\?/);



// Support: Android 2.3
// Workaround failure to string-cast null input
jQuery.parseJSON = function( data ) {
	return JSON.parse( data + "" );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE9
	try {
		tmp = new DOMParser();
		xml = tmp.parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Document location
	ajaxLocation = window.location.href,

	// Segment location into parts
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

		// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
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

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,
			// URL without anti-cache param
			cacheURL,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// Shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});


jQuery._evalUrl = function( url ) {
	return jQuery.ajax({
		url: url,
		type: "GET",
		dataType: "script",
		async: false,
		global: false,
		"throws": true
	});
};


jQuery.fn.extend({
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapAll( html.call(this, i) );
			});
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	}
});


jQuery.expr.filters.hidden = function( elem ) {
	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
};
jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function() {
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		})
		.map(function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});


jQuery.ajaxSettings.xhr = function() {
	try {
		return new XMLHttpRequest();
	} catch( e ) {}
};

var xhrId = 0,
	xhrCallbacks = {},
	xhrSuccessStatus = {
		// file protocol always yields status code 0, assume 200
		0: 200,
		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE9
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if ( window.attachEvent ) {
	window.attachEvent( "onunload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]();
		}
	});
}

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport(function( options ) {
	var callback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr(),
					id = ++xhrId;

				xhr.open( options.type, options.url, options.async, options.username, options.password );

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers["X-Requested-With"] ) {
					headers["X-Requested-With"] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							delete xhrCallbacks[ id ];
							callback = xhr.onload = xhr.onerror = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {
								complete(
									// file: protocol always yields status 0; see #8605, #14207
									xhr.status,
									xhr.statusText
								);
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,
									// Support: IE9
									// Accessing binary-data responseText throws an exception
									// (#11426)
									typeof xhr.responseText === "string" ? {
										text: xhr.responseText
									} : undefined,
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				xhr.onerror = callback("error");

				// Create the abort callback
				callback = xhrCallbacks[ id ] = callback("abort");

				try {
					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {
					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {
	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery("<script>").prop({
					async: true,
					charset: s.scriptCharset,
					src: s.url
				}).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});




// data: string of html
// context (optional): If specified, the fragment will be created in this context, defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[1] ) ];
	}

	parsed = jQuery.buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = jQuery.trim( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
});




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep(jQuery.timers, function( fn ) {
		return elem === fn.elem;
	}).length;
};




var docElem = window.document.documentElement;

/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend({
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
		}

		var docElem, win,
			elem = this[ 0 ],
			box = { top: 0, left: 0 },
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// Support: BlackBerry 5, iOS 3 (original iPhone)
		// If we don't have gBCR, just use 0,0 rather than error
		if ( typeof elem.getBoundingClientRect !== strundefined ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top + win.pageYOffset - docElem.clientTop,
			left: box.left + win.pageXOffset - docElem.clientLeft
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// Assume getBoundingClientRect is there when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || docElem;
		});
	}
});

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : window.pageXOffset,
					top ? val : window.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

// Support: Safari<7+, Chrome<37+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );
				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
});


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});


// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	});
}




var
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === strundefined ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;

}));

/**
 * History.js jQuery Adapter
 * @author Benjamin Arthur Lupton <contact@balupton.com>
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

// Closure
(function(window,undefined){
	"use strict";

	// Localise Globals
	var
		History = window.History = window.History||{},
		jQuery = window.jQuery;

	// Check Existence
	if ( typeof History.Adapter !== 'undefined' ) {
		throw new Error('History.js Adapter has already been loaded...');
	}

	// Add the Adapter
	History.Adapter = {
		/**
		 * History.Adapter.bind(el,event,callback)
		 * @param {Element|string} el
		 * @param {string} event - custom and standard events
		 * @param {function} callback
		 * @return {void}
		 */
		bind: function(el,event,callback){
			jQuery(el).bind(event,callback);
		},

		/**
		 * History.Adapter.trigger(el,event)
		 * @param {Element|string} el
		 * @param {string} event - custom and standard events
		 * @param {Object=} extra - a object of extra event data (optional)
		 * @return {void}
		 */
		trigger: function(el,event,extra){
			jQuery(el).trigger(event,extra);
		},

		/**
		 * History.Adapter.extractEventData(key,event,extra)
		 * @param {string} key - key for the event data to extract
		 * @param {string} event - custom and standard events
		 * @param {Object=} extra - a object of extra event data (optional)
		 * @return {mixed}
		 */
		extractEventData: function(key,event,extra){
			// jQuery Native then jQuery Custom
			var result = (event && event.originalEvent && event.originalEvent[key]) || (extra && extra[key]) || undefined;

			// Return
			return result;
		},

		/**
		 * History.Adapter.onDomLoad(callback)
		 * @param {function} callback
		 * @return {void}
		 */
		onDomLoad: function(callback) {
			jQuery(callback);
		}
	};

	// Try and Initialise History
	if ( typeof History.init !== 'undefined' ) {
		History.init();
	}

})(window);

/**
 * History.js Core
 * @author Benjamin Arthur Lupton <contact@balupton.com>
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

(function(window,undefined){
	"use strict";

	// ========================================================================
	// Initialise

	// Localise Globals
	var
		console = window.console||undefined, // Prevent a JSLint complain
		document = window.document, // Make sure we are using the correct document
		navigator = window.navigator, // Make sure we are using the correct navigator
		sessionStorage = false, // sessionStorage
		setTimeout = window.setTimeout,
		clearTimeout = window.clearTimeout,
		setInterval = window.setInterval,
		clearInterval = window.clearInterval,
		JSON = window.JSON,
		alert = window.alert,
		History = window.History = window.History||{}, // Public History Object
		history = window.history; // Old History Object

	try {
		sessionStorage = window.sessionStorage; // This will throw an exception in some browsers when cookies/localStorage are explicitly disabled (i.e. Chrome)
		sessionStorage.setItem('TEST', '1');
		sessionStorage.removeItem('TEST');
	} catch(e) {
		sessionStorage = false;
	}

	// MooTools Compatibility
	JSON.stringify = JSON.stringify||JSON.encode;
	JSON.parse = JSON.parse||JSON.decode;

	// Check Existence
	if ( typeof History.init !== 'undefined' ) {
		throw new Error('History.js Core has already been loaded...');
	}

	// Initialise History
	History.init = function(options){
		// Check Load Status of Adapter
		if ( typeof History.Adapter === 'undefined' ) {
			return false;
		}

		// Check Load Status of Core
		if ( typeof History.initCore !== 'undefined' ) {
			History.initCore();
		}

		// Check Load Status of HTML4 Support
		if ( typeof History.initHtml4 !== 'undefined' ) {
			History.initHtml4();
		}

		// Return true
		return true;
	};


	// ========================================================================
	// Initialise Core

	// Initialise Core
	History.initCore = function(options){
		// Initialise
		if ( typeof History.initCore.initialized !== 'undefined' ) {
			// Already Loaded
			return false;
		}
		else {
			History.initCore.initialized = true;
		}


		// ====================================================================
		// Options

		/**
		 * History.options
		 * Configurable options
		 */
		History.options = History.options||{};

		/**
		 * History.options.hashChangeInterval
		 * How long should the interval be before hashchange checks
		 */
		History.options.hashChangeInterval = History.options.hashChangeInterval || 100;

		/**
		 * History.options.safariPollInterval
		 * How long should the interval be before safari poll checks
		 */
		History.options.safariPollInterval = History.options.safariPollInterval || 500;

		/**
		 * History.options.doubleCheckInterval
		 * How long should the interval be before we perform a double check
		 */
		History.options.doubleCheckInterval = History.options.doubleCheckInterval || 500;

		/**
		 * History.options.disableSuid
		 * Force History not to append suid
		 */
		History.options.disableSuid = History.options.disableSuid || false;

		/**
		 * History.options.storeInterval
		 * How long should we wait between store calls
		 */
		History.options.storeInterval = History.options.storeInterval || 1000;

		/**
		 * History.options.busyDelay
		 * How long should we wait between busy events
		 */
		History.options.busyDelay = History.options.busyDelay || 250;

		/**
		 * History.options.debug
		 * If true will enable debug messages to be logged
		 */
		History.options.debug = History.options.debug || false;

		/**
		 * History.options.initialTitle
		 * What is the title of the initial state
		 */
		History.options.initialTitle = History.options.initialTitle || document.title;

		/**
		 * History.options.html4Mode
		 * If true, will force HTMl4 mode (hashtags)
		 */
		History.options.html4Mode = History.options.html4Mode || false;

		/**
		 * History.options.delayInit
		 * Want to override default options and call init manually.
		 */
		History.options.delayInit = History.options.delayInit || false;


		// ====================================================================
		// Interval record

		/**
		 * History.intervalList
		 * List of intervals set, to be cleared when document is unloaded.
		 */
		History.intervalList = [];

		/**
		 * History.clearAllIntervals
		 * Clears all setInterval instances.
		 */
		History.clearAllIntervals = function(){
			var i, il = History.intervalList;
			if (typeof il !== "undefined" && il !== null) {
				for (i = 0; i < il.length; i++) {
					clearInterval(il[i]);
				}
				History.intervalList = null;
			}
		};


		// ====================================================================
		// Debug

		/**
		 * History.debug(message,...)
		 * Logs the passed arguments if debug enabled
		 */
		History.debug = function(){
			if ( (History.options.debug||false) ) {
				History.log.apply(History,arguments);
			}
		};

		/**
		 * History.log(message,...)
		 * Logs the passed arguments
		 */
		History.log = function(){
			// Prepare
			var
				consoleExists = !(typeof console === 'undefined' || typeof console.log === 'undefined' || typeof console.log.apply === 'undefined'),
				textarea = document.getElementById('log'),
				message,
				i,n,
				args,arg
				;

			// Write to Console
			if ( consoleExists ) {
				args = Array.prototype.slice.call(arguments);
				message = args.shift();
				if ( typeof console.debug !== 'undefined' ) {
					console.debug.apply(console,[message,args]);
				}
				else {
					console.log.apply(console,[message,args]);
				}
			}
			else {
				message = ("\n"+arguments[0]+"\n");
			}

			// Write to log
			for ( i=1,n=arguments.length; i<n; ++i ) {
				arg = arguments[i];
				if ( typeof arg === 'object' && typeof JSON !== 'undefined' ) {
					try {
						arg = JSON.stringify(arg);
					}
					catch ( Exception ) {
						// Recursive Object
					}
				}
				message += "\n"+arg+"\n";
			}

			// Textarea
			if ( textarea ) {
				textarea.value += message+"\n-----\n";
				textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
			}
			// No Textarea, No Console
			else if ( !consoleExists ) {
				alert(message);
			}

			// Return true
			return true;
		};


		// ====================================================================
		// Emulated Status

		/**
		 * History.getInternetExplorerMajorVersion()
		 * Get's the major version of Internet Explorer
		 * @return {integer}
		 * @license Public Domain
		 * @author Benjamin Arthur Lupton <contact@balupton.com>
		 * @author James Padolsey <https://gist.github.com/527683>
		 */
		History.getInternetExplorerMajorVersion = function(){
			var result = History.getInternetExplorerMajorVersion.cached =
					(typeof History.getInternetExplorerMajorVersion.cached !== 'undefined')
				?	History.getInternetExplorerMajorVersion.cached
				:	(function(){
						var v = 3,
								div = document.createElement('div'),
								all = div.getElementsByTagName('i');
						while ( (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->') && all[0] ) {}
						return (v > 4) ? v : false;
					})()
				;
			return result;
		};

		/**
		 * History.isInternetExplorer()
		 * Are we using Internet Explorer?
		 * @return {boolean}
		 * @license Public Domain
		 * @author Benjamin Arthur Lupton <contact@balupton.com>
		 */
		History.isInternetExplorer = function(){
			var result =
				History.isInternetExplorer.cached =
				(typeof History.isInternetExplorer.cached !== 'undefined')
					?	History.isInternetExplorer.cached
					:	Boolean(History.getInternetExplorerMajorVersion())
				;
			return result;
		};

		/**
		 * History.emulated
		 * Which features require emulating?
		 */

		if (History.options.html4Mode) {
			History.emulated = {
				pushState : true,
				hashChange: true
			};
		}

		else {

			History.emulated = {
				pushState: !Boolean(
					window.history && window.history.pushState && window.history.replaceState
					&& !(
						(/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(navigator.userAgent) /* disable for versions of iOS before version 4.3 (8F190) */
						|| (/AppleWebKit\/5([0-2]|3[0-2])/i).test(navigator.userAgent) /* disable for the mercury iOS browser, or at least older versions of the webkit engine */
					)
				),
				hashChange: Boolean(
					!(('onhashchange' in window) || ('onhashchange' in document))
					||
					(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8)
				)
			};
		}

		/**
		 * History.enabled
		 * Is History enabled?
		 */
		History.enabled = !History.emulated.pushState;

		/**
		 * History.bugs
		 * Which bugs are present
		 */
		History.bugs = {
			/**
			 * Safari 5 and Safari iOS 4 fail to return to the correct state once a hash is replaced by a `replaceState` call
			 * https://bugs.webkit.org/show_bug.cgi?id=56249
			 */
			setHash: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),

			/**
			 * Safari 5 and Safari iOS 4 sometimes fail to apply the state change under busy conditions
			 * https://bugs.webkit.org/show_bug.cgi?id=42940
			 */
			safariPoll: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),

			/**
			 * MSIE 6 and 7 sometimes do not apply a hash even it was told to (requiring a second call to the apply function)
			 */
			ieDoubleCheck: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8),

			/**
			 * MSIE 6 requires the entire hash to be encoded for the hashes to trigger the onHashChange event
			 */
			hashEscape: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 7)
		};

		/**
		 * History.isEmptyObject(obj)
		 * Checks to see if the Object is Empty
		 * @param {Object} obj
		 * @return {boolean}
		 */
		History.isEmptyObject = function(obj) {
			for ( var name in obj ) {
				if ( obj.hasOwnProperty(name) ) {
					return false;
				}
			}
			return true;
		};

		/**
		 * History.cloneObject(obj)
		 * Clones a object and eliminate all references to the original contexts
		 * @param {Object} obj
		 * @return {Object}
		 */
		History.cloneObject = function(obj) {
			var hash,newObj;
			if ( obj ) {
				hash = JSON.stringify(obj);
				newObj = JSON.parse(hash);
			}
			else {
				newObj = {};
			}
			return newObj;
		};


		// ====================================================================
		// URL Helpers

		/**
		 * History.getRootUrl()
		 * Turns "http://mysite.com/dir/page.html?asd" into "http://mysite.com"
		 * @return {String} rootUrl
		 */
		History.getRootUrl = function(){
			// Create
			var rootUrl = document.location.protocol+'//'+(document.location.hostname||document.location.host);
			if ( document.location.port||false ) {
				rootUrl += ':'+document.location.port;
			}
			rootUrl += '/';

			// Return
			return rootUrl;
		};

		/**
		 * History.getBaseHref()
		 * Fetches the `href` attribute of the `<base href="...">` element if it exists
		 * @return {String} baseHref
		 */
		History.getBaseHref = function(){
			// Create
			var
				baseElements = document.getElementsByTagName('base'),
				baseElement = null,
				baseHref = '';

			// Test for Base Element
			if ( baseElements.length === 1 ) {
				// Prepare for Base Element
				baseElement = baseElements[0];
				baseHref = baseElement.href.replace(/[^\/]+$/,'');
			}

			// Adjust trailing slash
			baseHref = baseHref.replace(/\/+$/,'');
			if ( baseHref ) baseHref += '/';

			// Return
			return baseHref;
		};

		/**
		 * History.getBaseUrl()
		 * Fetches the baseHref or basePageUrl or rootUrl (whichever one exists first)
		 * @return {String} baseUrl
		 */
		History.getBaseUrl = function(){
			// Create
			var baseUrl = History.getBaseHref()||History.getBasePageUrl()||History.getRootUrl();

			// Return
			return baseUrl;
		};

		/**
		 * History.getPageUrl()
		 * Fetches the URL of the current page
		 * @return {String} pageUrl
		 */
		History.getPageUrl = function(){
			// Fetch
			var
				State = History.getState(false,false),
				stateUrl = (State||{}).url||History.getLocationHref(),
				pageUrl;

			// Create
			pageUrl = stateUrl.replace(/\/+$/,'').replace(/[^\/]+$/,function(part,index,string){
				return (/\./).test(part) ? part : part+'/';
			});

			// Return
			return pageUrl;
		};

		/**
		 * History.getBasePageUrl()
		 * Fetches the Url of the directory of the current page
		 * @return {String} basePageUrl
		 */
		History.getBasePageUrl = function(){
			// Create
			var basePageUrl = (History.getLocationHref()).replace(/[#\?].*/,'').replace(/[^\/]+$/,function(part,index,string){
				return (/[^\/]$/).test(part) ? '' : part;
			}).replace(/\/+$/,'')+'/';

			// Return
			return basePageUrl;
		};

		/**
		 * History.getFullUrl(url)
		 * Ensures that we have an absolute URL and not a relative URL
		 * @param {string} url
		 * @param {Boolean} allowBaseHref
		 * @return {string} fullUrl
		 */
		History.getFullUrl = function(url,allowBaseHref){
			// Prepare
			var fullUrl = url, firstChar = url.substring(0,1);
			allowBaseHref = (typeof allowBaseHref === 'undefined') ? true : allowBaseHref;

			// Check
			if ( /[a-z]+\:\/\//.test(url) ) {
				// Full URL
			}
			else if ( firstChar === '/' ) {
				// Root URL
				fullUrl = History.getRootUrl()+url.replace(/^\/+/,'');
			}
			else if ( firstChar === '#' ) {
				// Anchor URL
				fullUrl = History.getPageUrl().replace(/#.*/,'')+url;
			}
			else if ( firstChar === '?' ) {
				// Query URL
				fullUrl = History.getPageUrl().replace(/[\?#].*/,'')+url;
			}
			else {
				// Relative URL
				if ( allowBaseHref ) {
					fullUrl = History.getBaseUrl()+url.replace(/^(\.\/)+/,'');
				} else {
					fullUrl = History.getBasePageUrl()+url.replace(/^(\.\/)+/,'');
				}
				// We have an if condition above as we do not want hashes
				// which are relative to the baseHref in our URLs
				// as if the baseHref changes, then all our bookmarks
				// would now point to different locations
				// whereas the basePageUrl will always stay the same
			}

			// Return
			return fullUrl.replace(/\#$/,'');
		};

		/**
		 * History.getShortUrl(url)
		 * Ensures that we have a relative URL and not a absolute URL
		 * @param {string} url
		 * @return {string} url
		 */
		History.getShortUrl = function(url){
			// Prepare
			var shortUrl = url, baseUrl = History.getBaseUrl(), rootUrl = History.getRootUrl();

			// Trim baseUrl
			if ( History.emulated.pushState ) {
				// We are in a if statement as when pushState is not emulated
				// The actual url these short urls are relative to can change
				// So within the same session, we the url may end up somewhere different
				shortUrl = shortUrl.replace(baseUrl,'');
			}

			// Trim rootUrl
			shortUrl = shortUrl.replace(rootUrl,'/');

			// Ensure we can still detect it as a state
			if ( History.isTraditionalAnchor(shortUrl) ) {
				shortUrl = './'+shortUrl;
			}

			// Clean It
			shortUrl = shortUrl.replace(/^(\.\/)+/g,'./').replace(/\#$/,'');

			// Return
			return shortUrl;
		};

		/**
		 * History.getLocationHref(document)
		 * Returns a normalized version of document.location.href
		 * accounting for browser inconsistencies, etc.
		 *
		 * This URL will be URI-encoded and will include the hash
		 *
		 * @param {object} document
		 * @return {string} url
		 */
		History.getLocationHref = function(doc) {
			doc = doc || document;

			// most of the time, this will be true
			if (doc.URL === doc.location.href)
				return doc.location.href;

			// some versions of webkit URI-decode document.location.href
			// but they leave document.URL in an encoded state
			if (doc.location.href === decodeURIComponent(doc.URL))
				return doc.URL;

			// FF 3.6 only updates document.URL when a page is reloaded
			// document.location.href is updated correctly
			if (doc.location.hash && decodeURIComponent(doc.location.href.replace(/^[^#]+/, "")) === doc.location.hash)
				return doc.location.href;

			if (doc.URL.indexOf('#') == -1 && doc.location.href.indexOf('#') != -1)
				return doc.location.href;
			
			return doc.URL || doc.location.href;
		};


		// ====================================================================
		// State Storage

		/**
		 * History.store
		 * The store for all session specific data
		 */
		History.store = {};

		/**
		 * History.idToState
		 * 1-1: State ID to State Object
		 */
		History.idToState = History.idToState||{};

		/**
		 * History.stateToId
		 * 1-1: State String to State ID
		 */
		History.stateToId = History.stateToId||{};

		/**
		 * History.urlToId
		 * 1-1: State URL to State ID
		 */
		History.urlToId = History.urlToId||{};

		/**
		 * History.storedStates
		 * Store the states in an array
		 */
		History.storedStates = History.storedStates||[];

		/**
		 * History.savedStates
		 * Saved the states in an array
		 */
		History.savedStates = History.savedStates||[];

		/**
		 * History.noramlizeStore()
		 * Noramlize the store by adding necessary values
		 */
		History.normalizeStore = function(){
			History.store.idToState = History.store.idToState||{};
			History.store.urlToId = History.store.urlToId||{};
			History.store.stateToId = History.store.stateToId||{};
		};

		/**
		 * History.getState()
		 * Get an object containing the data, title and url of the current state
		 * @param {Boolean} friendly
		 * @param {Boolean} create
		 * @return {Object} State
		 */
		History.getState = function(friendly,create){
			// Prepare
			if ( typeof friendly === 'undefined' ) { friendly = true; }
			if ( typeof create === 'undefined' ) { create = true; }

			// Fetch
			var State = History.getLastSavedState();

			// Create
			if ( !State && create ) {
				State = History.createStateObject();
			}

			// Adjust
			if ( friendly ) {
				State = History.cloneObject(State);
				State.url = State.cleanUrl||State.url;
			}

			// Return
			return State;
		};

		/**
		 * History.getIdByState(State)
		 * Gets a ID for a State
		 * @param {State} newState
		 * @return {String} id
		 */
		History.getIdByState = function(newState){

			// Fetch ID
			var id = History.extractId(newState.url),
				str;

			if ( !id ) {
				// Find ID via State String
				str = History.getStateString(newState);
				if ( typeof History.stateToId[str] !== 'undefined' ) {
					id = History.stateToId[str];
				}
				else if ( typeof History.store.stateToId[str] !== 'undefined' ) {
					id = History.store.stateToId[str];
				}
				else {
					// Generate a new ID
					while ( true ) {
						id = (new Date()).getTime() + String(Math.random()).replace(/\D/g,'');
						if ( typeof History.idToState[id] === 'undefined' && typeof History.store.idToState[id] === 'undefined' ) {
							break;
						}
					}

					// Apply the new State to the ID
					History.stateToId[str] = id;
					History.idToState[id] = newState;
				}
			}

			// Return ID
			return id;
		};

		/**
		 * History.normalizeState(State)
		 * Expands a State Object
		 * @param {object} State
		 * @return {object}
		 */
		History.normalizeState = function(oldState){
			// Variables
			var newState, dataNotEmpty;

			// Prepare
			if ( !oldState || (typeof oldState !== 'object') ) {
				oldState = {};
			}

			// Check
			if ( typeof oldState.normalized !== 'undefined' ) {
				return oldState;
			}

			// Adjust
			if ( !oldState.data || (typeof oldState.data !== 'object') ) {
				oldState.data = {};
			}

			// ----------------------------------------------------------------

			// Create
			newState = {};
			newState.normalized = true;
			newState.title = oldState.title||'';
			newState.url = History.getFullUrl(oldState.url?oldState.url:(History.getLocationHref()));
			newState.hash = History.getShortUrl(newState.url);
			newState.data = History.cloneObject(oldState.data);

			// Fetch ID
			newState.id = History.getIdByState(newState);

			// ----------------------------------------------------------------

			// Clean the URL
			newState.cleanUrl = newState.url.replace(/\??\&_suid.*/,'');
			newState.url = newState.cleanUrl;

			// Check to see if we have more than just a url
			dataNotEmpty = !History.isEmptyObject(newState.data);

			// Apply
			if ( (newState.title || dataNotEmpty) && History.options.disableSuid !== true ) {
				// Add ID to Hash
				newState.hash = History.getShortUrl(newState.url).replace(/\??\&_suid.*/,'');
				if ( !/\?/.test(newState.hash) ) {
					newState.hash += '?';
				}
				newState.hash += '&_suid='+newState.id;
			}

			// Create the Hashed URL
			newState.hashedUrl = History.getFullUrl(newState.hash);

			// ----------------------------------------------------------------

			// Update the URL if we have a duplicate
			if ( (History.emulated.pushState || History.bugs.safariPoll) && History.hasUrlDuplicate(newState) ) {
				newState.url = newState.hashedUrl;
			}

			// ----------------------------------------------------------------

			// Return
			return newState;
		};

		/**
		 * History.createStateObject(data,title,url)
		 * Creates a object based on the data, title and url state params
		 * @param {object} data
		 * @param {string} title
		 * @param {string} url
		 * @return {object}
		 */
		History.createStateObject = function(data,title,url){
			// Hashify
			var State = {
				'data': data,
				'title': title,
				'url': url
			};

			// Expand the State
			State = History.normalizeState(State);

			// Return object
			return State;
		};

		/**
		 * History.getStateById(id)
		 * Get a state by it's UID
		 * @param {String} id
		 */
		History.getStateById = function(id){
			// Prepare
			id = String(id);

			// Retrieve
			var State = History.idToState[id] || History.store.idToState[id] || undefined;

			// Return State
			return State;
		};

		/**
		 * Get a State's String
		 * @param {State} passedState
		 */
		History.getStateString = function(passedState){
			// Prepare
			var State, cleanedState, str;

			// Fetch
			State = History.normalizeState(passedState);

			// Clean
			cleanedState = {
				data: State.data,
				title: passedState.title,
				url: passedState.url
			};

			// Fetch
			str = JSON.stringify(cleanedState);

			// Return
			return str;
		};

		/**
		 * Get a State's ID
		 * @param {State} passedState
		 * @return {String} id
		 */
		History.getStateId = function(passedState){
			// Prepare
			var State, id;

			// Fetch
			State = History.normalizeState(passedState);

			// Fetch
			id = State.id;

			// Return
			return id;
		};

		/**
		 * History.getHashByState(State)
		 * Creates a Hash for the State Object
		 * @param {State} passedState
		 * @return {String} hash
		 */
		History.getHashByState = function(passedState){
			// Prepare
			var State, hash;

			// Fetch
			State = History.normalizeState(passedState);

			// Hash
			hash = State.hash;

			// Return
			return hash;
		};

		/**
		 * History.extractId(url_or_hash)
		 * Get a State ID by it's URL or Hash
		 * @param {string} url_or_hash
		 * @return {string} id
		 */
		History.extractId = function ( url_or_hash ) {
			// Prepare
			var id,parts,url, tmp;

			// Extract
			
			// If the URL has a #, use the id from before the #
			if (url_or_hash.indexOf('#') != -1)
			{
				tmp = url_or_hash.split("#")[0];
			}
			else
			{
				tmp = url_or_hash;
			}
			
			parts = /(.*)\&_suid=([0-9]+)$/.exec(tmp);
			url = parts ? (parts[1]||url_or_hash) : url_or_hash;
			id = parts ? String(parts[2]||'') : '';

			// Return
			return id||false;
		};

		/**
		 * History.isTraditionalAnchor
		 * Checks to see if the url is a traditional anchor or not
		 * @param {String} url_or_hash
		 * @return {Boolean}
		 */
		History.isTraditionalAnchor = function(url_or_hash){
			// Check
			var isTraditional = !(/[\/\?\.]/.test(url_or_hash));

			// Return
			return isTraditional;
		};

		/**
		 * History.extractState
		 * Get a State by it's URL or Hash
		 * @param {String} url_or_hash
		 * @return {State|null}
		 */
		History.extractState = function(url_or_hash,create){
			// Prepare
			var State = null, id, url;
			create = create||false;

			// Fetch SUID
			id = History.extractId(url_or_hash);
			if ( id ) {
				State = History.getStateById(id);
			}

			// Fetch SUID returned no State
			if ( !State ) {
				// Fetch URL
				url = History.getFullUrl(url_or_hash);

				// Check URL
				id = History.getIdByUrl(url)||false;
				if ( id ) {
					State = History.getStateById(id);
				}

				// Create State
				if ( !State && create && !History.isTraditionalAnchor(url_or_hash) ) {
					State = History.createStateObject(null,null,url);
				}
			}

			// Return
			return State;
		};

		/**
		 * History.getIdByUrl()
		 * Get a State ID by a State URL
		 */
		History.getIdByUrl = function(url){
			// Fetch
			var id = History.urlToId[url] || History.store.urlToId[url] || undefined;

			// Return
			return id;
		};

		/**
		 * History.getLastSavedState()
		 * Get an object containing the data, title and url of the current state
		 * @return {Object} State
		 */
		History.getLastSavedState = function(){
			return History.savedStates[History.savedStates.length-1]||undefined;
		};

		/**
		 * History.getLastStoredState()
		 * Get an object containing the data, title and url of the current state
		 * @return {Object} State
		 */
		History.getLastStoredState = function(){
			return History.storedStates[History.storedStates.length-1]||undefined;
		};

		/**
		 * History.hasUrlDuplicate
		 * Checks if a Url will have a url conflict
		 * @param {Object} newState
		 * @return {Boolean} hasDuplicate
		 */
		History.hasUrlDuplicate = function(newState) {
			// Prepare
			var hasDuplicate = false,
				oldState;

			// Fetch
			oldState = History.extractState(newState.url);

			// Check
			hasDuplicate = oldState && oldState.id !== newState.id;

			// Return
			return hasDuplicate;
		};

		/**
		 * History.storeState
		 * Store a State
		 * @param {Object} newState
		 * @return {Object} newState
		 */
		History.storeState = function(newState){
			// Store the State
			History.urlToId[newState.url] = newState.id;

			// Push the State
			History.storedStates.push(History.cloneObject(newState));

			// Return newState
			return newState;
		};

		/**
		 * History.isLastSavedState(newState)
		 * Tests to see if the state is the last state
		 * @param {Object} newState
		 * @return {boolean} isLast
		 */
		History.isLastSavedState = function(newState){
			// Prepare
			var isLast = false,
				newId, oldState, oldId;

			// Check
			if ( History.savedStates.length ) {
				newId = newState.id;
				oldState = History.getLastSavedState();
				oldId = oldState.id;

				// Check
				isLast = (newId === oldId);
			}

			// Return
			return isLast;
		};

		/**
		 * History.saveState
		 * Push a State
		 * @param {Object} newState
		 * @return {boolean} changed
		 */
		History.saveState = function(newState){
			// Check Hash
			if ( History.isLastSavedState(newState) ) {
				return false;
			}

			// Push the State
			History.savedStates.push(History.cloneObject(newState));

			// Return true
			return true;
		};

		/**
		 * History.getStateByIndex()
		 * Gets a state by the index
		 * @param {integer} index
		 * @return {Object}
		 */
		History.getStateByIndex = function(index){
			// Prepare
			var State = null;

			// Handle
			if ( typeof index === 'undefined' ) {
				// Get the last inserted
				State = History.savedStates[History.savedStates.length-1];
			}
			else if ( index < 0 ) {
				// Get from the end
				State = History.savedStates[History.savedStates.length+index];
			}
			else {
				// Get from the beginning
				State = History.savedStates[index];
			}

			// Return State
			return State;
		};
		
		/**
		 * History.getCurrentIndex()
		 * Gets the current index
		 * @return (integer)
		*/
		History.getCurrentIndex = function(){
			// Prepare
			var index = null;
			
			// No states saved
			if(History.savedStates.length < 1) {
				index = 0;
			}
			else {
				index = History.savedStates.length-1;
			}
			return index;
		};

		// ====================================================================
		// Hash Helpers

		/**
		 * History.getHash()
		 * @param {Location=} location
		 * Gets the current document hash
		 * Note: unlike location.hash, this is guaranteed to return the escaped hash in all browsers
		 * @return {string}
		 */
		History.getHash = function(doc){
			var url = History.getLocationHref(doc),
				hash;
			hash = History.getHashByUrl(url);
			return hash;
		};

		/**
		 * History.unescapeHash()
		 * normalize and Unescape a Hash
		 * @param {String} hash
		 * @return {string}
		 */
		History.unescapeHash = function(hash){
			// Prepare
			var result = History.normalizeHash(hash);

			// Unescape hash
			result = decodeURIComponent(result);

			// Return result
			return result;
		};

		/**
		 * History.normalizeHash()
		 * normalize a hash across browsers
		 * @return {string}
		 */
		History.normalizeHash = function(hash){
			// Prepare
			var result = hash.replace(/[^#]*#/,'').replace(/#.*/, '');

			// Return result
			return result;
		};

		/**
		 * History.setHash(hash)
		 * Sets the document hash
		 * @param {string} hash
		 * @return {History}
		 */
		History.setHash = function(hash,queue){
			// Prepare
			var State, pageUrl;

			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.setHash: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.setHash,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Log
			//History.debug('History.setHash: called',hash);

			// Make Busy + Continue
			History.busy(true);

			// Check if hash is a state
			State = History.extractState(hash,true);
			if ( State && !History.emulated.pushState ) {
				// Hash is a state so skip the setHash
				//History.debug('History.setHash: Hash is a state so skipping the hash set with a direct pushState call',arguments);

				// PushState
				History.pushState(State.data,State.title,State.url,false);
			}
			else if ( History.getHash() !== hash ) {
				// Hash is a proper hash, so apply it

				// Handle browser bugs
				if ( History.bugs.setHash ) {
					// Fix Safari Bug https://bugs.webkit.org/show_bug.cgi?id=56249

					// Fetch the base page
					pageUrl = History.getPageUrl();

					// Safari hash apply
					History.pushState(null,null,pageUrl+'#'+hash,false);
				}
				else {
					// Normal hash apply
					document.location.hash = hash;
				}
			}

			// Chain
			return History;
		};

		/**
		 * History.escape()
		 * normalize and Escape a Hash
		 * @return {string}
		 */
		History.escapeHash = function(hash){
			// Prepare
			var result = History.normalizeHash(hash);

			// Escape hash
			result = window.encodeURIComponent(result);

			// IE6 Escape Bug
			if ( !History.bugs.hashEscape ) {
				// Restore common parts
				result = result
					.replace(/\%21/g,'!')
					.replace(/\%26/g,'&')
					.replace(/\%3D/g,'=')
					.replace(/\%3F/g,'?');
			}

			// Return result
			return result;
		};

		/**
		 * History.getHashByUrl(url)
		 * Extracts the Hash from a URL
		 * @param {string} url
		 * @return {string} url
		 */
		History.getHashByUrl = function(url){
			// Extract the hash
			var hash = String(url)
				.replace(/([^#]*)#?([^#]*)#?(.*)/, '$2')
				;

			// Unescape hash
			hash = History.unescapeHash(hash);

			// Return hash
			return hash;
		};

		/**
		 * History.setTitle(title)
		 * Applies the title to the document
		 * @param {State} newState
		 * @return {Boolean}
		 */
		History.setTitle = function(newState){
			// Prepare
			var title = newState.title,
				firstState;

			// Initial
			if ( !title ) {
				firstState = History.getStateByIndex(0);
				if ( firstState && firstState.url === newState.url ) {
					title = firstState.title||History.options.initialTitle;
				}
			}

			// Apply
			try {
				document.getElementsByTagName('title')[0].innerHTML = title.replace('<','&lt;').replace('>','&gt;').replace(' & ',' &amp; ');
			}
			catch ( Exception ) { }
			document.title = title;

			// Chain
			return History;
		};


		// ====================================================================
		// Queueing

		/**
		 * History.queues
		 * The list of queues to use
		 * First In, First Out
		 */
		History.queues = [];

		/**
		 * History.busy(value)
		 * @param {boolean} value [optional]
		 * @return {boolean} busy
		 */
		History.busy = function(value){
			// Apply
			if ( typeof value !== 'undefined' ) {
				//History.debug('History.busy: changing ['+(History.busy.flag||false)+'] to ['+(value||false)+']', History.queues.length);
				History.busy.flag = value;
			}
			// Default
			else if ( typeof History.busy.flag === 'undefined' ) {
				History.busy.flag = false;
			}

			// Queue
			if ( !History.busy.flag ) {
				// Execute the next item in the queue
				clearTimeout(History.busy.timeout);
				var fireNext = function(){
					var i, queue, item;
					if ( History.busy.flag ) return;
					for ( i=History.queues.length-1; i >= 0; --i ) {
						queue = History.queues[i];
						if ( queue.length === 0 ) continue;
						item = queue.shift();
						History.fireQueueItem(item);
						History.busy.timeout = setTimeout(fireNext,History.options.busyDelay);
					}
				};
				History.busy.timeout = setTimeout(fireNext,History.options.busyDelay);
			}

			// Return
			return History.busy.flag;
		};

		/**
		 * History.busy.flag
		 */
		History.busy.flag = false;

		/**
		 * History.fireQueueItem(item)
		 * Fire a Queue Item
		 * @param {Object} item
		 * @return {Mixed} result
		 */
		History.fireQueueItem = function(item){
			return item.callback.apply(item.scope||History,item.args||[]);
		};

		/**
		 * History.pushQueue(callback,args)
		 * Add an item to the queue
		 * @param {Object} item [scope,callback,args,queue]
		 */
		History.pushQueue = function(item){
			// Prepare the queue
			History.queues[item.queue||0] = History.queues[item.queue||0]||[];

			// Add to the queue
			History.queues[item.queue||0].push(item);

			// Chain
			return History;
		};

		/**
		 * History.queue (item,queue), (func,queue), (func), (item)
		 * Either firs the item now if not busy, or adds it to the queue
		 */
		History.queue = function(item,queue){
			// Prepare
			if ( typeof item === 'function' ) {
				item = {
					callback: item
				};
			}
			if ( typeof queue !== 'undefined' ) {
				item.queue = queue;
			}

			// Handle
			if ( History.busy() ) {
				History.pushQueue(item);
			} else {
				History.fireQueueItem(item);
			}

			// Chain
			return History;
		};

		/**
		 * History.clearQueue()
		 * Clears the Queue
		 */
		History.clearQueue = function(){
			History.busy.flag = false;
			History.queues = [];
			return History;
		};


		// ====================================================================
		// IE Bug Fix

		/**
		 * History.stateChanged
		 * States whether or not the state has changed since the last double check was initialised
		 */
		History.stateChanged = false;

		/**
		 * History.doubleChecker
		 * Contains the timeout used for the double checks
		 */
		History.doubleChecker = false;

		/**
		 * History.doubleCheckComplete()
		 * Complete a double check
		 * @return {History}
		 */
		History.doubleCheckComplete = function(){
			// Update
			History.stateChanged = true;

			// Clear
			History.doubleCheckClear();

			// Chain
			return History;
		};

		/**
		 * History.doubleCheckClear()
		 * Clear a double check
		 * @return {History}
		 */
		History.doubleCheckClear = function(){
			// Clear
			if ( History.doubleChecker ) {
				clearTimeout(History.doubleChecker);
				History.doubleChecker = false;
			}

			// Chain
			return History;
		};

		/**
		 * History.doubleCheck()
		 * Create a double check
		 * @return {History}
		 */
		History.doubleCheck = function(tryAgain){
			// Reset
			History.stateChanged = false;
			History.doubleCheckClear();

			// Fix IE6,IE7 bug where calling history.back or history.forward does not actually change the hash (whereas doing it manually does)
			// Fix Safari 5 bug where sometimes the state does not change: https://bugs.webkit.org/show_bug.cgi?id=42940
			if ( History.bugs.ieDoubleCheck ) {
				// Apply Check
				History.doubleChecker = setTimeout(
					function(){
						History.doubleCheckClear();
						if ( !History.stateChanged ) {
							//History.debug('History.doubleCheck: State has not yet changed, trying again', arguments);
							// Re-Attempt
							tryAgain();
						}
						return true;
					},
					History.options.doubleCheckInterval
				);
			}

			// Chain
			return History;
		};


		// ====================================================================
		// Safari Bug Fix

		/**
		 * History.safariStatePoll()
		 * Poll the current state
		 * @return {History}
		 */
		History.safariStatePoll = function(){
			// Poll the URL

			// Get the Last State which has the new URL
			var
				urlState = History.extractState(History.getLocationHref()),
				newState;

			// Check for a difference
			if ( !History.isLastSavedState(urlState) ) {
				newState = urlState;
			}
			else {
				return;
			}

			// Check if we have a state with that url
			// If not create it
			if ( !newState ) {
				//History.debug('History.safariStatePoll: new');
				newState = History.createStateObject();
			}

			// Apply the New State
			//History.debug('History.safariStatePoll: trigger');
			History.Adapter.trigger(window,'popstate');

			// Chain
			return History;
		};


		// ====================================================================
		// State Aliases

		/**
		 * History.back(queue)
		 * Send the browser history back one item
		 * @param {Integer} queue [optional]
		 */
		History.back = function(queue){
			//History.debug('History.back: called', arguments);

			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.back: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.back,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Make Busy + Continue
			History.busy(true);

			// Fix certain browser bugs that prevent the state from changing
			History.doubleCheck(function(){
				History.back(false);
			});

			// Go back
			history.go(-1);

			// End back closure
			return true;
		};

		/**
		 * History.forward(queue)
		 * Send the browser history forward one item
		 * @param {Integer} queue [optional]
		 */
		History.forward = function(queue){
			//History.debug('History.forward: called', arguments);

			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.forward: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.forward,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Make Busy + Continue
			History.busy(true);

			// Fix certain browser bugs that prevent the state from changing
			History.doubleCheck(function(){
				History.forward(false);
			});

			// Go forward
			history.go(1);

			// End forward closure
			return true;
		};

		/**
		 * History.go(index,queue)
		 * Send the browser history back or forward index times
		 * @param {Integer} queue [optional]
		 */
		History.go = function(index,queue){
			//History.debug('History.go: called', arguments);

			// Prepare
			var i;

			// Handle
			if ( index > 0 ) {
				// Forward
				for ( i=1; i<=index; ++i ) {
					History.forward(queue);
				}
			}
			else if ( index < 0 ) {
				// Backward
				for ( i=-1; i>=index; --i ) {
					History.back(queue);
				}
			}
			else {
				throw new Error('History.go: History.go requires a positive or negative integer passed.');
			}

			// Chain
			return History;
		};


		// ====================================================================
		// HTML5 State Support

		// Non-Native pushState Implementation
		if ( History.emulated.pushState ) {
			/*
			 * Provide Skeleton for HTML4 Browsers
			 */

			// Prepare
			var emptyFunction = function(){};
			History.pushState = History.pushState||emptyFunction;
			History.replaceState = History.replaceState||emptyFunction;
		} // History.emulated.pushState

		// Native pushState Implementation
		else {
			/*
			 * Use native HTML5 History API Implementation
			 */

			/**
			 * History.onPopState(event,extra)
			 * Refresh the Current State
			 */
			History.onPopState = function(event,extra){
				// Prepare
				var stateId = false, newState = false, currentHash, currentState;

				// Reset the double check
				History.doubleCheckComplete();

				// Check for a Hash, and handle apporiatly
				currentHash = History.getHash();
				if ( currentHash ) {
					// Expand Hash
					currentState = History.extractState(currentHash||History.getLocationHref(),true);
					if ( currentState ) {
						// We were able to parse it, it must be a State!
						// Let's forward to replaceState
						//History.debug('History.onPopState: state anchor', currentHash, currentState);
						History.replaceState(currentState.data, currentState.title, currentState.url, false);
					}
					else {
						// Traditional Anchor
						//History.debug('History.onPopState: traditional anchor', currentHash);
						History.Adapter.trigger(window,'anchorchange');
						History.busy(false);
					}

					// We don't care for hashes
					History.expectedStateId = false;
					return false;
				}

				// Ensure
				stateId = History.Adapter.extractEventData('state',event,extra) || false;

				// Fetch State
				if ( stateId ) {
					// Vanilla: Back/forward button was used
					newState = History.getStateById(stateId);
				}
				else if ( History.expectedStateId ) {
					// Vanilla: A new state was pushed, and popstate was called manually
					newState = History.getStateById(History.expectedStateId);
				}
				else {
					// Initial State
					newState = History.extractState(History.getLocationHref());
				}

				// The State did not exist in our store
				if ( !newState ) {
					// Regenerate the State
					newState = History.createStateObject(null,null,History.getLocationHref());
				}

				// Clean
				History.expectedStateId = false;

				// Check if we are the same state
				if ( History.isLastSavedState(newState) ) {
					// There has been no change (just the page's hash has finally propagated)
					//History.debug('History.onPopState: no change', newState, History.savedStates);
					History.busy(false);
					return false;
				}

				// Store the State
				History.storeState(newState);
				History.saveState(newState);

				// Force update of the title
				History.setTitle(newState);

				// Fire Our Event
				History.Adapter.trigger(window,'statechange');
				History.busy(false);

				// Return true
				return true;
			};
			History.Adapter.bind(window,'popstate',History.onPopState);

			/**
			 * History.pushState(data,title,url)
			 * Add a new State to the history object, become it, and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.pushState = function(data,title,url,queue){
				//History.debug('History.pushState: called', arguments);

				// Check the State
				if ( History.getHashByUrl(url) && History.emulated.pushState ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Handle Queueing
				if ( queue !== false && History.busy() ) {
					// Wait + Push to Queue
					//History.debug('History.pushState: we must wait', arguments);
					History.pushQueue({
						scope: History,
						callback: History.pushState,
						args: arguments,
						queue: queue
					});
					return false;
				}

				// Make Busy + Continue
				History.busy(true);

				// Create the newState
				var newState = History.createStateObject(data,title,url);

				// Check it
				if ( History.isLastSavedState(newState) ) {
					// Won't be a change
					History.busy(false);
				}
				else {
					// Store the newState
					History.storeState(newState);
					History.expectedStateId = newState.id;

					// Push the newState
					history.pushState(newState.id,newState.title,newState.url);

					// Fire HTML5 Event
					History.Adapter.trigger(window,'popstate');
				}

				// End pushState closure
				return true;
			};

			/**
			 * History.replaceState(data,title,url)
			 * Replace the State and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.replaceState = function(data,title,url,queue){
				//History.debug('History.replaceState: called', arguments);

				// Check the State
				if ( History.getHashByUrl(url) && History.emulated.pushState ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Handle Queueing
				if ( queue !== false && History.busy() ) {
					// Wait + Push to Queue
					//History.debug('History.replaceState: we must wait', arguments);
					History.pushQueue({
						scope: History,
						callback: History.replaceState,
						args: arguments,
						queue: queue
					});
					return false;
				}

				// Make Busy + Continue
				History.busy(true);

				// Create the newState
				var newState = History.createStateObject(data,title,url);

				// Check it
				if ( History.isLastSavedState(newState) ) {
					// Won't be a change
					History.busy(false);
				}
				else {
					// Store the newState
					History.storeState(newState);
					History.expectedStateId = newState.id;

					// Push the newState
					history.replaceState(newState.id,newState.title,newState.url);

					// Fire HTML5 Event
					History.Adapter.trigger(window,'popstate');
				}

				// End replaceState closure
				return true;
			};

		} // !History.emulated.pushState


		// ====================================================================
		// Initialise

		/**
		 * Load the Store
		 */
		if ( sessionStorage ) {
			// Fetch
			try {
				History.store = JSON.parse(sessionStorage.getItem('History.store'))||{};
			}
			catch ( err ) {
				History.store = {};
			}

			// Normalize
			History.normalizeStore();
		}
		else {
			// Default Load
			History.store = {};
			History.normalizeStore();
		}

		/**
		 * Clear Intervals on exit to prevent memory leaks
		 */
		History.Adapter.bind(window,"unload",History.clearAllIntervals);

		/**
		 * Create the initial State
		 */
		History.saveState(History.storeState(History.extractState(History.getLocationHref(),true)));

		/**
		 * Bind for Saving Store
		 */
		if ( sessionStorage ) {
			// When the page is closed
			History.onUnload = function(){
				// Prepare
				var	currentStore, item, currentStoreString;

				// Fetch
				try {
					currentStore = JSON.parse(sessionStorage.getItem('History.store'))||{};
				}
				catch ( err ) {
					currentStore = {};
				}

				// Ensure
				currentStore.idToState = currentStore.idToState || {};
				currentStore.urlToId = currentStore.urlToId || {};
				currentStore.stateToId = currentStore.stateToId || {};

				// Sync
				for ( item in History.idToState ) {
					if ( !History.idToState.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.idToState[item] = History.idToState[item];
				}
				for ( item in History.urlToId ) {
					if ( !History.urlToId.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.urlToId[item] = History.urlToId[item];
				}
				for ( item in History.stateToId ) {
					if ( !History.stateToId.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.stateToId[item] = History.stateToId[item];
				}

				// Update
				History.store = currentStore;
				History.normalizeStore();

				// In Safari, going into Private Browsing mode causes the
				// Session Storage object to still exist but if you try and use
				// or set any property/function of it it throws the exception
				// "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to
				// add something to storage that exceeded the quota." infinitely
				// every second.
				currentStoreString = JSON.stringify(currentStore);
				try {
					// Store
					sessionStorage.setItem('History.store', currentStoreString);
				}
				catch (e) {
					if (e.code === DOMException.QUOTA_EXCEEDED_ERR) {
						if (sessionStorage.length) {
							// Workaround for a bug seen on iPads. Sometimes the quota exceeded error comes up and simply
							// removing/resetting the storage can work.
							sessionStorage.removeItem('History.store');
							sessionStorage.setItem('History.store', currentStoreString);
						} else {
							// Otherwise, we're probably private browsing in Safari, so we'll ignore the exception.
						}
					} else {
						throw e;
					}
				}
			};

			// For Internet Explorer
			History.intervalList.push(setInterval(History.onUnload,History.options.storeInterval));

			// For Other Browsers
			History.Adapter.bind(window,'beforeunload',History.onUnload);
			History.Adapter.bind(window,'unload',History.onUnload);

			// Both are enabled for consistency
		}

		// Non-Native pushState Implementation
		if ( !History.emulated.pushState ) {
			// Be aware, the following is only for native pushState implementations
			// If you are wanting to include something for all browsers
			// Then include it above this if block

			/**
			 * Setup Safari Fix
			 */
			if ( History.bugs.safariPoll ) {
				History.intervalList.push(setInterval(History.safariStatePoll, History.options.safariPollInterval));
			}

			/**
			 * Ensure Cross Browser Compatibility
			 */
			if ( navigator.vendor === 'Apple Computer, Inc.' || (navigator.appCodeName||'') === 'Mozilla' ) {
				/**
				 * Fix Safari HashChange Issue
				 */

				// Setup Alias
				History.Adapter.bind(window,'hashchange',function(){
					History.Adapter.trigger(window,'popstate');
				});

				// Initialise Alias
				if ( History.getHash() ) {
					History.Adapter.onDomLoad(function(){
						History.Adapter.trigger(window,'hashchange');
					});
				}
			}

		} // !History.emulated.pushState


	}; // History.initCore

	// Try to Initialise History
	if (!History.options || !History.options.delayInit) {
		History.init();
	}

})(window);

/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var pluses = /\+/g;

    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
        if (s.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape...
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }

        try {
            // Replace server-side written pluses with spaces.
            // If we can't decode the cookie, ignore it, it's unusable.
            // If we can't parse the cookie, ignore it, it's unusable.
            s = decodeURIComponent(s.replace(pluses, ' '));
            return config.json ? JSON.parse(s) : s;
        } catch(e) {}
    }

    function read(s, converter) {
        var value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }

    var config = $.cookie = function (key, value, options) {

        // Write

        if (value !== undefined && !$.isFunction(value)) {
            options = $.extend({}, config.defaults, options);

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setTime(+t + days * 864e+5);
            }

            return (document.cookie = [
                encode(key), '=', stringifyCookieValue(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path    ? '; path=' + options.path : '',
                options.domain  ? '; domain=' + options.domain : '',
                options.secure  ? '; secure' : ''
            ].join(''));
        }

        // Read

        var result = key ? undefined : {};

        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all. Also prevents odd result when
        // calling $.cookie().
        var cookies = document.cookie ? document.cookie.split('; ') : [];

        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decode(parts.shift());
            var cookie = parts.join('=');

            if (key && key === name) {
                // If second argument (value) is a function it's a converter...
                result = read(cookie, value);
                break;
            }

            // Prevent storing a cookie that we couldn't decode.
            if (!key && (cookie = read(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }

        return result;
    };

    config.defaults = {};

    $.removeCookie = function (key, options) {
        if ($.cookie(key) === undefined) {
            return false;
        }

        // Must not alter options, thus extending a fresh object...
        $.cookie(key, '', $.extend({}, options, { expires: -1 }));
        return !$.cookie(key);
    };

}));

/*! jQuery UI - v1.11.2 - 2014-12-25
* http://jqueryui.com
* Includes: core.js, widget.js, mouse.js, position.js, effect.js, effect-bounce.js, effect-drop.js, effect-pulsate.js, effect-slide.js, effect-transfer.js
* Copyright 2014 jQuery Foundation and other contributors; Licensed MIT */

(function(e){"function"==typeof define&&define.amd?define(["jquery"],e):e(jQuery)})(function(e){function t(t,s){var a,n,o,r=t.nodeName.toLowerCase();return"area"===r?(a=t.parentNode,n=a.name,t.href&&n&&"map"===a.nodeName.toLowerCase()?(o=e("img[usemap='#"+n+"']")[0],!!o&&i(o)):!1):(/input|select|textarea|button|object/.test(r)?!t.disabled:"a"===r?t.href||s:s)&&i(t)}function i(t){return e.expr.filters.visible(t)&&!e(t).parents().addBack().filter(function(){return"hidden"===e.css(this,"visibility")}).length}e.ui=e.ui||{},e.extend(e.ui,{version:"1.11.2",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}}),e.fn.extend({scrollParent:function(t){var i=this.css("position"),s="absolute"===i,a=t?/(auto|scroll|hidden)/:/(auto|scroll)/,n=this.parents().filter(function(){var t=e(this);return s&&"static"===t.css("position")?!1:a.test(t.css("overflow")+t.css("overflow-y")+t.css("overflow-x"))}).eq(0);return"fixed"!==i&&n.length?n:e(this[0].ownerDocument||document)},uniqueId:function(){var e=0;return function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++e)})}}(),removeUniqueId:function(){return this.each(function(){/^ui-id-\d+$/.test(this.id)&&e(this).removeAttr("id")})}}),e.extend(e.expr[":"],{data:e.expr.createPseudo?e.expr.createPseudo(function(t){return function(i){return!!e.data(i,t)}}):function(t,i,s){return!!e.data(t,s[3])},focusable:function(i){return t(i,!isNaN(e.attr(i,"tabindex")))},tabbable:function(i){var s=e.attr(i,"tabindex"),a=isNaN(s);return(a||s>=0)&&t(i,!a)}}),e("<a>").outerWidth(1).jquery||e.each(["Width","Height"],function(t,i){function s(t,i,s,n){return e.each(a,function(){i-=parseFloat(e.css(t,"padding"+this))||0,s&&(i-=parseFloat(e.css(t,"border"+this+"Width"))||0),n&&(i-=parseFloat(e.css(t,"margin"+this))||0)}),i}var a="Width"===i?["Left","Right"]:["Top","Bottom"],n=i.toLowerCase(),o={innerWidth:e.fn.innerWidth,innerHeight:e.fn.innerHeight,outerWidth:e.fn.outerWidth,outerHeight:e.fn.outerHeight};e.fn["inner"+i]=function(t){return void 0===t?o["inner"+i].call(this):this.each(function(){e(this).css(n,s(this,t)+"px")})},e.fn["outer"+i]=function(t,a){return"number"!=typeof t?o["outer"+i].call(this,t):this.each(function(){e(this).css(n,s(this,t,!0,a)+"px")})}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e("<a>").data("a-b","a").removeData("a-b").data("a-b")&&(e.fn.removeData=function(t){return function(i){return arguments.length?t.call(this,e.camelCase(i)):t.call(this)}}(e.fn.removeData)),e.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()),e.fn.extend({focus:function(t){return function(i,s){return"number"==typeof i?this.each(function(){var t=this;setTimeout(function(){e(t).focus(),s&&s.call(t)},i)}):t.apply(this,arguments)}}(e.fn.focus),disableSelection:function(){var e="onselectstart"in document.createElement("div")?"selectstart":"mousedown";return function(){return this.bind(e+".ui-disableSelection",function(e){e.preventDefault()})}}(),enableSelection:function(){return this.unbind(".ui-disableSelection")},zIndex:function(t){if(void 0!==t)return this.css("zIndex",t);if(this.length)for(var i,s,a=e(this[0]);a.length&&a[0]!==document;){if(i=a.css("position"),("absolute"===i||"relative"===i||"fixed"===i)&&(s=parseInt(a.css("zIndex"),10),!isNaN(s)&&0!==s))return s;a=a.parent()}return 0}}),e.ui.plugin={add:function(t,i,s){var a,n=e.ui[t].prototype;for(a in s)n.plugins[a]=n.plugins[a]||[],n.plugins[a].push([i,s[a]])},call:function(e,t,i,s){var a,n=e.plugins[t];if(n&&(s||e.element[0].parentNode&&11!==e.element[0].parentNode.nodeType))for(a=0;n.length>a;a++)e.options[n[a][0]]&&n[a][1].apply(e.element,i)}};var s=0,a=Array.prototype.slice;e.cleanData=function(t){return function(i){var s,a,n;for(n=0;null!=(a=i[n]);n++)try{s=e._data(a,"events"),s&&s.remove&&e(a).triggerHandler("remove")}catch(o){}t(i)}}(e.cleanData),e.widget=function(t,i,s){var a,n,o,r,h={},l=t.split(".")[0];return t=t.split(".")[1],a=l+"-"+t,s||(s=i,i=e.Widget),e.expr[":"][a.toLowerCase()]=function(t){return!!e.data(t,a)},e[l]=e[l]||{},n=e[l][t],o=e[l][t]=function(e,t){return this._createWidget?(arguments.length&&this._createWidget(e,t),void 0):new o(e,t)},e.extend(o,n,{version:s.version,_proto:e.extend({},s),_childConstructors:[]}),r=new i,r.options=e.widget.extend({},r.options),e.each(s,function(t,s){return e.isFunction(s)?(h[t]=function(){var e=function(){return i.prototype[t].apply(this,arguments)},a=function(e){return i.prototype[t].apply(this,e)};return function(){var t,i=this._super,n=this._superApply;return this._super=e,this._superApply=a,t=s.apply(this,arguments),this._super=i,this._superApply=n,t}}(),void 0):(h[t]=s,void 0)}),o.prototype=e.widget.extend(r,{widgetEventPrefix:n?r.widgetEventPrefix||t:t},h,{constructor:o,namespace:l,widgetName:t,widgetFullName:a}),n?(e.each(n._childConstructors,function(t,i){var s=i.prototype;e.widget(s.namespace+"."+s.widgetName,o,i._proto)}),delete n._childConstructors):i._childConstructors.push(o),e.widget.bridge(t,o),o},e.widget.extend=function(t){for(var i,s,n=a.call(arguments,1),o=0,r=n.length;r>o;o++)for(i in n[o])s=n[o][i],n[o].hasOwnProperty(i)&&void 0!==s&&(t[i]=e.isPlainObject(s)?e.isPlainObject(t[i])?e.widget.extend({},t[i],s):e.widget.extend({},s):s);return t},e.widget.bridge=function(t,i){var s=i.prototype.widgetFullName||t;e.fn[t]=function(n){var o="string"==typeof n,r=a.call(arguments,1),h=this;return n=!o&&r.length?e.widget.extend.apply(null,[n].concat(r)):n,o?this.each(function(){var i,a=e.data(this,s);return"instance"===n?(h=a,!1):a?e.isFunction(a[n])&&"_"!==n.charAt(0)?(i=a[n].apply(a,r),i!==a&&void 0!==i?(h=i&&i.jquery?h.pushStack(i.get()):i,!1):void 0):e.error("no such method '"+n+"' for "+t+" widget instance"):e.error("cannot call methods on "+t+" prior to initialization; "+"attempted to call method '"+n+"'")}):this.each(function(){var t=e.data(this,s);t?(t.option(n||{}),t._init&&t._init()):e.data(this,s,new i(n,this))}),h}},e.Widget=function(){},e.Widget._childConstructors=[],e.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(t,i){i=e(i||this.defaultElement||this)[0],this.element=e(i),this.uuid=s++,this.eventNamespace="."+this.widgetName+this.uuid,this.bindings=e(),this.hoverable=e(),this.focusable=e(),i!==this&&(e.data(i,this.widgetFullName,this),this._on(!0,this.element,{remove:function(e){e.target===i&&this.destroy()}}),this.document=e(i.style?i.ownerDocument:i.document||i),this.window=e(this.document[0].defaultView||this.document[0].parentWindow)),this.options=e.widget.extend({},this.options,this._getCreateOptions(),t),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:e.noop,_getCreateEventData:e.noop,_create:e.noop,_init:e.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled "+"ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:e.noop,widget:function(){return this.element},option:function(t,i){var s,a,n,o=t;if(0===arguments.length)return e.widget.extend({},this.options);if("string"==typeof t)if(o={},s=t.split("."),t=s.shift(),s.length){for(a=o[t]=e.widget.extend({},this.options[t]),n=0;s.length-1>n;n++)a[s[n]]=a[s[n]]||{},a=a[s[n]];if(t=s.pop(),1===arguments.length)return void 0===a[t]?null:a[t];a[t]=i}else{if(1===arguments.length)return void 0===this.options[t]?null:this.options[t];o[t]=i}return this._setOptions(o),this},_setOptions:function(e){var t;for(t in e)this._setOption(t,e[t]);return this},_setOption:function(e,t){return this.options[e]=t,"disabled"===e&&(this.widget().toggleClass(this.widgetFullName+"-disabled",!!t),t&&(this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus"))),this},enable:function(){return this._setOptions({disabled:!1})},disable:function(){return this._setOptions({disabled:!0})},_on:function(t,i,s){var a,n=this;"boolean"!=typeof t&&(s=i,i=t,t=!1),s?(i=a=e(i),this.bindings=this.bindings.add(i)):(s=i,i=this.element,a=this.widget()),e.each(s,function(s,o){function r(){return t||n.options.disabled!==!0&&!e(this).hasClass("ui-state-disabled")?("string"==typeof o?n[o]:o).apply(n,arguments):void 0}"string"!=typeof o&&(r.guid=o.guid=o.guid||r.guid||e.guid++);var h=s.match(/^([\w:-]*)\s*(.*)$/),l=h[1]+n.eventNamespace,u=h[2];u?a.delegate(u,l,r):i.bind(l,r)})},_off:function(t,i){i=(i||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,t.unbind(i).undelegate(i),this.bindings=e(this.bindings.not(t).get()),this.focusable=e(this.focusable.not(t).get()),this.hoverable=e(this.hoverable.not(t).get())},_delay:function(e,t){function i(){return("string"==typeof e?s[e]:e).apply(s,arguments)}var s=this;return setTimeout(i,t||0)},_hoverable:function(t){this.hoverable=this.hoverable.add(t),this._on(t,{mouseenter:function(t){e(t.currentTarget).addClass("ui-state-hover")},mouseleave:function(t){e(t.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(t){this.focusable=this.focusable.add(t),this._on(t,{focusin:function(t){e(t.currentTarget).addClass("ui-state-focus")},focusout:function(t){e(t.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(t,i,s){var a,n,o=this.options[t];if(s=s||{},i=e.Event(i),i.type=(t===this.widgetEventPrefix?t:this.widgetEventPrefix+t).toLowerCase(),i.target=this.element[0],n=i.originalEvent)for(a in n)a in i||(i[a]=n[a]);return this.element.trigger(i,s),!(e.isFunction(o)&&o.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},e.each({show:"fadeIn",hide:"fadeOut"},function(t,i){e.Widget.prototype["_"+t]=function(s,a,n){"string"==typeof a&&(a={effect:a});var o,r=a?a===!0||"number"==typeof a?i:a.effect||i:t;a=a||{},"number"==typeof a&&(a={duration:a}),o=!e.isEmptyObject(a),a.complete=n,a.delay&&s.delay(a.delay),o&&e.effects&&e.effects.effect[r]?s[t](a):r!==t&&s[r]?s[r](a.duration,a.easing,n):s.queue(function(i){e(this)[t](),n&&n.call(s[0]),i()})}}),e.widget;var n=!1;e(document).mouseup(function(){n=!1}),e.widget("ui.mouse",{version:"1.11.2",options:{cancel:"input,textarea,button,select,option",distance:1,delay:0},_mouseInit:function(){var t=this;this.element.bind("mousedown."+this.widgetName,function(e){return t._mouseDown(e)}).bind("click."+this.widgetName,function(i){return!0===e.data(i.target,t.widgetName+".preventClickEvent")?(e.removeData(i.target,t.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):void 0}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&this.document.unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(t){if(!n){this._mouseMoved=!1,this._mouseStarted&&this._mouseUp(t),this._mouseDownEvent=t;var i=this,s=1===t.which,a="string"==typeof this.options.cancel&&t.target.nodeName?e(t.target).closest(this.options.cancel).length:!1;return s&&!a&&this._mouseCapture(t)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){i.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(t)&&this._mouseDelayMet(t)&&(this._mouseStarted=this._mouseStart(t)!==!1,!this._mouseStarted)?(t.preventDefault(),!0):(!0===e.data(t.target,this.widgetName+".preventClickEvent")&&e.removeData(t.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(e){return i._mouseMove(e)},this._mouseUpDelegate=function(e){return i._mouseUp(e)},this.document.bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),t.preventDefault(),n=!0,!0)):!0}},_mouseMove:function(t){if(this._mouseMoved){if(e.ui.ie&&(!document.documentMode||9>document.documentMode)&&!t.button)return this._mouseUp(t);if(!t.which)return this._mouseUp(t)}return(t.which||t.button)&&(this._mouseMoved=!0),this._mouseStarted?(this._mouseDrag(t),t.preventDefault()):(this._mouseDistanceMet(t)&&this._mouseDelayMet(t)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,t)!==!1,this._mouseStarted?this._mouseDrag(t):this._mouseUp(t)),!this._mouseStarted)},_mouseUp:function(t){return this.document.unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,t.target===this._mouseDownEvent.target&&e.data(t.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(t)),n=!1,!1},_mouseDistanceMet:function(e){return Math.max(Math.abs(this._mouseDownEvent.pageX-e.pageX),Math.abs(this._mouseDownEvent.pageY-e.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}}),function(){function t(e,t,i){return[parseFloat(e[0])*(p.test(e[0])?t/100:1),parseFloat(e[1])*(p.test(e[1])?i/100:1)]}function i(t,i){return parseInt(e.css(t,i),10)||0}function s(t){var i=t[0];return 9===i.nodeType?{width:t.width(),height:t.height(),offset:{top:0,left:0}}:e.isWindow(i)?{width:t.width(),height:t.height(),offset:{top:t.scrollTop(),left:t.scrollLeft()}}:i.preventDefault?{width:0,height:0,offset:{top:i.pageY,left:i.pageX}}:{width:t.outerWidth(),height:t.outerHeight(),offset:t.offset()}}e.ui=e.ui||{};var a,n,o=Math.max,r=Math.abs,h=Math.round,l=/left|center|right/,u=/top|center|bottom/,d=/[\+\-]\d+(\.[\d]+)?%?/,c=/^\w+/,p=/%$/,f=e.fn.position;e.position={scrollbarWidth:function(){if(void 0!==a)return a;var t,i,s=e("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),n=s.children()[0];return e("body").append(s),t=n.offsetWidth,s.css("overflow","scroll"),i=n.offsetWidth,t===i&&(i=s[0].clientWidth),s.remove(),a=t-i},getScrollInfo:function(t){var i=t.isWindow||t.isDocument?"":t.element.css("overflow-x"),s=t.isWindow||t.isDocument?"":t.element.css("overflow-y"),a="scroll"===i||"auto"===i&&t.width<t.element[0].scrollWidth,n="scroll"===s||"auto"===s&&t.height<t.element[0].scrollHeight;return{width:n?e.position.scrollbarWidth():0,height:a?e.position.scrollbarWidth():0}},getWithinInfo:function(t){var i=e(t||window),s=e.isWindow(i[0]),a=!!i[0]&&9===i[0].nodeType;return{element:i,isWindow:s,isDocument:a,offset:i.offset()||{left:0,top:0},scrollLeft:i.scrollLeft(),scrollTop:i.scrollTop(),width:s||a?i.width():i.outerWidth(),height:s||a?i.height():i.outerHeight()}}},e.fn.position=function(a){if(!a||!a.of)return f.apply(this,arguments);a=e.extend({},a);var p,m,g,v,y,b,_=e(a.of),x=e.position.getWithinInfo(a.within),w=e.position.getScrollInfo(x),k=(a.collision||"flip").split(" "),T={};return b=s(_),_[0].preventDefault&&(a.at="left top"),m=b.width,g=b.height,v=b.offset,y=e.extend({},v),e.each(["my","at"],function(){var e,t,i=(a[this]||"").split(" ");1===i.length&&(i=l.test(i[0])?i.concat(["center"]):u.test(i[0])?["center"].concat(i):["center","center"]),i[0]=l.test(i[0])?i[0]:"center",i[1]=u.test(i[1])?i[1]:"center",e=d.exec(i[0]),t=d.exec(i[1]),T[this]=[e?e[0]:0,t?t[0]:0],a[this]=[c.exec(i[0])[0],c.exec(i[1])[0]]}),1===k.length&&(k[1]=k[0]),"right"===a.at[0]?y.left+=m:"center"===a.at[0]&&(y.left+=m/2),"bottom"===a.at[1]?y.top+=g:"center"===a.at[1]&&(y.top+=g/2),p=t(T.at,m,g),y.left+=p[0],y.top+=p[1],this.each(function(){var s,l,u=e(this),d=u.outerWidth(),c=u.outerHeight(),f=i(this,"marginLeft"),b=i(this,"marginTop"),D=d+f+i(this,"marginRight")+w.width,S=c+b+i(this,"marginBottom")+w.height,N=e.extend({},y),M=t(T.my,u.outerWidth(),u.outerHeight());"right"===a.my[0]?N.left-=d:"center"===a.my[0]&&(N.left-=d/2),"bottom"===a.my[1]?N.top-=c:"center"===a.my[1]&&(N.top-=c/2),N.left+=M[0],N.top+=M[1],n||(N.left=h(N.left),N.top=h(N.top)),s={marginLeft:f,marginTop:b},e.each(["left","top"],function(t,i){e.ui.position[k[t]]&&e.ui.position[k[t]][i](N,{targetWidth:m,targetHeight:g,elemWidth:d,elemHeight:c,collisionPosition:s,collisionWidth:D,collisionHeight:S,offset:[p[0]+M[0],p[1]+M[1]],my:a.my,at:a.at,within:x,elem:u})}),a.using&&(l=function(e){var t=v.left-N.left,i=t+m-d,s=v.top-N.top,n=s+g-c,h={target:{element:_,left:v.left,top:v.top,width:m,height:g},element:{element:u,left:N.left,top:N.top,width:d,height:c},horizontal:0>i?"left":t>0?"right":"center",vertical:0>n?"top":s>0?"bottom":"middle"};d>m&&m>r(t+i)&&(h.horizontal="center"),c>g&&g>r(s+n)&&(h.vertical="middle"),h.important=o(r(t),r(i))>o(r(s),r(n))?"horizontal":"vertical",a.using.call(this,e,h)}),u.offset(e.extend(N,{using:l}))})},e.ui.position={fit:{left:function(e,t){var i,s=t.within,a=s.isWindow?s.scrollLeft:s.offset.left,n=s.width,r=e.left-t.collisionPosition.marginLeft,h=a-r,l=r+t.collisionWidth-n-a;t.collisionWidth>n?h>0&&0>=l?(i=e.left+h+t.collisionWidth-n-a,e.left+=h-i):e.left=l>0&&0>=h?a:h>l?a+n-t.collisionWidth:a:h>0?e.left+=h:l>0?e.left-=l:e.left=o(e.left-r,e.left)},top:function(e,t){var i,s=t.within,a=s.isWindow?s.scrollTop:s.offset.top,n=t.within.height,r=e.top-t.collisionPosition.marginTop,h=a-r,l=r+t.collisionHeight-n-a;t.collisionHeight>n?h>0&&0>=l?(i=e.top+h+t.collisionHeight-n-a,e.top+=h-i):e.top=l>0&&0>=h?a:h>l?a+n-t.collisionHeight:a:h>0?e.top+=h:l>0?e.top-=l:e.top=o(e.top-r,e.top)}},flip:{left:function(e,t){var i,s,a=t.within,n=a.offset.left+a.scrollLeft,o=a.width,h=a.isWindow?a.scrollLeft:a.offset.left,l=e.left-t.collisionPosition.marginLeft,u=l-h,d=l+t.collisionWidth-o-h,c="left"===t.my[0]?-t.elemWidth:"right"===t.my[0]?t.elemWidth:0,p="left"===t.at[0]?t.targetWidth:"right"===t.at[0]?-t.targetWidth:0,f=-2*t.offset[0];0>u?(i=e.left+c+p+f+t.collisionWidth-o-n,(0>i||r(u)>i)&&(e.left+=c+p+f)):d>0&&(s=e.left-t.collisionPosition.marginLeft+c+p+f-h,(s>0||d>r(s))&&(e.left+=c+p+f))},top:function(e,t){var i,s,a=t.within,n=a.offset.top+a.scrollTop,o=a.height,h=a.isWindow?a.scrollTop:a.offset.top,l=e.top-t.collisionPosition.marginTop,u=l-h,d=l+t.collisionHeight-o-h,c="top"===t.my[1],p=c?-t.elemHeight:"bottom"===t.my[1]?t.elemHeight:0,f="top"===t.at[1]?t.targetHeight:"bottom"===t.at[1]?-t.targetHeight:0,m=-2*t.offset[1];0>u?(s=e.top+p+f+m+t.collisionHeight-o-n,e.top+p+f+m>u&&(0>s||r(u)>s)&&(e.top+=p+f+m)):d>0&&(i=e.top-t.collisionPosition.marginTop+p+f+m-h,e.top+p+f+m>d&&(i>0||d>r(i))&&(e.top+=p+f+m))}},flipfit:{left:function(){e.ui.position.flip.left.apply(this,arguments),e.ui.position.fit.left.apply(this,arguments)},top:function(){e.ui.position.flip.top.apply(this,arguments),e.ui.position.fit.top.apply(this,arguments)}}},function(){var t,i,s,a,o,r=document.getElementsByTagName("body")[0],h=document.createElement("div");t=document.createElement(r?"div":"body"),s={visibility:"hidden",width:0,height:0,border:0,margin:0,background:"none"},r&&e.extend(s,{position:"absolute",left:"-1000px",top:"-1000px"});for(o in s)t.style[o]=s[o];t.appendChild(h),i=r||document.documentElement,i.insertBefore(t,i.firstChild),h.style.cssText="position: absolute; left: 10.7432222px;",a=e(h).offset().left,n=a>10&&11>a,t.innerHTML="",i.removeChild(t)}()}(),e.ui.position;var o="ui-effects-",r=e;e.effects={effect:{}},function(e,t){function i(e,t,i){var s=d[t.type]||{};return null==e?i||!t.def?null:t.def:(e=s.floor?~~e:parseFloat(e),isNaN(e)?t.def:s.mod?(e+s.mod)%s.mod:0>e?0:e>s.max?s.max:e)}function s(i){var s=l(),a=s._rgba=[];return i=i.toLowerCase(),f(h,function(e,n){var o,r=n.re.exec(i),h=r&&n.parse(r),l=n.space||"rgba";return h?(o=s[l](h),s[u[l].cache]=o[u[l].cache],a=s._rgba=o._rgba,!1):t}),a.length?("0,0,0,0"===a.join()&&e.extend(a,n.transparent),s):n[i]}function a(e,t,i){return i=(i+1)%1,1>6*i?e+6*(t-e)*i:1>2*i?t:2>3*i?e+6*(t-e)*(2/3-i):e}var n,o="backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",r=/^([\-+])=\s*(\d+\.?\d*)/,h=[{re:/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(e){return[e[1],e[2],e[3],e[4]]}},{re:/rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(e){return[2.55*e[1],2.55*e[2],2.55*e[3],e[4]]}},{re:/#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,parse:function(e){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}},{re:/#([a-f0-9])([a-f0-9])([a-f0-9])/,parse:function(e){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}},{re:/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,space:"hsla",parse:function(e){return[e[1],e[2]/100,e[3]/100,e[4]]}}],l=e.Color=function(t,i,s,a){return new e.Color.fn.parse(t,i,s,a)},u={rgba:{props:{red:{idx:0,type:"byte"},green:{idx:1,type:"byte"},blue:{idx:2,type:"byte"}}},hsla:{props:{hue:{idx:0,type:"degrees"},saturation:{idx:1,type:"percent"},lightness:{idx:2,type:"percent"}}}},d={"byte":{floor:!0,max:255},percent:{max:1},degrees:{mod:360,floor:!0}},c=l.support={},p=e("<p>")[0],f=e.each;p.style.cssText="background-color:rgba(1,1,1,.5)",c.rgba=p.style.backgroundColor.indexOf("rgba")>-1,f(u,function(e,t){t.cache="_"+e,t.props.alpha={idx:3,type:"percent",def:1}}),l.fn=e.extend(l.prototype,{parse:function(a,o,r,h){if(a===t)return this._rgba=[null,null,null,null],this;(a.jquery||a.nodeType)&&(a=e(a).css(o),o=t);var d=this,c=e.type(a),p=this._rgba=[];return o!==t&&(a=[a,o,r,h],c="array"),"string"===c?this.parse(s(a)||n._default):"array"===c?(f(u.rgba.props,function(e,t){p[t.idx]=i(a[t.idx],t)}),this):"object"===c?(a instanceof l?f(u,function(e,t){a[t.cache]&&(d[t.cache]=a[t.cache].slice())}):f(u,function(t,s){var n=s.cache;f(s.props,function(e,t){if(!d[n]&&s.to){if("alpha"===e||null==a[e])return;d[n]=s.to(d._rgba)}d[n][t.idx]=i(a[e],t,!0)}),d[n]&&0>e.inArray(null,d[n].slice(0,3))&&(d[n][3]=1,s.from&&(d._rgba=s.from(d[n])))}),this):t},is:function(e){var i=l(e),s=!0,a=this;return f(u,function(e,n){var o,r=i[n.cache];return r&&(o=a[n.cache]||n.to&&n.to(a._rgba)||[],f(n.props,function(e,i){return null!=r[i.idx]?s=r[i.idx]===o[i.idx]:t})),s}),s},_space:function(){var e=[],t=this;return f(u,function(i,s){t[s.cache]&&e.push(i)}),e.pop()},transition:function(e,t){var s=l(e),a=s._space(),n=u[a],o=0===this.alpha()?l("transparent"):this,r=o[n.cache]||n.to(o._rgba),h=r.slice();return s=s[n.cache],f(n.props,function(e,a){var n=a.idx,o=r[n],l=s[n],u=d[a.type]||{};null!==l&&(null===o?h[n]=l:(u.mod&&(l-o>u.mod/2?o+=u.mod:o-l>u.mod/2&&(o-=u.mod)),h[n]=i((l-o)*t+o,a)))}),this[a](h)},blend:function(t){if(1===this._rgba[3])return this;var i=this._rgba.slice(),s=i.pop(),a=l(t)._rgba;return l(e.map(i,function(e,t){return(1-s)*a[t]+s*e}))},toRgbaString:function(){var t="rgba(",i=e.map(this._rgba,function(e,t){return null==e?t>2?1:0:e});return 1===i[3]&&(i.pop(),t="rgb("),t+i.join()+")"},toHslaString:function(){var t="hsla(",i=e.map(this.hsla(),function(e,t){return null==e&&(e=t>2?1:0),t&&3>t&&(e=Math.round(100*e)+"%"),e});return 1===i[3]&&(i.pop(),t="hsl("),t+i.join()+")"},toHexString:function(t){var i=this._rgba.slice(),s=i.pop();return t&&i.push(~~(255*s)),"#"+e.map(i,function(e){return e=(e||0).toString(16),1===e.length?"0"+e:e}).join("")},toString:function(){return 0===this._rgba[3]?"transparent":this.toRgbaString()}}),l.fn.parse.prototype=l.fn,u.hsla.to=function(e){if(null==e[0]||null==e[1]||null==e[2])return[null,null,null,e[3]];var t,i,s=e[0]/255,a=e[1]/255,n=e[2]/255,o=e[3],r=Math.max(s,a,n),h=Math.min(s,a,n),l=r-h,u=r+h,d=.5*u;return t=h===r?0:s===r?60*(a-n)/l+360:a===r?60*(n-s)/l+120:60*(s-a)/l+240,i=0===l?0:.5>=d?l/u:l/(2-u),[Math.round(t)%360,i,d,null==o?1:o]},u.hsla.from=function(e){if(null==e[0]||null==e[1]||null==e[2])return[null,null,null,e[3]];var t=e[0]/360,i=e[1],s=e[2],n=e[3],o=.5>=s?s*(1+i):s+i-s*i,r=2*s-o;return[Math.round(255*a(r,o,t+1/3)),Math.round(255*a(r,o,t)),Math.round(255*a(r,o,t-1/3)),n]},f(u,function(s,a){var n=a.props,o=a.cache,h=a.to,u=a.from;l.fn[s]=function(s){if(h&&!this[o]&&(this[o]=h(this._rgba)),s===t)return this[o].slice();var a,r=e.type(s),d="array"===r||"object"===r?s:arguments,c=this[o].slice();return f(n,function(e,t){var s=d["object"===r?e:t.idx];null==s&&(s=c[t.idx]),c[t.idx]=i(s,t)}),u?(a=l(u(c)),a[o]=c,a):l(c)},f(n,function(t,i){l.fn[t]||(l.fn[t]=function(a){var n,o=e.type(a),h="alpha"===t?this._hsla?"hsla":"rgba":s,l=this[h](),u=l[i.idx];return"undefined"===o?u:("function"===o&&(a=a.call(this,u),o=e.type(a)),null==a&&i.empty?this:("string"===o&&(n=r.exec(a),n&&(a=u+parseFloat(n[2])*("+"===n[1]?1:-1))),l[i.idx]=a,this[h](l)))})})}),l.hook=function(t){var i=t.split(" ");f(i,function(t,i){e.cssHooks[i]={set:function(t,a){var n,o,r="";if("transparent"!==a&&("string"!==e.type(a)||(n=s(a)))){if(a=l(n||a),!c.rgba&&1!==a._rgba[3]){for(o="backgroundColor"===i?t.parentNode:t;(""===r||"transparent"===r)&&o&&o.style;)try{r=e.css(o,"backgroundColor"),o=o.parentNode}catch(h){}a=a.blend(r&&"transparent"!==r?r:"_default")}a=a.toRgbaString()}try{t.style[i]=a}catch(h){}}},e.fx.step[i]=function(t){t.colorInit||(t.start=l(t.elem,i),t.end=l(t.end),t.colorInit=!0),e.cssHooks[i].set(t.elem,t.start.transition(t.end,t.pos))}})},l.hook(o),e.cssHooks.borderColor={expand:function(e){var t={};return f(["Top","Right","Bottom","Left"],function(i,s){t["border"+s+"Color"]=e}),t}},n=e.Color.names={aqua:"#00ffff",black:"#000000",blue:"#0000ff",fuchsia:"#ff00ff",gray:"#808080",green:"#008000",lime:"#00ff00",maroon:"#800000",navy:"#000080",olive:"#808000",purple:"#800080",red:"#ff0000",silver:"#c0c0c0",teal:"#008080",white:"#ffffff",yellow:"#ffff00",transparent:[null,null,null,0],_default:"#ffffff"}}(r),function(){function t(t){var i,s,a=t.ownerDocument.defaultView?t.ownerDocument.defaultView.getComputedStyle(t,null):t.currentStyle,n={};if(a&&a.length&&a[0]&&a[a[0]])for(s=a.length;s--;)i=a[s],"string"==typeof a[i]&&(n[e.camelCase(i)]=a[i]);else for(i in a)"string"==typeof a[i]&&(n[i]=a[i]);return n}function i(t,i){var s,n,o={};for(s in i)n=i[s],t[s]!==n&&(a[s]||(e.fx.step[s]||!isNaN(parseFloat(n)))&&(o[s]=n));return o}var s=["add","remove","toggle"],a={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};e.each(["borderLeftStyle","borderRightStyle","borderBottomStyle","borderTopStyle"],function(t,i){e.fx.step[i]=function(e){("none"!==e.end&&!e.setAttr||1===e.pos&&!e.setAttr)&&(r.style(e.elem,i,e.end),e.setAttr=!0)}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e.effects.animateClass=function(a,n,o,r){var h=e.speed(n,o,r);return this.queue(function(){var n,o=e(this),r=o.attr("class")||"",l=h.children?o.find("*").addBack():o;l=l.map(function(){var i=e(this);return{el:i,start:t(this)}}),n=function(){e.each(s,function(e,t){a[t]&&o[t+"Class"](a[t])})},n(),l=l.map(function(){return this.end=t(this.el[0]),this.diff=i(this.start,this.end),this}),o.attr("class",r),l=l.map(function(){var t=this,i=e.Deferred(),s=e.extend({},h,{queue:!1,complete:function(){i.resolve(t)}});return this.el.animate(this.diff,s),i.promise()}),e.when.apply(e,l.get()).done(function(){n(),e.each(arguments,function(){var t=this.el;e.each(this.diff,function(e){t.css(e,"")})}),h.complete.call(o[0])})})},e.fn.extend({addClass:function(t){return function(i,s,a,n){return s?e.effects.animateClass.call(this,{add:i},s,a,n):t.apply(this,arguments)}}(e.fn.addClass),removeClass:function(t){return function(i,s,a,n){return arguments.length>1?e.effects.animateClass.call(this,{remove:i},s,a,n):t.apply(this,arguments)}}(e.fn.removeClass),toggleClass:function(t){return function(i,s,a,n,o){return"boolean"==typeof s||void 0===s?a?e.effects.animateClass.call(this,s?{add:i}:{remove:i},a,n,o):t.apply(this,arguments):e.effects.animateClass.call(this,{toggle:i},s,a,n)}}(e.fn.toggleClass),switchClass:function(t,i,s,a,n){return e.effects.animateClass.call(this,{add:i,remove:t},s,a,n)}})}(),function(){function t(t,i,s,a){return e.isPlainObject(t)&&(i=t,t=t.effect),t={effect:t},null==i&&(i={}),e.isFunction(i)&&(a=i,s=null,i={}),("number"==typeof i||e.fx.speeds[i])&&(a=s,s=i,i={}),e.isFunction(s)&&(a=s,s=null),i&&e.extend(t,i),s=s||i.duration,t.duration=e.fx.off?0:"number"==typeof s?s:s in e.fx.speeds?e.fx.speeds[s]:e.fx.speeds._default,t.complete=a||i.complete,t}function i(t){return!t||"number"==typeof t||e.fx.speeds[t]?!0:"string"!=typeof t||e.effects.effect[t]?e.isFunction(t)?!0:"object"!=typeof t||t.effect?!1:!0:!0}e.extend(e.effects,{version:"1.11.2",save:function(e,t){for(var i=0;t.length>i;i++)null!==t[i]&&e.data(o+t[i],e[0].style[t[i]])},restore:function(e,t){var i,s;for(s=0;t.length>s;s++)null!==t[s]&&(i=e.data(o+t[s]),void 0===i&&(i=""),e.css(t[s],i))},setMode:function(e,t){return"toggle"===t&&(t=e.is(":hidden")?"show":"hide"),t},getBaseline:function(e,t){var i,s;switch(e[0]){case"top":i=0;break;case"middle":i=.5;break;case"bottom":i=1;break;default:i=e[0]/t.height}switch(e[1]){case"left":s=0;break;case"center":s=.5;break;case"right":s=1;break;default:s=e[1]/t.width}return{x:s,y:i}},createWrapper:function(t){if(t.parent().is(".ui-effects-wrapper"))return t.parent();var i={width:t.outerWidth(!0),height:t.outerHeight(!0),"float":t.css("float")},s=e("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0}),a={width:t.width(),height:t.height()},n=document.activeElement;try{n.id}catch(o){n=document.body}return t.wrap(s),(t[0]===n||e.contains(t[0],n))&&e(n).focus(),s=t.parent(),"static"===t.css("position")?(s.css({position:"relative"}),t.css({position:"relative"})):(e.extend(i,{position:t.css("position"),zIndex:t.css("z-index")}),e.each(["top","left","bottom","right"],function(e,s){i[s]=t.css(s),isNaN(parseInt(i[s],10))&&(i[s]="auto")}),t.css({position:"relative",top:0,left:0,right:"auto",bottom:"auto"})),t.css(a),s.css(i).show()},removeWrapper:function(t){var i=document.activeElement;return t.parent().is(".ui-effects-wrapper")&&(t.parent().replaceWith(t),(t[0]===i||e.contains(t[0],i))&&e(i).focus()),t},setTransition:function(t,i,s,a){return a=a||{},e.each(i,function(e,i){var n=t.cssUnit(i);n[0]>0&&(a[i]=n[0]*s+n[1])}),a}}),e.fn.extend({effect:function(){function i(t){function i(){e.isFunction(n)&&n.call(a[0]),e.isFunction(t)&&t()}var a=e(this),n=s.complete,r=s.mode;(a.is(":hidden")?"hide"===r:"show"===r)?(a[r](),i()):o.call(a[0],s,i)}var s=t.apply(this,arguments),a=s.mode,n=s.queue,o=e.effects.effect[s.effect];return e.fx.off||!o?a?this[a](s.duration,s.complete):this.each(function(){s.complete&&s.complete.call(this)}):n===!1?this.each(i):this.queue(n||"fx",i)},show:function(e){return function(s){if(i(s))return e.apply(this,arguments);var a=t.apply(this,arguments);return a.mode="show",this.effect.call(this,a)}}(e.fn.show),hide:function(e){return function(s){if(i(s))return e.apply(this,arguments);var a=t.apply(this,arguments);return a.mode="hide",this.effect.call(this,a)}}(e.fn.hide),toggle:function(e){return function(s){if(i(s)||"boolean"==typeof s)return e.apply(this,arguments);var a=t.apply(this,arguments);return a.mode="toggle",this.effect.call(this,a)}}(e.fn.toggle),cssUnit:function(t){var i=this.css(t),s=[];return e.each(["em","px","%","pt"],function(e,t){i.indexOf(t)>0&&(s=[parseFloat(i),t])}),s}})}(),function(){var t={};e.each(["Quad","Cubic","Quart","Quint","Expo"],function(e,i){t[i]=function(t){return Math.pow(t,e+2)}}),e.extend(t,{Sine:function(e){return 1-Math.cos(e*Math.PI/2)},Circ:function(e){return 1-Math.sqrt(1-e*e)},Elastic:function(e){return 0===e||1===e?e:-Math.pow(2,8*(e-1))*Math.sin((80*(e-1)-7.5)*Math.PI/15)},Back:function(e){return e*e*(3*e-2)},Bounce:function(e){for(var t,i=4;((t=Math.pow(2,--i))-1)/11>e;);return 1/Math.pow(4,3-i)-7.5625*Math.pow((3*t-2)/22-e,2)
}}),e.each(t,function(t,i){e.easing["easeIn"+t]=i,e.easing["easeOut"+t]=function(e){return 1-i(1-e)},e.easing["easeInOut"+t]=function(e){return.5>e?i(2*e)/2:1-i(-2*e+2)/2}})}(),e.effects,e.effects.effect.bounce=function(t,i){var s,a,n,o=e(this),r=["position","top","bottom","left","right","height","width"],h=e.effects.setMode(o,t.mode||"effect"),l="hide"===h,u="show"===h,d=t.direction||"up",c=t.distance,p=t.times||5,f=2*p+(u||l?1:0),m=t.duration/f,g=t.easing,v="up"===d||"down"===d?"top":"left",y="up"===d||"left"===d,b=o.queue(),_=b.length;for((u||l)&&r.push("opacity"),e.effects.save(o,r),o.show(),e.effects.createWrapper(o),c||(c=o["top"===v?"outerHeight":"outerWidth"]()/3),u&&(n={opacity:1},n[v]=0,o.css("opacity",0).css(v,y?2*-c:2*c).animate(n,m,g)),l&&(c/=Math.pow(2,p-1)),n={},n[v]=0,s=0;p>s;s++)a={},a[v]=(y?"-=":"+=")+c,o.animate(a,m,g).animate(n,m,g),c=l?2*c:c/2;l&&(a={opacity:0},a[v]=(y?"-=":"+=")+c,o.animate(a,m,g)),o.queue(function(){l&&o.hide(),e.effects.restore(o,r),e.effects.removeWrapper(o),i()}),_>1&&b.splice.apply(b,[1,0].concat(b.splice(_,f+1))),o.dequeue()},e.effects.effect.drop=function(t,i){var s,a=e(this),n=["position","top","bottom","left","right","opacity","height","width"],o=e.effects.setMode(a,t.mode||"hide"),r="show"===o,h=t.direction||"left",l="up"===h||"down"===h?"top":"left",u="up"===h||"left"===h?"pos":"neg",d={opacity:r?1:0};e.effects.save(a,n),a.show(),e.effects.createWrapper(a),s=t.distance||a["top"===l?"outerHeight":"outerWidth"](!0)/2,r&&a.css("opacity",0).css(l,"pos"===u?-s:s),d[l]=(r?"pos"===u?"+=":"-=":"pos"===u?"-=":"+=")+s,a.animate(d,{queue:!1,duration:t.duration,easing:t.easing,complete:function(){"hide"===o&&a.hide(),e.effects.restore(a,n),e.effects.removeWrapper(a),i()}})},e.effects.effect.pulsate=function(t,i){var s,a=e(this),n=e.effects.setMode(a,t.mode||"show"),o="show"===n,r="hide"===n,h=o||"hide"===n,l=2*(t.times||5)+(h?1:0),u=t.duration/l,d=0,c=a.queue(),p=c.length;for((o||!a.is(":visible"))&&(a.css("opacity",0).show(),d=1),s=1;l>s;s++)a.animate({opacity:d},u,t.easing),d=1-d;a.animate({opacity:d},u,t.easing),a.queue(function(){r&&a.hide(),i()}),p>1&&c.splice.apply(c,[1,0].concat(c.splice(p,l+1))),a.dequeue()},e.effects.effect.slide=function(t,i){var s,a=e(this),n=["position","top","bottom","left","right","width","height"],o=e.effects.setMode(a,t.mode||"show"),r="show"===o,h=t.direction||"left",l="up"===h||"down"===h?"top":"left",u="up"===h||"left"===h,d={};e.effects.save(a,n),a.show(),s=t.distance||a["top"===l?"outerHeight":"outerWidth"](!0),e.effects.createWrapper(a).css({overflow:"hidden"}),r&&a.css(l,u?isNaN(s)?"-"+s:-s:s),d[l]=(r?u?"+=":"-=":u?"-=":"+=")+s,a.animate(d,{queue:!1,duration:t.duration,easing:t.easing,complete:function(){"hide"===o&&a.hide(),e.effects.restore(a,n),e.effects.removeWrapper(a),i()}})},e.effects.effect.transfer=function(t,i){var s=e(this),a=e(t.to),n="fixed"===a.css("position"),o=e("body"),r=n?o.scrollTop():0,h=n?o.scrollLeft():0,l=a.offset(),u={top:l.top-r,left:l.left-h,height:a.innerHeight(),width:a.innerWidth()},d=s.offset(),c=e("<div class='ui-effects-transfer'></div>").appendTo(document.body).addClass(t.className).css({top:d.top-r,left:d.left-h,height:s.innerHeight(),width:s.innerWidth(),position:n?"fixed":"absolute"}).animate(u,t.duration,t.easing,function(){c.remove(),i()})}});
/**
 * @fileoverview
 * - Using the 'QRCode for Javascript library'
 * - Fixed dataset of 'QRCode for Javascript library' for support full-spec.
 * - this library has no dependencies.
 *
 * @author davidshimjs
 * @see <a href="http://www.d-project.com/" target="_blank">http://www.d-project.com/</a>
 * @see <a href="http://jeromeetienne.github.com/jquery-qrcode/" target="_blank">http://jeromeetienne.github.com/jquery-qrcode/</a>
 */
var QRCode;

(function () {
	//---------------------------------------------------------------------
	// QRCode for JavaScript
	//
	// Copyright (c) 2009 Kazuhiko Arase
	//
	// URL: http://www.d-project.com/
	//
	// Licensed under the MIT license:
	//   http://www.opensource.org/licenses/mit-license.php
	//
	// The word "QR Code" is registered trademark of
	// DENSO WAVE INCORPORATED
	//   http://www.denso-wave.com/qrcode/faqpatent-e.html
	//
	//---------------------------------------------------------------------
	function QR8bitByte(data) {
		this.mode = QRMode.MODE_8BIT_BYTE;
		this.data = data;
		this.parsedData = [];

		// Added to support UTF-8 Characters
		for (var i = 0, l = this.data.length; i < l; i++) {
			var byteArray = [];
			var code = this.data.charCodeAt(i);

			if (code > 0x10000) {
				byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
				byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
				byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
				byteArray[3] = 0x80 | (code & 0x3F);
			} else if (code > 0x800) {
				byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
				byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
				byteArray[2] = 0x80 | (code & 0x3F);
			} else if (code > 0x80) {
				byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
				byteArray[1] = 0x80 | (code & 0x3F);
			} else {
				byteArray[0] = code;
			}

			this.parsedData.push(byteArray);
		}

		this.parsedData = Array.prototype.concat.apply([], this.parsedData);

		if (this.parsedData.length != this.data.length) {
			this.parsedData.unshift(191);
			this.parsedData.unshift(187);
			this.parsedData.unshift(239);
		}
	}

	QR8bitByte.prototype = {
		getLength: function (buffer) {
			return this.parsedData.length;
		},
		write: function (buffer) {
			for (var i = 0, l = this.parsedData.length; i < l; i++) {
				buffer.put(this.parsedData[i], 8);
			}
		}
	};

	function QRCodeModel(typeNumber, errorCorrectLevel) {
		this.typeNumber = typeNumber;
		this.errorCorrectLevel = errorCorrectLevel;
		this.modules = null;
		this.moduleCount = 0;
		this.dataCache = null;
		this.dataList = [];
	}

	QRCodeModel.prototype={addData:function(data){var newData=new QR8bitByte(data);this.dataList.push(newData);this.dataCache=null;},isDark:function(row,col){if(row<0||this.moduleCount<=row||col<0||this.moduleCount<=col){throw new Error(row+","+col);}
	return this.modules[row][col];},getModuleCount:function(){return this.moduleCount;},make:function(){this.makeImpl(false,this.getBestMaskPattern());},makeImpl:function(test,maskPattern){this.moduleCount=this.typeNumber*4+17;this.modules=new Array(this.moduleCount);for(var row=0;row<this.moduleCount;row++){this.modules[row]=new Array(this.moduleCount);for(var col=0;col<this.moduleCount;col++){this.modules[row][col]=null;}}
	this.setupPositionProbePattern(0,0);this.setupPositionProbePattern(this.moduleCount-7,0);this.setupPositionProbePattern(0,this.moduleCount-7);this.setupPositionAdjustPattern();this.setupTimingPattern();this.setupTypeInfo(test,maskPattern);if(this.typeNumber>=7){this.setupTypeNumber(test);}
	if(this.dataCache==null){this.dataCache=QRCodeModel.createData(this.typeNumber,this.errorCorrectLevel,this.dataList);}
	this.mapData(this.dataCache,maskPattern);},setupPositionProbePattern:function(row,col){for(var r=-1;r<=7;r++){if(row+r<=-1||this.moduleCount<=row+r)continue;for(var c=-1;c<=7;c++){if(col+c<=-1||this.moduleCount<=col+c)continue;if((0<=r&&r<=6&&(c==0||c==6))||(0<=c&&c<=6&&(r==0||r==6))||(2<=r&&r<=4&&2<=c&&c<=4)){this.modules[row+r][col+c]=true;}else{this.modules[row+r][col+c]=false;}}}},getBestMaskPattern:function(){var minLostPoint=0;var pattern=0;for(var i=0;i<8;i++){this.makeImpl(true,i);var lostPoint=QRUtil.getLostPoint(this);if(i==0||minLostPoint>lostPoint){minLostPoint=lostPoint;pattern=i;}}
	return pattern;},createMovieClip:function(target_mc,instance_name,depth){var qr_mc=target_mc.createEmptyMovieClip(instance_name,depth);var cs=1;this.make();for(var row=0;row<this.modules.length;row++){var y=row*cs;for(var col=0;col<this.modules[row].length;col++){var x=col*cs;var dark=this.modules[row][col];if(dark){qr_mc.beginFill(0,100);qr_mc.moveTo(x,y);qr_mc.lineTo(x+cs,y);qr_mc.lineTo(x+cs,y+cs);qr_mc.lineTo(x,y+cs);qr_mc.endFill();}}}
	return qr_mc;},setupTimingPattern:function(){for(var r=8;r<this.moduleCount-8;r++){if(this.modules[r][6]!=null){continue;}
	this.modules[r][6]=(r%2==0);}
	for(var c=8;c<this.moduleCount-8;c++){if(this.modules[6][c]!=null){continue;}
	this.modules[6][c]=(c%2==0);}},setupPositionAdjustPattern:function(){var pos=QRUtil.getPatternPosition(this.typeNumber);for(var i=0;i<pos.length;i++){for(var j=0;j<pos.length;j++){var row=pos[i];var col=pos[j];if(this.modules[row][col]!=null){continue;}
	for(var r=-2;r<=2;r++){for(var c=-2;c<=2;c++){if(r==-2||r==2||c==-2||c==2||(r==0&&c==0)){this.modules[row+r][col+c]=true;}else{this.modules[row+r][col+c]=false;}}}}}},setupTypeNumber:function(test){var bits=QRUtil.getBCHTypeNumber(this.typeNumber);for(var i=0;i<18;i++){var mod=(!test&&((bits>>i)&1)==1);this.modules[Math.floor(i/3)][i%3+this.moduleCount-8-3]=mod;}
	for(var i=0;i<18;i++){var mod=(!test&&((bits>>i)&1)==1);this.modules[i%3+this.moduleCount-8-3][Math.floor(i/3)]=mod;}},setupTypeInfo:function(test,maskPattern){var data=(this.errorCorrectLevel<<3)|maskPattern;var bits=QRUtil.getBCHTypeInfo(data);for(var i=0;i<15;i++){var mod=(!test&&((bits>>i)&1)==1);if(i<6){this.modules[i][8]=mod;}else if(i<8){this.modules[i+1][8]=mod;}else{this.modules[this.moduleCount-15+i][8]=mod;}}
	for(var i=0;i<15;i++){var mod=(!test&&((bits>>i)&1)==1);if(i<8){this.modules[8][this.moduleCount-i-1]=mod;}else if(i<9){this.modules[8][15-i-1+1]=mod;}else{this.modules[8][15-i-1]=mod;}}
	this.modules[this.moduleCount-8][8]=(!test);},mapData:function(data,maskPattern){var inc=-1;var row=this.moduleCount-1;var bitIndex=7;var byteIndex=0;for(var col=this.moduleCount-1;col>0;col-=2){if(col==6)col--;while(true){for(var c=0;c<2;c++){if(this.modules[row][col-c]==null){var dark=false;if(byteIndex<data.length){dark=(((data[byteIndex]>>>bitIndex)&1)==1);}
	var mask=QRUtil.getMask(maskPattern,row,col-c);if(mask){dark=!dark;}
	this.modules[row][col-c]=dark;bitIndex--;if(bitIndex==-1){byteIndex++;bitIndex=7;}}}
	row+=inc;if(row<0||this.moduleCount<=row){row-=inc;inc=-inc;break;}}}}};QRCodeModel.PAD0=0xEC;QRCodeModel.PAD1=0x11;QRCodeModel.createData=function(typeNumber,errorCorrectLevel,dataList){var rsBlocks=QRRSBlock.getRSBlocks(typeNumber,errorCorrectLevel);var buffer=new QRBitBuffer();for(var i=0;i<dataList.length;i++){var data=dataList[i];buffer.put(data.mode,4);buffer.put(data.getLength(),QRUtil.getLengthInBits(data.mode,typeNumber));data.write(buffer);}
	var totalDataCount=0;for(var i=0;i<rsBlocks.length;i++){totalDataCount+=rsBlocks[i].dataCount;}
	if(buffer.getLengthInBits()>totalDataCount*8){throw new Error("code length overflow. ("
	+buffer.getLengthInBits()
	+">"
	+totalDataCount*8
	+")");}
	if(buffer.getLengthInBits()+4<=totalDataCount*8){buffer.put(0,4);}
	while(buffer.getLengthInBits()%8!=0){buffer.putBit(false);}
	while(true){if(buffer.getLengthInBits()>=totalDataCount*8){break;}
	buffer.put(QRCodeModel.PAD0,8);if(buffer.getLengthInBits()>=totalDataCount*8){break;}
	buffer.put(QRCodeModel.PAD1,8);}
	return QRCodeModel.createBytes(buffer,rsBlocks);};QRCodeModel.createBytes=function(buffer,rsBlocks){var offset=0;var maxDcCount=0;var maxEcCount=0;var dcdata=new Array(rsBlocks.length);var ecdata=new Array(rsBlocks.length);for(var r=0;r<rsBlocks.length;r++){var dcCount=rsBlocks[r].dataCount;var ecCount=rsBlocks[r].totalCount-dcCount;maxDcCount=Math.max(maxDcCount,dcCount);maxEcCount=Math.max(maxEcCount,ecCount);dcdata[r]=new Array(dcCount);for(var i=0;i<dcdata[r].length;i++){dcdata[r][i]=0xff&buffer.buffer[i+offset];}
	offset+=dcCount;var rsPoly=QRUtil.getErrorCorrectPolynomial(ecCount);var rawPoly=new QRPolynomial(dcdata[r],rsPoly.getLength()-1);var modPoly=rawPoly.mod(rsPoly);ecdata[r]=new Array(rsPoly.getLength()-1);for(var i=0;i<ecdata[r].length;i++){var modIndex=i+modPoly.getLength()-ecdata[r].length;ecdata[r][i]=(modIndex>=0)?modPoly.get(modIndex):0;}}
	var totalCodeCount=0;for(var i=0;i<rsBlocks.length;i++){totalCodeCount+=rsBlocks[i].totalCount;}
	var data=new Array(totalCodeCount);var index=0;for(var i=0;i<maxDcCount;i++){for(var r=0;r<rsBlocks.length;r++){if(i<dcdata[r].length){data[index++]=dcdata[r][i];}}}
	for(var i=0;i<maxEcCount;i++){for(var r=0;r<rsBlocks.length;r++){if(i<ecdata[r].length){data[index++]=ecdata[r][i];}}}
	return data;};var QRMode={MODE_NUMBER:1<<0,MODE_ALPHA_NUM:1<<1,MODE_8BIT_BYTE:1<<2,MODE_KANJI:1<<3};var QRErrorCorrectLevel={L:1,M:0,Q:3,H:2};var QRMaskPattern={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};var QRUtil={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:(1<<10)|(1<<8)|(1<<5)|(1<<4)|(1<<2)|(1<<1)|(1<<0),G18:(1<<12)|(1<<11)|(1<<10)|(1<<9)|(1<<8)|(1<<5)|(1<<2)|(1<<0),G15_MASK:(1<<14)|(1<<12)|(1<<10)|(1<<4)|(1<<1),getBCHTypeInfo:function(data){var d=data<<10;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)>=0){d^=(QRUtil.G15<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)));}
	return((data<<10)|d)^QRUtil.G15_MASK;},getBCHTypeNumber:function(data){var d=data<<12;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)>=0){d^=(QRUtil.G18<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)));}
	return(data<<12)|d;},getBCHDigit:function(data){var digit=0;while(data!=0){digit++;data>>>=1;}
	return digit;},getPatternPosition:function(typeNumber){return QRUtil.PATTERN_POSITION_TABLE[typeNumber-1];},getMask:function(maskPattern,i,j){switch(maskPattern){case QRMaskPattern.PATTERN000:return(i+j)%2==0;case QRMaskPattern.PATTERN001:return i%2==0;case QRMaskPattern.PATTERN010:return j%3==0;case QRMaskPattern.PATTERN011:return(i+j)%3==0;case QRMaskPattern.PATTERN100:return(Math.floor(i/2)+Math.floor(j/3))%2==0;case QRMaskPattern.PATTERN101:return(i*j)%2+(i*j)%3==0;case QRMaskPattern.PATTERN110:return((i*j)%2+(i*j)%3)%2==0;case QRMaskPattern.PATTERN111:return((i*j)%3+(i+j)%2)%2==0;default:throw new Error("bad maskPattern:"+maskPattern);}},getErrorCorrectPolynomial:function(errorCorrectLength){var a=new QRPolynomial([1],0);for(var i=0;i<errorCorrectLength;i++){a=a.multiply(new QRPolynomial([1,QRMath.gexp(i)],0));}
	return a;},getLengthInBits:function(mode,type){if(1<=type&&type<10){switch(mode){case QRMode.MODE_NUMBER:return 10;case QRMode.MODE_ALPHA_NUM:return 9;case QRMode.MODE_8BIT_BYTE:return 8;case QRMode.MODE_KANJI:return 8;default:throw new Error("mode:"+mode);}}else if(type<27){switch(mode){case QRMode.MODE_NUMBER:return 12;case QRMode.MODE_ALPHA_NUM:return 11;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 10;default:throw new Error("mode:"+mode);}}else if(type<41){switch(mode){case QRMode.MODE_NUMBER:return 14;case QRMode.MODE_ALPHA_NUM:return 13;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 12;default:throw new Error("mode:"+mode);}}else{throw new Error("type:"+type);}},getLostPoint:function(qrCode){var moduleCount=qrCode.getModuleCount();var lostPoint=0;for(var row=0;row<moduleCount;row++){for(var col=0;col<moduleCount;col++){var sameCount=0;var dark=qrCode.isDark(row,col);for(var r=-1;r<=1;r++){if(row+r<0||moduleCount<=row+r){continue;}
	for(var c=-1;c<=1;c++){if(col+c<0||moduleCount<=col+c){continue;}
	if(r==0&&c==0){continue;}
	if(dark==qrCode.isDark(row+r,col+c)){sameCount++;}}}
	if(sameCount>5){lostPoint+=(3+sameCount-5);}}}
	for(var row=0;row<moduleCount-1;row++){for(var col=0;col<moduleCount-1;col++){var count=0;if(qrCode.isDark(row,col))count++;if(qrCode.isDark(row+1,col))count++;if(qrCode.isDark(row,col+1))count++;if(qrCode.isDark(row+1,col+1))count++;if(count==0||count==4){lostPoint+=3;}}}
	for(var row=0;row<moduleCount;row++){for(var col=0;col<moduleCount-6;col++){if(qrCode.isDark(row,col)&&!qrCode.isDark(row,col+1)&&qrCode.isDark(row,col+2)&&qrCode.isDark(row,col+3)&&qrCode.isDark(row,col+4)&&!qrCode.isDark(row,col+5)&&qrCode.isDark(row,col+6)){lostPoint+=40;}}}
	for(var col=0;col<moduleCount;col++){for(var row=0;row<moduleCount-6;row++){if(qrCode.isDark(row,col)&&!qrCode.isDark(row+1,col)&&qrCode.isDark(row+2,col)&&qrCode.isDark(row+3,col)&&qrCode.isDark(row+4,col)&&!qrCode.isDark(row+5,col)&&qrCode.isDark(row+6,col)){lostPoint+=40;}}}
	var darkCount=0;for(var col=0;col<moduleCount;col++){for(var row=0;row<moduleCount;row++){if(qrCode.isDark(row,col)){darkCount++;}}}
	var ratio=Math.abs(100*darkCount/moduleCount/moduleCount-50)/5;lostPoint+=ratio*10;return lostPoint;}};var QRMath={glog:function(n){if(n<1){throw new Error("glog("+n+")");}
	return QRMath.LOG_TABLE[n];},gexp:function(n){while(n<0){n+=255;}
	while(n>=256){n-=255;}
	return QRMath.EXP_TABLE[n];},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)};for(var i=0;i<8;i++){QRMath.EXP_TABLE[i]=1<<i;}
	for(var i=8;i<256;i++){QRMath.EXP_TABLE[i]=QRMath.EXP_TABLE[i-4]^QRMath.EXP_TABLE[i-5]^QRMath.EXP_TABLE[i-6]^QRMath.EXP_TABLE[i-8];}
	for(var i=0;i<255;i++){QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]]=i;}
	function QRPolynomial(num,shift){if(num.length==undefined){throw new Error(num.length+"/"+shift);}
	var offset=0;while(offset<num.length&&num[offset]==0){offset++;}
	this.num=new Array(num.length-offset+shift);for(var i=0;i<num.length-offset;i++){this.num[i]=num[i+offset];}}
	QRPolynomial.prototype={get:function(index){return this.num[index];},getLength:function(){return this.num.length;},multiply:function(e){var num=new Array(this.getLength()+e.getLength()-1);for(var i=0;i<this.getLength();i++){for(var j=0;j<e.getLength();j++){num[i+j]^=QRMath.gexp(QRMath.glog(this.get(i))+QRMath.glog(e.get(j)));}}
	return new QRPolynomial(num,0);},mod:function(e){if(this.getLength()-e.getLength()<0){return this;}
	var ratio=QRMath.glog(this.get(0))-QRMath.glog(e.get(0));var num=new Array(this.getLength());for(var i=0;i<this.getLength();i++){num[i]=this.get(i);}
	for(var i=0;i<e.getLength();i++){num[i]^=QRMath.gexp(QRMath.glog(e.get(i))+ratio);}
	return new QRPolynomial(num,0).mod(e);}};function QRRSBlock(totalCount,dataCount){this.totalCount=totalCount;this.dataCount=dataCount;}
	QRRSBlock.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]];QRRSBlock.getRSBlocks=function(typeNumber,errorCorrectLevel){var rsBlock=QRRSBlock.getRsBlockTable(typeNumber,errorCorrectLevel);if(rsBlock==undefined){throw new Error("bad rs block @ typeNumber:"+typeNumber+"/errorCorrectLevel:"+errorCorrectLevel);}
	var length=rsBlock.length/3;var list=[];for(var i=0;i<length;i++){var count=rsBlock[i*3+0];var totalCount=rsBlock[i*3+1];var dataCount=rsBlock[i*3+2];for(var j=0;j<count;j++){list.push(new QRRSBlock(totalCount,dataCount));}}
	return list;};QRRSBlock.getRsBlockTable=function(typeNumber,errorCorrectLevel){switch(errorCorrectLevel){case QRErrorCorrectLevel.L:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+0];case QRErrorCorrectLevel.M:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+1];case QRErrorCorrectLevel.Q:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+2];case QRErrorCorrectLevel.H:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+3];default:return undefined;}};function QRBitBuffer(){this.buffer=[];this.length=0;}
	QRBitBuffer.prototype={get:function(index){var bufIndex=Math.floor(index/8);return((this.buffer[bufIndex]>>>(7-index%8))&1)==1;},put:function(num,length){for(var i=0;i<length;i++){this.putBit(((num>>>(length-i-1))&1)==1);}},getLengthInBits:function(){return this.length;},putBit:function(bit){var bufIndex=Math.floor(this.length/8);if(this.buffer.length<=bufIndex){this.buffer.push(0);}
	if(bit){this.buffer[bufIndex]|=(0x80>>>(this.length%8));}
	this.length++;}};var QRCodeLimitLength=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]];

	function _isSupportCanvas() {
		return typeof CanvasRenderingContext2D != "undefined";
	}

	// android 2.x doesn't support Data-URI spec
	function _getAndroid() {
		var android = false;
		var sAgent = navigator.userAgent;

		if (/android/i.test(sAgent)) { // android
			android = true;
			aMat = sAgent.toString().match(/android ([0-9]\.[0-9])/i);

			if (aMat && aMat[1]) {
				android = parseFloat(aMat[1]);
			}
		}

		return android;
	}

	var svgDrawer = (function() {

		var Drawing = function (el, htOption) {
			this._el = el;
			this._htOption = htOption;
		};

		Drawing.prototype.draw = function (oQRCode) {
			var _htOption = this._htOption;
			var _el = this._el;
			var nCount = oQRCode.getModuleCount();
			var nWidth = Math.floor(_htOption.width / nCount);
			var nHeight = Math.floor(_htOption.height / nCount);

			this.clear();

			function makeSVG(tag, attrs) {
				var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
				for (var k in attrs)
					if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
				return el;
			}

			var svg = makeSVG("svg" , {'viewBox': '0 0 ' + String(nCount) + " " + String(nCount), 'width': '100%', 'height': '100%', 'fill': _htOption.colorLight});
			svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
			_el.appendChild(svg);

			svg.appendChild(makeSVG("rect", {"fill": _htOption.colorDark, "width": "1", "height": "1", "id": "template"}));

			for (var row = 0; row < nCount; row++) {
				for (var col = 0; col < nCount; col++) {
					if (oQRCode.isDark(row, col)) {
						var child = makeSVG("use", {"x": String(row), "y": String(col)});
						child.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#template")
						svg.appendChild(child);
					}
				}
			}
		};
		Drawing.prototype.clear = function () {
			while (this._el.hasChildNodes())
				this._el.removeChild(this._el.lastChild);
		};
		return Drawing;
	})();

	var useSVG = document.documentElement.tagName.toLowerCase() === "svg";

	// Drawing in DOM by using Table tag
	var Drawing = useSVG ? svgDrawer : !_isSupportCanvas() ? (function () {
		var Drawing = function (el, htOption) {
			this._el = el;
			this._htOption = htOption;
		};

		/**
		 * Draw the QRCode
		 *
		 * @param {QRCode} oQRCode
		 */
		Drawing.prototype.draw = function (oQRCode) {
            var _htOption = this._htOption;
            var _el = this._el;
			var nCount = oQRCode.getModuleCount();
			var nWidth = Math.floor(_htOption.width / nCount);
			var nHeight = Math.floor(_htOption.height / nCount);
			var aHTML = ['<table style="border:0;border-collapse:collapse;">'];

			for (var row = 0; row < nCount; row++) {
				aHTML.push('<tr>');

				for (var col = 0; col < nCount; col++) {
					aHTML.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + nWidth + 'px;height:' + nHeight + 'px;background-color:' + (oQRCode.isDark(row, col) ? _htOption.colorDark : _htOption.colorLight) + ';"></td>');
				}

				aHTML.push('</tr>');
			}

			aHTML.push('</table>');
			_el.innerHTML = aHTML.join('');

			// Fix the margin values as real size.
			var elTable = _el.childNodes[0];
			var nLeftMarginTable = (_htOption.width - elTable.offsetWidth) / 2;
			var nTopMarginTable = (_htOption.height - elTable.offsetHeight) / 2;

			if (nLeftMarginTable > 0 && nTopMarginTable > 0) {
				elTable.style.margin = nTopMarginTable + "px " + nLeftMarginTable + "px";
			}
		};

		/**
		 * Clear the QRCode
		 */
		Drawing.prototype.clear = function () {
			this._el.innerHTML = '';
		};

		return Drawing;
	})() : (function () { // Drawing in Canvas
		function _onMakeImage() {
			this._elImage.src = this._elCanvas.toDataURL("image/png");
			this._elImage.style.display = "block";
			this._elCanvas.style.display = "none";
		}

		// Android 2.1 bug workaround
		// http://code.google.com/p/android/issues/detail?id=5141
		if (this._android && this._android <= 2.1) {
	    	var factor = 1 / window.devicePixelRatio;
	        var drawImage = CanvasRenderingContext2D.prototype.drawImage;
	    	CanvasRenderingContext2D.prototype.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
	    		if (("nodeName" in image) && /img/i.test(image.nodeName)) {
		        	for (var i = arguments.length - 1; i >= 1; i--) {
		            	arguments[i] = arguments[i] * factor;
		        	}
	    		} else if (typeof dw == "undefined") {
	    			arguments[1] *= factor;
	    			arguments[2] *= factor;
	    			arguments[3] *= factor;
	    			arguments[4] *= factor;
	    		}

	        	drawImage.apply(this, arguments);
	    	};
		}

		/**
		 * Check whether the user's browser supports Data URI or not
		 *
		 * @private
		 * @param {Function} fSuccess Occurs if it supports Data URI
		 * @param {Function} fFail Occurs if it doesn't support Data URI
		 */
		function _safeSetDataURI(fSuccess, fFail) {
            var self = this;
            self._fFail = fFail;
            self._fSuccess = fSuccess;

            // Check it just once
            if (self._bSupportDataURI === null) {
                var el = document.createElement("img");
                var fOnError = function() {
                    self._bSupportDataURI = false;

                    if (self._fFail) {
                        _fFail.call(self);
                    }
                };
                var fOnSuccess = function() {
                    self._bSupportDataURI = true;

                    if (self._fSuccess) {
                        self._fSuccess.call(self);
                    }
                };

                el.onabort = fOnError;
                el.onerror = fOnError;
                el.onload = fOnSuccess;
                el.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="; // the Image contains 1px data.
                return;
            } else if (self._bSupportDataURI === true && self._fSuccess) {
                self._fSuccess.call(self);
            } else if (self._bSupportDataURI === false && self._fFail) {
                self._fFail.call(self);
            }
		};

		/**
		 * Drawing QRCode by using canvas
		 *
		 * @constructor
		 * @param {HTMLElement} el
		 * @param {Object} htOption QRCode Options
		 */
		var Drawing = function (el, htOption) {
    		this._bIsPainted = false;
    		this._android = _getAndroid();

			this._htOption = htOption;
			this._elCanvas = document.createElement("canvas");
			this._elCanvas.width = htOption.width;
			this._elCanvas.height = htOption.height;
			el.appendChild(this._elCanvas);
			this._el = el;
			this._oContext = this._elCanvas.getContext("2d");
			this._bIsPainted = false;
			this._elImage = document.createElement("img");
			this._elImage.style.display = "none";
			this._el.appendChild(this._elImage);
			this._bSupportDataURI = null;
		};

		/**
		 * Draw the QRCode
		 *
		 * @param {QRCode} oQRCode
		 */
		Drawing.prototype.draw = function (oQRCode) {
            var _elImage = this._elImage;
            var _oContext = this._oContext;
            var _htOption = this._htOption;

			var nCount = oQRCode.getModuleCount();
			var nWidth = _htOption.width / nCount;
			var nHeight = _htOption.height / nCount;
			var nRoundedWidth = Math.round(nWidth);
			var nRoundedHeight = Math.round(nHeight);

			_elImage.style.display = "none";
			this.clear();

			for (var row = 0; row < nCount; row++) {
				for (var col = 0; col < nCount; col++) {
					var bIsDark = oQRCode.isDark(row, col);
					var nLeft = col * nWidth;
					var nTop = row * nHeight;
					_oContext.strokeStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
					_oContext.lineWidth = 1;
					_oContext.fillStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
					_oContext.fillRect(nLeft, nTop, nWidth, nHeight);

					// 안티 앨리어싱 방지 처리
					_oContext.strokeRect(
						Math.floor(nLeft) + 0.5,
						Math.floor(nTop) + 0.5,
						nRoundedWidth,
						nRoundedHeight
					);

					_oContext.strokeRect(
						Math.ceil(nLeft) - 0.5,
						Math.ceil(nTop) - 0.5,
						nRoundedWidth,
						nRoundedHeight
					);
				}
			}

			this._bIsPainted = true;
		};

		/**
		 * Make the image from Canvas if the browser supports Data URI.
		 */
		Drawing.prototype.makeImage = function () {
			if (this._bIsPainted) {
				_safeSetDataURI.call(this, _onMakeImage);
			}
		};

		/**
		 * Return whether the QRCode is painted or not
		 *
		 * @return {Boolean}
		 */
		Drawing.prototype.isPainted = function () {
			return this._bIsPainted;
		};

		/**
		 * Clear the QRCode
		 */
		Drawing.prototype.clear = function () {
			this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);
			this._bIsPainted = false;
		};

		/**
		 * @private
		 * @param {Number} nNumber
		 */
		Drawing.prototype.round = function (nNumber) {
			if (!nNumber) {
				return nNumber;
			}

			return Math.floor(nNumber * 1000) / 1000;
		};

		return Drawing;
	})();

	/**
	 * Get the type by string length
	 *
	 * @private
	 * @param {String} sText
	 * @param {Number} nCorrectLevel
	 * @return {Number} type
	 */
	function _getTypeNumber(sText, nCorrectLevel) {
		var nType = 1;
		var length = _getUTF8Length(sText);

		for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
			var nLimit = 0;

			switch (nCorrectLevel) {
				case QRErrorCorrectLevel.L :
					nLimit = QRCodeLimitLength[i][0];
					break;
				case QRErrorCorrectLevel.M :
					nLimit = QRCodeLimitLength[i][1];
					break;
				case QRErrorCorrectLevel.Q :
					nLimit = QRCodeLimitLength[i][2];
					break;
				case QRErrorCorrectLevel.H :
					nLimit = QRCodeLimitLength[i][3];
					break;
			}

			if (length <= nLimit) {
				break;
			} else {
				nType++;
			}
		}

		if (nType > QRCodeLimitLength.length) {
			throw new Error("Too long data");
		}

		return nType;
	}

	function _getUTF8Length(sText) {
		var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
		return replacedText.length + (replacedText.length != sText ? 3 : 0);
	}

	/**
	 * @class QRCode
	 * @constructor
	 * @example
	 * new QRCode(document.getElementById("test"), "http://jindo.dev.naver.com/collie");
	 *
	 * @example
	 * var oQRCode = new QRCode("test", {
	 *    text : "http://naver.com",
	 *    width : 128,
	 *    height : 128
	 * });
	 *
	 * oQRCode.clear(); // Clear the QRCode.
	 * oQRCode.makeCode("http://map.naver.com"); // Re-create the QRCode.
	 *
	 * @param {HTMLElement|String} el target element or 'id' attribute of element.
	 * @param {Object|String} vOption
	 * @param {String} vOption.text QRCode link data
	 * @param {Number} [vOption.width=256]
	 * @param {Number} [vOption.height=256]
	 * @param {String} [vOption.colorDark="#000000"]
	 * @param {String} [vOption.colorLight="#ffffff"]
	 * @param {QRCode.CorrectLevel} [vOption.correctLevel=QRCode.CorrectLevel.H] [L|M|Q|H]
	 */
	QRCode = function (el, vOption) {
		this._htOption = {
			width : 256,
			height : 256,
			typeNumber : 4,
			colorDark : "#000000",
			colorLight : "#ffffff",
			correctLevel : QRErrorCorrectLevel.H
		};

		if (typeof vOption === 'string') {
			vOption	= {
				text : vOption
			};
		}

		// Overwrites options
		if (vOption) {
			for (var i in vOption) {
				this._htOption[i] = vOption[i];
			}
		}

		if (typeof el == "string") {
			el = document.getElementById(el);
		}

		this._android = _getAndroid();
		this._el = el;
		this._oQRCode = null;
		this._oDrawing = new Drawing(this._el, this._htOption);

		if (this._htOption.text) {
			this.makeCode(this._htOption.text);
		}
	};

	/**
	 * Make the QRCode
	 *
	 * @param {String} sText link data
	 */
	QRCode.prototype.makeCode = function (sText) {
		this._oQRCode = new QRCodeModel(_getTypeNumber(sText, this._htOption.correctLevel), this._htOption.correctLevel);
		this._oQRCode.addData(sText);
		this._oQRCode.make();
		this._el.title = sText;
		this._oDrawing.draw(this._oQRCode);
		this.makeImage();
	};

	/**
	 * Make the Image from Canvas element
	 * - It occurs automatically
	 * - Android below 3 doesn't support Data-URI spec.
	 *
	 * @private
	 */
	QRCode.prototype.makeImage = function () {
		if (typeof this._oDrawing.makeImage == "function" && (!this._android || this._android >= 3)) {
			this._oDrawing.makeImage();
		}
	};

	/**
	 * Clear the QRCode
	 */
	QRCode.prototype.clear = function () {
		this._oDrawing.clear();
	};

	/**
	 * @name QRCode.CorrectLevel
	 */
	QRCode.CorrectLevel = QRErrorCorrectLevel;
})();
ControlPanel.define('CheckUpdates', function(require, exports) {
    //Consts
    var
    //Selectors
        GET_VERSION_NUMBER_URL = '/check_updates/',
        CURRENT_VERSION = '.footer .current-version',
        NEW_VERSION = '.footer .new-version';

    var $ = require('jQuery'),
        UXLog = require('UXLog');

    exports.check = function() {
        $.get(GET_VERSION_NUMBER_URL, function(versions) {
            if(!versions)
                return;

            if(versions.newVersion) {
                var newVersionHTML = [$(NEW_VERSION).html(), versions.newVersion].join(' ');

                $(CURRENT_VERSION).hide();
                $(NEW_VERSION)
                    .html(newVersionHTML)
                    .fadeIn()
                    .on('click', function () {
                        UXLog.write('"Download new version ' + versions.newVersion + '"+ button clicked');
                    });
            }
            else
                $(CURRENT_VERSION).text('v. ' + versions.curVersion).show();
        });
    };
});


ControlPanel.define('OptionsView', function (require, exports) {
    require('Widgets.Dialog');
    require('Widgets.Draggable');
    require('Widgets.Resizable');
    require('Widgets.ScrollBar');
    require('Widgets.TreeView');

    var $ = require('jQuery'),
        Util = require('Util'),
        UXLog = require('UXLog');

    exports.init = function () {
        //Constants
        var
        //Selectors
            HEADER_BACK = '.header .back',
            FOOTER = '.footer',
            ADD_BROWSER_BTN = '#add-browser-btn',
            DETECT_BROWSERS_BTN = '#detect-browsers-btn',
            BROWSER_ROW = '.browser-row',
            OPTIONS_TAB_CONT = '.options-tabs-cont',
            SERVER_OPTIONS = '#server-options',
            BROWSERS_OPTIONS = '#browsers-options',
            RESTART_BTN = '#restart-btn',
            SERVICE_PORT1 = '#service_post1',
            SERVICE_PORT2 = '#service_post2',
            CONTROL_PANEL_PORT = '#control_panel_port',
            HOSTNAME = '#hostname',
            REPORTS_PATH_INPUT = '#reports-path-input',
            OPTION_TABS = '.options-tabs li',
            TAB_CONTENT = '.tab-content',
            MSG_CONT = '.msg-cont',
            CHANGE_BROWSER_DIALOG = '#change-browser-dialog',
            FS_TREEVIEW_CONT = '#fs-tree',
            CHANGE_BROWSER_INPUT = '#input-path',
            TITLE_CONT = '.err-text',
            CHANGE_BROWSER_CANCEL_BTN = '#change_browser_cancel',
            CHANGE_BROWSER_OK_BTN = '#change_browser_btn',
            UI_DIALOG_TITLE_CONT = '.dialog-header',
            APPLY_NETWORK_OPTIONS_BTN = '#apply-network-options',
            APPLY_REPORTS_OPTIONS_BTN = '#apply-reports-options',
            OPTIONS_CONT = '.options-cont',
            LOADING_MSG_CLASS = 'loading-img',
            AUTO_DETECT_NETWORK = '#server-options input[type="checkbox"]',
            INPUTS_NETWORK = '#server-options input[type="text"]',
            EDIT_BROWSER_BTN = '.edit-browser-btn',
            BROWSER_OPTIONS_DIALOG_CONT = '#browser-options-dialog',
            EDIT_BROWSER_NAME = '#edit-browser-name',
            EDIT_BROWSER_PATH = '#edit-browser-path',
            EDIT_BROWSER_CMD = '#edit-browser-cmd',
            DELETE_BROWSER_DIALOG_CONT = '#delete-browser-dialog',
            DELETE_BROWSER_YES_BTN = '#delete-browser-yes-btn',
            DELETE_BROWSER_NO_BTN = '#delete-browser-no-btn',
            DELETE_BROWSER_BUTTON = '.delete-browser-btn',
            PORT_BUSY = '.port-busy',
            DIALOG_TEXT = '.dialog-text h2',
            ICON_TYPES = '.icon-types',
            ICON_UNKNOWN = '.unknown',
            BROWSER_FILE = '#browser-file',
            BROWSER_OPTIONS_OK_BTN = '#configure-browser-ok-btn',
            BROWSER_OPTIONS_CANCEL_BTN = '#configure-browser-cancel-btn',
            ICON_CHECKED = '.icon-checked',
            REPORT_OPTIONS = '#reports-options',
            REPORTS_PATH_DIALOG = '#reports-path-dialog',
            REPORTS_PATH_DIALOG_INPUT = '#reports-path-dialog-input',
            REPORTS_PATH_OK_BTN = '#reports-path-ok',
            REPORTS_PATH_CANCEL_BTN = '#reports-path-cancel',
            CHANGE_REPORT_PATH_BTN = '#change-report-btn',
            REPORTS_PATH_TREEVIEW_CONT = '#reports-path-fs-tree',
            HOME_DIR_BTN = '.home-dir',

        //Classes
            ERR_VALUE_CLASS = 'err-value',
            CHANGE_BROWSER_CLASS = 'change-browser',
            TREE_ITEM_SELECTED_CLASS = 'selected',
            READONLY_CLASS = 'readonly',
            BROWSER_OPTIONS_DIALOG_CLASS = 'browser-options-dialog',
            DELETE_BROWSER_DIALOG_CLASS = 'delete-browser',
            ACTIVE_TAB_CLASS = 'active',
            ICON_CHECKED_CLASS = 'icon-checked',
            PORT_BUSY_CLASS = 'port-busy',
            RESIZE_MARKER_CHANGE_BROWSER_FILE_CLASS = 'resize-marker-change-browser',
            ERR_MSG_CLASS = 'err-msg',
            INFO_MSG_CLASS = 'info-msg',
            REPORTS_PATH_CLASS = 'reports-path',
            REPORTS_PATH_SCROLLBAR_CLASS = 'reports-path-scrollbar',
            RESIZE_MARKER_REPORTS_PATH_CLASS = 'reports-path-resize-marker',

        //Urls
            CHANGE_BROWSER_SCROLLBAR_CLASS = 'change-browser-scrollbar',
            RESTART_URL = '/network/save/',
            APPLY_REPORTS_OPTIONS_URL = '/reports/configure',
            DETECT_BROWSER_URL = '/browsers/detect/',
            CONFIGURE_BROWSER_URL = '/browser/configure/',
            GET_FS_BY_PATH_URL = '/files_by_path/',
            GET_DIR_BY_PATH_URL = '/dirs_by_path/',

        //Text
            PORT_ALREADY_IN_USE_TEXT = 'The port is already in use.',
            EMPTY_FIELD_TEXT = 'Required field.',
            IDENTICAL_VALUES_TEXT = 'Proxy and control panel ports must have different values.',
            PORT_IS_AUTO_DETECTING_TEXT = 'The port was detected automatically, because the specified port is already in use.',
            INVALID_PORT_VALUE_TEXT = 'Invalid port value. Please enter a number in the range from 0 to 65535',
            NEED_RESTART_TEXT = 'Network options have been changed. The changes will be applied after the server restarts.',
            REPORTS_OPTIONS_UPDATED_TEXT = 'Report options have been changed.',
            ERR_MSG_TYPE = 'error',
            WARN_MSG_TYPE = 'warning',
            DELETE_DIALOG_TEXT_PATTERN = 'Are you sure you want to remove "{0}"?',
            EDIT_BROWSER_DIALOG_TITLE_TEXT = '"{0}" options',
            ADD_BROWSER_DIALOG_TITLE_TEXT = 'Add new browser',
            BROWSER_PATH_NOT_EXISTS_TEXT = 'Browser path not exists',
            BROWSER_IS_ALREADY_EXISTS = 'Browser with same name is already exists',

        //Attr
            DATA_BROWSER_ICON_ATTR = 'data-browser-icon',
            DATA_TAB_ATTR = 'data-tab',
            PATH_ATTR = 'data-path',
            DATA_BROWSER_NAME_ATTR = 'data-browser-name',
            DATA_BROWSER_PATH_ATTR = 'data-browser-path',
            DATA_BROWSER_CMD_ATTR = 'data-browser-cmd',

        //Metrics
            ENTER_BTN_CODE = 13,
            FS_EXPAND_DURATION = 200,
            BROWSERS_ANIMATION_DURATION = 500,
            CHANGE_BROWSER_DIALOG_WIDTH = 560,
            REPORTS_PATH_DIALOG_WIDTH = 560,
            BROWSER_DIALOG_WIDTH = 600,
            LOADING_MSG_DURATION = 750,
            PORT_MIN_VALUE = 0,
            PORT_MAX_VALUE = 65535;

        //Globals
        var $document = $(document),
            $changeBrowserDialog = null,
            $browserOptionsDialog = null,
            optionsPageContent = null,
            $reportsPathDialog = null,
            loadAnimationStartTime = 0;


        //Utils
        var portValueIsValid = function (port) {
            port = parseInt(port);
            return (port > PORT_MIN_VALUE && port < PORT_MAX_VALUE);
        };

        var showMsg = function (text, type) {
            var $msgCont = $(MSG_CONT);

            if (type === ERR_MSG_TYPE)
                $msgCont.addClass(ERR_MSG_CLASS);
            else
                $msgCont.addClass(INFO_MSG_CLASS);

            $msgCont.show();
            $msgCont.find('p').html(text);
        };

        var removeMsg = function () {
            var $msgCont = $(MSG_CONT);

            $msgCont.hide();
            $msgCont.find('p').html('');
        };

        var setInCenter = function ($elm) {
            var $cont = $(OPTIONS_CONT),
                topMargin = (Util.getContentHeight() - $elm.height() ) / 2;

            if (topMargin > 0)
                $elm.css('margin-top', topMargin);

            var leftMargin = ($cont.outerWidth(false) - $elm.width()) / 2;

            if (leftMargin > 0)
                $elm.css('margin-left', leftMargin);
        };

        var restoreContent = function (actionBeforeInit) {
            var animationDuration = (new Date()).getTime() - loadAnimationStartTime;

            var restore = function () {
                $(OPTIONS_CONT).html(optionsPageContent);

                if (typeof actionBeforeInit === 'function')
                    actionBeforeInit();

                initContent();

                loadAnimationStartTime = 0;
            };

            if (animationDuration < LOADING_MSG_DURATION)
                setTimeout(restore, LOADING_MSG_DURATION - animationDuration);
            else
                restore();
        };

        var createLoadingMsg = function () {
            var $pageCont = $(OPTIONS_CONT),
                $loadingMsgContent = $('<div></div>')
                    .addClass(LOADING_MSG_CLASS);

            optionsPageContent = $pageCont.html();

            $pageCont.html($loadingMsgContent);
            setInCenter($loadingMsgContent);

            loadAnimationStartTime = (new Date()).getTime();
        };

        var initEnterBtn = function () {
            $(SERVER_OPTIONS).find('input').keypress(function (e) {
                if (e.which === ENTER_BTN_CODE)
                    $(RESTART_BTN).click();
            });
        };

        var initTabs = function () {
            var $tab = $(OPTION_TABS);

            $tab.click(function () {
                var $curTab = $(this);
                var tabContent = $curTab.attr(DATA_TAB_ATTR);

                $(TAB_CONTENT).hide();
                $('#' + tabContent).show();
                $tab.removeClass(ACTIVE_TAB_CLASS);
                $curTab.addClass(ACTIVE_TAB_CLASS);
                UXLog.write('Settings: "' + $curTab.text() + '" tab opened');
            });

            if ($(PORT_BUSY).length) {
                $tab.eq(1).click();
            }
        };

        //Dialogs
        var configureBrowser = function (name, oldName, path, cmd, icon, callback) {
            var browserInfo = {
                path: path,
                cmd: cmd || '',
                icon: icon || ''
            };

            createLoadingMsg();

            $.post(CONFIGURE_BROWSER_URL, {
                browserName: name,
                browserInfo: browserInfo,
                oldName: oldName
            },function (content) {
                restoreContent(function () {
                    $(BROWSERS_OPTIONS).html(content).fadeIn(BROWSERS_ANIMATION_DURATION);
                    callback();
                });
            }).error(function (err) {
                    restoreContent(function () {
                        callback(JSON.parse(err.responseText));
                    });
                });
        };

        var deleteBrowser = function (browserName) {
            createLoadingMsg();

            $.post(CONFIGURE_BROWSER_URL, {
                browserName: browserName
            },function (content) {
                restoreContent(function () {
                    $(BROWSERS_OPTIONS).html(content).fadeIn(BROWSERS_ANIMATION_DURATION);
                });
            }).error(function () {
                    restoreContent();
                });
        };

        var detectBrowser = function () {
            createLoadingMsg();

            $.post(DETECT_BROWSER_URL,function (content) {
                restoreContent(function () {
                    $(BROWSERS_OPTIONS).html(content).fadeIn(BROWSERS_ANIMATION_DURATION);
                });
            }).error(function () {
                    restoreContent();
                });
        };

        var initDeleteBrowserDialog = function () {
            var $deleteDialog = null,
                $btn = null,
                browserName = null,
                $cont = $(DELETE_BROWSER_DIALOG_CONT);

            $deleteDialog = $cont.dialog({
                autoOpen: false,
                dialogClass: DELETE_BROWSER_DIALOG_CLASS,
                width: BROWSER_DIALOG_WIDTH
            });

            $document.on('click', DELETE_BROWSER_BUTTON, function () {
                UXLog.write('Settings: "Remove browser" clicked');

                $btn = $(this);
                browserName = $btn.closest(BROWSER_ROW).attr(DATA_BROWSER_NAME_ATTR);

                $cont.find(DIALOG_TEXT).text(Util.formatText(DELETE_DIALOG_TEXT_PATTERN, browserName));
                $deleteDialog.dialog('open');
            });

            $(DELETE_BROWSER_YES_BTN).click(function () {
                deleteBrowser(browserName);
                $deleteDialog.dialog('close');
            });

            $(DELETE_BROWSER_NO_BTN).click(function () {
                $deleteDialog.dialog('close');
            });
        };

        var initReportsPathDialog = function() {
            var $cont = $(REPORTS_PATH_DIALOG),
                $fsTreeView = $(REPORTS_PATH_TREEVIEW_CONT),
                $fsTreeViewCont = $fsTreeView.parent(),
                $inputPath = $(REPORTS_PATH_DIALOG_INPUT),
                $inputPathNextElm = $inputPath.next(),
                $inputErr = $inputPathNextElm.find(TITLE_CONT),
                reportsPath = '',
                inputFocus = false,
                loadItems = function () {
                    $fsTreeViewCont.scrollBar({
                        scrollTo: REPORTS_PATH_TREEVIEW_CONT + ' li.' + TREE_ITEM_SELECTED_CLASS,
                        scrollClass: REPORTS_PATH_SCROLLBAR_CLASS
                    });
                },
                treeviewOptions = {
                    url: GET_DIR_BY_PATH_URL,
                    open: '',
                    effect: 'animate',
                    time: FS_EXPAND_DURATION,
                    asyncAction: loadItems
                };

            $reportsPathDialog = $cont.dialog({
                autoOpen: false,
                dialogClass: REPORTS_PATH_CLASS,
                width: 'auto'
            });

            var clearInputDirErr = function () {
                $inputPath.removeClass(ERR_VALUE_CLASS);
                $inputPathNextElm.hide();
                $inputErr.html();
            };

            $document.on('click', CHANGE_REPORT_PATH_BTN, function (e) {
                var initValue = $(REPORTS_PATH_INPUT).val();

                $inputPath.val(initValue);
                reportsPath = treeviewOptions.open = initValue;

                $reportsPathDialog.dialog('open');

                $cont.parent().find(UI_DIALOG_TITLE_CONT).draggable();
                $fsTreeViewCont.scrollBar({
                    scrollTo: REPORTS_PATH_TREEVIEW_CONT + ' li.' + TREE_ITEM_SELECTED_CLASS,
                    scrollClass: REPORTS_PATH_SCROLLBAR_CLASS
                });

                $fsTreeViewCont.resizable({
                    minWidth: REPORTS_PATH_DIALOG_WIDTH,
                    minHeight: $fsTreeViewCont.height(),
                    class: RESIZE_MARKER_REPORTS_PATH_CLASS,
                    action: function () {
                        $fsTreeViewCont.scrollBar({
                            scrollClass: REPORTS_PATH_SCROLLBAR_CLASS
                        });
                    }
                });

                $fsTreeView.treeView(treeviewOptions);

                e.stopImmediatePropagation();
            });

            $inputPath.focusout(function (e) {
                inputFocus = false;
                e.stopImmediatePropagation();
            });

            $inputPath.click(function (e) {
                if (!inputFocus) {
                    inputFocus = true;
                    $(this).select();
                }

                e.stopImmediatePropagation();
            });

            $inputPath.keyup(function (e) {
                treeviewOptions.open = $inputPath.val();
                treeviewOptions.effect = false;
                $fsTreeView.treeView(treeviewOptions);
                treeviewOptions.effect = 'animate';

                if (e.keyCode !== ENTER_BTN_CODE) {
                    $inputPath.removeClass(ERR_VALUE_CLASS);
                    $inputPathNextElm.hide();
                    $inputPathNextElm.find(TITLE_CONT).html();
                }

                e.stopImmediatePropagation();
            });

            $document.on('click', REPORTS_PATH_OK_BTN, function (e) {
                var inputValue = $inputPath.val(),
                    $reportsPathInput = $(REPORTS_PATH_INPUT);

                Util.removeInputMsgs($(REPORT_OPTIONS));

                $inputPathNextElm.hide();

                if ($.trim(inputValue))
                    $inputPath.val(decodeURIComponent(reportsPath));

                clearInputDirErr();

                if(!$.trim(inputValue))
                    Util.showInputMsg($inputPath, EMPTY_FIELD_TEXT, ERR_MSG_TYPE);
                else {
                    $reportsPathInput.val(inputValue);
                    $reportsPathDialog.dialog('close');
                }


                e.stopImmediatePropagation();
            });

            $document.on('click', REPORTS_PATH_CANCEL_BTN, function (e) {
                $reportsPathDialog.dialog('close');
                e.stopImmediatePropagation();
            });

            $document.on('click', REPORTS_PATH_TREEVIEW_CONT + ' li', function () {
                reportsPath = $(this).attr(PATH_ATTR);
                $inputPath.val(decodeURIComponent(reportsPath));
            });

            $document.on('click', [REPORTS_PATH_DIALOG, HOME_DIR_BTN].join(' '), function(e) {
                $inputPath.val(window.HOME_DIR);
                $inputPath.keyup();

                e.stopImmediatePropagation();
            });
        };

        var initReportsOptions = function() {
            $document.on('click', APPLY_REPORTS_OPTIONS_BTN, function(e) {
                var $cont = $(REPORT_OPTIONS),
                    $reportsPathInput = $(REPORTS_PATH_INPUT),
                    reportsPathVal = $reportsPathInput.val();

                UXLog.write('Settings: "Apply reports settings" clicked');

                Util.removeInputMsgs($cont);

                if(!reportsPathVal) {
                    Util.showInputMsg($reportsPathInput, EMPTY_FIELD_TEXT, ERR_MSG_TYPE);
                    return;
                }

                //NOTE: save attribute value for inputs for restore content
                $reportsPathInput.attr('value', reportsPathVal);

                removeMsg();
                createLoadingMsg();
                Util.removeInputMsgs($cont);

                $.post(APPLY_REPORTS_OPTIONS_URL, {
                    reportsPath: reportsPathVal
                }).success(function (warn) {
                    restoreContent(function () {
                        if (warn.hasChanged)
                            showMsg(REPORTS_OPTIONS_UPDATED_TEXT);
                    });
                }).error(function (data) {
                    restoreContent(function () {
                        //NOTE: reinitialisation after inserting content
                        $reportsPathInput = $(REPORTS_PATH_INPUT);
                        Util.showInputMsg($reportsPathInput, data.responseText, ERR_MSG_TYPE);
                    });
                });

                e.stopImmediatePropagation();
            });

            initReportsPathDialog();
        };

        var initNetworkOptions = function () {
            var $hostnameInput = $(HOSTNAME),
                $controlPanelPortInput = $(CONTROL_PANEL_PORT),
                $servicePort1Input = $(SERVICE_PORT1),
                $servicePort2Input = $(SERVICE_PORT2);

            $(PORT_BUSY).each(function (index, input) {
                Util.showInputMsg($(input), PORT_IS_AUTO_DETECTING_TEXT, WARN_MSG_TYPE);
            });

            $(AUTO_DETECT_NETWORK).click(function () {
                var $input = $(this).closest('tr').find('td input[type="text"]');

                if ($(this).prop('checked')) {
                    $input.attr('readonly', 'readonly').addClass(READONLY_CLASS);
                    $(this).attr('checked', 'checked');
                }
                else {
                    $input.removeAttr('readonly').removeClass(READONLY_CLASS);
                    $(this).removeAttr('checked');
                }
            });

            $(APPLY_NETWORK_OPTIONS_BTN).click(function () {
                var $cont = $(SERVER_OPTIONS),
                    hostname = $hostnameInput.val(),
                    controlPanelPort = parseInt($controlPanelPortInput.val()),
                    servicePort1 = parseInt($servicePort1Input.val()),
                    servicePort2 = parseInt($servicePort2Input.val()),
                    options = {};

                var uxLogCbState = [];

                $(AUTO_DETECT_NETWORK).each(function () {
                    uxLogCbState.push(this.id + ':' + $(this).prop('checked'));
                });

                UXLog.write('Settings: "Apply network settings" clicked - ' + uxLogCbState.join(' | '));

                options.hostname = !$hostnameInput.hasClass(READONLY_CLASS) ? hostname : "";
                if (!$servicePort1Input.hasClass(PORT_BUSY_CLASS) || !$servicePort1Input.hasClass(READONLY_CLASS))
                    options.service_port1 = !$servicePort1Input.hasClass(READONLY_CLASS) ? servicePort1 : "";

                if (!$servicePort2Input.hasClass(PORT_BUSY_CLASS) || !$servicePort2Input.hasClass(READONLY_CLASS))
                    options.service_port2 = !$servicePort2Input.hasClass(READONLY_CLASS) ? servicePort2 : "";

                if (!$controlPanelPortInput.hasClass(PORT_BUSY_CLASS) || !$controlPanelPortInput.hasClass(READONLY_CLASS))
                    options.control_panel_port = !$controlPanelPortInput.hasClass(READONLY_CLASS) ? controlPanelPort : "";

                removeMsg();
                Util.removeInputMsgs($cont);
                $(PORT_BUSY).removeClass(PORT_BUSY_CLASS);

                var portsInputArr = [
                    {
                        value: servicePort1,
                        $el: $servicePort1Input
                    },
                    {
                        value: servicePort2,
                        $el: $servicePort2Input
                    },
                    {
                        value: controlPanelPort,
                        $el: $controlPanelPortInput
                    }
                ], isValuesValid = true;

                while (portsInputArr.length > 0) {
                    var port = portsInputArr.pop();

                    if(port.$el.hasClass(READONLY_CLASS))
                        continue;

                    if (!port.value) {
                        Util.showInputMsg(port.$el, EMPTY_FIELD_TEXT, ERR_MSG_TYPE);
                        isValuesValid = false;
                    }

                    if (!portValueIsValid(port.value)) {
                        Util.showInputMsg(port.$el, INVALID_PORT_VALUE_TEXT, ERR_MSG_TYPE);
                        isValuesValid = false;
                    }

                    for (var i = 0, length = portsInputArr.length; i < length; i++) {
                        if (port.value && !portsInputArr[i].$el.hasClass(READONLY_CLASS) && port.value === portsInputArr[i].value) {
                            Util.showInputMsg(port.$el, IDENTICAL_VALUES_TEXT, ERR_MSG_TYPE);
                            Util.showInputMsg(portsInputArr[i].$el, IDENTICAL_VALUES_TEXT, ERR_MSG_TYPE);
                            isValuesValid = false;
                        }
                    }
                }

                if (!hostname) {
                    Util.showInputMsg($hostnameInput, EMPTY_FIELD_TEXT, ERR_MSG_TYPE);
                    isValuesValid = false;
                }

                if (!isValuesValid)
                    return;

                //NOTE: save attribute value for inputs for restore content
                if(hostname)
                    $hostnameInput.attr('value', hostname);
                if(servicePort1)
                    $servicePort1Input.attr('value', servicePort1);
                if(servicePort2)
                    $servicePort2Input.attr('value', servicePort2);
                if(controlPanelPort)
                    $controlPanelPortInput.attr('value', controlPanelPort);

                $(AUTO_DETECT_NETWORK).each(function (index, el) {
                    var $el = $(el);

                    if (!$el.prop('checked'))
                        $el.removeAttr('checked');
                    else
                        $el.prop('checked', 'checked');
                });

                $(INPUTS_NETWORK).each(function(index, el) {
                    var $el = $(el);

                    if(!$el.prop('readonly'))
                        $el.removeAttr('readonly');
                    else
                        $el.attr('readonly', 'readonly');
                });

                createLoadingMsg();

                Util.removeInputMsgs($cont);

                $.post(RESTART_URL, {options: options}).success(function (warn) {
                    restoreContent(function () {
                        if (warn.hasChanged)
                            showMsg(NEED_RESTART_TEXT);

                        if (warn.controlPanelPort && !$controlPanelPortInput.hasClass(READONLY_CLASS))
                            Util.showInputMsg($(CONTROL_PANEL_PORT), PORT_ALREADY_IN_USE_TEXT, WARN_MSG_TYPE);
                        else if (warn.servicePort && !$servicePort1Input.hasClass(READONLY_CLASS))
                            Util.showInputMsg($(SERVICE_PORT1), PORT_ALREADY_IN_USE_TEXT, WARN_MSG_TYPE);
                    });
                }).error(function (data) {
                        restoreContent();
                        showMsg(data.responseText, ERR_MSG_TYPE);
                    });
            });
        };

        var initBrowserOptionsDialog = function () {
            var $cont = $(BROWSER_OPTIONS_DIALOG_CONT),
                $nameInput = $(EDIT_BROWSER_NAME),
                $pathInput = $(EDIT_BROWSER_PATH),
                $cmdInput = $(EDIT_BROWSER_CMD),
                $iconInput = $(ICON_TYPES),
                $iconInputIcons = $iconInput.find('li'),
                $fsTreeView = $(FS_TREEVIEW_CONT),
                $dialogTitleText = null,
                initBrowserName = "";

            $browserOptionsDialog = $cont.dialog({
                autoOpen: false,
                dialogClass: BROWSER_OPTIONS_DIALOG_CLASS,
                width: BROWSER_DIALOG_WIDTH
            });

            $dialogTitleText = $cont.parent().find(UI_DIALOG_TITLE_CONT).find('span');

            var initBrowserDialogOptions = function ($browserOptions) {
                Util.removeInputMsgs($cont);

                if ($browserOptions) {
                    var $tr = $browserOptions.closest('tr'),
                        $icon = $iconInput.find('span.' + $tr.attr(DATA_BROWSER_ICON_ATTR));

                    $dialogTitleText.text(Util.formatText(EDIT_BROWSER_DIALOG_TITLE_TEXT, $tr.attr(DATA_BROWSER_NAME_ATTR)));

                    $nameInput.val($tr.attr(DATA_BROWSER_NAME_ATTR));
                    $pathInput.val($tr.attr(DATA_BROWSER_PATH_ATTR));
                    $cmdInput.val($tr.attr(DATA_BROWSER_CMD_ATTR));

                    initBrowserName = $tr.attr(DATA_BROWSER_NAME_ATTR);

                    $iconInputIcons.removeClass(ICON_CHECKED_CLASS);

                    if ($icon.length)
                        $icon.closest('li').addClass(ICON_CHECKED_CLASS);
                    else
                        $iconInput.find(ICON_UNKNOWN).closest('li').addClass(ICON_CHECKED_CLASS);
                } else {
                    $dialogTitleText.text(ADD_BROWSER_DIALOG_TITLE_TEXT);

                    $nameInput.val('');
                    $pathInput.val('');
                    $cmdInput.val('');
                    $iconInputIcons.removeClass(ICON_CHECKED_CLASS);
                    $iconInput.find(ICON_UNKNOWN).closest('li').addClass(ICON_CHECKED_CLASS);
                    $fsTreeView.html('');
                }
            };

            $document.on('click', EDIT_BROWSER_BTN, function () {
                UXLog.write('Settings: "Modify browser settings" clicked');
                initBrowserDialogOptions($(this));
                $browserOptionsDialog.dialog('open');
            });

            $document.on('click', ADD_BROWSER_BTN, function () {
                UXLog.write('Settings: "Add new browser" clicked');
                initBrowserDialogOptions(null);
                $browserOptionsDialog.dialog('open');
            });

            $iconInputIcons.click(function () {
                $iconInputIcons.removeClass(ICON_CHECKED_CLASS);
                $(this).addClass(ICON_CHECKED_CLASS);
            });

            $(BROWSER_FILE).click(function () {
                $browserOptionsDialog.dialog('close');
                $changeBrowserDialog.dialog('open');
            });

            $(BROWSER_OPTIONS_OK_BTN).click(function () {
                var name = $nameInput.val(),
                    path = $pathInput.val(),
                    cmd = $cmdInput.val(),
                    browserIcon = $iconInputIcons.filter(ICON_CHECKED).attr(DATA_BROWSER_ICON_ATTR);

                Util.removeInputMsgs($cont);

                var browserWithSameName = $([BROWSER_ROW, '[', DATA_BROWSER_NAME_ATTR, '="', name, '"]'].join('')),
                    browserIsAlreadyExists = browserWithSameName.length && name !== initBrowserName;

                if (!name || !path || browserIsAlreadyExists) {
                    if (!name)
                        Util.showInputMsg($nameInput, EMPTY_FIELD_TEXT, ERR_MSG_TYPE);
                    if (!path)
                        Util.showInputMsg($pathInput, EMPTY_FIELD_TEXT, ERR_MSG_TYPE);
                    if (browserIsAlreadyExists)
                        Util.showInputMsg($nameInput, BROWSER_IS_ALREADY_EXISTS, ERR_MSG_TYPE);

                    return;
                }

                configureBrowser(name, initBrowserName, path, cmd, browserIcon, function (err) {
                    if (err) {
                        var $input = err.pathError ? $pathInput : $nameInput,
                            errMsg = err.saveError || BROWSER_PATH_NOT_EXISTS_TEXT;

                        Util.showInputMsg($input, errMsg, ERR_MSG_TYPE);
                        $browserOptionsDialog.dialog('open');
                    } else
                        $browserOptionsDialog.dialog('close');
                });
            });

            $(BROWSER_OPTIONS_CANCEL_BTN).click(function () {
                $browserOptionsDialog.dialog('close');
            });
        };

        var initChangeBrowserDialog = function () {
            var $cont = $(CHANGE_BROWSER_DIALOG),
                $fsTreeView = $(FS_TREEVIEW_CONT),
                $fsTreeViewCont = $fsTreeView.parent(),
                $inputPath = $(CHANGE_BROWSER_INPUT),
                $inputPathNextElm = $inputPath.next(),
                $inputErr = $inputPathNextElm.find(TITLE_CONT),
                browserFile = '',
                inputFocus = false,
                loadItems = function () {
                    $fsTreeViewCont.scrollBar({
                        scrollTo: FS_TREEVIEW_CONT + ' li.' + TREE_ITEM_SELECTED_CLASS,
                        scrollClass: CHANGE_BROWSER_SCROLLBAR_CLASS
                    });
                },
                treeviewOptions = {
                    url: GET_FS_BY_PATH_URL,
                    open: '',
                    effect: 'animate',
                    time: FS_EXPAND_DURATION,
                    asyncAction: loadItems
                };

            $changeBrowserDialog = $cont.dialog({
                autoOpen: false,
                dialogClass: CHANGE_BROWSER_CLASS,
                width: 'auto'
            });

            var clearInputDirErr = function () {
                $inputPath.removeClass(ERR_VALUE_CLASS);
                $inputPathNextElm.hide();
                $inputErr.html();
            };

            $document.on('click', BROWSER_FILE, function () {
                var initValue = $(EDIT_BROWSER_PATH).val();

                $inputPath.val(initValue);
                browserFile = treeviewOptions.open = initValue;

                $changeBrowserDialog.dialog('open');

                $cont.parent().find(UI_DIALOG_TITLE_CONT).draggable();
                $fsTreeViewCont.scrollBar({
                    scrollTo: FS_TREEVIEW_CONT + ' li.' + TREE_ITEM_SELECTED_CLASS,
                    scrollClass: CHANGE_BROWSER_SCROLLBAR_CLASS
                });

                $fsTreeViewCont.resizable({
                    minWidth: CHANGE_BROWSER_DIALOG_WIDTH,
                    minHeight: $fsTreeViewCont.height(),
                    class: RESIZE_MARKER_CHANGE_BROWSER_FILE_CLASS,
                    action: function () {
                        $fsTreeViewCont.scrollBar({
                            scrollClass: CHANGE_BROWSER_SCROLLBAR_CLASS
                        });
                    }
                });

                $fsTreeView.treeView(treeviewOptions);
            });

            $inputPath.focusout(function () {
                inputFocus = false;
            });

            $inputPath.click(function () {
                if (!inputFocus) {
                    inputFocus = true;
                    $(this).select();
                }
            });

            $inputPath.keyup(function (e) {
                treeviewOptions.open = $inputPath.val();
                treeviewOptions.effect = false;
                $fsTreeView.treeView(treeviewOptions);
                treeviewOptions.effect = 'animate';

                if (e.keyCode !== ENTER_BTN_CODE) {
                    $inputPath.removeClass(ERR_VALUE_CLASS);
                    $inputPathNextElm.hide();
                    $inputPathNextElm.find(TITLE_CONT).html();
                }
            });

            $document.on('click', [CHANGE_BROWSER_DIALOG, HOME_DIR_BTN].join(' '), function(e) {
                $inputPath.val(window.HOME_DIR);
                $inputPath.keyup();

                e.stopImmediatePropagation();
            });

            $(CHANGE_BROWSER_OK_BTN).click(function () {
                var inputValue = $inputPath.val();

                $inputPathNextElm.hide();

                if ($.trim(inputValue)) {
                    browserFile = inputValue;
                    $inputPath.val(decodeURIComponent(browserFile));
                }

                clearInputDirErr();
                $changeBrowserDialog.dialog('close');
                $browserOptionsDialog.find(EDIT_BROWSER_PATH).val(inputValue);
                $browserOptionsDialog.dialog('open');
            });

            $(CHANGE_BROWSER_CANCEL_BTN).click(function () {
                $changeBrowserDialog.dialog('close');
                $browserOptionsDialog.dialog('open');
            });

            $document.on('click', FS_TREEVIEW_CONT + ' li', function () {
                browserFile = $(this).attr(PATH_ATTR);
                $inputPath.val(decodeURIComponent(browserFile));
            });
        };

        var initDetectBrowsersBtn = function () {
            $(DETECT_BROWSERS_BTN).click(function () {
                UXLog.write('Settings: "Find installed browsers" clicked');
                detectBrowser();
            });
        };

        var initContent = function () {
            initNetworkOptions();
            initReportsOptions();
            initDetectBrowsersBtn();
            initEnterBtn();
        };

        var initHorizontalScrollHandler = function () {
            $(window).scroll(function () {
                var scrollLeft = $(this).scrollLeft();

                $(HEADER_BACK).css('left', -scrollLeft);
                $(OPTIONS_TAB_CONT).css('left', -scrollLeft);
                $(FOOTER).css('left', -scrollLeft);
            });
        };


        $document.ready(function () {
            UXLog.write('Settings opened');

            initHorizontalScrollHandler();
            initTabs();
            initDeleteBrowserDialog();
            initBrowserOptionsDialog();
            initChangeBrowserDialog();

            initContent();
        });
    };
});
/* global History: true */
/* global io: true */

ControlPanel.define('ProjectView', function (require, exports) {
    require('Widgets.Dialog');
    require('Widgets.Draggable');
    require('Widgets.Resizable');
    require('Widgets.ScrollBar');
    require('Widgets.TreeView');

    var $ = require('jQuery'),
        FixtureEditor = require('Widgets.FixtureEditor'),
        NotificationsList = require('Widgets.NotificationsList'),
        Util = require('Util'),
        UXLog = require('UXLog');

    exports.init = function () {
        //Constants
        var
            FIXTURE_FILE_EXTENSION = '.test.js',
            FIXTURE_FILE_EXTENSION_PATTERN = /\.test\.js$/,
            FILENAME_ILLEGAL_CHARACTERS_PATTERN = /[\\\/:*?"<>|]/g,
            INVALID_URL_CHARACTER_PATTERN = /[!@#&'*,%:;<=>?\[\]^`\{\}]/g,
            ENTER_BTN_CODE = 13,

        //Cookie
            PROJECT_NAVIGATION_STATE_COOKIE = 'project_navigation_state',
            PROJECT_PAGE_STATE_COOKIE = 'project_page_state',
            RUN_DIALOG_STATE_COOKIE = 'run_dialog_state',
            COOKIE_EXPIRED_DAYS = 1,

        //Selectors
            HEADER = '.header',
            FOOTER = '.footer',
            HEADER_BACK = '.header .back',
            NO_TESTS = '.no-tests',
            TOP_BUTTONS = '.fixtures-top-buttons',
            BROWSER = '#project-browser',
            PROJECT_VIEW = '.project-view',
            BUILD_ERRS = '#build-errs',
            BUILD_ERRS_CONTAINER = '.build-errs-container',
            RENAME_DIR_DIALOG_CONT = '#rename-dir-dialog',
            RENAME_DIR_BTN = '#rename-dir-btn',
            RENAME_DIR_INPUT = '#rename-dir-dir-name',
            DELETE_DIR_DIALOG_CONT = '#delete-dir-dialog',
            DELETE_DIR_YES_BTN = '#delete-dir-yes-btn',
            DELETE_DIR_NO_BTN = '#delete-dir-no-btn',
            RENAME_TEST_DIALOG_CONT = '#rename-test-dialog',
            RENAME_TEST_INPUT = '#test-new-name',
            RENAME_TEST_BTN = '#rename-test-btn',
            EDIT_FIXTURE_DIALOG_CONT = '#edit-fixture-dialog',
            EDIT_FIXTURE_OK_BTN = '#edit-fixture-btn',
            EDIT_FIXTURE_NAME_INPUT = '#edit-fixture-name',
            EDIT_FILENAME_INPUT = '#edit-fixture-filename',
            EDIT_FIXTURE_PAGE_INPUT = '#edit-fixture-page',
            EDIT_FIXTURE_AUTH_CREDENTIALS_GROUP = '#edit-fixture-auth-credentials-group',
            EDIT_FIXTURE_SHOW_CREDENTIALS_LINK = '#edit-fixture-show-credentials',
            EDIT_FIXTURE_AUTH_USERNAME_INPUT = '#edit-fixture-auth-username',
            EDIT_FIXTURE_AUTH_PASSWORD_INPUT = '#edit-fixture-auth-password',
            DELETE_FIXTURE_DIALOG_CONT = '#delete-fixture-dialog',
            DELETE_FIXTURE_YES_BTN = '#delete-fixture-yes-btn',
            DELETE_FIXTURE_NO_BTN = '#delete-fixture-no-btn',
            ADD_FIXTURE_DIALOG_CONT = '#add-fixture-dialog',
            ADD_FIXTURE_INPUT_NAME = '#add-fixture-name',
            ADD_FIXTURE_INPUT_FILENAME = '#add-fixture-filename',
            ADD_FIXTURE_INPUT_PAGE = '#add-fixture-page',
            ADD_FIXTURE_OK_BTN = '#add-fixture-btn',
            ADD_FIXTURE_AUTH_CREDENTIALS_GROUP = '#add-fixture-auth-credentials-group',
            ADD_FIXTURE_SHOW_CREDENTIALS_LINK = '#add-fixture-show-credentials',
            ADD_FIXTURE_AUTH_USERNAME_INPUT = '#add-fixture-auth-username',
            ADD_FIXTURE_AUTH_PASSWORD_INPUT = '#add-fixture-auth-password',
            ADD_DIR_CONT = '#add-dir-dialog',
            ADD_DIR_INPUT_DIR_NAME = '#add-dir-name',
            ADD_DIR_OK_BTN = '#add-dir-btn',
            DELETE_TEST_DIALOG_CONT = '#delete-test-dialog',
            DELETE_TEST_YES_BTN = '#delete-test-yes-btn',
            DELETE_TEST_NO_BTN = '#delete-test-no-btn',
            OPEN_PROJECT_CONT = '#open-project-dialog',
            OPEN_PROJECT_OK_BTN = '#open-project-ok',
            OPEN_PROJECT_CANCEL_BTN = '#open-project-cancel',
            MSG_CONTAINER = '#msg-container',
            DIRS_TREEVIEW_CONT = '#fs-tree',
            OPEN_PROJECT_PATH_INPUT = '#input-path',
            BUILD_ERRS_TITLE = '.title',
            BUILD_ERRS_LIST = '.list',
            BUILD_ERRS_EXP_COL_BUTTON = '.expand-collapse-button',
            FIXTURE_ICON = '.fixture-icon',
            FIXTURE_INFO = '.fixture-info',
            FIXTURE_BUTTON = '.fixture-button',
            NAV_LINK = 'a.nav-link',
            NAV_BUTTON = '.nav-button',
            ANIM_CONTAINER = '.anim-container',
            RUN_BUTTON = '.run-button',
            RECORD_BUTTON = '.record-button',
            BROWSER_ROW = '.browser-row',
            REVISION_CONTAINER = '#revision-container',
            EXPANDED = '.expanded',
            BROWSER_ROW_EXPANDED = BROWSER_ROW + EXPANDED,
            RENAME_DIR_BUTTON = '.rename-dir-btn',
            DELETE_DIR_BUTTON = '.delete-dir-btn',
            EDIT_FIXTURE_BUTTON = '.edit-fixture-btn',
            DELETE_FIXTURE_BUTTON = '.delete-fixture-btn',
            RENAME_TEST_BUTTON = '.rename-test-btn',
            DELETE_TEST_BUTTON = '.delete-test-btn',
            ADD_FIXTURE_BTN = '.add-fixture-btn',
            ADD_DIR_BTN = '.add-dir-btn',
            OPEN_PROJECT_BTN = '.open-project-btn',
            UI_DIALOG_TITLE_CONT = '.dialog-header',
            UI_DIALOG_TITLE = '.dialog-header span',
            UI_DIALOG = 'div.dialog',
            UI_DIALOG_BTN = '.button',
            ADD_FIXTURE_DIALOG = '.add-fixture',
            ADD_DIR_DIALOG = '.add-dir',
            OPEN_PROJECT_DIALOG = '.open-project',
            FIXTURE_FILENAME = '.fixture-filename',
            DIALOG_TEXT = '.dialog-text h2',
            BREADCRUMBS = '.breadcrumbs',
            EDIT_FIXTURE_CODE_BTN = '.edit-fixture-code-btn',
            EXPAND_TESTS_GROUP_BTN = '.expand-test-group',
            COLLAPSE_TESTS_GROUP_BTN = '.collapse-test-group',
            TESTS_GROUP = '.group-tests',
            TESTS_GROUP_CONTENT = '.group-tests-content',
            CREATE_PROJECT_DIALOG = '.create-project',
            CREATE_PROJECT_DIALOG_CONT = '#create-project-dialog',
            CREATE_PROJECT_FS_TREEVIEW_CONT = '#create-project-fs-tree',
            PROJECT_PATH_INPUT = '#project-path',
            PROJECT_NAME_INPUT = '#project-name',
            CREATE_PROJECT_BTN = '.create-project-btn',
            CREATE_PROJECT_OK_BTN = '#create-project-ok-btn',
            CREATE_PROJECT_CANCEL_BTN = '#create-project-cancel',
            FIXTURE_TOP_BTNS = '.fixtures-top-buttons',
            EXAMPLE_PROJECT_BTN = '.example-project-btn',
            CLOSE_PROJECT_BTN = '#close-project-btn',
            START_PAGE_CONT = '.start-page-cont',
            HOME_DIR_BTN = '.home-dir',
            WORKER_LIST_DIALOG_WRAPPER = '#worker-list-dialog-wrapper',
            WORKER_LIST_DIALOG = '#worker-list-dialog',
            DIALOG_RUN_BUTTON = '#dialog-run-btn',
            TAKE_SCREENSHOT_OPTION = '#take-screenshot-option',
            FAIL_ON_JS_ERROR_OPTION = '#fail-on-js-errors-option',
            SELECT_ALL_BROWSERS_BTN = '#select-all-browsers',
            DESELECT_ALL_BROWSERS_BTN = '#deselect-all-browsers',
            SELECT_ALL_WORKERS_BTN = '#select-all-workers',
            DESELECT_ALL_WORKERS_BTN = '#deselect-all-workers',
            BROWSER_SELECT = '.select-browser',
            WORKER_SELECT = '.select-worker',
            SELECTED_BROWSER = BROWSER_SELECT + ':checked',
            SELECTED_WORKER = WORKER_SELECT + ':checked',
            RUN_DIALOG_WORKERS_LIST = '.connected-workers-wrap',
            RUN_DIALOG_BROWSERS_LIST = '.browser-workers-wrap',

        //Attrs
            DIR_NAME_ATTR = 'data-dir-name',
            FIXTURE_FILE_ATTR = 'data-fixture-file',
            FIXTURE_NAME_ATTR = 'data-fixture-name',
            FIXTURE_PAGE_ATTR = 'data-fixture-page',
            FIXTURE_PASSWORD_ATTR = 'data-fixture-password',
            FIXTURE_UID_ATTR = 'data-fixtureuid',
            FIXTURE_USERNAME_ATTR = 'data-fixture-username',
            GROUP_NAME_ATTR = 'data-group',
            INPUT_PATH_ATTR = 'data-path',
            SOURCE_ATTR = 'data-source',
            SOURCE_TYPE_ATTR = 'data-source-type',
            TEST_NAME_ATTR = 'data-test-name',
            BROWSER_NAME_ATTR = 'data-browsername',
            WORKER_NAME_ATTR = 'data-workername',

        //Classes
            BROWSER_ROW_EXPANDED_CLASS = 'expanded',
            BTN_COLLAPSE_CLASS = 'collapse',
            BTN_EXPAND_CLASS = 'expand',
            SUCCESS_STATUS_CLASS = 'project-browser-status success',
            WITH_ERRORS_STATUS_CLASS = 'project-browser-status with-errors',
            FAIL_STATUS_CLASS = 'project-browser-status fail',
            UPDATE_STATUS_CLASS = 'project-browser-status update',
            ADD_FIXTURE_CLASS = 'add-fixture',
            ADD_DIR_CLASS = 'add-dir',
            EDIT_FIXTURE_CLASS = 'edit-fixture',
            DELETE_FIXTURE_CLASS = 'delete-fixture',
            RENAME_DIR_CLASS = 'rename-dir',
            DELETE_DIR_CLASS = 'delete-dir',
            RENAME_TEST_CLASS = 'rename-test',
            DELETE_TEST_CLASS = 'delete-test',
            LOADING_MSG_CLASS = 'loading-img',
            AUTO_INPUT_CLASS = 'auto-input',
            HOVER_EMULATION_CLASS = 'hover-emulation',
            GROUP_HEADER_CLASS = 'group-header',
            OPEN_PROJECT_CLASS = 'open-project',
            TREEVIEW_SELECTED_ITEM_CLASS = 'selected',
            OPEN_PROJECT_SCROLLBAR_CLASS = 'open-project-scrollbar',
            RESIZE_MARKER_OPEN_PROJECT_DIALOG_CLASS = 'resize-marker-open-project',
            CREATE_PROJECT_CLASS = 'create-project',
            CREATE_PROJECT_SCROLLBAR_CLASS = 'create-project-scrollbar',
            RESIZE_MARKER_CREATE_PROJECT_CLASS = 'resize-create-project-dialog',
            RUN_DIALOG_WORKERS_SCROLLBAR_CLASS = 'connected-workers-scrollbar',
            RUN_DIALOG_BROWSERS_SCROLLBAR_CLASS = 'browser-workers-scrollbar',

        //Urls
            SLIDE_QUERY_PARAM = '?slide=1',
            REBUILD_REVISION_PARAM = '?rebuild=1',
            RUN_TASK_URL = '/tests_run/',
            START_RECORDING_URL = '/recording/start/',
            TRACK_TASK_URL = '/results/',
            PROJECT_URL = '/project/',
            RENAME_DIR_URL = '/rename_dir/',
            DELETE_DIR_URL = '/delete_dir/',
            CREATE_FIXTURE_URL = '/create_fixture/',
            CREATE_DIR_URL = '/create_dir/',
            EDIT_FIXTURE_URL = '/edit_fixture/',
            DELETE_FIXTURE_URL = '/delete_fixture/',
            RENAME_TEST_URL = '/rename_test/',
            DELETE_TEST_URL = '/delete_test/',
            IDLE_WORKER_URL = '/worker/idle/',
            OPEN_PROJECT_URL = '/open_project/',
            OPEN_EXAMPLE_PROJECT_URL = '/open_project?example=1',
            CLOSE_PROJECT_URL = '/close_project/',
            GET_DIR_BY_PATH_URL = '/dirs_by_path/',
            RETURN_URL_QUERY_PARAM = '?returnUrl=',
            EXPAND_ROW_PARAM = '?expand=',
            CREATE_PROJECT_URL = '/create_project/',
            LIST_WORKERS_URL = '/worker/list?render=1',

        //Status messages
            TASK_START_SUCCESS_MSG = 'Task was successfully started',
            TASK_STARTED_WITH_ERRORS_MSG = 'Task was started with errors',
            TASK_START_FAILED_MSG = 'Failed to start task',
            START_RECORDING_FAILED_MSG = 'Failed to start test recording for the selected test fixture',
            VFS_REBUILDED_MSG = 'File system has been updated',
            CREATE_FIXTURE_SUCCESS_MSG_PATTERN = 'The "{0}" test fixture has been successfully created',
            CREATE_DIR_SUCCESS_MSG_PATTERN = 'The "{0}" directory has been successfully created',
            RENAME_DIR_SUCCESS_MSG_PATTERN = 'The directory has been renamed. <span>Previous name: "{0}".<br/>New name: "{1}".</span>',
            DELETE_DIR_SUCCESS_MSG_PATTERN = 'The "{0}" directory has been successfully deleted',
            EDIT_FIXTURE_SUCCESS_MSG_PATTERN = 'The test fixture has been changed',
            EDIT_FIXTURE_FILENAME_MSG_PATTERN = '<span>Previous file name: "{0}".<br/>New file name: "{1}".</span>',
            EDIT_FIXTURE_NAME_MSG_PATTERN = '<span>Previous name: "{0}".<br/>New name: "{1}".</span>',
            EDIT_FIXTURE_PAGE_MSG_PATTERN = '<span>Previous web page: "{0}".<br/>New web page: "{1}".</span>',
            RENAME_TEST_SUCCESS_MSG_PATTERN = 'Test has been renamed. <span>Previous name: "{0}".<br/>New name: "{1}".</span>',
            DELETE_FIXTURE_SUCCESS_MSG_PATTERN = 'The "{0}" test fixture has been successfully deleted',
            DELETE_TEST_SUCCESS_MSG_PATTERN = 'The "{0}" test has been successfully deleted',
            SAVE_FIXTURE_CODE_SUCCESS_MSG_PATTERN = 'The "{0}" test fixture has been changed',

        //Error msgs
            EMPTY_NAME_ERR_MSG = 'Required field.',
            EMPTY_PAGE_ERR_MSG = 'Required field.',
            EMPTY_FILENAME_ERR_MSG = 'Required field.',
            EMPTY_DIR_NAME_ERR_MSG = 'Required field.',
            EMPTY_AUTH_USERNAME_ERR_MSG = 'Required field.',

        //Ui text
            RENAME_DIR_DIALOG_TITLE_PATTERN = 'Rename directory: "{0}"',
            RENAME_TEST_DIALOG_TITLE_PATTERN = 'Rename test: "{0}"',
            EDIT_FIXTURE_DIALOG_TITLE_PATTERN = 'Modify fixture: "{0}"',
            DELETE_DIALOG_TEXT_PATTERN = 'Are you sure you want to delete "{0}"?',
            FIXTURE_ALREADY_EXISTS_ERR_MSG_PATTERN = 'The "{0}" fixture already exists in the current directory.',

        //Metrics
            BASE_PATH_ARRAY_LENGTH = 4,
            CREATE_PROJECT_DIALOG_HEIGHT = 300,
            CREATE_PROJECT_TREEVIEW_WIDTH = 570,
            DIFFERENCE_BETWEEN_SELECT_AND_CLICK = 5,
            FS_EXPAND_DURATION = 200,
            FS_OPERATION_DIALOG_WIDTH = 610,
            LOADING_MSG_DURATION = 750,
            OPEN_PROJECT_DIALOG_HEIGHT = 300,
            OPEN_PROJECT_TREEVIEW_WIDTH = 560,
            SLIDE_DURATION = 200,
            WORKER_LIST_DIALOG_WIDTH = 570;

        //Globals
        var socket = null,
            $document = $(document),
            $window = $(window),
            $notificationContainer = null,
            $runDialog = null,
            $body = $('html, body'),
            pageTitle = document.title,
            scrollTop = 0,
            fsOperationFlag = false,
            stopObservationForRevision = false,
            fsOperation = {text: '', status: ''},
            expFixtureFilenames = [],
            expGroupFilenames = [],
            activeFixture = null,
            $addFixtureDialog = null,
            $addDialog = null,
            $projectBrowserContent = null,
            slideCallback = null,
            expandedErr = false,
            currentProject = window.CURRENT_PROJECT,
            loadAnimationStartTime = 0;

        //Utils
        var getValidFilename = function (filename) {
            return  filename.replace(FILENAME_ILLEGAL_CHARACTERS_PATTERN, '')
                .replace(/\s/g, '_')
                .toLowerCase();
        };

        var isStartPage = function () {
            return $(START_PAGE_CONT).length;
        };

        var getFixtureRow = function(fixtureName) {
            return $('[' + FIXTURE_NAME_ATTR + '="' + fixtureName + '"]');
        };

        var openTestTarget = function(fixtureName, testName, callback) {
            var $fixture = getFixtureRow(fixtureName);

            if(!testName)
                expandedBrowserRow($fixture.attr(FIXTURE_FILE_ATTR), true, false);
            else {
                expandedBrowserRow($fixture.attr(FIXTURE_FILE_ATTR), false, false);
                var $test =  $fixture.next().find('[' + TEST_NAME_ATTR + '="' + testName + '"]').eq(0);

                $test.effect('pulsate', {times: 1}, 'slow', function() {});
            }

            callback($fixture);
        };

        var expandedBrowserRow = function (fixtureFileName, enableAnimation, goToRow, callback) {
            //NOTE: Fix opera problem :contains filter
            var $titleSearch = $(BROWSER_ROW).filter(function () {
                var fileName = $.trim($(this).attr(FIXTURE_FILE_ATTR));
                return fixtureFileName === fileName;
            });

            if ($titleSearch) {
                $titleSearch.addClass(BROWSER_ROW_EXPANDED_CLASS);
                $titleSearch.find(FIXTURE_ICON).addClass(BTN_COLLAPSE_CLASS);
                if (enableAnimation)
                    $titleSearch.next().find(ANIM_CONTAINER).show('slow', function () {
                        if(goToRow)
                            Util.scrollTo($titleSearch);

                        $titleSearch.effect('pulsate', {times: 1}, 'slow', function() {});
                        $titleSearch.next().effect('pulsate', {times: 1}, 'slow', function() {
                            if (typeof callback === 'function')
                                callback($titleSearch);
                        });
                    });
                else {
                    $titleSearch.next().find(ANIM_CONTAINER).show();
                    if (typeof callback === 'function')
                        callback($titleSearch);
                }
            }
        };

        var expandTestsGroup = function (groupItem) {
            var $fixture = $(BROWSER_ROW).filter(function () {
                var fileName = $.trim($(this).attr(FIXTURE_FILE_ATTR));
                return groupItem.filename === fileName;
            });

            var $tr = $fixture.next().find('tr[' + GROUP_NAME_ATTR + '="' + groupItem.group + '"]');

            $tr.eq(0).hide();
            $tr.eq(1).css('display', 'block');
        };

        var execActionAfterAnimationTimeout = function (action) {
            var animationDuration = (new Date()).getTime() - loadAnimationStartTime;

            var actionByTimeout = function () {
                action();
                loadAnimationStartTime = 0;
            };

            if (animationDuration < LOADING_MSG_DURATION)
                setTimeout(actionByTimeout, LOADING_MSG_DURATION - animationDuration);
            else
                actionByTimeout();
        };

        //Navigation
        var slideToUpperLevel = function () {
            clearDialogData();

            var to = location.href.split('/');

            if (to.length > BASE_PATH_ARRAY_LENGTH)
                to.pop();

            to = to.join('/');

            if (History.enabled)
                History.pushState(null, pageTitle, to);
            else
                location.href = to;
        };

        var slide = function (from, to, disableAnimation) {
            var $container = $(BROWSER).parent(),
                forward = Util.getPathDepth(to) > Util.getPathDepth(from);

            $.cookie(PROJECT_NAVIGATION_STATE_COOKIE, window.location.pathname, { expires: COOKIE_EXPIRED_DAYS, path: PROJECT_URL });
            $.cookie(PROJECT_PAGE_STATE_COOKIE, '', { expires: COOKIE_EXPIRED_DAYS, path: PROJECT_URL });

            $.get([to, SLIDE_QUERY_PARAM].join(''),function (res) {
                if (!disableAnimation)
                    $container.hide('drop', { direction: forward ? 'left' : 'right' }, SLIDE_DURATION, function () {
                        clearDialogData();
                        $container.html(res);

                        $container.show('drop', { direction: forward ? 'right' : 'left' }, SLIDE_DURATION, function () {
                            initContent();

                            if (typeof slideCallback === 'function')
                                slideCallback();
                        });
                    });
                else {
                    clearDialogData();
                    $container.html(res);
                    initContent();

                    if (typeof slideCallback === 'function')
                        slideCallback();
                }
            }).error(function () {
                    slideToUpperLevel();
                });
        };

        var setStartPageOffset = function () {
            var $startPageMsgCont = $(START_PAGE_CONT),
                topMargin = Math.ceil((Util.getContentHeight() - $(BUILD_ERRS_CONTAINER).outerHeight(true) - $startPageMsgCont.height()) / 4);

            if (topMargin > 0 && $startPageMsgCont.length)
                $startPageMsgCont.css('margin-top', topMargin);
        };

        //State management
        var saveState = function () {
            scrollTop = $window.scrollTop();
            expFixtureFilenames = [];
            expGroupFilenames = [];
            expandedErr = $(BUILD_ERRS).find(BUILD_ERRS_LIST).css('display') === 'block';

            $(BROWSER).find(BROWSER_ROW_EXPANDED).each(function () {
                var $expItem = $(this),
                    fixtureFilename = $.trim($expItem.attr(FIXTURE_FILE_ATTR));

                expFixtureFilenames.push(fixtureFilename);
            });

            $(TESTS_GROUP).each(function () {
                var $el = $(this);

                if ($el.css('display') !== 'none')
                    expGroupFilenames.push({
                        group: $el.attr(GROUP_NAME_ATTR),
                        filename: $el.closest('td').attr(FIXTURE_FILE_ATTR)
                    });
            });
        };

        var restoreState = function (enableAnimation) {
            for (var i = 0; i < expFixtureFilenames.length; i++)
                expandedBrowserRow(expFixtureFilenames[i], enableAnimation, false);

            //NOTE: animation for the restoring state of group tests is always disabled
            for (i = 0; i < expGroupFilenames.length; i++)
                expandTestsGroup(expGroupFilenames[i]);

            if (expandedErr) {
                var $buildErrs = $(BUILD_ERRS);

                $buildErrs.find(BUILD_ERRS_LIST).show();
                $buildErrs.find(BUILD_ERRS_EXP_COL_BUTTON).toggleClass(BTN_COLLAPSE_CLASS);
            }

            if (!activeFixture)
                $body.scrollTop(scrollTop);
            else
                expandedBrowserRow(activeFixture, true, true, function () {
                    activeFixture = null;
                });
        };

        var saveStateToCookie = function () {
            saveState();

            var pageState = {
                expFixtureFilenames: expFixtureFilenames,
                expGroupFileNames: expGroupFilenames,
                expandedErr: expandedErr,
                location: window.location.href
            };

            $.cookie(PROJECT_PAGE_STATE_COOKIE, JSON.stringify(pageState), { expires: COOKIE_EXPIRED_DAYS, path: PROJECT_URL });
        };

        var initPageStateFromCookie = function () {
            var pageState = $.cookie(PROJECT_PAGE_STATE_COOKIE);

            if (pageState) {
                pageState = JSON.parse($.cookie(PROJECT_PAGE_STATE_COOKIE));

                if (Util.cutQueryString(pageState.location) === Util.cutQueryString(window.location.href)) {
                    expFixtureFilenames = pageState.expFixtureFilenames;
                    expGroupFilenames = pageState.expGroupFileNames;
                    expandedErr = pageState.expandedErr;

                    restoreState(false);
                }
            }
        };

        var setInCenter = function ($elm) {
            var $projectView = $(PROJECT_VIEW),
                topMargin = (Util.getContentHeight() - $(TOP_BUTTONS).height() - $(BUILD_ERRS_CONTAINER).outerHeight(false) - $projectView.outerHeight(true) + $projectView.innerHeight() - $elm.height()) / 2;

            if (topMargin > 0)
                $elm.css('margin-top', topMargin - $(BREADCRUMBS).height());

            var leftMargin = ($(REVISION_CONTAINER).outerWidth(false) - $elm.width()) / 2;

            if (leftMargin > 0)
                $elm.css('margin-left', leftMargin);
        };

        //Loading message for file operations.
        var createLoadingMsg = function () {
            var $revisionContainer = $(REVISION_CONTAINER);

            $projectBrowserContent = $revisionContainer.html();

            var $loadingMsgContent = $('<div></div>')
                .addClass(LOADING_MSG_CLASS);

            $notificationContainer.removeFixedState();
            $(BUILD_ERRS).html('');
            $(BROWSER).html($loadingMsgContent);

            hideTopPanel();
            $notificationContainer.clearList();
            setInCenter($loadingMsgContent);

            loadAnimationStartTime = (new Date()).getTime();
        };

        var restoreContent = function () {
            var restore = function () {
                $(REVISION_CONTAINER).html($projectBrowserContent);
                showTopPanel();
                initBuildErrs();
                initContent();
            };

            execActionAfterAnimationTimeout(restore);
        };

        //Dialogs
        var createAddFixtureDialog = function () {
            $addFixtureDialog = $(ADD_FIXTURE_DIALOG_CONT).dialog({
                autoOpen: false,
                dialogClass: ADD_FIXTURE_CLASS,
                width: FS_OPERATION_DIALOG_WIDTH
            });
        };

        var createDirDialog = function () {
            $addDialog = $(ADD_DIR_CONT).dialog({
                autoOpen: false,
                dialogClass: ADD_DIR_CLASS,
                width: FS_OPERATION_DIALOG_WIDTH
            });
        };

        var clearDialogData = function (clearAllDialogs) {
            if (clearAllDialogs)
                $(UI_DIALOG).find('.dialog-content').dialog('destroy');
            else
                $(UI_DIALOG).not(ADD_FIXTURE_DIALOG).not(ADD_DIR_DIALOG)
                    .not(OPEN_PROJECT_DIALOG).not(CREATE_PROJECT_DIALOG).find('.dialog-content').dialog('destroy');
        };

        //VFS operations
        var addFixture = function (fixtureName, fixtureFilename, fixturePage, fixtureUsername, fixturePassword, callback) {
            fsOperationFlag = true;
            activeFixture = fixtureFilename;
            saveState();
            createLoadingMsg();

            var curPath = Util.getCurPath();

            $.post(CREATE_FIXTURE_URL,
                {   curPath: curPath,
                    fixtureName: fixtureName,
                    filename: fixtureFilename,
                    fixturePage: fixturePage,
                    fixtureUsername: fixtureUsername,
                    fixturePassword: fixturePassword
                },
                function () {
                    fsOperation = {text: Util.formatText(CREATE_FIXTURE_SUCCESS_MSG_PATTERN, fixtureName), status: 'success'};

                    callback();

                }).error(function (data) {
                    fsOperationFlag = false;
                    restoreContent();

                    callback(data.responseText);
                });
        };

        var addDir = function (dirName, callback) {
            fsOperationFlag = true;
            saveState();
            createLoadingMsg();

            var curPath = Util.getCurPath();

            $.post(CREATE_DIR_URL,
                {   curPath: curPath,
                    dirName: dirName
                },
                function () {
                    fsOperation = {text: Util.formatText(CREATE_DIR_SUCCESS_MSG_PATTERN, dirName), status: 'success'};

                    callback();
                }).error(function (data) {
                    fsOperationFlag = false;
                    restoreContent();
                    callback(data.responseText);
                });
        };

        var renameDir = function (dirName, newName, callback) {
            fsOperationFlag = true;
            saveState();
            createLoadingMsg();

            var curPath = Util.getCurPath() + '/' + dirName;

            $.post(RENAME_DIR_URL,
                {   curPath: curPath,
                    newName: newName
                },
                function () {
                    fsOperation = {text: Util.formatText(RENAME_DIR_SUCCESS_MSG_PATTERN, dirName, newName), status: 'success'};

                    callback();
                }).error(function (data) {
                    fsOperationFlag = false;
                    restoreContent();
                    callback(data.responseText);
                });
        };

        var deleteDir = function (dirName) {
            fsOperationFlag = true;
            saveState();
            createLoadingMsg();

            var curPath = Util.getCurPath() + '/' + dirName;

            $.post(DELETE_DIR_URL, {curPath: curPath},function () {
                fsOperation = {text: Util.formatText(DELETE_DIR_SUCCESS_MSG_PATTERN, dirName), status: 'success'};
            }).error(function (data) {
                    fsOperationFlag = false;
                    restoreContent();
                    $notificationContainer.showPermanentErrorMsg(data.responseText);
                });
        };

        var editFixture = function (oldFilename, newFilename, oldName, newName, oldPage, newPage, newUsername, newPassword, callback) {
            fsOperationFlag = true;
            saveState();
            createLoadingMsg();

            var curPath = Util.getCurPath();

            $.post(EDIT_FIXTURE_URL,
                {   curPath: curPath,
                    newName: newName,
                    newPage: newPage,
                    oldFilename: oldFilename,
                    newFilename: newFilename,
                    newUsername: newUsername,
                    newPassword: newPassword
                },
                function () {
                    var text = EDIT_FIXTURE_SUCCESS_MSG_PATTERN +
                        (oldName === newName ? '' : Util.formatText(EDIT_FIXTURE_NAME_MSG_PATTERN, oldName, newName)) +
                        (oldFilename === newFilename ? '' : Util.formatText(EDIT_FIXTURE_FILENAME_MSG_PATTERN, oldFilename, newFilename)) +
                        (oldPage === newPage ? '' : Util.formatText(EDIT_FIXTURE_PAGE_MSG_PATTERN, oldPage, newPage));
                    fsOperation = {text: text, status: 'success'};

                    callback();
                }).error(function (data) {
                    fsOperationFlag = false;
                    restoreContent();
                    callback(data.responseText);
                });
        };

        var deleteFixture = function (fixtureFilename, fixtureName) {
            fsOperationFlag = true;
            saveState();
            createLoadingMsg();

            var curPath = Util.getCurPath();

            $.post(DELETE_FIXTURE_URL,
                {   curPath: curPath,
                    fixtureFilename: fixtureFilename
                },
                function () {
                    fsOperation = {text: Util.formatText(DELETE_FIXTURE_SUCCESS_MSG_PATTERN, fixtureName), status: 'success'};
                }).error(function (data) {
                    fsOperationFlag = false;
                    restoreContent();
                    $notificationContainer.showPermanentErrorMsg(data.responseText);
                });
        };

        var renameTest = function (filename, oldName, newName, callback) {
            fsOperationFlag = true;
            saveState();
            createLoadingMsg();

            var curPath = Util.getCurPath();

            $.post(RENAME_TEST_URL,
                {curPath: curPath,
                    filename: filename,
                    oldName: oldName,
                    newName: newName
                },
                function () {
                    fsOperation = {text: Util.formatText(RENAME_TEST_SUCCESS_MSG_PATTERN, oldName, newName), status: 'success'};

                    callback();
                }).error(function (data) {
                    fsOperationFlag = false;
                    restoreContent();
                    callback(data.responseText);
                });
        };

        var deleteTest = function (filename, testName) {
            fsOperationFlag = true;
            saveState();
            createLoadingMsg();

            var curPath = Util.getCurPath();

            $.post(DELETE_TEST_URL,
                {
                    curPath: curPath,
                    filename: filename,
                    testName: testName
                },
                function () {
                    fsOperation = {text: Util.formatText(DELETE_TEST_SUCCESS_MSG_PATTERN, testName), status: 'success'};
                }).error(function (data) {
                    fsOperationFlag = false;
                    restoreContent();
                    $notificationContainer.showPermanentErrorMsg(data.responseText);
                }
            );
        };

        var createProject = function (projectPath, name, $createProjectDialog, callback) {
            saveState();
            createLoadingMsg();
            $createProjectDialog.dialog('close');

            $.post(CREATE_PROJECT_URL,
                {
                    projectPath: projectPath,
                    name: name
                }, callback).error(function (data) {
                    $createProjectDialog.dialog('open');
                    restoreContent();
                    callback(data.responseText);
                }
            );
        };

        var clearNavigationState = function () {
            $.cookie(PROJECT_PAGE_STATE_COOKIE, '', { expires: COOKIE_EXPIRED_DAYS, path: PROJECT_URL });
            $.cookie(PROJECT_NAVIGATION_STATE_COOKIE, '', { expires: COOKIE_EXPIRED_DAYS, path: PROJECT_URL });
        };

        var openProject = function (projectName, $openProejctDialog, callback) {
            clearNavigationState();
            createLoadingMsg();
            $openProejctDialog.dialog('close');

            $.post(OPEN_PROJECT_URL, {projectName: projectName}, callback, 'text').error(function (data) {
                $openProejctDialog.dialog('open');
                fsOperationFlag = false;
                restoreContent();
                callback(data.responseText);
            });
        };

        //Run task
        var runTask = function (opt) {
            var runXhr = $.ajax({
                type: 'POST',
                url: RUN_TASK_URL,
                data: {opt: opt}
            });

            runXhr.always(function () {
                var res = JSON.parse(runXhr.responseText);

                if (res.workerName && !res.errs.length) {
                    location.href = IDLE_WORKER_URL + res.workerName + RETURN_URL_QUERY_PARAM + location.href;
                    return;
                }

                $.each(res.errs, function () {
                    $notificationContainer.showPermanentErrorMsg(this);
                });

                var statusClassName = {
                        'success': SUCCESS_STATUS_CLASS,
                        'with-errors': WITH_ERRORS_STATUS_CLASS,
                        'fail': FAIL_STATUS_CLASS
                    }[res.status],
                    statusText = {
                        'success': TASK_START_SUCCESS_MSG,
                        'with-errors': TASK_STARTED_WITH_ERRORS_MSG,
                        'fail': TASK_START_FAILED_MSG
                    }[res.status],
                    $statusContent = $('<span></span>').text(statusText),
                    taskResultsLink = TRACK_TASK_URL + res.taskUid;

                if (res.status !== 'fail')
                    $notificationContainer.showStatus(statusClassName, $statusContent, taskResultsLink);
                else
                    $notificationContainer.showStatus(statusClassName, $statusContent);
            });
        };

        //Handle filename input
        var filenameInputHandler = function ($nameInput, $filenameInput) {
            var filenameChanged = false,
                tmpFilename = '';

            $filenameInput.addClass(AUTO_INPUT_CLASS);

            var nameInputHandler = function () {
                if (!filenameChanged)
                    $filenameInput.val(getValidFilename($nameInput.val() + FIXTURE_FILE_EXTENSION));
            };

            var filenameInputHandler = function () {
                if ($filenameInput.val() && $filenameInput.val() !== getValidFilename($nameInput.val() + FIXTURE_FILE_EXTENSION)) {
                    filenameChanged = true;
                    $filenameInput.removeClass(AUTO_INPUT_CLASS);
                }
            };

            $nameInput.keypress(function () {
                nameInputHandler();
            });

            $nameInput.keyup(function () {
                nameInputHandler();
            });

            $filenameInput.keypress(function () {
                filenameInputHandler();
            });

            $filenameInput.keyup(function () {
                filenameInputHandler();
            });

            $filenameInput.focusin(function () {
                if (!filenameChanged)
                    tmpFilename = $filenameInput.val();
            });

            $filenameInput.focusout(function () {
                var filenameValue = $filenameInput.val();

                if (!filenameChanged || !filenameValue) {
                    $filenameInput.val(tmpFilename);
                    $filenameInput.addClass(AUTO_INPUT_CLASS);
                    filenameChanged = false;
                }
                else if (!(new RegExp(FIXTURE_FILE_EXTENSION_PATTERN)).test(filenameValue))
                    $filenameInput.val((filenameValue + FIXTURE_FILE_EXTENSION));
            });
        };

        var cutNotUrlChars = function ($input) {
            if (INVALID_URL_CHARACTER_PATTERN.test($input.val()))
                $input.val($input.val().replace(INVALID_URL_CHARACTER_PATTERN, ''));
        };

        //Handle directory name input
        var dirnameInputHandler = function ($nameInput) {
            $nameInput.keypress(function (e) {
                if (Util.isNotHotKey(e))
                    cutNotUrlChars($nameInput);
            });

            $nameInput.keyup(function (e) {
                if (Util.isNotHotKey(e))
                    cutNotUrlChars($nameInput);
            });
        };

        //HTTP Basic / NTLM authentication group
        var initAuthCredentialsGroup = function (group, link) {
            var $group = $(group),
                $groupHeader = $group.find('.' + GROUP_HEADER_CLASS),
                $authCredentialsTable = $group.find('table'),
                $showCredentialsLink = $(link),
                $expandCollapseButton = $showCredentialsLink.next();

            var showAuthCredentials = function () {
                $authCredentialsTable.css('display', '');
                $expandCollapseButton.addClass(BTN_COLLAPSE_CLASS);
                $expandCollapseButton.removeClass(BTN_EXPAND_CLASS);
            };

            var hideAuthCredentials = function () {
                $authCredentialsTable.css('display', 'none');
                $expandCollapseButton.removeClass(BTN_COLLAPSE_CLASS);
                $expandCollapseButton.addClass(BTN_EXPAND_CLASS);
            };

            var onShowCredentialsClick = function () {
                if ($authCredentialsTable.is(':visible'))
                    hideAuthCredentials();
                else
                    showAuthCredentials();
            };

            //NOTE: check is group was inited before
            if (!($expandCollapseButton.hasClass(BTN_COLLAPSE_CLASS) || $expandCollapseButton.hasClass(BTN_EXPAND_CLASS)))
                $groupHeader.bind('click', onShowCredentialsClick);

            hideAuthCredentials();
        };

        //Initialization
        var initFixtureButtons = function () {
            $(FIXTURE_BUTTON).click(function () {
                var $fixtureTr = $(this).parents(BROWSER_ROW).first(),
                    $btn = $fixtureTr.find(FIXTURE_ICON),
                    fixtureUid = $fixtureTr.attr(FIXTURE_UID_ATTR);

                $btn.toggleClass(BTN_COLLAPSE_CLASS);
                $fixtureTr.toggleClass(BROWSER_ROW_EXPANDED_CLASS);

                var $fixtureInfoTr = $(FIXTURE_INFO).filter(function () {
                    return $(this).attr(FIXTURE_UID_ATTR) === fixtureUid;
                });

                $fixtureInfoTr.find(ANIM_CONTAINER).toggle('fast', function () {
                    if ($fixtureInfoTr.find(ANIM_CONTAINER).css('display') === 'none')
                        $fixtureTr.removeClass(HOVER_EMULATION_CLASS);
                });

                saveStateToCookie();
            });

            var fixtureButtonsTouchHandle = function ($elm) {
                $elm.parents(BROWSER_ROW).first().addClass(HOVER_EMULATION_CLASS);
            };

            var animationSpeed = 'fast';

            $(EXPAND_TESTS_GROUP_BTN).click(function () {
                var $groupHeader = $(this).closest('tr'),
                    $groupTests = $groupHeader.next(),
                    $groupTestsContent = $groupTests.find(TESTS_GROUP_CONTENT),
                    groupHeaderHeight = $groupHeader.height();

                //NOTE: Animation step 1: show one row and hide group header
                $groupTests.css('display', 'block');

                $groupTestsContent.css({
                    height: groupHeaderHeight,
                    overflow: 'hidden'
                });

                $groupHeader.hide();

                //NOTE: Animation step 2: expand div
                var contentHeight = $groupTestsContent[0].scrollHeight;

                $groupTestsContent.scrollTop((contentHeight - groupHeaderHeight) / 2);

                $groupTestsContent.animate({
                    height: contentHeight,
                    scrollTop: 0
                }, animationSpeed, function () {
                    $groupTestsContent.css({
                        overflow: 'auto',
                        height: 'auto'
                    });
                });

                //NOTE: Animation step 3: run window offset animate in parallel for tests list.
                $body.animate({
                    scrollTop: Util.getBodyScrollTop() + contentHeight / 2
                }, animationSpeed);

                saveStateToCookie();
            });

            $(COLLAPSE_TESTS_GROUP_BTN).click(function () {
                var $groupTests = $(this).closest('tr'),
                    $groupTestsContent = $groupTests.find(TESTS_GROUP_CONTENT),
                    $groupHeader = $groupTests.prev(),
                    groupHeaderHeight = $groupHeader.height(),
                    contentHeight = $groupTestsContent[0].scrollHeight;

                //NOTE: Animation step 1: collapse tests list and show group header
                $groupTestsContent.css('overflow', 'hidden');

                $groupTestsContent.animate({
                    height: groupHeaderHeight,
                    scrollTop: (contentHeight - groupHeaderHeight) / 2
                }, animationSpeed, function () {
                    $groupHeader.show();
                    $groupTests.hide();

                    $groupTestsContent.css('overflow', 'auto');

                    saveStateToCookie();
                });

                //NOTE: Animation step 2:  run window offset animate in parallel for tests list.
                $body.animate({
                    scrollTop: Util.getBodyScrollTop() - contentHeight / 2
                }, animationSpeed);
            });

            //NOTE: touch device support
            $(FIXTURE_BUTTON).on('touchstart', function () {
                fixtureButtonsTouchHandle($(this));
            });

            $(FIXTURE_BUTTON).on('MSPointerDown', function () {
                if (window.navigator.msMaxTouchPoints)
                    fixtureButtonsTouchHandle($(this));
            });
        };

        var restoreRunDialogState = function () {
            var cookieValue = $.cookie(RUN_DIALOG_STATE_COOKIE),
                dialogState = {};

            if (cookieValue) {
                try{
                    dialogState = JSON.parse(cookieValue);

                    if(!dialogState || typeof dialogState !== 'object' || $.isArray(dialogState))
                        dialogState = {};
                } catch(e) {
                    //NOTE: fallback if format of dialog state is incorrect
                }
            }

            for(var checkboxId in dialogState) {
                if(dialogState.hasOwnProperty(checkboxId)) {
                    var $checkbox = $('input[id="' + checkboxId + '"]');

                    if(!$checkbox.attr('disabled') && !$checkbox.attr('readonly'))
                        $checkbox.prop('checked', dialogState[checkboxId]);
                }
            }
        };

        var saveRunDialogState = function () {
            var checkedElms = {};

            $(WORKER_LIST_DIALOG).find('input[type="checkbox"]').each(function (index, value) {
                var $item = $(value),
                    id = $item.attr('id');

                checkedElms[id] = $item.prop('checked');
            });

            $.cookie(RUN_DIALOG_STATE_COOKIE, JSON.stringify(checkedElms), { expires: COOKIE_EXPIRED_DAYS});
        };

        var initRunButtons = function () {
            $(RUN_BUTTON).click(function () {
                var $btn = $(this);

                $(WORKER_LIST_DIALOG_WRAPPER).load(LIST_WORKERS_URL, function () {
                    $runDialog = $(WORKER_LIST_DIALOG).dialog({
                        width: WORKER_LIST_DIALOG_WIDTH,
                        close: function () {
                            $runDialog
                                .dialog('destroy');
                        }
                    });

                    var $workersList = $(RUN_DIALOG_WORKERS_LIST),
                        $browsersList = $(RUN_DIALOG_BROWSERS_LIST);

                    if ($workersList.length)
                        $workersList.scrollBar({
                            scrollClass: RUN_DIALOG_WORKERS_SCROLLBAR_CLASS
                        });

                    if ($browsersList.length)
                        $browsersList.scrollBar({
                            scrollClass: RUN_DIALOG_BROWSERS_SCROLLBAR_CLASS
                        });

                    restoreRunDialogState();

                    var $dialogBtn = $runDialog.find(DIALOG_RUN_BUTTON);

                    $(SELECT_ALL_BROWSERS_BTN).click(function () {
                        $(BROWSER_SELECT).prop('checked', true);
                        saveRunDialogState();
                    });

                    $(DESELECT_ALL_BROWSERS_BTN).click(function () {
                        $(BROWSER_SELECT).prop('checked', false);
                        saveRunDialogState();
                    });

                    $(SELECT_ALL_WORKERS_BTN).click(function () {
                        $(WORKER_SELECT).prop('checked', true);
                        saveRunDialogState();
                    });

                    $(DESELECT_ALL_WORKERS_BTN).click(function () {
                        $(WORKER_SELECT).prop('checked', false);
                        saveRunDialogState();
                    });

                    $runDialog.find('input[type="checkbox"]').click(function () {
                        saveRunDialogState();
                    });

                    $dialogBtn.click(function () {
                        //NOTE: encodeURI for 'source'-parameter, because it may contain dir path
                        var opt = {
                            sourceType: $btn.attr(SOURCE_TYPE_ATTR),
                            source: encodeURI($btn.attr(SOURCE_ATTR)),
                            workers: [],
                            browsers: [],
                            location: location.href,
                            takeScreenshotOnFails: $runDialog.find(TAKE_SCREENSHOT_OPTION).is(':checked') ? 'true' : 'false',
                            failOnJsErrors: $runDialog.find(FAIL_ON_JS_ERROR_OPTION).is(':checked') ? 'true' : 'false'
                        };

                        if ($btn.attr(SOURCE_TYPE_ATTR) === 'group') {
                            opt.source = [];

                            $btn.closest('tr').next().find(RUN_BUTTON).each(function () {
                                opt.source.push($(this).attr(SOURCE_ATTR));
                            });

                            opt.groupName = $btn.attr(GROUP_NAME_ATTR);
                        }

                        $runDialog.find(SELECTED_BROWSER).each(function () {
                            opt.browsers.push($(this).attr(BROWSER_NAME_ATTR));
                        });

                        $runDialog.find(SELECTED_WORKER).each(function () {
                            opt.workers.push($(this).attr(WORKER_NAME_ATTR));
                        });

                        UXLog.write('Project: run task ec:' +
                            ' br:' + opt.browsers.length +
                            ' cw:' + opt.workers.length);

                        runTask(opt);

                        $runDialog.dialog('close');

                        return false;
                    });
                });
            });
        };

        var initRecordButtons = function () {
            $(RECORD_BUTTON).click(function () {
                UXLog.write('Project: recorder started');

                createLoadingMsg();

                var $btn = $(this),
                    fixtureUid = $btn.attr(FIXTURE_UID_ATTR);

                var jqxhr = $.ajax({
                    type: 'POST',
                    url: START_RECORDING_URL,
                    data: {
                        fixtureUid: fixtureUid,
                        returnUrl: window.location.href.split('?')[0]
                    }
                });


                jqxhr.done(function (res) {
                    if (socket)
                        socket.disconnect();

                    window.location.href = res;
                });

                jqxhr.fail(function () {
                    var $statusContent = $('<span></span>').text(START_RECORDING_FAILED_MSG);

                    restoreContent();
                    $notificationContainer.showPermanentErrorMsg(jqxhr.responseText);
                    $notificationContainer.showStatus(FAIL_STATUS_CLASS, $statusContent);
                });

            });
        };

        //Dialog utils
        var createInputSelectHandler = function ($input) {
            var inputFocus = false,
                inputStartCursorPositionX = 0;

            $input.focusout(function () {
                inputFocus = false;
            });

            $input.mousedown(function (e) {
                inputStartCursorPositionX = e.clientX;
            });

            $input.mouseup(function (e) {
                if (Math.abs(e.clientX - inputStartCursorPositionX) < DIFFERENCE_BETWEEN_SELECT_AND_CLICK && !inputFocus)
                    $(this).select();

                inputFocus = true;
            });
        };

        var initEnterBtnHandler = function () {
            $(UI_DIALOG).find('input').keypress(function (e) {
                if (e.which === ENTER_BTN_CODE) {
                    $(this).closest(UI_DIALOG).find(UI_DIALOG_BTN).last().click();
                    e.stopImmediatePropagation();
                }
            });
        };

        //Init dialogs

        var initOpenExampleProject = function () {
            UXLog.write('Project: Example project opened');
            $document.on('click', EXAMPLE_PROJECT_BTN, function () {
                clearNavigationState();
                createLoadingMsg();

                $.post(OPEN_EXAMPLE_PROJECT_URL,function () {
                }).error(function (data) {
                        $notificationContainer.showPermanentErrorMsg(data.responseText);
                    });
            });
        };

        var initCloseProject = function () {
            UXLog.write('Project: Project closed');
            $(CLOSE_PROJECT_BTN).click(function () {
                $notificationContainer.clearList();
                hideTopPanel();
                clearNavigationState();
                createLoadingMsg();

                $.post(CLOSE_PROJECT_URL,function () {
                    var restore = function () {
                        clearDialogData();

                        $.cookie(PROJECT_NAVIGATION_STATE_COOKIE, '', { expires: COOKIE_EXPIRED_DAYS, path: PROJECT_URL });
                        $.cookie(PROJECT_PAGE_STATE_COOKIE, '', { expires: COOKIE_EXPIRED_DAYS, path: PROJECT_URL });
                        $notificationContainer.hide();

                        if (History.enabled) {
                            if (window.location.pathname === PROJECT_URL) {
                                slideCallback = initStartPageMsg;
                                slide(window.location.href, PROJECT_URL, true);
                            }
                            else
                                History.replaceState(null, pageTitle, PROJECT_URL);
                        }
                        else
                            window.location.href = PROJECT_URL;
                    };

                    execActionAfterAnimationTimeout(restore);
                }, 'text').error(function (data) {
                        restoreContent();
                        $notificationContainer.showPermanentErrorMsg(data.responseText);
                    });
            });
        };

        var initRenameTestDialog = function () {
            var $renameDialog = null,
                $btn = null,
                $cont = $(RENAME_TEST_DIALOG_CONT),
                $testNameInput = $(RENAME_TEST_INPUT),
                filename = '',
                oldName = '';

            $renameDialog = $cont.dialog({
                autoOpen: false,
                dialogClass: RENAME_TEST_CLASS,
                width: FS_OPERATION_DIALOG_WIDTH
            });

            $(RENAME_TEST_BUTTON).click(function () {
                $btn = $(this);
                filename = $btn.closest(FIXTURE_INFO).parent().prev().attr(FIXTURE_FILE_ATTR);
                oldName = $btn.closest('tr').attr(TEST_NAME_ATTR);

                var title = Util.formatText(RENAME_TEST_DIALOG_TITLE_PATTERN, oldName);

                UXLog.write('Project: rename test dialog opened');

                $cont.parent().find(UI_DIALOG_TITLE).html(title);
                $renameDialog.dialog('open');
                Util.removeInputMsgs($cont);
                $cont.find('input').val(oldName).select();
            });

            $(RENAME_TEST_BTN).click(function (event) {
                var newName = $testNameInput.val();

                Util.removeInputMsgs($cont);

                if (!$.trim(newName) || newName === oldName) {
                    if (!$.trim(newName))
                        Util.showInputMsg($testNameInput, EMPTY_NAME_ERR_MSG);

                    if (newName === oldName) {
                        $cont.find('input').focusout();
                        $renameDialog.dialog('close');
                    }
                } else {
                    $cont.find('input').focusout();
                    $renameDialog.dialog('close');

                    renameTest(filename, oldName, newName, function (renameErr) {
                        if (!renameErr)
                            $cont.find('input').val('');
                        else
                            $renameDialog.dialog('open');
                        Util.showInputMsg($testNameInput, renameErr);
                    });
                }

                event.stopImmediatePropagation();
            });
        };

        var initDeleteTestDialog = function () {
            var $deleteDialog = null,
                $btn = null,
                filename = '',
                testName = '',
                $cont = $(DELETE_TEST_DIALOG_CONT);

            $deleteDialog = $cont.dialog({
                autoOpen: false,
                dialogClass: DELETE_TEST_CLASS,
                width: FS_OPERATION_DIALOG_WIDTH
            });

            $(DELETE_TEST_BUTTON).click(function () {
                $btn = $(this);
                filename = $btn.closest(FIXTURE_INFO).parent().prev().attr(FIXTURE_FILE_ATTR);
                testName = $btn.closest('tr').attr(TEST_NAME_ATTR);

                UXLog.write('Project: delete test dialog opened');
                $cont.find(DIALOG_TEXT).text(Util.formatText(DELETE_DIALOG_TEXT_PATTERN, testName));
                $deleteDialog.dialog('open');
            });

            $(DELETE_TEST_YES_BTN).click(function () {
                deleteTest(filename, testName);
                $deleteDialog.dialog('close');
            });

            $(DELETE_TEST_NO_BTN).click(function () {
                $deleteDialog.dialog('close');
            });
        };

        var initAddFixtureDialog = function () {
            var $cont = $(ADD_FIXTURE_DIALOG_CONT),
                $nameInput = $(ADD_FIXTURE_INPUT_NAME),
                $filenameInput = $(ADD_FIXTURE_INPUT_FILENAME),
                $pageInput = $(ADD_FIXTURE_INPUT_PAGE),
                $usernameInput = $(ADD_FIXTURE_AUTH_USERNAME_INPUT),
                $passwordInput = $(ADD_FIXTURE_AUTH_PASSWORD_INPUT);

            $(ADD_FIXTURE_BTN).click(function () {
                initAuthCredentialsGroup(ADD_FIXTURE_AUTH_CREDENTIALS_GROUP, ADD_FIXTURE_SHOW_CREDENTIALS_LINK);
                $addFixtureDialog.dialog('open');
                $cont.find('input').val('');
                Util.removeInputMsgs($cont);
                filenameInputHandler($nameInput, $filenameInput);
            });

            $document.on('click', ADD_FIXTURE_OK_BTN, function (event) {
                var fixtureName = $nameInput.val(),
                    fixtureFilename = $filenameInput.val(),
                    fixturePage = $pageInput.val(),
                    username = $usernameInput.val(),
                    password = $passwordInput.val();

                Util.removeInputMsgs($cont);

                var fixtureAlreadyExists = getFixtureRow(fixtureName).length;

                if (!$.trim(fixtureName) || fixtureAlreadyExists || !$.trim(fixturePage) || !$.trim(fixtureFilename) || (!$.trim(username) && $.trim(password))) {
                    if (!$.trim(fixtureName))
                        Util.showInputMsg($nameInput, EMPTY_NAME_ERR_MSG);

                    if (fixtureAlreadyExists)
                        Util.showInputMsg($nameInput, Util.formatText(FIXTURE_ALREADY_EXISTS_ERR_MSG_PATTERN, fixtureName));

                    if (!$.trim(fixturePage))
                        Util.showInputMsg($pageInput, EMPTY_PAGE_ERR_MSG);

                    if (!$.trim(fixtureFilename))
                        Util.showInputMsg($filenameInput, EMPTY_FILENAME_ERR_MSG);

                    if (!$.trim(username) && $.trim(password))
                        Util.showInputMsg($usernameInput, EMPTY_AUTH_USERNAME_ERR_MSG);
                } else {
                    $addFixtureDialog.dialog('close');

                    addFixture(fixtureName, fixtureFilename, $.trim(fixturePage), $.trim(username), password, function (addFixtureErr) {
                        UXLog.write('Project: New fixture created via "New fixture" dialog');

                        if (!addFixtureErr)
                            $cont.find('input').val('');
                        else {
                            $addFixtureDialog.dialog('open');
                            Util.showInputMsg($filenameInput, addFixtureErr);
                        }
                    });
                }

                event.stopImmediatePropagation();
            });
        };

        var initAddDirDialog = function () {
            var $cont = $(ADD_DIR_CONT),
                $dirNameInput = $(ADD_DIR_INPUT_DIR_NAME);

            $(ADD_DIR_BTN).click(function () {
                $addDialog.dialog('open');
                $cont.find('input').val('');
                Util.removeInputMsgs($cont);
            });

            dirnameInputHandler($dirNameInput);

            $(ADD_DIR_OK_BTN).click(function (event) {
                cutNotUrlChars($dirNameInput);

                var dirName = $dirNameInput.val();

                Util.removeInputMsgs($cont);

                if (!$.trim(dirName))
                    Util.showInputMsg($dirNameInput, EMPTY_DIR_NAME_ERR_MSG);
                else {
                    $addDialog.dialog('close');

                    addDir(dirName, function (addDirErr) {
                        if (!addDirErr)
                            $cont.find('input').val('');
                        else {
                            $addDialog.dialog('open');
                            Util.showInputMsg($dirNameInput, addDirErr);
                        }
                    });
                }

                event.stopImmediatePropagation();
            });
        };

        var initCreateProjectDialog = function () {
            var $cont = $(CREATE_PROJECT_DIALOG_CONT),
                $fsTreeView = $(CREATE_PROJECT_FS_TREEVIEW_CONT),
                $fsTreeViewCont = $fsTreeView.parent(),
                $inputPath = $(PROJECT_PATH_INPUT),
                $inputName = $(PROJECT_NAME_INPUT),
                projectName = '',
                cancelCreating = function () {
                    $createProjectDialog.dialog('close');
                    $inputName.val('');
                    Util.removeInputMsgs($cont);
                },
                redrawScrollbar = function () {
                    $fsTreeViewCont.scrollBar({
                        scrollTo: CREATE_PROJECT_FS_TREEVIEW_CONT + ' li.' + TREEVIEW_SELECTED_ITEM_CLASS,
                        scrollClass: CREATE_PROJECT_SCROLLBAR_CLASS
                    });
                },
                $createProjectDialog = $cont.dialog({
                    autoOpen: false,
                    dialogClass: CREATE_PROJECT_CLASS,
                    width: 'auto',
                    close: cancelCreating
                }),
                treeviewOptions = {
                    url: GET_DIR_BY_PATH_URL,
                    open: currentProject,
                    effect: 'animate',
                    time: FS_EXPAND_DURATION,
                    asyncAction: redrawScrollbar
                };

            dirnameInputHandler($inputName);

            $document.on('click', CREATE_PROJECT_BTN, function () {
                UXLog.write('Project: "Create project" button clicked');
                $fsTreeView.html('');
                treeviewOptions.open = currentProject;
                $fsTreeView.treeView(treeviewOptions);
                $createProjectDialog.dialog('open');

                $cont.parent().find(UI_DIALOG_TITLE_CONT).draggable();
                redrawScrollbar();

                $fsTreeViewCont.resizable({
                    minWidth: CREATE_PROJECT_TREEVIEW_WIDTH,
                    minHeight: CREATE_PROJECT_DIALOG_HEIGHT,
                    class: RESIZE_MARKER_CREATE_PROJECT_CLASS,
                    action: function () {
                        $fsTreeViewCont.scrollBar({ scrollClass: CREATE_PROJECT_SCROLLBAR_CLASS });
                    }
                });

                var selectedDir = $fsTreeViewCont.find(' li.' + TREEVIEW_SELECTED_ITEM_CLASS).attr(INPUT_PATH_ATTR);

                selectedDir = selectedDir || currentProject;
                $inputPath.val(decodeURIComponent(selectedDir));
            });

            createInputSelectHandler($inputPath);

            $inputPath.keyup(function (e) {
                treeviewOptions.open = $inputPath.val();
                treeviewOptions.effect = false;
                $fsTreeView.treeView(treeviewOptions);
                treeviewOptions.effect = 'animate';

                if (e.keyCode !== ENTER_BTN_CODE)
                    Util.removeInputMsgs($cont);
            });

            $(CREATE_PROJECT_OK_BTN).click(function () {
                var projectPath = $inputPath.val(),
                    projectName = $inputName.val();

                Util.removeInputMsgs($cont);

                if (!$.trim(projectPath) || !$.trim(projectName)) {
                    if (!$.trim(projectName))
                        Util.showInputMsg($inputName, EMPTY_NAME_ERR_MSG);

                    if (!$.trim(projectPath))
                        Util.showInputMsg($inputPath, EMPTY_NAME_ERR_MSG);

                    return;
                }

                if ($.trim(projectPath))
                    $inputPath.val(decodeURIComponent(projectPath));

                Util.removeInputMsgs($cont);

                createProject(projectPath, projectName, $createProjectDialog, function (err) {
                    UXLog.write('Project: project created');

                    if (!err) {
                        Util.removeInputMsgs($cont);
                        $createProjectDialog.dialog('close');
                        currentProject = Util.pathJoin(projectPath, projectName);
                        treeviewOptions.open = currentProject;
                    }
                    else
                        Util.showInputMsg($inputName, err);
                });
            });

            $(CREATE_PROJECT_CANCEL_BTN).click(cancelCreating);

            $document.on('click', CREATE_PROJECT_FS_TREEVIEW_CONT + ' li', function () {
                projectName = $(this).attr(INPUT_PATH_ATTR);
                $inputPath.val(decodeURIComponent(projectName));
            });

            $document.on('click', [CREATE_PROJECT_DIALOG_CONT, HOME_DIR_BTN].join(' '), function() {
                $inputPath.val(window.HOME_DIR);
                $inputPath.keyup();
            });
        };

        var initOpenProjectDialog = function () {
            var $cont = $(OPEN_PROJECT_CONT),
                $dirsTreeView = $(DIRS_TREEVIEW_CONT),
                $dirsTreeViewCont = $dirsTreeView.parent(),
                $inputDirPath = $(OPEN_PROJECT_PATH_INPUT),

                $openProjectDialog = $cont.dialog({
                    autoOpen: false,
                    dialogClass: OPEN_PROJECT_CLASS,
                    width: 'auto'
                }),
                loadItems = function () {
                    $dirsTreeViewCont.scrollBar({
                        scrollTo: DIRS_TREEVIEW_CONT + ' li.' + TREEVIEW_SELECTED_ITEM_CLASS,
                        scrollClass: OPEN_PROJECT_SCROLLBAR_CLASS
                    });
                },
                setInputValue = function ($el) {
                    $inputDirPath.val(decodeURIComponent($el.attr(INPUT_PATH_ATTR)));
                },
                treeviewOptions = {
                    url: GET_DIR_BY_PATH_URL,
                    open: currentProject,
                    effect: 'animate',
                    time: FS_EXPAND_DURATION,
                    asyncAction: loadItems,
                    selectAction: setInputValue
                };

            $document.on('click', [OPEN_PROJECT_CONT, HOME_DIR_BTN].join(' '), function() {
                $inputDirPath.val(window.HOME_DIR);
                $inputDirPath.keyup();
            });

            $document.on('click', OPEN_PROJECT_BTN, function () {
                UXLog.write('Project: "Open project" button clicked');
                $dirsTreeView.html('');
                treeviewOptions.open = currentProject;
                $dirsTreeView.treeView(treeviewOptions);
                $openProjectDialog.dialog('open');

                $cont.parent().find(UI_DIALOG_TITLE_CONT).draggable();

                $dirsTreeViewCont.resizable({
                    minWidth: OPEN_PROJECT_TREEVIEW_WIDTH,
                    minHeight: OPEN_PROJECT_DIALOG_HEIGHT,
                    resizeMarkerClass: RESIZE_MARKER_OPEN_PROJECT_DIALOG_CLASS,
                    action: function () {
                        $dirsTreeViewCont.scrollBar({
                            scrollClass: OPEN_PROJECT_SCROLLBAR_CLASS
                        });
                    }
                });

                var selectedDir = $(DIRS_TREEVIEW_CONT + ' li.' + TREEVIEW_SELECTED_ITEM_CLASS).attr(INPUT_PATH_ATTR);

                selectedDir = selectedDir || currentProject;
                $inputDirPath.val(decodeURIComponent(selectedDir));
            });

            createInputSelectHandler($inputDirPath);

            $inputDirPath.keyup(function (e) {
                treeviewOptions.open = $inputDirPath.val();
                treeviewOptions.effect = false;
                $dirsTreeView.treeView(treeviewOptions);
                treeviewOptions.effect = 'animate';

                if (e.keyCode !== ENTER_BTN_CODE)
                    Util.removeInputMsgs($cont);
            });

            $(OPEN_PROJECT_OK_BTN).click(function () {
                var inputValue = $inputDirPath.val();

                if (!$.trim(inputValue))
                    $inputDirPath.val(decodeURIComponent(currentProject));

                Util.removeInputMsgs($cont);

                openProject(inputValue, $openProjectDialog, function (err) {
                    UXLog.write('Project: project opened');

                    stopObservationForRevision = true;

                    if (!err) {
                        if(History.enabled) {
                            History.replaceState(null, pageTitle, PROJECT_URL);
                            stopObservationForRevision = false;
                            currentProject = inputValue;
                            treeviewOptions.open = currentProject;
                        }
                        else
                            location.href = [location.protocol, '//', location.host, PROJECT_URL].join('');

                        Util.removeInputMsgs($cont);
                        $notificationContainer.show();
                    } else
                        Util.showInputMsg($inputDirPath, err);
                });
            });

            $(OPEN_PROJECT_CANCEL_BTN).click(function () {
                $openProjectDialog.dialog('close');
            });
        };

        var initRenameDialog = function () {
            var $renameDialog = null,
                $btn = null,
                $cont = $(RENAME_DIR_DIALOG_CONT),
                $dirNameInput = $(RENAME_DIR_INPUT),
                oldName = '';

            $renameDialog = $cont.dialog({
                autoOpen: false,
                dialogClass: RENAME_DIR_CLASS,
                width: FS_OPERATION_DIALOG_WIDTH
            });

            dirnameInputHandler($dirNameInput);

            $(RENAME_DIR_BUTTON).click(function () {
                $btn = $(this);
                oldName = $btn.closest(BROWSER_ROW).attr(DIR_NAME_ATTR);

                var title = Util.formatText(RENAME_DIR_DIALOG_TITLE_PATTERN, oldName);

                $cont.parent().find(UI_DIALOG_TITLE).html(title);
                $renameDialog.dialog('open');
                Util.removeInputMsgs($cont);
                $cont.find('input').val(oldName).select();
            });

            $(RENAME_DIR_BTN).click(function (event) {
                cutNotUrlChars($dirNameInput);

                var dirName = $dirNameInput.val();

                Util.removeInputMsgs($cont);

                if (!$.trim(dirName) || dirName === oldName) {
                    if (!$.trim(dirName))
                        Util.showInputMsg($dirNameInput, EMPTY_NAME_ERR_MSG);

                    if (dirName === oldName) {
                        //NOTE: Ipad bug: does not hide the virtual keyboard if there is no focusout event for the input element.
                        $cont.find('input').focusout();
                        $renameDialog.dialog('close');
                    }
                } else {
                    $cont.find('input').focusout();
                    $renameDialog.dialog('close');

                    renameDir(oldName, dirName, function (renameErr) {
                        if (!renameErr)
                            $cont.find('input').val('');
                        else {
                            $renameDialog.dialog('open');
                            Util.showInputMsg($dirNameInput, renameErr);
                        }
                    });
                }

                event.stopImmediatePropagation();
            });
        };

        var initDeleteDialog = function () {
            var $deleteDialog = null,
                $btn = null,
                dirName = '',
                $cont = $(DELETE_DIR_DIALOG_CONT);

            $deleteDialog = $cont.dialog({
                autoOpen: false,
                dialogClass: DELETE_DIR_CLASS,
                width: FS_OPERATION_DIALOG_WIDTH
            });

            $(DELETE_DIR_BUTTON).click(function () {
                $btn = $(this);
                dirName = $btn.closest(BROWSER_ROW).attr(DIR_NAME_ATTR);

                $cont.find(DIALOG_TEXT).text(Util.formatText(DELETE_DIALOG_TEXT_PATTERN, dirName));
                $deleteDialog.dialog('open');
            });

            $(DELETE_DIR_YES_BTN).click(function () {
                deleteDir(dirName);
                $deleteDialog.dialog('close');
            });

            $(DELETE_DIR_NO_BTN).click(function () {
                $deleteDialog.dialog('close');
            });
        };

        var initEditFixtureDialog = function () {
            var $editFixtureDialog = null,
                $btn = null,
                $cont = $(EDIT_FIXTURE_DIALOG_CONT),
                $fixtureNameInput = $(EDIT_FIXTURE_NAME_INPUT),
                $filenameInput = $(EDIT_FILENAME_INPUT),
                $fixturePageInput = $(EDIT_FIXTURE_PAGE_INPUT),
                $fixtureUsernameInput = $(EDIT_FIXTURE_AUTH_USERNAME_INPUT),
                $fixturePasswordInput = $(EDIT_FIXTURE_AUTH_PASSWORD_INPUT),
                oldName = '',
                oldWebPage,
                oldFilename = '',
                oldUsername = '',
                oldPassword = '';

            $editFixtureDialog = $cont.dialog({
                autoOpen: false,
                dialogClass: EDIT_FIXTURE_CLASS,
                width: FS_OPERATION_DIALOG_WIDTH
            });

            $(EDIT_FIXTURE_BUTTON).click(function () {
                $btn = $(this);

                UXLog.write('Project: edit fixture dialog opened');
                var $browserRow = $btn.closest(BROWSER_ROW);

                oldName = $browserRow.attr(FIXTURE_NAME_ATTR);
                oldFilename = $browserRow.attr(FIXTURE_FILE_ATTR);
                oldWebPage = $browserRow.attr(FIXTURE_PAGE_ATTR);
                oldUsername = $browserRow.attr(FIXTURE_USERNAME_ATTR);
                oldPassword = $browserRow.attr(FIXTURE_PASSWORD_ATTR);

                var title = Util.formatText(EDIT_FIXTURE_DIALOG_TITLE_PATTERN, oldName);

                $cont.parent().find(UI_DIALOG_TITLE).html(title);
                $fixtureNameInput.val(oldName);
                $filenameInput.val(oldFilename);
                $fixturePageInput.val(oldWebPage);
                $fixtureUsernameInput.val(oldUsername);
                $fixturePasswordInput.val(oldPassword);

                initAuthCredentialsGroup(EDIT_FIXTURE_AUTH_CREDENTIALS_GROUP, EDIT_FIXTURE_SHOW_CREDENTIALS_LINK);

                $editFixtureDialog.dialog('open');

                Util.removeInputMsgs($cont);
                filenameInputHandler($fixtureNameInput, $filenameInput);
            });

            $(EDIT_FIXTURE_OK_BTN).click(function (event) {
                var fixtureName = $fixtureNameInput.val(),
                    fixturePage = $fixturePageInput.val(),
                    filename = $filenameInput.val(),
                    username = $fixtureUsernameInput.val(),
                    password = $fixturePasswordInput.val();

                Util.removeInputMsgs($cont);

                if (!$.trim(fixtureName) || !$.trim(fixturePage) || (!$.trim(username) && $.trim(password))) {
                    if (!$.trim(fixtureName))
                        Util.showInputMsg($fixtureNameInput, EMPTY_NAME_ERR_MSG);

                    if (!$.trim(fixturePage))
                        Util.showInputMsg($fixturePageInput, EMPTY_PAGE_ERR_MSG);

                    if (!$.trim(username) && $.trim(password))
                        Util.showInputMsg($fixtureUsernameInput, EMPTY_AUTH_USERNAME_ERR_MSG);
                } else if (oldName === fixtureName && oldFilename === filename && $.trim(oldWebPage) === $.trim(fixturePage) && username === oldUsername && password === oldPassword) {
                    $cont.find('input').val('').focusout();
                    $editFixtureDialog.dialog('close');
                } else {
                    $cont.find('input').focusout();
                    $editFixtureDialog.dialog('close');

                    editFixture(oldFilename, filename, oldName, fixtureName, oldWebPage, $.trim(fixturePage), $.trim(username), password, function (editErr) {
                        if (!editErr)
                            $cont.find('input').val('');
                        else {
                            $editFixtureDialog.dialog('open');
                            Util.showInputMsg($filenameInput, editErr);
                        }
                    });
                }

                event.stopImmediatePropagation();
            });
        };

        var initDeleteFixtureDialog = function () {
            var $deleteFixtureDialog = null,
                $btn = null,
                fixtureName = '',
                fixtureFilename = '',
                $cont = $(DELETE_FIXTURE_DIALOG_CONT);

            $deleteFixtureDialog = $cont.dialog({
                autoOpen: false,
                dialogClass: DELETE_FIXTURE_CLASS,
                width: FS_OPERATION_DIALOG_WIDTH
            });

            $(DELETE_FIXTURE_BUTTON).click(function () {
                $btn = $(this);

                UXLog.write('Project: delete fixture dialog opened');
                fixtureFilename = $btn.closest(BROWSER_ROW).attr(FIXTURE_FILE_ATTR);
                fixtureName = $btn.closest(BROWSER_ROW).attr(FIXTURE_NAME_ATTR);

                $cont.find(DIALOG_TEXT).text(Util.formatText(DELETE_DIALOG_TEXT_PATTERN, fixtureName));
                $deleteFixtureDialog.dialog('open');
            });

            $(DELETE_FIXTURE_YES_BTN).click(function () {
                deleteFixture(fixtureFilename, fixtureName);
                $deleteFixtureDialog.dialog('close');
            });

            $(DELETE_FIXTURE_NO_BTN).click(function () {
                $deleteFixtureDialog.dialog('close');
            });
        };

        var initCodeEditorDialog = function() {
            FixtureEditor.init({
                openBtn: EDIT_FIXTURE_CODE_BTN,
                onSaveClick: function() {
                    fsOperationFlag = true;
                    saveState();
                    createLoadingMsg();
                },
                onSaveSuccess: function(fixtureFile) {
                    fsOperation = {text: Util.formatText(SAVE_FIXTURE_CODE_SUCCESS_MSG_PATTERN, fixtureFile), status: 'success'};
                },
                onSaveFail: function(data) {
                    fsOperationFlag = false;
                    restoreContent();
                    $notificationContainer.showPermanentErrorMsg(data.responseText);
                },
                onOpenFail: function(data) {
                    $notificationContainer.showPermanentErrorMsg(data);
                },
                getCurrentTestName: function($btn) {
                    return $btn.closest('tr').attr(TEST_NAME_ATTR) || '';
                },
                getFileName: function($btn) {
                    var curTestName = $btn.closest('tr').attr(TEST_NAME_ATTR) || '';

                    return curTestName ?
                        $btn.closest(FIXTURE_INFO).attr(FIXTURE_FILE_ATTR) :
                        $btn.closest(BROWSER_ROW).attr(FIXTURE_FILE_ATTR);
                },
                getCurrentPath: function() {
                    return Util.getCurPath();
                }
            });
        };

        var initHyperlinks = function () {
            $(BROWSER).find(NAV_LINK).click(function () {
                var href = $(this).attr('href');

                $.cookie(PROJECT_NAVIGATION_STATE_COOKIE, href, { expires: COOKIE_EXPIRED_DAYS, path: PROJECT_URL });

                if (History.enabled)
                    History.pushState(null, pageTitle, href);
                else
                    window.location.href = href;

                return false;
            });
        };

        var initNavButtons = function () {
            $(BROWSER).find(NAV_BUTTON).click(function () {
                var $navLink = $(this).parents(BROWSER_ROW).first().find(NAV_LINK);

                $.cookie(PROJECT_NAVIGATION_STATE_COOKIE, $navLink.attr('href'), { expires: COOKIE_EXPIRED_DAYS, path: PROJECT_URL });

                if (History.enabled) {
                    History.pushState(null, pageTitle, $navLink.attr('href'));
                }
                else
                    window.location.href = $navLink.attr('href');

                return false;
            });
        };

        var initStatusContainer = function () {
            $notificationContainer = NotificationsList({
                selector: MSG_CONTAINER,
                topOffset: $(HEADER).height() + $(TOP_BUTTONS).height(),
                leftOffset: ($('body').width() + $(PROJECT_VIEW).width()) / 2,
                bottomOffset: $(FOOTER).height()
            });
        };

        var initContent = function () {
            initNoTestsMsg();

            //Buttons
            initFixtureButtons();
            initRunButtons();
            initRecordButtons();
            initNavButtons();
            //Dialogs
            initRenameDialog();
            initDeleteDialog();
            initEditFixtureDialog();
            initDeleteFixtureDialog();
            initAddFixtureDialog();
            initAddDirDialog();
            initRenameTestDialog();
            initDeleteTestDialog();

            initEnterBtnHandler();
            initHyperlinks();

            setStartPageOffset();
        };

        var showTopPanel = function () {
            var $topBtns = $(TOP_BUTTONS);

            $topBtns.show();
            $topBtns.prev().show();
        };

        var hideTopPanel = function () {
            var $topBtns = $(TOP_BUTTONS);

            $topBtns.hide();
            $topBtns.prev().hide();
        };

        var initRevisionWatcher = function () {
            var socketDisconnected = false;

            socket = io.connect(window.location.protocol + '//' + window.location.host);

            var suiteChanged = function () {
                if(stopObservationForRevision)
                    return;

                if (!fsOperationFlag)
                    saveState();

                if ($runDialog && $runDialog.dialog)
                    $runDialog.dialog('close');

                //NOTE: Fix the current path for the opera
                $.get(window.location.pathname + REBUILD_REVISION_PARAM,function (data) {
                    clearDialogData();

                    $(REVISION_CONTAINER).html(data);
                    showTopPanel();
                    restoreState(true);

                    if (!$(FIXTURE_TOP_BTNS).is(':visible'))
                        $(FIXTURE_TOP_BTNS).show();

                    $(REVISION_CONTAINER).effect('pulsate', {times: 1}, 'slow', function () {
                        var $statusContent = $('<span></span>'),
                            statusClassName = null;

                        if (fsOperationFlag) {
                            statusClassName = fsOperation.status === 'success' ? SUCCESS_STATUS_CLASS : FAIL_STATUS_CLASS;
                            $statusContent.html(fsOperation.text);
                            fsOperationFlag = false;
                        } else {
                            $statusContent.html(VFS_REBUILDED_MSG);
                            statusClassName = UPDATE_STATUS_CLASS;
                        }

                        $notificationContainer.showStatus(statusClassName, $statusContent);
                    });

                    //NOTE reload content script
                    initBuildErrs();
                    initContent();
                    $notificationContainer.updateTopOffset();
                    $notificationContainer.updatePosition();
                }).error(function () {
                        slideToUpperLevel();
                    });
            };

            var updateRevision = function () {
                if (isStartPage())
                    return;

                execActionAfterAnimationTimeout(suiteChanged);
            };

            socket.on('vfsRevisionChanged', function () {
                updateRevision();
            });

            socket.on('vfsRevisionStartUpdate', function () {
                createLoadingMsg();
            });

            socket.on('vfsProjectRemoved', function () {
                location.href = [window.location.protocol, '//', window.location.host, PROJECT_URL].join('');
            });

            //NOTE: show update message for reconnect
            socket.on('connect', function () {
                if (socketDisconnected) {
                    updateRevision();
                    socketDisconnected = false;
                }
            });

            socket.on('taskComplete', function (data) {
                $notificationContainer.showTaskCompleteMsg(data);
            });

            socket.on('disconnect', function () {
                socketDisconnected = true;
            });
        };

        var initBuildErrs = function () {
            var $buildErrs = $(BUILD_ERRS),
                $title = $buildErrs.find(BUILD_ERRS_TITLE);

            $title.click(function () {
                $buildErrs.find(BUILD_ERRS_EXP_COL_BUTTON).toggleClass(BTN_COLLAPSE_CLASS);
                $buildErrs.find(BUILD_ERRS_LIST).slideToggle('fast', function () {
                    saveStateToCookie();
                    $notificationContainer.updateTopOffset();
                });
            });

            $(FIXTURE_FILENAME).click(function () {
                var fixturePath = $(this).attr(FIXTURE_FILE_ATTR).split('\\'),
                    fileName = fixturePath.pop(),
                    to = '/project' + fixturePath.join('/');

                slideCallback = function () {
                    expandedBrowserRow(fileName, true, true, function() {
                        saveStateToCookie();
                        slideCallback = null;
                    });
                };

                if (to !== location.pathname) {
                    if (History.enabled)
                        History.pushState(null, pageTitle, to);
                    else
                        location.href = to + EXPAND_ROW_PARAM + fileName;
                } else
                    slideCallback();
            });
        };

        var initHistorySlider = function () {
            if (!History.enabled)
                return;

            var from = window.location.href;

            History.Adapter.bind(window, 'statechange', function () {
                var to = History.getState().url;

                slide(from, to);

                from = to;
            });
        };

        var initPageEffect = function () {
            if (History.enabled)
                History.replaceState(null, pageTitle, window.location.href.split('?')[0]);

            $(REVISION_CONTAINER).fadeIn('slow', function () {
                //NOTE: Expand row mechanism for browsers, that not supported history API.
                if (window.EXPAND_ROW) {
                    expandedBrowserRow(window.EXPAND_ROW, true, true, function () {
                        saveStateToCookie();
                        window.EXPAND_ROW = '';
                    });
                }

                if(window.OPEN_TEST_TARGET) {
                    openTestTarget(window.OPEN_TEST_TARGET, window.OPEN_TEST_NAME, function($row) {
                        Util.scrollTo($row);
                        saveStateToCookie();

                        window.OPEN_TEST_TARGET = '';
                        window.OPEN_TEST_NAME= '';
                    });
                }

                var completedTask = window.COMPLETED_TASK;

                if (completedTask) {
                    $notificationContainer.showTaskCompleteMsg(completedTask);
                    window.COMPLETED_TASK = '';
                }
            });
        };

        var initNoTestsMsg = function () {
            var $noTests = $(NO_TESTS);

            if ($noTests) {
                setInCenter($noTests);
                $noTests.css('visibility', 'visible');
            }

            $window.resize(function () {
                if ($noTests)
                    setInCenter($noTests);
            });
        };

        var initNavigationState = function () {
            var $projectNavigationState = $.cookie(PROJECT_NAVIGATION_STATE_COOKIE),
                $container = $(BROWSER).parent();

            if (!!$projectNavigationState && $projectNavigationState !== window.location.pathname && window.location.pathname === PROJECT_URL) {
                if (History.enabled)
                    History.replaceState(null, pageTitle, $projectNavigationState);

                $.get([$projectNavigationState, SLIDE_QUERY_PARAM].join(''),function (res) {
                    if (History.enabled) {
                        clearDialogData();
                        $container.html(res);
                        initContent();
                        initPageStateFromCookie();
                    } else
                        window.location.href = $projectNavigationState;
                }).error(function () {
                        if (History.enabled)
                            slideToUpperLevel();
                    });
            }
            else {
                $.cookie(PROJECT_NAVIGATION_STATE_COOKIE, window.location.pathname, { expires: COOKIE_EXPIRED_DAYS, path: PROJECT_URL });
                initPageStateFromCookie();
            }
        };

        var initStartPageMsg = function () {
            setStartPageOffset();

            $window.scroll(function (e) {
                setStartPageOffset();
                e.stopImmediatePropagation();
            });

            $window.resize(function (e) {
                setStartPageOffset();
                e.stopImmediatePropagation();
            });
        };

        var initHorizontalScrollHandler = function () {
            $(window).scroll(function () {
                var scrollLeft = $(this).scrollLeft();

                $(HEADER_BACK).css('left', -scrollLeft);
                $(FIXTURE_TOP_BTNS).css('left', -scrollLeft);
                $(FOOTER).css('left', -scrollLeft);
            });
        };

        $document.ready(function () {
            initHorizontalScrollHandler();

            createAddFixtureDialog();
            createDirDialog();
            initOpenProjectDialog();
            initCreateProjectDialog();
            initOpenExampleProject();
            initCloseProject();
            initCodeEditorDialog();

            initNavigationState();
            initPageEffect();
            initHistorySlider();
            initBuildErrs();
            initRevisionWatcher();
            initStatusContainer();
            initStartPageMsg();
            initContent();
        });
    };
});
/* global History: true */
/* global io: true */
/* global ace: true */

ControlPanel.define('ResultsView', function (require, exports) {
    require('Widgets.Dialog');
    require('Widgets.Draggable');
    require('Widgets.Resizable');
    require('Widgets.ScrollBar');

    var $ = require('jQuery'),
        FixtureEditor = require('Widgets.FixtureEditor'),
        Util = require('Util'),
        UXLog = require('UXLog');

    exports.init = function () {

        //Constants
        var
        //Selectors
            ALERT_DIALOG = '#alert-dialog',
            ALERT_DIALOG_OK_BTN = '#alert-dialog-ok-btn',
            CLEAR_REPORTS_DIALOG_CONT = '#clear-reports-dialog',
            CLEAR_REPORTS_NO_BTN = '#clear-reports-no-btn',
            CLEAR_REPORTS_YES_BTN = '#clear-reports-yes-btn',
            CLEAR_RESULTS = '#clear-reports',
            CONTENT = '.content',
            DETAIL_LINK = '.detail-link',
            DETAIL_VIEW = '.task-detail',
            DIALOG_TEXT = '.dialog-text',
            DIALOG_HEADER = '.dialog-text h2',
            ERROR_ROW = '.error-row',
            EXPORT_REPORT = '.export-report-btn',
            FILE_DOWNLOADING = '.file-downloading',
            FIXTURE_NAME = '.fixture-name',
            FOOTER = '.footer',
            GO_TO_CODE_BTN = '.go-to-code-btn',
            GRID_CONTAINER = '#gridContainer',
            GRID_ROW = 'tr.dx-row',
            HEADER_BACK = '.header .back',
            HIGHLIGHT_CODE = '.language-javascript',
            NAV_LINK = 'a.nav-link',
            NO_MSG = '.no-msg',
            NO_TASKS_RESULTS = '.no-tasks-results',
            REMOVE_REPORT_BTN = '.remove-report-btn',
            REMOVE_REPORT_DIALOG_CONT = '#remove-report-dialog',
            REMOVE_REPORT_NO_BTN = '#remove-report-no-btn',
            REMOVE_REPORT_YES_BTN = '#remove-report-yes-btn',
            REPORT_HEADER = '.report-head',
            RESTART_TASK_BTN = '.restart-task',
            RESTART_TASK_LINKS = '.restart-task li',
            SCREENSHOTS_GALLERY = '#screenshots-gallery',
            SCREENSHOTS_GALLERY_ALL_BTN = '.screenshot-cell',
            SCREENSHOTS_LIST = '.screenshots-list',
            TASK_ITEM = '.task-results-item',
            TASKS_RESULTS_CONTAINER = '#tasks-results-container',
            TEST_NAME = '.test-name',
            TOP_BUTTONS = '.results-top-buttons',
            TOP_BUTTONS_CONT = '.results-top-buttons-cont',
            UI_DIALOG_TITLE = '.dialog-header span',
            UI_DIALOG_TITLE_CONT = '.dialog-header',

        //Classes
            ALERT_DIALOG_CLASS = 'alert-dialog',
            CLEAR_REPORTS_CLASS = 'clear-reports',
            FAILED_VIEW_CLASS = 'failed-view',
            FILE_DOWNLOADING_CLASS = 'file-downloading',
            FIXTURE_NAME_CLASS = 'fixture-name',
            HIDDEN_CLASS = 'hidden',
            LOADING_MSG_CLASS = 'loading-img',
            REMOVE_REPORT_CLASS = 'remove-report',
            RESIZE_SCREENSHOT_GALLERY_CLASS = 'resize-screenshot-gallery',
            SCREENSHOTS_GALLERY_CLASS = 'screenshots-gallery',
            SCREENSHOTS_GALLERY_SCROLLBAR_CLASS = 'screenshots-gallery-scrollbar',
            STEP_NAME_CLASS = 'step-name',
            SUCCESS_VIEW_CLASS = 'succeeded-view',
            TEST_NAME_CLASS = 'test-name',

        //Urls
            ACE_LIB_URL = '/ace',
            CLEAR_REPORTS_URL = '/clear_results/',
            DETAIL_QUERY_PARAM = '?detail=1',
            IDLE_WORKER_URL = '/worker/idle/',
            REMOVE_REPORT_URL = '/remove_report/',
            RETURN_URL_QUERY_PARAM = '?returnUrl=',
            REVISION_REQ_URL = '/results_rev/',
            RUN_TASK_URL = '/tests_run/',
            SLIDE_QUERY_PARAM = '?partial=1',
            TASKS_RESULTS_URL = '/results/',
            GET_REPORT_JSON_URL = [REVISION_REQ_URL, '{0}/?json=1'].join(''),
            PROJECT_URL = [location.protocol, '//', location.host, '/project'].join(''),
            RESULTS_URL = [location.protocol, '//', location.host, '/results/'].join(''),
            GET_SCREEN_URL = '/get_screen/?path=',
            TO_SCREEN_URL_PATTERN = '/to_screen/?path={0}&title={1}',
            GET_SCREEN_THUMBNAIL_URL_PATTERN = GET_SCREEN_URL + '{0}&thumbnail=1',

        //Attr
            FIXTURE_FILE_ATTR = 'data-fixture-file',
            FIXTURE_NAME_ATTR = 'data-fixture-name',
            REPORT_FORMAT_ATTR = 'data-format',
            RUN_FAILED_TESTS_ATTR = 'data-run-failed-tests',
            RUN_OPTIONS_ATTR = 'data-run-options',
            TASK_NAME_ATTR = 'data-task-name',
            TASK_UID_ATTR = 'data-taskid',
            TEST_NAME_ATTR = 'data-test-name',
            TEST_UID_ATTR = 'data-test-uid',

        //Texts
            REMOVE_REPORT_DIALOG_TEXT_PATTERN = 'Are you sure that you wish to delete the {0} report?',
            TASK_FAILED_TEXT = 'fail',
            TASK_PASSED_TEXT = 'passed',
            NO_SCREENSHOTS_TEXT = 'No screenshots',
            SCREENSHOTS_AVAILABLE_TEXT = 'Screenshots available',
            NO_ERRORS_TEXT = 'No errors',

            EXPORT_URL_PATTERN = '/export_results/?format={0}&taskID={1}',
            SCREENSHOTS_DIALOG_TEXT_PATTERN = '"{0}" - Screenshots',
            WORKER_VERSION_PATTERN = ' (v. {0})',

        //Tmpl
            ERROR_ROW_PATTERN = '<div class="error-row"><pre>{0}</pre>{1}</div>',
            BROWSER_HEADER_PATTERN = '<span class="browser-header">{0}</span>',
            STEP_HEADER_PATTERN = '<div class="step-separator"></div><p><span></span>Step: "{0}"</p>',
            THUMBNAIL_PATTERN = '<a href="{0}" class="thumbnail" target="_blanc">' +
                '<div class="overlay"></div><div class="zoom-icon"></div>' +
                '<img src="{1}" alt=""/><span>{2}</span></a>',
            SCREEN_PREVIEW_PATTERN = '<p class="screen-title">Screenshot: </p>{0}',

        //Metrics
            TASK_MAX_ANIMATION_COUNT = 2,
            SLIDE_DURATION = 200,
            CONFIRM_DIALOG_WIDTH = 610,
            ALERT_DIALOG_WIDTH = 610,
            SCREENSHOTS_GALLERY_WIDTH = 520,
            SCREENSHOTS_GALLERY_MIN_HEIGHT = 400,
            REMOVE_DOWNLOADING_IFRAME_TIMEOUT = 1000,
            LOADING_MSG_DURATION = 750,
            GRID_UPDATE_LOCK_TIMEOUT = 300,

        //Grid options
            GRID_WIDTH = 960,
            PAGE_SIZE = 100,
            SEARCH_PANEL_WIDTH = 240,
            PAGINATION_VALUES = [200, 500, 1000],
            DURATION_COLUMN = 'Duration',
            ERRORS_COLUMN = 'Errors',
            FIXTURE_NAME_COLUMN = 'Fixture',
            SCREENSHOT_COLUMN = 'Screenshots',
            STATUS_COLUMN = 'Status',
            TEST_NAME_COLUMN = 'Test',
            DURATION_COLUMN_WIDTH = 100,
            ERRORS_COLUMN_WIDTH = 60,
            SCREENSHOT_COLUMN_WIDTH = 90,
            STATUS_COLUMN_WIDTH = 90;

        var $document = $(document),
            isPage404 = false,
            pageTitle = document.title,
            scrollTop = 0,
            lastContHeight = 0,
            loadAnimationStartTime = 0,
            taskUpdateList = [],
            lastTaskUpdateData = [],
            animationBlocked = false,
            fullUpdateFlag = false,
            stopUpdateFlag = false,
            taskContent = null,
            $alertDialog = null,
            $screenGallery = null,
            removeTaskReportUid = null,
            screenshots = {},
            isFirstGridInit = true,
            gridState = null,
            highlight = function() {};

        var setInCenter = function ($elm) {
            var topMargin = (Util.getContentHeight() - $elm.height()) / 2;

            if (topMargin > 0)
                $elm.css('margin-top', topMargin);

            var leftMargin = ($(TASKS_RESULTS_CONTAINER).outerWidth(false) - $elm.width()) / 2;

            if (leftMargin > 0)
                $elm.css('margin-left', leftMargin);
        };

        var showTopPanel = function () {
            var $topBtns = $(TOP_BUTTONS);

            $topBtns.removeClass(HIDDEN_CLASS);
            $topBtns.prev().removeClass(HIDDEN_CLASS);
        };

        var hideTopPanel = function () {
            var $topBtns = $(TOP_BUTTONS);

            $topBtns.addClass(HIDDEN_CLASS);
            $topBtns.prev().addClass(HIDDEN_CLASS);
        };

        var slide = function (from, to, disableAnimation) {
            var $container = $(TASKS_RESULTS_CONTAINER),
                forward = Util.getPathDepth(to) > Util.getPathDepth(from);

            var showTopPanelForList = function () {
                if (!isDetailView() && !$(NO_MSG).length)
                    showTopPanel();
                else
                    hideTopPanel();
            };

            $.get([to, SLIDE_QUERY_PARAM].join(''), function (res) {
                if (!disableAnimation) {
                    $container.hide('drop', { direction: forward ? 'left' : 'right' }, SLIDE_DURATION, function () {
                        $container.html(res);

                        $container.show('drop', { direction: forward ? 'right' : 'left' }, SLIDE_DURATION, function () {
                            showTopPanelForList();
                            initContent();
                        });
                    });
                } else {
                    $container.html(res);
                    showTopPanelForList();
                    initContent();
                }
            });
        };

        var isDetailView = function () {
            return $(TASKS_RESULTS_CONTAINER).find(DETAIL_VIEW).length;
        };

        var saveState = function () {
            scrollTop = $(window).scrollTop();
            lastContHeight = $(TASKS_RESULTS_CONTAINER).height();
        };

        var restoreState = function () {
            var $resultsCont = $(TASKS_RESULTS_CONTAINER),
                curContHeight = $resultsCont.height();

            //NOTE: Calculate the difference in height if it is not detailed view.
            if (!$resultsCont.find(DETAIL_VIEW).length)
                scrollTop += curContHeight - lastContHeight;

            $('html, body').scrollTop(scrollTop);
        };

        var createLoadingMsg = function () {
            var $revisionContainer = $(TASKS_RESULTS_CONTAINER);

            stopUpdateFlag = true;
            taskContent = $revisionContainer.html();

            var $loadingMsgContent = $('<div></div>')
                .addClass(LOADING_MSG_CLASS);

            $(TASKS_RESULTS_CONTAINER).html($loadingMsgContent);
            setInCenter($loadingMsgContent);

            loadAnimationStartTime = (new Date()).getTime();
        };

        var clearLoadingMsg = function(returnToList) {
            var animationDuration = (new Date()).getTime() - loadAnimationStartTime;

            var restore = function () {
                if(returnToList && RESULTS_URL !== location.href) {
                    if(History)
                        History.pushState(null, pageTitle, RESULTS_URL);
                    else
                        location.href = RESULTS_URL;
                } else
                    slide(location.href, location.href, true);

                isFirstGridInit = true;
                loadAnimationStartTime = 0;
                stopUpdateFlag = false;
            };

            if (animationDuration < LOADING_MSG_DURATION)
                setTimeout(restore, LOADING_MSG_DURATION - animationDuration);
            else
                restore();
        };

        var initHyperlinks = function () {
            $(TASKS_RESULTS_CONTAINER).find(NAV_LINK).click(function () {
                var href = $(this).attr('href');

                showTopPanel();

                if (History.enabled)
                    History.pushState(null, pageTitle, href);
                else
                    window.location.href = href;

                return false;
            });
        };

        var initAlertDialog = function () {
            $alertDialog = $(ALERT_DIALOG).dialog({
                width: ALERT_DIALOG_WIDTH,
                autoOpen: false,
                dialogClass: ALERT_DIALOG_CLASS
            });

            $(ALERT_DIALOG_OK_BTN).click(function () {
                $alertDialog.dialog('close');
            });
        };

        var restartTests = function(options) {
            var runXhr = $.ajax({
                type: 'POST',
                url: RUN_TASK_URL,
                data: {opt: options}
            });

            runXhr.always(function () {
                var res = JSON.parse(runXhr.responseText);

                if (res.errs.length) {
                    var errsHtml = res.errs.reduce(function (res, elm) {
                        return res + '<p>' + elm + '</p>';
                    }, '');

                    $alertDialog.find(DIALOG_TEXT).html(errsHtml);
                    $alertDialog.dialog('open');
                } else if (res.workerName)
                    location.href = IDLE_WORKER_URL + res.workerName + RETURN_URL_QUERY_PARAM + options.location;
                else
                    location.href = RESULTS_URL + res.taskUid;
            });
        };

        var initRestartTaskButtons = function () {
            var $restartLink = $(TASKS_RESULTS_CONTAINER).find(RESTART_TASK_LINKS);

            $(RESTART_TASK_BTN).click(function(e) {
                e.stopImmediatePropagation();
            });

            $restartLink.click(function (e) {
                var $taskItem = $(this).closest(TASK_ITEM),
                    opt = JSON.parse($taskItem.attr(RUN_OPTIONS_ATTR)),
                    taskId = $taskItem.attr(TASK_UID_ATTR),
                    returnUrl = isDetailView() ? RESULTS_URL : location.href;

                var runTests = function() {
                    restartTests({
                        sourceType: opt.sourceType,
                        source: opt.source,
                        workers: opt.workers,
                        browsers: opt.browsers,
                        groupName: opt.groupName,
                        takeScreenshotOnFails: opt.takeScreenshotOnFails,
                        failOnJsErrors: opt.failOnJsErrors,
                        location: returnUrl,
                        returnToReport: true
                    });
                };

                if (opt._currentWindowWorker)
                    opt.workers = [];

                if($(this).attr(RUN_FAILED_TESTS_ATTR)) {
                    opt.groupName = (typeof opt.source === 'string' ? opt.source : opt.groupName);
                    opt.sourceType = 'group';
                    opt.source = [];

                    $.get(Util.formatText(GET_REPORT_JSON_URL, taskId), function (data) {
                        for(var testUid in data.testErrReports) {
                            if(data.testErrReports.hasOwnProperty(testUid)) {
                                var err = data.testErrReports[testUid],
                                    testPath = err.fixturePath.length ?
                                        Util.sourceJoin(err.fixturePath, err.fixtureName, err.name) :
                                        Util.sourceJoin(err.fixtureName, err.name);

                                if(opt.source.indexOf(testPath) === -1)
                                    opt.source.push(testPath);
                            }
                        }

                        runTests();
                        UXLog.write('Tasks: Restart failed tests clicked');
                    });
                } else {
                    runTests();
                    UXLog.write('Tasks: Restart task clicked');
                }

                e.stopImmediatePropagation();
            });
        };

        var initExportReports = function () {
            $(EXPORT_REPORT).click(function (e) {
                e.stopImmediatePropagation();
            });

            var downLoadFile = function(url) {
                $('body').append("<iframe class=" + FILE_DOWNLOADING_CLASS + " src='" + url + "' style='display: none;' ></iframe>");

                setTimeout(function () {
                    $(FILE_DOWNLOADING).remove();
                }, REMOVE_DOWNLOADING_IFRAME_TIMEOUT);
            };

            $(EXPORT_REPORT).find('li').click(function (e) {
                var $el = $(this),
                    format = $el.attr(REPORT_FORMAT_ATTR);

                UXLog.write('Tasks: export task clicked, format: ' + format);
                downLoadFile(Util.formatText(EXPORT_URL_PATTERN, format, $el.attr(TASK_UID_ATTR)));
                e.stopImmediatePropagation();
            });
        };

        var initNavButtons = function () {
            $(TASKS_RESULTS_CONTAINER).find(DETAIL_LINK).click(function () {
                var taskID = $(this).attr('data-taskID'),
                    navLink = TASKS_RESULTS_URL + taskID;

                UXLog.write('Tasks: task detail opened');

                hideTopPanel();
                isFirstGridInit = true;

                if (History.enabled)
                    History.pushState(null, pageTitle, navLink);
                else
                    window.location.href = navLink;

                return false;
            });
        };

        var openFixtureInTestsView = function(fixturePath, fixtureName) {
            var path = ['', fixturePath].join('/');

            window.open([PROJECT_URL, path, '?open=', encodeURIComponent(fixtureName)].join(''));
        };

        var openTestInTestsView = function(fixturePath, fixtureName, testName) {
            var path = ['', fixturePath].join('/');

            window.open([PROJECT_URL, path,
                '?open=', encodeURIComponent(fixtureName),
                '&testName=', encodeURIComponent(testName)
            ].join(''));
        };

        var initResultsGrid = function(data) {
            var $gridContainer = $(GRID_CONTAINER);

            $gridContainer.css('top', $(HEADER_BACK).height() +
                parseInt($(CONTENT).css('margin-top')) + $(REPORT_HEADER).height() + 'px');

            $gridContainer.dxDataGrid({
                allowColumnResizing: true,
                allowColumnReordering: true,
                dataSource: data,
                hoverStateEnabled: false,
                showBorders: false,
                showColumnLines: true,
                showRowLines: false,
                cellHintEnabled: false,
                scrolling: {
                    mode: 'infinity'
                },
                width: GRID_WIDTH,
                masterDetail: {
                    enabled: true,
                    template: function(container, options) {
                        var errsByWorker = options.key.errMsg,
                            content = '';

                        var $content = $('<div>');

                        for(var worker in errsByWorker) {
                            if(errsByWorker.hasOwnProperty(worker)) {
                                content = content ? content + '\n\n': '';
                                content += Util.formatText(BROWSER_HEADER_PATTERN, worker);
                                content += errsByWorker[worker].errMsg;
                            }
                        }

                        $content.append(content);
                        $content.appendTo(container);

                        highlight(container.find(HIGHLIGHT_CODE).not(GO_TO_CODE_BTN), false);
                        highlight(container.find([HIGHLIGHT_CODE, GO_TO_CODE_BTN].join('')), true);
                        //NOTE: hack for current version
                        $(GRID_CONTAINER).dxDataGrid('instance').getView('rowsView')._highlightSearchText(container);
                    }
                },
                loadPanel:{
                    enabled: false
                },
                paging: {
                    pageSize: PAGE_SIZE
                },
                selection: {
                    mode: 'none'
                },
                pager: {
                    showPageSizeSelector: true,
                    allowedPageSizes: PAGINATION_VALUES
                },
                columns: [
                    {dataField: STATUS_COLUMN, width: STATUS_COLUMN_WIDTH, alignment: 'left', cellTemplate: function (container, options) {
                        $('<p></p>')
                            .text(options.value)
                            .attr('class', options.value)
                            .prepend('<span class="status-marker"></span>')
                            .appendTo(container);
                    }},
                    {dataField: TEST_NAME_COLUMN, cellTemplate: function (container, options) {
                        $('<span></span>')
                            .text(options.value)
                            .attr('class', TEST_NAME_CLASS)
                            .attr('title', options.value)
                            .attr(TEST_NAME_ATTR, options.value)
                            .appendTo(container);
                    }},
                    {dataField: FIXTURE_NAME_COLUMN, cellTemplate: function (container, options) {
                        $('<span></span>')
                            .text(options.value)
                            .attr('class', FIXTURE_NAME_CLASS)
                            .attr('title', options.value)
                            .attr(FIXTURE_FILE_ATTR, options.key.fixtureFileName)
                            .attr(FIXTURE_NAME_ATTR, options.value)
                            .appendTo(container);
                    },
                        groupCellTemplate: function (container, options) {
                            $('<span></span>')
                                .text(options.value)
                                .attr('class', FIXTURE_NAME_CLASS)
                                .attr(FIXTURE_NAME_ATTR, options.value)
                                .click(function () {
                                    UXLog.write('Tasks: Fixture name clicked (Grouping)');
                                    openFixtureInTestsView(options.data.items[0].fixturePath, options.data.items[0].fixtureName);
                                }).appendTo(container);
                        }
                    },
                    {dataField: DURATION_COLUMN, width: DURATION_COLUMN_WIDTH, alignment: 'center', customizeText: function(options) {
                        return Util.getFormattedTime(options.value);
                    }},
                    {dataField: SCREENSHOT_COLUMN, width: SCREENSHOT_COLUMN_WIDTH, alignment: 'center', cellTemplate: function (container, options) {
                        container.html(options.value);
                    }, groupCellTemplate: function(container, options) {
                        if(!options.value)
                            container.html(NO_SCREENSHOTS_TEXT);
                        else
                            container.html(SCREENSHOTS_AVAILABLE_TEXT);
                    }, calculateGroupValue: function(data) {
                        if(data[SCREENSHOT_COLUMN] === '-')
                            return 0;
                        else
                            return 1;

                    }},
                    {dataField: ERRORS_COLUMN, width: ERRORS_COLUMN_WIDTH, alignment: 'center',  dataType:'string', groupCellTemplate: function(container, options) {
                        if(options.value === '-')
                            container.html(NO_ERRORS_TEXT);
                        else
                            container.html(options.column.caption + ': ' +  options.value);
                    }},
                    {calculateCellValue: function(data) {
                        var errMsg = data.errMsg,
                            searchContent = '';

                        for(var worker in errMsg) {
                            if(errMsg.hasOwnProperty(worker)) {
                                searchContent += worker;
                                searchContent += errMsg[worker].errMsg;
                            }
                        }

                        return searchContent;
                    }, allowFiltering: true, dataType: 'string', visible: false, calculateFilterExpression: function(text) {
                        return [this.calculateCellValue, 'contains', text];
                    } }
                ],
                grouping: {
                    autoExpandAll: true
                },
                searchPanel: {
                    visible: true,
                    width: SEARCH_PANEL_WIDTH
                },
                groupPanel: {
                    visible: true
                },
                onCellPrepared: function(e){
                    //NOTE: Not expand master detail if it's empty
                    if (!e.key.errMsg && e.column.command === 'expand')
                        e.cellElement.removeClass('dx-command-expand dx-datagrid-group-closed dx-datagrid-expand');
                },
                onRowPrepared: function(e) {
                    if(e && e.key && e.key[STATUS_COLUMN] !== TASK_PASSED_TEXT)
                        e.rowElement.css('cursor', 'pointer');
                },
                onEditorPrepared: function() {
                    if(gridState) {
                        var dataGrid = $(GRID_CONTAINER).dxDataGrid('instance');
                        dataGrid.state(gridState);

                        gridState = null;
                    }

                    if(isFirstGridInit)
                        isFirstGridInit = false;
                },
                onCellClick: function(clickedCell) {
                    //NOTE: we go to fixture and test only if we clicked on link, not cell
                    var testElement = document.elementFromPoint(clickedCell.jQueryEvent.clientX, clickedCell.jQueryEvent.clientY);
                    if(testElement.tagName.toLowerCase() === 'td' && clickedCell.columnIndex) {
                        if(clickedCell.key.errMsg) {
                            if(clickedCell.component.isRowExpanded(clickedCell.key))
                                clickedCell.component.collapseRow(clickedCell.key);
                            else
                                clickedCell.component.expandRow(clickedCell.key);
                        }

                        return;
                    }

                    if (clickedCell.cellElement.find(TEST_NAME).length) {
                        UXLog.write('Tasks: Test name clicked');
                        openTestInTestsView(clickedCell.data.fixturePath, clickedCell.data.fixtureName, clickedCell.value);
                    } else if (clickedCell.cellElement.find(FIXTURE_NAME).length) {
                        UXLog.write('Tasks: Fixture name clicked');
                        openFixtureInTestsView(clickedCell.data.fixturePath, clickedCell.data.fixtureName);
                    }
                },
                onContentReady: function() {
                    var $scrollView = $(GRID_CONTAINER).find('.dx-scrollable');

                    //NOTE: T154989
                    $scrollView.dxScrollable({ showScrollbar: 'always'});
                 }
            });
        };

        var initDetailPage = function() {
            var locArr = location.href.split('/'),
                taskID = locArr[locArr.length - 1],
                formattedData = [];

            $.get(Util.formatText(GET_REPORT_JSON_URL, taskID), function (data) {
                var getScreenBtn = function(uid, stepName, workerName) {
                    var testScreenshots = data._screenshots[uid];

                    if(testScreenshots) {
                        for (var index = 0, length = testScreenshots.length; index < length; index++) {
                            var screen = testScreenshots[index],
                                getScreenUrl = Util.formatText(TO_SCREEN_URL_PATTERN, encodeURIComponent(screen.filePath), [screen.stepName, screen.workerName].join(' - ')),
                                getScreenThumbnailUrl = Util.formatText(GET_SCREEN_THUMBNAIL_URL_PATTERN, encodeURIComponent(screen.filePath));

                            if(screen.stepName === stepName && screen.workerName === workerName && screen.isFailedStep) {
                                var thumbNail = Util.formatText(THUMBNAIL_PATTERN, getScreenUrl, getScreenThumbnailUrl, '');
                                return Util.formatText(SCREEN_PREVIEW_PATTERN, thumbNail);
                            }
                        }
                    }

                    return '';
                };

                var browserVersions = data.browserVersions;
                screenshots = data._screenshots;

                function buildGridDateHandler(obj) {
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            var test = obj[key],
                                data = {
                                    uid: key
                                },
                                testsDictionary = {};

                            var fixture = test.fixturePath ?
                                ['', test.fixturePath, test.fixtureName].join('/') :
                                [test.fixturePath, test.fixtureName].join('/');

                            data[TEST_NAME_COLUMN] = test.name;
                            data[FIXTURE_NAME_COLUMN] = fixture;
                            data[DURATION_COLUMN] = test.time;
                            data.fixtureName = test.fixtureName;
                            data.fixturePath = test.fixturePath;
                            data.fixtureFileName = test.fixtureFileName;

                            if (screenshots[key] && screenshots[key].length) {
                                var screens = screenshots[key];

                                for(var screenIndex = 0; screenIndex < screens.length; screenIndex++) {
                                    if(!screens[screenIndex].isFailedStep)
                                        data[SCREENSHOT_COLUMN] =
                                            '<a class="screenshot screenshot-cell" title="View screenshots" ' + TEST_UID_ATTR + '="' + key + '"></a>';
                                }

                                if(!data[SCREENSHOT_COLUMN])
                                    data[SCREENSHOT_COLUMN] = '-';
                            } else
                                data[SCREENSHOT_COLUMN] = '-';

                            if (test.errs && test.errs.length) {
                                for (var index = 0, length = test.errs.length; index < length; index++) {
                                    var err = test.errs[index],
                                        browserVersion = browserVersions[err.workerName],
                                        version = browserVersion ? Util.formatText(WORKER_VERSION_PATTERN, browserVersion) : '',
                                        workerName = err.workerName + version,
                                        screenHtml = getScreenBtn(key, err._originalErr.stepName, err.workerName),
                                        errRow = Util.formatText(ERROR_ROW_PATTERN, err._msgMarkdown, screenHtml);

                                    //NOTE: we're grouping several errors for one test;
                                    if(testsDictionary.hasOwnProperty(fixture) && testsDictionary[fixture].hasOwnProperty(test.name)) {
                                        var testData = formattedData[testsDictionary[fixture][test.name]];

                                        if(!testData.errMsg[workerName])
                                            testData.errMsg[workerName] = {
                                                errMsg: errRow,
                                                stepName: err._originalErr.stepName
                                            };
                                        else
                                            testData.errMsg[workerName].errMsg += '\n' + errRow;

                                        continue;
                                    } else {
                                        testsDictionary[fixture] = {};
                                        testsDictionary[fixture][test.name] = formattedData.length;

                                        data[STATUS_COLUMN] = TASK_FAILED_TEXT;
                                        data.errMsg = {};
                                        data.errMsg[workerName] = {
                                            errMsg: errRow,
                                            stepName: err._originalErr.stepName
                                        };
                                        data[ERRORS_COLUMN] = test.errs.length;
                                    }

                                    formattedData.push(data);
                                }
                            }
                            else {
                                data[STATUS_COLUMN] = TASK_PASSED_TEXT;
                                data[ERRORS_COLUMN] = '-';
                                data.errMsg = '';

                                formattedData.push(data);
                            }
                        }
                    }
                }

                buildGridDateHandler(data.testErrReports);
                buildGridDateHandler(data.passedTests);

                if(isFirstGridInit)
                    initResultsGrid(formattedData);
                else {
                    var $gridCont = $(GRID_CONTAINER);

                    gridState = $gridCont.dxDataGrid('instance').state();
                    $gridCont.dxDataGrid({dataSource: formattedData});
                }
            });
        };

        var updateGalleryAndOpen = function(uid, testName, stepName) {
            var $content = $(SCREENSHOTS_GALLERY).find(SCREENSHOTS_LIST),
                screenTarget = stepName ? stepName : testName;

            $content.html('');
            $screenGallery.parent().find(UI_DIALOG_TITLE).html(Util.formatText(SCREENSHOTS_DIALOG_TEXT_PATTERN, screenTarget));

            var testScreens = screenshots[uid] || [],
                curStepName = '';

            for(var index = 0, length = testScreens.length; index < length; index++) {
                var screen = testScreens[index],
                    getScreenUrl = Util.formatText(TO_SCREEN_URL_PATTERN, encodeURIComponent(screen.filePath), [screen.stepName, screen.workerName].join(' - ')),
                    getScreenThumbnailUrl = Util.formatText(GET_SCREEN_THUMBNAIL_URL_PATTERN, encodeURIComponent(screen.filePath)),
                    screenHtml = Util.formatText(THUMBNAIL_PATTERN, getScreenUrl, getScreenThumbnailUrl, screen.workerName);

                if(stepName) {
                    if(stepName === screen.stepName && screen.isFailedStep) {
                        if (screen.stepName !== curStepName) {
                            $content.append(Util.formatText(STEP_HEADER_PATTERN, screen.stepName));
                            curStepName = screen.stepName;
                        }
                        $content.append(screenHtml);
                    }
                } else if (!screen.isFailedStep) {
                    if (screen.stepName !== curStepName) {
                        $content.append(Util.formatText(STEP_HEADER_PATTERN, screen.stepName));
                        curStepName = screen.stepName;
                    }
                    $content.append(screenHtml);
                }
            }

            $screenGallery.parent().find(UI_DIALOG_TITLE_CONT).draggable();
            $content.resizable({
                minWidth: SCREENSHOTS_GALLERY_WIDTH,
                minHeight: SCREENSHOTS_GALLERY_MIN_HEIGHT,
                resizeMarkerClass: RESIZE_SCREENSHOT_GALLERY_CLASS,
                action: function () {
                    $content.scrollBar({ scrollClass: SCREENSHOTS_GALLERY_SCROLLBAR_CLASS });
                }
            });
            $screenGallery.dialog('open');
            $content.scrollBar({ scrollClass: SCREENSHOTS_GALLERY_SCROLLBAR_CLASS });

            UXLog.write('Tasks: screenshots gallery opened');
        };

        var initScreenshotsGallery = function() {
            $screenGallery = $(SCREENSHOTS_GALLERY).dialog({
                width: 'auto',
                autoOpen: false,
                dialogClass: SCREENSHOTS_GALLERY_CLASS
            });

            $document.on('click', SCREENSHOTS_GALLERY_ALL_BTN, function(e) {
                var $btn = $(this),
                    $row = $btn.closest(GRID_ROW),
                    testName = $row.find(TEST_NAME).attr(TEST_NAME_ATTR);

                updateGalleryAndOpen($btn.attr(TEST_UID_ATTR), testName, '');

                e.stopImmediatePropagation();
            });
        };

        var initContent = function () {
            initNoTaskResultsMsg();
            initNavButtons();
            initRestartTaskButtons();
            initHyperlinks();
            initRemoveReportBtn();
            initExportReports();
            initCodeEditorDialog();
            initScreenshotsGallery();

            if(isDetailView())
                initDetailPage();
        };

        var initNoTaskResultsMsg = function () {
            var setNoResultsMsgMargin = function () {
                var $noTasksResultsMsg = $(NO_TASKS_RESULTS),
                    topMargin = Math.ceil((Util.getContentHeight() - $noTasksResultsMsg.outerHeight(false)) / 2);

                if (topMargin > 0)
                    $noTasksResultsMsg.css('margin-top', topMargin);
            };

            if ($(NO_TASKS_RESULTS))
                setNoResultsMsgMargin();

            $(window).resize(function () {
                if ($(NO_TASKS_RESULTS))
                    setNoResultsMsgMargin();
            });
        };

        var initHistorySlider = function () {
            if (!History.enabled)
                return;

            var from = window.location.href;

            History.Adapter.bind(window, 'statechange', function () {

                //NOTE: Fix for return from 404 error page. Reload page for delete 404 page from browser history.
                if (isPage404) {
                    window.location.reload();
                    return;
                }

                var to = History.getState().url;

                isFirstGridInit = true;

                slide(from, to);

                from = to;
            });
        };

        var taskUpdate = function (taskID, callback) {
            if (stopUpdateFlag)
                return;

            //NOTE: push in updateList array count active animation, need it for limit the animation.
            if (!taskUpdateList[taskID])
                taskUpdateList[taskID] = 1;

            var $taskResultsCont = $(TASKS_RESULTS_CONTAINER),
                $taskItem = $taskResultsCont.find(TASK_ITEM + '[data-taskID = "' + taskID + '"]'),
                queryPath = REVISION_REQ_URL + taskID;

            if (isDetailView()) {
                queryPath += DETAIL_QUERY_PARAM;

                if(!$taskItem.length)
                    return;
            }

            $.get(queryPath, function (data) {
                lastTaskUpdateData[taskID] = data;
                $taskItem = $taskResultsCont.find(TASK_ITEM + '[data-taskID = "' + taskID + '"]');

                var insertTaskContent = function () {
                    saveState();

                    if ($taskItem.length) {
                        if (!isDetailView()) {
                            $taskItem.replaceWith(data);
                            showTopPanel();
                        }
                        else
                            $taskItem.find(REPORT_HEADER).replaceWith(data);

                    }
                    else if (!isDetailView()) {
                        $taskResultsCont.prepend(data);
                        $(NO_MSG).remove();
                    }

                    $taskItem = $taskResultsCont.find(TASK_ITEM + '[data-taskID = "' + taskID + '"]');

                    restoreState();
                    //NOTE reload content script
                    initContent();
                };

                if (!isDetailView() && taskUpdateList[taskID] < TASK_MAX_ANIMATION_COUNT) {
                    animationBlocked = true;
                    insertTaskContent();

                    $($taskItem).show('fast', function () {
                        animationBlocked = false;
                        saveState();
                        //NOTE: Insert task data, which are updated during the animation.
                        $taskItem.replaceWith(lastTaskUpdateData[taskID]);
                        restoreState();
                        initContent();
                        taskUpdateList[taskID] = taskUpdateList[taskID] ? --taskUpdateList[taskID] : 0;
                    });
                } else {
                    //NOTE: Flag animationBlocked stops insert the updated data, to the end of the animation.
                    if (!animationBlocked) {
                        insertTaskContent();

                        $($taskItem).show();
                        taskUpdateList[taskID] = taskUpdateList[taskID] ? --taskUpdateList[taskID] : 0;
                    } else {
                        taskUpdateList[taskID] = taskUpdateList[taskID] ? --taskUpdateList[taskID] : 0;
                    }
                }

                //NOTE: animation limit
                if (taskUpdateList[taskID] > TASK_MAX_ANIMATION_COUNT) {
                    fullUpdateFlag = true;
                } else {
                    taskUpdateList[taskID]++;
                }

                if(typeof callback === 'function')
                    callback();
            });
        };

        var initRevisionWatcher = function () {
            var socket = io.connect(window.location.protocol + '//' + window.location.host),
                socketDisconnected = false,
                updateLock = false,
                updateDelayTimeout = null;

            if (fullUpdateFlag) {
                slide(location.href, location.href);
                fullUpdateFlag = false;
                taskUpdateList = [];
            }

            socket.on('taskUpdated', function (data) {
                if (!isDetailView()) {
                    taskUpdate(data.taskUid);
                }
                else {
                    if (!updateLock) {
                        updateLock = true;
                        taskUpdate(data.taskUid, function() {
                            updateLock = false;
                        });
                    } else if (!updateDelayTimeout) {
                        updateDelayTimeout = setTimeout(function () {
                            var $reportHeader = $(REPORT_HEADER);

                            if (!$reportHeader.hasClass(FAILED_VIEW_CLASS) && !$reportHeader.hasClass(SUCCESS_VIEW_CLASS)) {
                                taskUpdate(data.taskUid, function() {
                                    window.clearTimeout(updateDelayTimeout);
                                    updateDelayTimeout = null;
                                });
                            }
                        }, GRID_UPDATE_LOCK_TIMEOUT);
                    }
                }
            });

            socket.on('taskComplete', function (data) {
                taskUpdate(data.taskUid);
            });

            //NOTE: show update message for reconnect
            socket.on('connect', function () {
                if (socketDisconnected) {
                    window.location.reload();
                    socketDisconnected = false;
                }
            });

            socket.on('disconnect', function () {
                socketDisconnected = true;
            });
        };

        var initPageEffect = function () {
            $(TASKS_RESULTS_CONTAINER).fadeIn();
        };

        var initRemoveReportBtn = function () {
            var $cont = $(REMOVE_REPORT_DIALOG_CONT),
                $removeReportDialog = $cont.dialog({
                    autoOpen: false,
                    dialogClass: REMOVE_REPORT_CLASS,
                    width: CONFIRM_DIALOG_WIDTH
                }),
                $report = null,
                $detailView = $(DETAIL_VIEW);

            $(REMOVE_REPORT_BTN).click(function (e) {
                $report = $(this).closest(DETAIL_LINK);
                removeTaskReportUid = isDetailView() ? $detailView.attr(TASK_UID_ATTR) : $report.attr(TASK_UID_ATTR);

                var reportName = isDetailView() ? $detailView.attr(TASK_NAME_ATTR) : $report.attr(TASK_NAME_ATTR);

                $cont.find(DIALOG_HEADER).text(Util.formatText(REMOVE_REPORT_DIALOG_TEXT_PATTERN, reportName));

                $removeReportDialog.dialog('open');
                UXLog.write('Tasks: remove task report opened');

                e.stopImmediatePropagation();
            });

            $(REMOVE_REPORT_NO_BTN).click(function (e) {
                removeTaskReportUid = null;
                $removeReportDialog.dialog('close');
                e.stopImmediatePropagation();
            });

            $(REMOVE_REPORT_YES_BTN).click(function (e) {
                if (!removeTaskReportUid)
                    return;

                $removeReportDialog.dialog('close');
                hideTopPanel();
                createLoadingMsg();

                $.post(REMOVE_REPORT_URL, {uid: removeTaskReportUid}, function () {
                    clearLoadingMsg(true);
                });

                e.stopImmediatePropagation();
            });
        };

        var initClearResultsBtn = function () {
            var $cont = $(CLEAR_REPORTS_DIALOG_CONT),
                $clearReportsDialog = $cont.dialog({
                    autoOpen: false,
                    dialogClass: CLEAR_REPORTS_CLASS,
                    width: CONFIRM_DIALOG_WIDTH
                });

            $(CLEAR_RESULTS).click(function (e) {
                $clearReportsDialog.dialog('open');

                e.stopImmediatePropagation();
            });

            $(CLEAR_REPORTS_NO_BTN).click(function (e) {
                $clearReportsDialog.dialog('close');

                e.stopImmediatePropagation();
            });

            $(CLEAR_REPORTS_YES_BTN).click(function (e) {
                $clearReportsDialog.dialog('close');
                hideTopPanel();
                createLoadingMsg();

                $.post(CLEAR_REPORTS_URL, function () {
                   clearLoadingMsg(false);
                });

                e.stopImmediatePropagation();
            });
        };

        var initHorizontalScrollHandler = function () {
            $(window).scroll(function () {
                var scrollLeft = $(this).scrollLeft();

                $(HEADER_BACK).css('left', -scrollLeft);
                $(TOP_BUTTONS).css('left', -scrollLeft);
                $(TOP_BUTTONS_CONT).css('left', -scrollLeft);
                $(FOOTER).css('left', -scrollLeft);
            });
        };

        var initCodeHighlighter = function (callback) {
            var baseLocation = [location.protocol, location.host].join('//'),
                aceBaseLocation = baseLocation + ACE_LIB_URL;

            ace.config.set('modePath', aceBaseLocation);
            ace.config.set('workerPath', aceBaseLocation);
            ace.config.set('themePath', aceBaseLocation);

            Util.loadAceEditorModules(ace,
                [
                    'ace/theme/textmate',
                    'ace/mode/javascript',
                    'ace/mode/html',
                    'ace/ext/language_tools',
                    'ace/ext/static_highlight'
                ],
                function () {
                    var dom = ace.require('ace/lib/dom'),
                        highlighter = ace.require('ace/ext/static_highlight'),
                        JavaScriptParser = new (ace.require('ace/mode/javascript').Mode)(),
                        HTMLParser = new (ace.require('ace/mode/html').Mode)(),
                        theme = ace.require('ace/theme/textmate');

                    var highlight = function ($codeElms, wrapElm) {
                        $.each($codeElms, function (index, el) {
                            var $highlightedEl = wrapElm ? $(el).wrap('<div class="multiline_editor"></div>')[0] : el;
                            var data = $highlightedEl.textContent,
                                mode = /(^<)|(^\[<)/.test(data) ? HTMLParser : JavaScriptParser,
                                highlighted = highlighter.render(data, mode, theme, 0, false);

                            dom.importCssString(highlighted.css, 'ace_highlight');
                            $highlightedEl.innerHTML = highlighted.html;

                            if (el.offsetWidth < el.scrollWidth) {
                                var $el = $(el);
                                $el.width(el.scrollWidth - parseInt($el.css('padding-left')) + 'px');
                            }
                        });
                    };

                    callback(highlight);
                });
        };

        var initCodeEditorDialog = function() {
            FixtureEditor.init({
                openBtn: GO_TO_CODE_BTN,
                onSaveClick: function() {
                    hideTopPanel();
                    createLoadingMsg();
                },
                onSaveSuccess: function() {
                    clearLoadingMsg(false);
                },
                onSaveFail: function(data) {
                    clearLoadingMsg(false);
                    $alertDialog.find(DIALOG_TEXT).html(data.responseText);
                    $alertDialog.dialog('open');
                },
                onOpenFail: function(data) {
                    $alertDialog.find(DIALOG_TEXT).html(data.responseText);
                    $alertDialog.dialog('open');
                },
                getCurrentTestName: function($btn) {
                    return $btn.closest(GRID_ROW).prev().find(TEST_NAME).attr(TEST_NAME_ATTR) || '';
                },
                getCurrentStep: function ($btn) {
                    if ($btn.hasClass(STEP_NAME_CLASS))
                        return $btn.text();
                    else
                        return $btn.closest(ERROR_ROW).find(GO_TO_CODE_BTN).eq(0).text();
                },
                getCurrentAssert: function ($btn) {
                    if ($btn.hasClass(STEP_NAME_CLASS))
                        return '';
                    else
                        return $btn.text();
                },
                getFileName: function ($btn) {
                    return $btn.closest(GRID_ROW).prev().find(FIXTURE_NAME).attr(FIXTURE_FILE_ATTR);
                },
                getCurrentPath: function ($btn) {
                    var fixtureName = $btn.closest(GRID_ROW).prev().find(FIXTURE_NAME).attr(FIXTURE_NAME_ATTR),
                        fixtureNameArr = fixtureName.indexOf('/') > -1 ? fixtureName.split('/') : [''];

                    return fixtureNameArr.length > 1 ? fixtureNameArr.slice(1, fixtureNameArr.length - 1).join('/') : '';
                }
            });
        };

        $document.ready(function () {
            UXLog.write('Tasks tab opened');
            initHorizontalScrollHandler();

            initPageEffect();
            initHistorySlider();
            initRevisionWatcher();
            initContent();
            initClearResultsBtn();
            initAlertDialog();
            initCodeHighlighter(function(func) {
                highlight = func;
            });
        });
    };
});
ControlPanel.define('Util', function (require, exports) {
    var $ = require('jQuery'),
        UXLog = require('UXLog');

    //Constants
    var
    //Selectors
        HEADER = '.header',
        FOOTER = '.footer',
        TESTS_VIEW_TOP_PANEL = '.fixtures-top-buttons',

        ERR_TEXT = '.err-text',
        INPUT_ERR_MSG = '.input-err',
        ERR_VALUE_CLASS = 'err-value',
        WARN_VALUE_CLASS = 'warn-value',

        ERR_MSG_TYPE = 'error',
        WARN_MSG_TYPE = 'warning';

    exports.getPathDepth = function (url) {
        var a = document.createElement('a');

        a.href = url;

        var path = a.pathname,
            depth = 0;

        if (path) {
            $.each(path.split('/'), function () {
                if (this.length)
                    depth++;
            });
        }

        return depth;
    };

    exports.scrollTo = function ($elem) {
        var offset = $elem.offset(),
            offsetTop = 0,
            $topPanel = $(TESTS_VIEW_TOP_PANEL),
            topPanelHeight = $topPanel.height();

        if (offset) {
            offsetTop = offset.top - $(HEADER).height();

            if ($topPanel.is(':visible'))
                offsetTop -= topPanelHeight;

            $('html, body').animate({
                scrollTop: offsetTop
            }, 'fast');
        }
    };

    exports.formatText = function (string) {
        var args = [].slice.call(arguments, 1);

        return string.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    };

    exports.getContentHeight = function () {
        return $('body').height() - $(HEADER).height() - $(FOOTER).height();
    };

    exports.pathJoin = function () {
        var separator = '/',
            result = arguments[0] || '';

        if (arguments.length > 1) {
            if (/\\/.test(arguments[0]))
                separator = '\\';

            result = Array.prototype.slice.call(arguments).join('/')
                .replace(/[\/\\]/g, separator)
                .replace(new RegExp('\\' + separator + '{2,}', 'g'), separator);
        }

        return result;
    };

    exports.sourceJoin = function () {
        var res = arguments[0] || '';

        if (arguments.length > 1)
            res = Array.prototype.slice.call(arguments).join('/');

        return res;
    };

    exports.isNotHotKey = function (event) {
        return !event.ctrlKey && !event.altKey;
    };

    exports.cutQueryString = function (url) {
        return url.replace(/(\?.*)*$/, '');
    };

    //Fix for cross browser behavior jquery 2.1.3
    //We use scrollTop instead offset, because $('html,body').offset().top and $('body').offset().top always return 0
    exports.getBodyScrollTop = function () {
        return Math.max($('html,body').scrollTop(), $('body').scrollTop());
    };

    exports.getFormattedTime = function (time) {
        var duration = '0';

        if (time > 0) {
            duration = '';

            if (time >= 3600) {
                duration += Math.floor(time / 3600) + 'h ';
                time = time % 3600;
            }

            if (time >= 60) {
                duration += Math.floor(time / 60) + 'm ';
                time = time % 60;
            }

            if (time > 0)
                duration += time + 's';
        }

        if (duration[duration.length - 1] === ' ')
            duration = duration.substr(0, duration.length - 1);

        return duration;
    };

    exports.prepareTextForRegExp = function (str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").replace(/[\s]{1}/g, '[\\s]{1}');
    };

    exports.getCurPath = function () {
        var curPath = location.pathname.split('/').slice(2);

        if (!curPath[curPath.length - 1])
            curPath.pop();

        return curPath.join('/');
    };

    exports.removeInputMsgs = function ($cont) {
        var $dialogErrMsg = $cont.find(INPUT_ERR_MSG),
            $dialogErrMsgTitle = $dialogErrMsg.find(ERR_TEXT);

        $cont.find('input').removeClass(ERR_VALUE_CLASS).removeClass(WARN_VALUE_CLASS);
        $dialogErrMsg.hide();
        $dialogErrMsgTitle.html('');
    };

    exports.showInputMsg = function ($input, text, type) {
        exports.removeInputMsgs($input);
        type = type ? type : ERR_MSG_TYPE;

        if (type === WARN_MSG_TYPE) {
            UXLog.write('Settings: warning msg was shown for input #' + $input.attr('id'));
            $input.addClass(WARN_VALUE_CLASS);
        } else if (type === ERR_MSG_TYPE) {
            UXLog.write('Settings: error msg was shown for input #' + $input.attr('id'));
            $input.addClass(ERR_VALUE_CLASS);
        }

        $input.next().show().find(ERR_TEXT).text(text);
    };

    exports.loadAceEditorModules = function(ace, modules, cb) {
        var module = modules.shift();

        ace.config.loadModule(module, function() {
            if(modules.length)
                exports.loadAceEditorModules(ace, modules, cb);
            else
                cb();
        });
    };
});
ControlPanel.define('UXLog', function (require, exports) {
    var $ = require('jQuery');

    //Consts
    var UXLOG_URL = '/uxlog/';

    exports.write = function (msg) {
        $.post(UXLOG_URL, {msg: msg}, function () {
        }, 'text');
    };
});



/* global io: true */

ControlPanel.define('WorkerIdle', function (require, exports) {
    var $ = require('jQuery');

    exports.init = function () {
        var
            IDLE_HEARTBEAT_DELAY = window.WebSocket ? 30000 : 2000,
            IDLE_HEARTBEAT_URL = '/worker/heartbeat',
            FORCE_WORKER_CLOSE_URL = '/worker/force-close',
        //Selector
            IDLE_MSG_CONT = '.idle-msg-wrap',
            IDLE_MSG = '.idle-msg',
        //Status messages
            WORKER_IS_UTILIZED = 'Worker has been utilized';

        window.startWorkerIdleHeartbeat = function (workerName) {
            var disconnectSocket = function () {
                if (window.WebSocket)
                    socket.disconnect();
            };

            var heartbeat = function () {
                var jqxhr = $.ajax({
                    type: 'POST',
                    url: IDLE_HEARTBEAT_URL,
                    data: { name: workerName }
                });

                jqxhr.done(function (res) {
                    if (res && res.status === 'run') {
                        //NOTE: we force socket disconnection here (and in all other cases when we change location)
                        //because seems like that there is a bug in socket.io in Firefox which lead to the following issue:
                        //We receive 'taskAdded' event, change page location, socket is disconnected and trying to reconnect
                        //again. On connection it performs heartbeat once again and all this leads to infinite loop
                        //(see B234283).
                        disconnectSocket();
                        location.href = decodeURI(res.testRunUrl);
                    } else if (res && res.status === 'utilized' && res.returnUrl) {
                        disconnectSocket();
                        location.href = (!res.lastTask || !/project/.test(res.returnUrl)) ?
                            res.returnUrl : [res.returnUrl, '?taskUid=', res.lastTask].join('');
                    } else if (res && res.status === 'utilized') {
                        disconnectSocket();
                        //NOTE: Try to close browser from js code first
                        window.open('', '_self', '');
                        window.close();

                        //FATALITY: if we fail to close browser window using previous methods, setup targetWindowMark as
                        //window.title, so it will be identified and killed by Windows taskkill
                        document.title = res.targetWindowMark;

                        $.ajax({
                            type: 'POST',
                            url: FORCE_WORKER_CLOSE_URL,
                            data: {targetWindowMark: res.targetWindowMark}
                        });

                        //NOTE: If we fail to close window then just show info message
                        $(IDLE_MSG).find('h2').text(WORKER_IS_UTILIZED).addClass('utilizedMsg');
                        $(IDLE_MSG).find('p').remove();
                    } else {
                        window.setTimeout(function () {
                            heartbeat();
                        }, IDLE_HEARTBEAT_DELAY);
                    }
                });
            };

            //NOTE: if WebSockets is not supported, use heartbeat with small interval
            if (window.WebSocket) {
                var socket = io.connect(window.location.protocol + '//' + window.location.host);

                socket.on('connect', function () {
                    socket.emit('registerWorker', workerName);
                    heartbeat();
                });

                socket.on('taskAdded', function () {
                    heartbeat();
                });
            } else
                heartbeat();
        };

        var setWaitMsgMargin = function () {
            var $idleMsg = $(IDLE_MSG),
                $idleMsgCont = $(IDLE_MSG_CONT);

            var topMargin = Math.ceil(($idleMsgCont.height() - $idleMsg.outerHeight(false)) / 2);

            if (topMargin > 0)
                $idleMsg.css('margin-top', topMargin);
        };

        $(document).ready(function () {
            setWaitMsgMargin();
        });

        $(window).resize(function () {
            setWaitMsgMargin();
        });
    };
});
/* global io: true */
/* global QRCode: true */

ControlPanel.define('WorkersView', function (require, exports) {
    var $ = require('jQuery'),
        Util = require('Util'),
        UXLog = require('UXLog');

    exports.init = function () {

        var
        //Selector
            HEADER_BACK = '.header .back',
            FOOTER = '.footer',
            ADD_WORKER_FORM_CONT = '.add-worker-form-wrap',
            NO_WORKERS = '.no_workers',
            ADD_WORKER_BTN = '#add-worker-btn',
            ADD_WORKER_ERR = '#add-worker-err',
            WORKER_NAME = '#worker-name',
            WORKERS_CONTAINER = '.workers-cont',
            NAME_SORT_BTN = '.name-sort',
            TYPE_SORT_BTN = '.type-sort',
            ERR_TITLE = '.title',
            WORKER_ROW = '.workers-dashboard > table tbody tr',
            WORKER_TBODY = '.workers-dashboard > table tbody',
            WORKER_NAME_VALUE = '.worker-name',
            WORKER_TYPE_VALUE = '.worker-type p',
            CURRENT_TASK_LINK = '.workers-dashboard .task-name',
            CURRENT_TEST_LINK = '.workers-dashboard .current-test',
            WORKER_QR_CODE = '#worker-qr-code',
        //Classes
            SORTING_ASC_ICON_CLASS = 'ascSort',
            SORTING_DESC_ICON_CLASS = 'descSort',
        //ID
            WORKER_QR_CODE_ID = 'worker-qr-code',
        //Url
            ADD_WORKER_URL = '/worker/add/',
            REVISION_REQ_URL = '/workers/',
            NO_REDIRECT_QUERY_PARAM = '?noRedirect=1',
            WORKER_REVISION_PARAM = '?workersUpdate=1',
            CREATE_WORKER_BY_QR_CODE_URL = '/worker/add/qrcode?create_by_qr_code=1',
        //String
            ERR_EMPTY_WORKER_NAME = 'Worker name is empty. The name should contain at least one character which cannot be a blank space.',
        //Metrics
            QR_CODE_HEIGHT = 80,
            QR_CODE_WIDTH = 80;

        var isNameSortedAsc = true,
            isTypeSortedAsc = true,
            lastGridSortResult = null,
            socketDisconnected = false;

        var sortGrid = function (sortType, asc) {
            var data = [],
                sortResult = '';

            $(WORKER_ROW).each(function (i, row) {
                data.push({
                    key: $(row).find(sortType).text(),
                    html: row.outerHTML
                });
            });

            data = data.sort(function (descr1, descr2) {
                if (descr1.key < descr2.key)
                    return -1;
                if (descr1.key > descr2.key)
                    return 1;

                return 0;
            });

            if (!asc)
                data = data.reverse();

            for (var i = 0; i < data.length; i++)
                sortResult += data[i].html;

            $(WORKER_TBODY).html(sortResult);
        };

        var scrollToChangedWorker = function () {
            if (window.WORKER) {
                var workerRow = $('tr[data-workername="' + window.WORKER + '"]');

                if (workerRow) {
                    Util.scrollTo(workerRow);
                    window.WORKER = '';
                }
            }
        };

        var initNoWorkersMsg = function () {
            var setNoWorkersMsgMargin = function () {
                var $noWorkersMsg = $(NO_WORKERS),
                    topMargin = Math.ceil((Util.getContentHeight() - $(ADD_WORKER_FORM_CONT).height() - $noWorkersMsg.outerHeight(false)) / 2);

                if (topMargin > 0)
                    $noWorkersMsg.css('margin-top', topMargin);
            };

            if ($(NO_WORKERS))
                setNoWorkersMsgMargin();

            $(window).resize(function () {
                if ($(NO_WORKERS))
                    setNoWorkersMsgMargin();
            });
        };

        var initQRCode = function () {
            new QRCode(WORKER_QR_CODE_ID, {
                text: [window.HOSTNAME, CREATE_WORKER_BY_QR_CODE_URL].join(''),
                width: QR_CODE_WIDTH,
                height: QR_CODE_HEIGHT,
                correctLevel: QRCode.CorrectLevel.L
            });

            //NOTE: qrcodejs haven't options for disabling the code title
            $(WORKER_QR_CODE).removeAttr('title');
        };

        var initContent = function () {
            initNoWorkersMsg();
            scrollToChangedWorker();

            $(CURRENT_TASK_LINK).on('click', function () {
                UXLog.write('Workers: current task link clicked');
            });

            $(CURRENT_TEST_LINK).on('click', function () {
                UXLog.write('Workers: current test link clicked');
            });

            $(ADD_WORKER_BTN).click(function () {
                var $err = $(ADD_WORKER_ERR),
                    $errTitle = $err.find(ERR_TITLE),
                    workerName = $(WORKER_NAME).val();

                UXLog.write('Workers: worker connected');

                $err.hide();

                if (!workerName) {
                    $errTitle.text(ERR_EMPTY_WORKER_NAME);
                    $err.show('fast');

                    return false;
                }

                $.ajax({url: [ADD_WORKER_URL, encodeURIComponent(workerName), NO_REDIRECT_QUERY_PARAM].join('')})
                    .done(function (res) {
                        window.location.href = res;
                    })
                    .fail(function (jqxhr) {
                        $errTitle.text(jqxhr.responseText);
                        $err.show('fast');
                    });

                return false;
            });

            $(NAME_SORT_BTN).click(function () {
                $(this).addClass(isNameSortedAsc ? SORTING_ASC_ICON_CLASS : SORTING_DESC_ICON_CLASS)
                    .removeClass(!isNameSortedAsc ? SORTING_ASC_ICON_CLASS : SORTING_DESC_ICON_CLASS);
                $(TYPE_SORT_BTN).removeClass(!isTypeSortedAsc ? SORTING_ASC_ICON_CLASS : SORTING_DESC_ICON_CLASS);

                UXLog.write('Workers: Sorting by name used');

                sortGrid(WORKER_NAME_VALUE, isNameSortedAsc);
                lastGridSortResult = {field: WORKER_NAME_VALUE, asc: isNameSortedAsc, sortBtn: NAME_SORT_BTN};
                isNameSortedAsc = !isNameSortedAsc;
            });

            $(TYPE_SORT_BTN).click(function () {
                $(this).addClass(isTypeSortedAsc ? SORTING_ASC_ICON_CLASS : SORTING_DESC_ICON_CLASS)
                    .removeClass(!isTypeSortedAsc ? SORTING_ASC_ICON_CLASS : SORTING_DESC_ICON_CLASS);
                $(NAME_SORT_BTN).removeClass(!isNameSortedAsc ? SORTING_ASC_ICON_CLASS : SORTING_DESC_ICON_CLASS);

                UXLog.write('Workers: Sorting by type used');

                sortGrid(WORKER_TYPE_VALUE, isTypeSortedAsc);
                lastGridSortResult = {field: WORKER_TYPE_VALUE, asc: isTypeSortedAsc, sortBtn: TYPE_SORT_BTN};
                isTypeSortedAsc = !isTypeSortedAsc;
            });
        };

        var updateState = function () {
            var queryPath = REVISION_REQ_URL + WORKER_REVISION_PARAM;

            $.get(queryPath, function (data) {
                var scrollTop = $(window).scrollTop();

                $(WORKERS_CONTAINER).html(data);

                $('html, body').animate({scrollTop: scrollTop}, 'fast');

                if (lastGridSortResult) {
                    sortGrid(lastGridSortResult.field, lastGridSortResult.asc);
                    $(lastGridSortResult.sortBtn).addClass(lastGridSortResult.asc ? SORTING_ASC_ICON_CLASS : SORTING_DESC_ICON_CLASS);
                }

                initContent();
            });
        };

        var initSocketEvent = function () {
            var socket = io.connect(window.location.protocol + '//' + window.location.host);

            socket.on('connect', function () {
                socket.emit('registerSeveralWorkers');

                if (socketDisconnected)
                    updateState();
            });

            socket.on('taskAdded', function () {
                updateState();
            });

            socket.on('taskUpdated', function () {
                updateState();
            });

            socket.on('workerAdded', function () {
                updateState();
            });

            socket.on('workerDisconnected', function () {
                updateState();
            });

            socket.on('disconnect', function () {
                socketDisconnected = true;
            });
        };

        var initPageEffect = function () {
            $(WORKERS_CONTAINER).fadeIn();
        };

        var initHorizontalScrollHandler = function () {
            $(window).scroll(function () {
                var scrollLeft = $(this).scrollLeft();

                $(HEADER_BACK).css('left', -scrollLeft);
                $(ADD_WORKER_FORM_CONT).css('left', -scrollLeft);
                $(FOOTER).css('left', -scrollLeft);
            });
        };

        $(document).ready(function () {
            UXLog.write('Workers tab opened');

            initHorizontalScrollHandler();
            initPageEffect();
            initSocketEvent();
            initQRCode();
            initContent();
        });
    };
});
/* global ace: true */

ControlPanel.define('Widgets.CodeEditor', function (require) {
    var $ = require('jQuery');

    //Consts
    var CODE_EDITOR = '#code-editor',
        CODE_EDITOR_ID = 'code-editor',
        ACE_LIB_URL = '/ace',
        EDITOR_THEME = 'ace/theme/textmate',
        EDITOR_MODE = 'ace/mode/javascript';

    var codeEditor = function ($el, options) {
        var editor = null,
            session = null,
            baseLocation = [location.protocol, location.host].join('//'),
            aceBaseLocation = baseLocation + ACE_LIB_URL;

        $el.html('<div id="' + CODE_EDITOR_ID + '"></div>');

        var $codeEditor = $(CODE_EDITOR);

        //Init ace base paths
        ace.config.set("modePath", aceBaseLocation);
        ace.config.set("workerPath", aceBaseLocation);
        ace.config.set("themePath", aceBaseLocation);

        //Init editor container
        editor = ace.edit($codeEditor.attr('id'));
        session = editor.getSession();

        //NOTE: warning in console ace.js:1 Automatically scrolling cursor into view after selection change this will be disabled in the next version set editor.$blockScrolling = Infinity to disable this message
        editor.$blockScrolling = Infinity;

        ace.config.loadModule("ace/ext/language_tools", function () {
            //Init basic autocomplete and snippets
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true
            });

            //Init editor highlight
            editor.setTheme(EDITOR_THEME);
            session.setMode(EDITOR_MODE);

            //Delete info annotations
            session.on("changeAnnotation", function (e, sessionData) {
                var modifiedAnnotations = [],
                    hasChanged = false;

                if (sessionData.$annotations && sessionData.$annotations.length) {
                    for (var index = 0, length = sessionData.$annotations.length; index < length; index++) {
                        var annotation = sessionData.$annotations[index];

                        if (annotation.type !== 'info')
                            modifiedAnnotations.push(annotation);
                        else
                            hasChanged = true;
                    }

                    if (hasChanged)
                        session.setAnnotations(modifiedAnnotations);
                }
            });

            //Init wrap text
            session.setUseWrapMode(false);

            //Init fixture code
            editor.setValue(options.code, 1);

            //NOTE: ace editor bug. markup of editor  is yet not ready after call setValue
            //After call resize markup of editor is visible.
            editor.resize(true);

            editor.gotoLine(options.line);
            editor.scrollToLine(options.line - 1);

            //Set editor focus
            editor.focus();
        });

        var getCode = function () {
            return editor && session ? session.getValue() : null;
        };

        var destroyEditor = function () {
            if (editor) {
                session.$stopWorker();
                editor.destroy();
                $el.html('');
            }
        };

        var resizeEditor = function () {
            editor.resize();
        };

        return {
            getCode: getCode,
            destroyEditor: destroyEditor,
            resizeEditor: resizeEditor
        };
    };

    this.exports = codeEditor;
});
ControlPanel.define('Widgets.Dialog', function(require) {
    var $ = require('jQuery');

    // Consts
    var DIALOG_CLASS_NAME = 'dialog',
        DIALOG_HEADER_CLASS_NAME = 'dialog-header',
        DIALOG_CLOSE_BUTTON_CLASS_NAME = 'dialog-close-btn',
        DIALOG_CONTENT_CLASS_NAME = 'dialog-content',
        DIALOG_MODAL_OVERLAY_CLASS_NAME = 'dialog-modal-overlay',

        STORED_DATA_KEY = 'stored-data',
        STORED_TAB_INDEX_KEY = 'stored-tab-index';

    // Dialogs
    var getDlgInfo = function($el, options) {
            var dialogs = $.fn.testCafeDialogs.dialogs,
                dlgInfo = null,
                el = $el[0];

            $.each(dialogs, function() {
                if(this.elem === el)
                    dlgInfo = this.dlgInfo;
            });

            if(!dlgInfo) {
                dlgInfo = createDialog($el, options);

                dialogs.push({
                    elem : el,
                    dlgInfo : dlgInfo
                });
            }

            return dlgInfo;
        },

        createDialog = function($el, options) {
            var dlgInfo = {},
                dlgTitle = $el.attr('data-title');

            dlgInfo.dialogEl = $('<div>').appendTo($('body'));
            dlgInfo.headerEl = $('<div>').appendTo(dlgInfo.dialogEl);
            dlgInfo.contentEl = $el.detach();

            if(dlgTitle)
                dlgInfo.titleEl = $('<span>', { text : dlgTitle }).appendTo(dlgInfo.headerEl);

            dlgInfo.closeBtnEl = $('<div>', {title : 'close'}).appendTo(dlgInfo.headerEl);
            dlgInfo.dialogEl.append(dlgInfo.contentEl);
            dlgInfo.options = options;

            prepareDialog(dlgInfo);

            return dlgInfo;
        },

        prepareDialog = function(dlgInfo) {
            var options = dlgInfo.options;

            dlgInfo.dialogEl.addClass(DIALOG_CLASS_NAME);
            dlgInfo.headerEl.addClass(DIALOG_HEADER_CLASS_NAME);
            dlgInfo.closeBtnEl.addClass(DIALOG_CLOSE_BUTTON_CLASS_NAME);
            dlgInfo.contentEl.addClass(DIALOG_CONTENT_CLASS_NAME);

            if(options) {
                if(options.width)
                    dlgInfo.dialogEl.css( { width : options.width });
                if(options.dialogClass)
                    dlgInfo.dialogEl.addClass(options.dialogClass);
            }

            $(dlgInfo.closeBtnEl).click(function() {
                $(dlgInfo.contentEl).dialog('close');
            });
        },

        updateDlgPos = function() {
            var currDlgInfo = $.fn.testCafeDialogs.currDlgInfo;

            if(currDlgInfo) {
                var $dialogEl = currDlgInfo.dialogEl,
                    $doc = $(document),
                    $overlay = getOverlay(),
                    $window = $(window);

                $dialogEl.css({
                    top : Math.max(0, (($window.height() - $dialogEl.outerHeight(false)) / 2) + $window.scrollTop()),
                    left : Math.max(0, (($window.width() - $dialogEl.outerWidth(false)) / 2) + $window.scrollLeft())
                });

                $overlay.css({
                    width: $doc.width(),
                    height: $doc.height()
                });
            }
        },

        openDialog = function(dlgInfo) {
            if(dlgInfo !== $.fn.testCafeDialogs.currDlgInfo) {
                showOverlay();
                dlgInfo.dialogEl.css({ display : 'block' });
                $.fn.testCafeDialogs.currDlgInfo = dlgInfo;
                updateDlgPos();

                changeTabIndices();
                focusFirstInput(dlgInfo.contentEl);
            }
        },

        closeDialog = function(dlgInfo) {
            if(dlgInfo === $.fn.testCafeDialogs.currDlgInfo) {
                dlgInfo.dialogEl.css({ display : 'none' });
                hideOverlay();
                $.fn.testCafeDialogs.currDlgInfo = null;

                if(dlgInfo.options && dlgInfo.options.close)
                    dlgInfo.options.close();

                restoreTabIndices();
            }
        },

        destroy = function(dlgInfo) {
            var dialogs = $.fn.testCafeDialogs.dialogs;

            closeDialog(dlgInfo);

            dlgInfo.dialogEl.remove();

            for(var i = 0; i < dialogs.length; i++) {
                if(dialogs[i].dlgInfo === dlgInfo) {
                    dialogs.splice(i, 1);
                    return;
                }
            }
        },

        // Modal cover
        getOverlay = function() {
            $.fn.modalOverlay = $.fn.modalOverlay || createOverlay();

            return $.fn.modalOverlay;
        },

        createOverlay = function() {
            return $('<div>')
                .addClass(DIALOG_MODAL_OVERLAY_CLASS_NAME)
                .appendTo($('body'));
        },

        showOverlay = function() {
            var $html = $('html'),
                $overlay = getOverlay(),
                $window = $(window),
                storedWindowWidth = $window.width(),
                storedData = {
                    scrollLeft : $window.scrollLeft(),
                    scrollTop : $window.scrollTop(),
                    overflow : $html.css('overflow')
                };

            $html.css({ overflow : 'hidden' });
            $window.scrollLeft(storedData.scrollLeft).scrollTop(storedData.scrollTop);

            var widthDelta = $window.width() - storedWindowWidth;

            storedData.paddingRight = widthDelta > 0 ? $html.css('padding-right') : null;

            if(widthDelta > 0)
                $html.css({ 'padding-right' : widthDelta });

            $overlay.css({ display : 'block' });
            $html.data(STORED_DATA_KEY, storedData);
        },

        hideOverlay = function() {
            var $html = $('html'),
                $overlay = getOverlay(),
                storedData = $html.data(STORED_DATA_KEY);

            if(storedData.paddingRight)
                $html.css({ 'padding-right' : storedData.paddingRight });

            $html.css({ overflow : storedData.overflow});
            $(window).scrollLeft(storedData.scrollLeft).scrollTop(storedData.scrollTop);
            $overlay.css({ display : 'none' });
        },

        // Tab indeces

        changeTabIndices = function() {
            var currDlgInfo = $.fn.testCafeDialogs.currDlgInfo;

            $('*').each(function() {
                if(typeof this.focus === 'function') {
                    var $this = $(this),
                        isCurrDlgChild = currDlgInfo.dialogEl.has($this).length > 0;

                    if(!isCurrDlgChild) {
                        $this.data(STORED_TAB_INDEX_KEY, $this.attr('tabindex'));
                        $this.attr('tabindex', -1);
                    }
                }
            });
        },

        focusFirstInput = function($contentEl) {
            var $inputs = $contentEl.find('input, button');

            if($inputs.length)
                $inputs[0].focus();
        },

        restoreTabIndices = function() {
            $('[tabindex="-1"]').each(function() {
                var $this = $(this),
                    storedTabIndex = $this.data(STORED_TAB_INDEX_KEY);

                if(storedTabIndex)
                    $this.attr('tabindex', storedTabIndex);
                else
                    $this.removeAttr('tabindex');
            });
        },

        dialog = function(options){
            if(this.length > 1) {
                this.each(function() {
                    $(this).dialog(options);
                });
            } else {
                var dlgInfo = getDlgInfo(this, options);

                if(!options)
                    openDialog(dlgInfo);
                else if(typeof options === 'string') {
                    if(options === 'open')
                        openDialog(dlgInfo);
                    else if(options === 'close')
                        closeDialog(dlgInfo);
                    else if(options === 'destroy')
                        destroy(dlgInfo);
                } else {
                    if(options.autoOpen || typeof options.autoOpen === 'undefined')
                        openDialog(dlgInfo);
                }
            }

            return this;
        },

        keyupHandler = function(e) {
            var currDlgInfo = $.fn.testCafeDialogs.currDlgInfo;

            if(currDlgInfo && !currDlgInfo.options.disableKeysHandler) {
                if (e.keyCode === 27) // Esc
                    currDlgInfo.contentEl.dialog('close');
            }
        },

        scroll = function(e) {
            updateDlgPos();

            if($.fn.testCafeDialogs.currDlgInfo)
                return e.preventDefault();
        };

    $.fn.testCafeDialogs = {
        dialogs : [],
        currDlgInfo : null
    };

    $.fn.dialog = dialog;

    $(document).keyup(keyupHandler);

    $(window).bind({
        resize : updateDlgPos,
        scroll : scroll
    });
});
ControlPanel.define('Widgets.Draggable', function(require) {
    var $ = require('jQuery');

    var Draggable = function($el) {
        this.$el = $el;
        this.$cont = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isDraggable = false;

        this._initDraggable();
    };

    Draggable.prototype._dragElm = function (x, y) {
        var diffX = x - this.mouseX,
            diffY = y - this.mouseY,
            elTop = parseInt(this.$cont.css('top')),
            elLeft = parseInt(this.$cont.css('left'));

        this.$cont.css({
            'top': Math.max(elTop + diffY, 0) + 'px',
            'left': Math.max(elLeft + diffX, 0) + 'px'
        });

        this.mouseX = x;
        this.mouseY = y;
    };

    Draggable.prototype._initDraggable = function () {
        var draggable = this,
            $el = draggable.$el;

        draggable.$cont = $el.parent();

        $el.off('mousedown');

        $el.on('mousedown', function (e) {
            draggable.mouseX = e.pageX;
            draggable.mouseY = e.pageY;
            draggable.isDraggable = true;

            e.preventDefault();
        });

        $(document).bind('mouseup', function () {
            draggable.isDraggable = false;
        });

        $(document).bind('mousemove', function (e) {
            if (draggable.isDraggable)
                draggable._dragElm(e.pageX, e.pageY);
        });
    };

    $.fn.draggable = function() {
        return new Draggable(this);
    };
});
ControlPanel.define('Widgets.FixtureEditor', function (require) {
    require('Widgets.Dialog');
    require('Widgets.Draggable');
    require('Widgets.Resizable');

    var $ = require('jQuery'),
        CodeEditor = require('Widgets.CodeEditor'),
        Util = require('Util'),
        UXLog = require('UXLog');

    var CODE_EDITOR_DIALOG = '#code-editor-dialog',
        CODE_EDITOR_CONT = '#code-editor-cont',
        CODE_EDITOR_CANCEL_BTN = '#cancel-fixture-code-btn',
        UI_DIALOG_TITLE_CONT = '.dialog-header',
        CODE_EDITOR_SAVE_BTN = '#save-fixture-code-btn',
        UI_DIALOG_CLOSE_BTN = '.dialog-close-btn',
        RESIZE_CODE_EDITOR_DIALOG_CLASS = 'resize-code-editor',

        CODE_EDITOR_CLASS = 'code-editor',

        GET_FIXTURE_CODE_URL = '/get_fixture_code/',
        SAVE_FIXTURE_CODE_URL = '/save_fixture_code/',

        FIXTURE_CODE_PATTERN_TEXT = '^.*[\'"]@test[\'"]\\[[\'"]{0}[\'"]\\].*$',

        CODE_EDITOR_WIDTH = 980,
        CODE_EDITOR_HEIGHT = 500;

    var saveFixtureCode = function (options, curPath, fixtureFile, code) {
        options.onSaveClick();

        $.post(SAVE_FIXTURE_CODE_URL,
            {
                curPath: curPath,
                filename: fixtureFile,
                code: code
            },
            function () {
                options.onSaveSuccess(fixtureFile);
            }).error(function (data) {
                options.onSaveFail(data);
            }
        );
    };

    var findIndexOfStrAfterLineIndex = function(str, text, lineNumber) {
        var findStr = new RegExp(Util.prepareTextForRegExp(str), 'gm'),
            matchArr = text.match(findStr),
            lines = text.split('\n');

        for(var index = 0, length = matchArr.length; index < length; index++) {
            for(var strIndex = lineNumber, strLength = lines.length; strIndex < strLength; strIndex++) {
                if(lines[strIndex].indexOf(matchArr[index]) > -1)
                    return strIndex + 1;
            }
        }
    };

    this.exports.init = function (options) {
        var $cont = $(CODE_EDITOR_DIALOG),
            $codeEditorCont = $(CODE_EDITOR_CONT),
            curPath = null,
            editorApi = null,
            fixtureFile = '',
            $codeEditorDialog = $cont.dialog({
                autoOpen: false,
                dialogClass: CODE_EDITOR_CLASS,
                width: 'auto',
                disableKeysHandler: true
            });

        $(document).on('click', options.openBtn, function (e) {
            var $btn = $(this),
                curTestName = options.getCurrentTestName($btn),
                curStep = options.hasOwnProperty('getCurrentStep') ? options.getCurrentStep($btn) : '',
                curAssert = options.hasOwnProperty('getCurrentAssert') ? options.getCurrentAssert($btn) : '';

            curPath = options.getCurrentPath($btn);
            fixtureFile = options.getFileName($btn);

            UXLog.write('Project: Fixture code editor opened');

            $.post(GET_FIXTURE_CODE_URL, {
                curPath: curPath,
                fixtureFile: fixtureFile
            },function (fixtureCode) {
                $codeEditorDialog.dialog('open');

                //NOTE: fixtureCodeMod used only for finding a line number for testname and contains modified source code
                // convert new line symbol \r\n -> \n
                // remove escaping for quotes. It will not cause a conflict the test names,
                // because for code parser test name 'test\'' is equivalent "test'"
                // cut comment /*...*/, it need if testname string contains comment
                var fixtureCodeMod = fixtureCode.replace(/\r/g, '')
                        .replace(/\\"/g, '"')
                        .replace(/\\'/g, '\'')
                        .replace(/\/\*.*?\*\//g, ''),
                    lineNumber = 1;

                //NOTE: escaping symbols used in regexp.
                curTestName = Util.prepareTextForRegExp(curTestName);

                if (curTestName) {
                    try {
                        var findLineExp = new RegExp(Util.formatText(FIXTURE_CODE_PATTERN_TEXT, curTestName), 'gm'),
                            lineCode = fixtureCodeMod.match(findLineExp)[0];

                        lineNumber = fixtureCodeMod.split('\n').indexOf(lineCode) + 1;

                        if(curStep) {
                            var stepLine = findIndexOfStrAfterLineIndex(curStep, fixtureCodeMod, lineNumber);
                            lineNumber = stepLine ? stepLine : lineNumber;

                            if(curAssert) {
                                var curAssertArr = curAssert.split('\n');

                                curAssert = curAssertArr.length > 1 ? curAssertArr[0].replace(/\r/g, '') : curAssert;

                                var assertLine = findIndexOfStrAfterLineIndex(curAssert, fixtureCodeMod, lineNumber);
                                lineNumber = assertLine ? assertLine : lineNumber;
                            }
                        }

                    } catch (e) {
                        //NOTE: fallback if test name wasn't found. Open editor on first line.
                    }
                }

                editorApi = CodeEditor($codeEditorCont, {
                    code: fixtureCode,
                    line: lineNumber
                });
            }).error(function (res) {
                    $codeEditorDialog.dialog('close');
                    options.onOpenFail(res);
                });

            e.stopImmediatePropagation();
        });

        $(CODE_EDITOR_CONT).css({
            width: CODE_EDITOR_WIDTH,
            height: CODE_EDITOR_HEIGHT
        });

        $cont.parent().find(UI_DIALOG_TITLE_CONT).draggable();
        $(CODE_EDITOR_CONT).resizable({
            minWidth: CODE_EDITOR_WIDTH,
            minHeight: CODE_EDITOR_HEIGHT,
            resizeMarkerClass: RESIZE_CODE_EDITOR_DIALOG_CLASS,
            action: function () {
                editorApi.resizeEditor();
            }
        });

        $(document).on('click', CODE_EDITOR_CANCEL_BTN, function () {
            $codeEditorDialog.dialog('close');
            editorApi.destroyEditor();
        });

        $codeEditorDialog.find(UI_DIALOG_CLOSE_BTN).click(function () {
            editorApi.destroyEditor();
        });

        $(document).on('click', CODE_EDITOR_SAVE_BTN, function () {
            var fixtureCode = editorApi.getCode();

            saveFixtureCode(options, curPath, fixtureFile, fixtureCode);
            $codeEditorDialog.dialog('close');
            editorApi.destroyEditor();
        });
    };
});
ControlPanel.define('Widgets.NotificationsList', function(require) {
    var $ = require('jQuery'),
        Util = require('Util'),
        UXLog = require('UXLog');

    var
        //Classes
        MSGS_CONT_FIXED_CLASS = 'fixed',
        ERR_FRAME_CLASS = 'err hidden',
        TITLE_CLASS = 'title',
        CLOSE_BUTTON_CLASS = 'close-button',
        TASK_RESULTS_CLASS = 'task-results',
        TASK_NAME_CLASS = 'task-name',
        HIDDEN_CLASS = 'hidden',

        //Metrics
        STATUS_FRAME_FADE_DURATION = 3000,
        STATUS_FRAME_FREEZE_DURATION = 5000,

        //Url
        TRACK_TASK_URL = '/results/',

        //Templates
        TASK_RESULTS_TMPL = '' +
            '<a href="' + TRACK_TASK_URL + '{0}" target="_blank"><div class="stats {1}">' +
            '<ul>' +
            '<li><p>{2}</p><p>Passed</p></li>' +
            '<li><p>{3}</p><p>Failed</p></li>' +
            '<li><p>{4}</p><p>Total</p></li>' +
            '</ul></div>' +
            '</a>';

    var NotificationsList = function(options) {
        this.statusContainerOffset = 0;
        this.el = options.selector;
        this.topOffset = options.topOffset;
        this.leftOffset = options.leftOffset;
        this.bottomOffset = options.bottomOffset;

        this._initNotificationList();
    };

    NotificationsList.prototype.showStatus = function (className, $content, link) {
        var nl = this,
            $container = $(this.el),
            $status = $('<div></div>')
                .addClass(className)
                .prependTo($container);

        var $title = !link ? $('<p></p>') : $('<a href="' + link + '" target="_blank"></a>');

        $title.addClass(TITLE_CLASS)
            .appendTo($status);

        if (link) {
            $title.html('<a></a>')
                .on('click', function () {
                    //TODO check uxlog
                    UXLog.write('Project: track task link clicked');
                });
        }

        $content.appendTo($title);
        $status.show();

        $status.effect('pulsate', { times: 3 }, 'fast', function () {
            nl._removeNotificationByTimeout($status);
        });
    };

    NotificationsList.prototype.showPermanentErrorMsg = function (text) {
        var $container = $(this.el);

        var $err = $('<div></div>')
            .addClass(ERR_FRAME_CLASS)
            .prependTo($container);

        var $errTitle = $('<p></p>')
            .addClass(TITLE_CLASS)
            .text(text)
            .appendTo($err);

        $('<span></span>')
            .addClass(CLOSE_BUTTON_CLASS)
            .appendTo($errTitle)
            .click(function () {
                $err.remove();
            });

        $err.effect('pulsate', {times: 3}, 'fast');
    };

    NotificationsList.prototype.showTaskCompleteMsg = function (data) {
        var nl = this;

        if (data.taskUid) {
            var $report = $('<div></div>').addClass(TASK_RESULTS_CLASS);

            $report.append(Util.formatText(TASK_RESULTS_TMPL, data.taskUid, data.status, data.passed, data.failed, data.total));

            $('<span></span>')
                .text(data.taskName)
                .addClass(TASK_NAME_CLASS)
                .prependTo($report.find('div').eq(0))
                .on('click', function () {
                    UXLog.write('Project: track completed task link clicked');
                });

            $report.prependTo($(nl.el));
            $report.effect('pulsate', { times: 3 }, 'fast', function () {
                nl._removeNotificationByTimeout($report);
            });
        }
    };

    NotificationsList.prototype.updateTopOffset = function () {
        var $msgCont = $(this.el);

        this.statusContainerOffset = $msgCont.offset().top - parseInt($msgCont.css('margin-top')) || 0;
    };

    NotificationsList.prototype.removeFixedState = function() {
        $(this.el).removeClass(MSGS_CONT_FIXED_CLASS).css('left', 'auto');
    };

    NotificationsList.prototype.updatePosition = function() {
        this._setPositionMsgsCont();
    };

    NotificationsList.prototype.clearList = function() {
        $(this.el).html('');
    };

    NotificationsList.prototype.hide = function() {
        $(this.el).addClass(HIDDEN_CLASS);
    };

    NotificationsList.prototype.show = function() {
        $(this.el).removeClass(HIDDEN_CLASS);
    };

    NotificationsList.prototype._removeNotificationByTimeout = function($msg) {
        var createTimeout = function () {
            return window.setTimeout(function () {
                $msg.fadeOut(STATUS_FRAME_FADE_DURATION, function () {
                    $msg.remove();
                });
            }, STATUS_FRAME_FREEZE_DURATION);
        };

        var timeout = createTimeout();

        $msg.hover(function () {
            window.clearTimeout(timeout);
            $msg.stop(true, false);
            $msg.css('opacity', '1');
        }, function () {
            timeout = createTimeout();
        });
    };

    NotificationsList.prototype._setPositionMsgsCont = function () {
        var $msgCont = $(this.el);

        if ($(document).scrollTop() + this.topOffset >= this.statusContainerOffset) {
            $msgCont.addClass(MSGS_CONT_FIXED_CLASS);
            $msgCont.css('left', this.leftOffset - $msgCont.width() - parseInt($msgCont.css('padding-right')));

            var maxAvailableStackSize = 0,
                curStackSize = 0,
                msgContMarginTop = parseInt($msgCont.css('margin-top')) || 0,
                $msgs = $msgCont.children('div');

            maxAvailableStackSize = $(window).height() - msgContMarginTop - this.topOffset - this.bottomOffset;

            $msgs.each(function (index) {
                var $el = $msgs.eq(index);

                curStackSize += $el.height() + parseInt($el.css('margin-top'));

                if (curStackSize > maxAvailableStackSize)
                    $el.hide();
                else
                    $el.show();
            });
        }
        else {
            $msgCont.removeClass(MSGS_CONT_FIXED_CLASS).css('left', 'auto');
            $msgCont.find('div').show();
        }
    };

    NotificationsList.prototype._initNotificationList = function() {
        var nl = this;

        nl.updateTopOffset();

        $(window).scroll(function () {
            nl._setPositionMsgsCont();
        });

        $(window).resize(function () {
            nl._setPositionMsgsCont();
        });
    };

    this.exports = function(options) {
        return new NotificationsList(options);
    };
});
ControlPanel.define('Widgets.Resizable', function(require) {
    var $ = require('jQuery');

    var DIALOG_CONTENT = '.dialog-content',
        RESIZE_MARKER_STYLE_CLASS = 'resize-marker';

    var Resizable = function($el, options) {
        this.$el = $el;
        this.isResize = false;
        this.mouseX = 0;
        this.mouseY = 0;

        this.settings = {
            minHeight: 0,
            minWidth: 0,
            action: null,
            resizeMarkerClass: RESIZE_MARKER_STYLE_CLASS
        };

        $.extend(this.settings, options);
        this._initResizable();
    };

    Resizable.prototype._createResizeMarker = function () {
        var $el = this.$el,
            settings = this.settings,
            resizeMarkerClass = this.settings.resizeMarkerClass,
            resizeMarkerSel = '.' + resizeMarkerClass,
            $existingResizeMarker = $(resizeMarkerSel);

        if($existingResizeMarker.length)
            $existingResizeMarker.remove();

        $el.closest(DIALOG_CONTENT).prepend('<div class="' + [resizeMarkerClass, RESIZE_MARKER_STYLE_CLASS].join(' ') + '"></div>');

        var $resizeMarker = $(resizeMarkerSel);

        $resizeMarker.css({
            position: 'absolute',
            cursor: 'nw-resize'
        });

        if(settings.minWidth && $el.width() < settings.minWidth)
            $el.css('width', settings.minWidth);

        if(settings.minHeight && $el.height() < settings.minHeight)
            $el.css('height', settings.minHeight);

        return $resizeMarker;
    };

    Resizable.prototype._resizeEl = function (x, y) {
        var $el = this.$el,
            settings = this.settings,
            widthDiff = x - this.mouseX,
            heightDiff = y - this.mouseY,
            elHeight = $el.height(),
            elWidth = $el.width(),
            newHeight = settings.minHeight,
            newWidth = settings.minWidth;

        if (elHeight + heightDiff > settings.minHeight) {
            newHeight = elHeight + heightDiff;
            this.mouseY = y;
        }

        if (widthDiff + elWidth > settings.minWidth) {
            this.mouseX = x;
            newWidth = widthDiff + elWidth;
        }

        $el.css({
            'height': newHeight + 'px',
            'width': newWidth + 'px'
        });

        if (typeof settings.action === 'function')
            settings.action();
    };

    Resizable.prototype._initResizable = function () {
        var resizeMarker = this._createResizeMarker(),
            resizable = this;

        resizeMarker.bind('mousedown', function (e) {
            resizable.isResize = true;
            resizable.mouseX = e.pageX;
            resizable.mouseY = e.pageY;

            e.preventDefault();
        });

        $(document).bind('mouseup', function () {
            resizable.isResize = false;
        });

        $(document).bind('mousemove', function (e) {
            if (resizable.isResize) {
                resizable._resizeEl(e.pageX, e.pageY);
                e.preventDefault();
            }
        });
    };

    $.fn.resizable = function(options) {
        return new Resizable(this, options);
    };
});
ControlPanel.define('Widgets.ScrollBar', function(require) {
    var $ = require('jQuery');

    var SCROLL_MIN_HEIGHT = 10,
        SCROLL_RIGHT_MARGIN = '5px',
        SCROLL_MIN_INNER_WIDTH = '5px',
        SCROLL_MIN_OUTER_WIDTH = '15px',
        SCROLL_BAR_COLOR = '#bebebe',
    //Classes
        SCROLL_BAR_CLASS = 'scrollbar';

    var onScrollDrag = function (e) {
        var diff = e.pageY - this.mouseYCoord,
            scrollTop = parseInt(this.$scrollBar.css('top')),
            scrollHeight = this.$scrollBar.outerHeight(false);

        if (diff > 0)
            scrollTop = Math.min(scrollTop + diff, this.elHeight - scrollHeight);
        else
            scrollTop = Math.max(scrollTop + diff, 0);

        var offset = Math.floor(scrollTop * this.contentHeight / this.elHeight);
        this.$el.scrollTop(offset);

        this.mouseYCoord = e.pageY;
        this.$scrollBar.css('top', scrollTop + 'px');
    };

    var onWheel = function (e) {
        var diff = e.originalEvent.wheelDelta || -e.originalEvent.deltaY * 8,
            elOffsetTop = this.$el.scrollTop(),
            scrollHeight = this.$scrollBar.outerHeight(false),
            scrollTop = parseInt(this.$scrollBar.css('top')),
            scrollBar = this;

        var getScrollOffset = function() {
            return Math.floor(scrollBar.$el.scrollTop() / scrollBar.contentHeight * scrollBar.elHeight);
        };

        if (diff > 0) {
            this.$el.scrollTop(Math.max(elOffsetTop - diff, 0));
            scrollTop = Math.max(getScrollOffset(), 0);
        } else {
            this.$el.scrollTop(Math.min(elOffsetTop - diff, this.contentHeight - this.elHeight));
            scrollTop = Math.min(getScrollOffset(), this.elHeight - scrollHeight);
        }

        this.$scrollBar.css('top', scrollTop + 'px');

        e.preventDefault();
        e.stopImmediatePropagation();
    };

    var ScrollBar = function($el, options) {
        this.$el = $el;
        this.contentHeight = 0;
        this.isScrollDragging = false;
        this.mouseYCoord = 0;
        this.elHeight = 0;
        this.$scrollBar = null;
        this.settings = {
            scrollTo: null,
            scrollClass: null
        };

        $.extend(this.settings, options);
        this._initScrollBar();
    };

    ScrollBar.prototype._getScrollHeight = function() {
        if (this.elHeight >= this.contentHeight)
            return 0;

        var height = Math.floor(this.elHeight / this.contentHeight * this.elHeight);

        return height > SCROLL_MIN_HEIGHT ? height : SCROLL_MIN_HEIGHT;
    };

    ScrollBar.prototype._getContentHeight = function() {
        return this.$el[0].scrollHeight - parseInt(this.$el.css('padding-top')) - parseInt(this.$el.css('padding-bottom'));
    };

    ScrollBar.prototype._isVisible = function($item) {
        var offset = $item.offset().top - this.$el.offset().top;

        return (offset > 0 && offset < this.elHeight);
    };

    ScrollBar.prototype._paintScrollBar = function () {
        var scrollBarClass = this.settings.scrollClass || SCROLL_BAR_CLASS,
            scrollBarSelector = '.' + scrollBarClass,
            $existsScrollBar = this.$el.parent().find(scrollBarSelector);

        if ($existsScrollBar.length)
             $existsScrollBar.remove();

        this.$el.before('<div class="' + scrollBarClass + '"></div>');

        var $scrollBar = $(scrollBarSelector),
            scrollHeight = this._getScrollHeight(),
            elScrollTop = this.$el.scrollTop(),
            top = Math.ceil(Math.min(elScrollTop / this.contentHeight * this.elHeight, this.elHeight - scrollHeight));

        $scrollBar.css({
            float: 'right',
            position: 'absolute',
            height: scrollHeight,
            width: SCROLL_MIN_OUTER_WIDTH,
            right: SCROLL_RIGHT_MARGIN,
            cursor: 'pointer',
            top: top + 'px'
        }).html('<div></div>');

        $scrollBar.find('div').css({
            height: scrollHeight,
            width: SCROLL_MIN_INNER_WIDTH,
            'background-color': SCROLL_BAR_COLOR
        });

        return $scrollBar;
    };

    ScrollBar.prototype._initScrollBar = function() {
        var scrollBar = this,
            $scrollTo = $(this.settings.scrollTo);

        this.$el.css({
            'overflow-y': 'hidden'
        });

        this.contentHeight = this._getContentHeight();
        this.elHeight = this.$el.height();

        if($scrollTo && $scrollTo.length && !this._isVisible($scrollTo)) {
            var scrollingOffset = $scrollTo.offset().top - this.$el.children().eq(0).offset().top;

            this.$el.scrollTop(scrollingOffset);
            this.settings.scrollTo = null;
        }

        this.$scrollBar = this._paintScrollBar();

        var wheelEvent = typeof document.onwheel !== 'undefined' ? 'wheel' : 'mousewheel';

        this.$el.off(wheelEvent);
        this.$el.bind(wheelEvent, function(e) {
            onWheel.call(scrollBar, e);
        });

        this.$scrollBar.off('mousedown');
        this.$scrollBar.bind('mousedown', function (e) {
            scrollBar.isScrollDragging = true;
            scrollBar.mouseYCoord = e.pageY;

            e.preventDefault();
        });

        $(document).bind('mouseup', function () {
            scrollBar.isScrollDragging = false;
        });

        $(document).bind('mousemove', function (e) {
            if (scrollBar.isScrollDragging) {
                onScrollDrag.call(scrollBar, e);
                e.preventDefault();
            }
        });
    };

    $.fn.scrollBar = function(options){
        return new ScrollBar(this, options);
    };
});
ControlPanel.define('Widgets.TreeView', function(require) {
    var $ = require('jQuery');

    //Consts
    var //Classes
        SELECTED_CLASS = 'selected',
        EXPANDED_CLASS = 'expanded',
        DIR_NAME_LABEL_CLASS = 'dir-name-label',
        EXPAND_BTN_OPENED_CLASS = 'expand-btn-opened',
        PRELOADER_CLASS = 'preloader',
        EXPAND_ICON_CLASS = 'expand-icon',
        FOLDER_ICON_CLASS = 'folder-icon',
        PROJECT_FOLDER_ICON_CLASS = 'project-folder-icon',
        FILE_ICON_CLASS = 'file-icon',
        FOLDER_CLASS = 'folder',
    //Selectors
        PRELOADER = '.preloader',
        EXPAND_ICON = '.expand-icon',
    //Attr
        PATH_ATTR = 'data-path',

        PATH_SEP = '/';

    var $document = $(document);

    var formatPath = function (path) {
        return path.replace(/\\/g, '/').replace(/\/{2}/g, '/');
    };

    var TreeView = function ($el, options) {
        this.$el = $el;
        this.settings = {
            url: null,
            open: null,
            effect: null,
            time: 0,
            asyncAction: null,
            selectAction: null
        };

        $.extend(this.settings, options);
        this._initTreeview();
    };

    TreeView.prototype._callAsyncAction = function () {
        if (typeof this.settings.asyncAction === 'function')
            this.settings.asyncAction();
    };

    TreeView.prototype._animateEl = function ($item, collapse, callback) {
        var time = this.settings.time,
            effect = this.settings.effect;

        if ($item.is(":visible")) {
            var $content = $item.children('ul'),
                height = $content.outerHeight(false);

            if (!collapse) {
                switch (effect) {
                    case 'animate':
                        $content.css({
                            height: 0,
                            opacity: 0,
                            overflow: 'hidden'
                        });

                        $content.animate({
                            height: height,
                            opacity: 1
                        }, time, function () {
                            $content.css('height', 'auto');
                            callback();
                        });

                        break;

                    case 'fadeIn':
                        $content.css('display', 'none');
                        $content.fadeIn(time, callback);

                        break;

                    default:
                        callback();
                        break;
                }
            }
            else {
                switch (effect) {
                    case 'animate':
                        $content.animate({
                            height: 0,
                            opacity: 0
                        }, time, callback);

                        break;

                    case 'fadeIn':
                        $content.fadeOut(time, callback);

                        break;

                    default:
                        callback();
                        break;
                }
            }
        }
        else
            callback();
    };

    TreeView.prototype._expandElm = function ($item, callback) {
        var treeview = this,
            url = treeview.settings.url,
            path = $item ? $item.attr(PATH_ATTR) : '';

        if (($item && $item.hasClass(EXPANDED_CLASS)) || (!$item && treeview.$el.find('li').length)) {
            if ($item)
                treeview._setSelected($item);

            callback();
            return;
        }

        var callbackFn = function () {
            treeview._callAsyncAction();
            callback();
        };

        if ($item)
            $item.append('<span class="' + PRELOADER_CLASS + '"></span>');

        $.get(url, {path: path}, function (itemsData) {
            var items = '';

            for (var i = 0, length = itemsData.length; i < length; i++) {
                if (itemsData[i].type === 'dir') {
                    items += '<li ' + PATH_ATTR + '=' + itemsData[i].id + ' class="' + FOLDER_CLASS + '">' +
                        '<span class=' + EXPAND_ICON_CLASS + '></span>';

                    if (itemsData[i].isProjectDir)
                        items += '<span class="' + PROJECT_FOLDER_ICON_CLASS + '"></span>';
                    else
                        items += '<span class="' + FOLDER_ICON_CLASS + '"></span>';

                    items += '<span class="' + DIR_NAME_LABEL_CLASS + '">' + itemsData[i].text + '</span></li>';
                } else {
                    items += '<li ' + PATH_ATTR + '=' + itemsData[i].id + '>' +
                        '<span></span>' +
                        '<span class="' + FILE_ICON_CLASS + '"></span>' +
                        '<span class="' + DIR_NAME_LABEL_CLASS + '">' + itemsData[i].text + '</span></li>';
                }
            }

            if ($item) {
                $item.children(PRELOADER).remove();
                items = '<ul>' + items + '</ul>';

                $item.children('span').addClass(EXPAND_BTN_OPENED_CLASS);
                $item.addClass(EXPANDED_CLASS).html($item.html() + items);

                treeview._setSelected($item);

                if (treeview.settings.effect)
                    treeview._animateEl($item, false, function () {
                        callbackFn();
                    });
                else
                    callbackFn();
            }
            else {
                treeview.$el.html(items);
                callbackFn();
            }
        });
    };

    TreeView.prototype._setSelected = function ($item) {
        if ($item && $item.length) {
            this.$el.find('li').removeClass(SELECTED_CLASS);
            $item.addClass(SELECTED_CLASS);
        }
    };

    TreeView.prototype._openNode = function (path) {
        var treeview = this,
            $el = treeview.$el,
            pathArr = formatPath(path).split(PATH_SEP),
            currPath = '',
            $currItem = null,
            tmpEffect = null;

        if (pathArr.length > 1 && !pathArr[pathArr.length - 1])
            pathArr.pop();

        var tmp = treeview.settings.asyncAction,
            effectTmp = treeview.settings.effect;

        treeview.settings.asyncAction = function () {
        };
        treeview.settings.effect = false;

        var expandNode = function () {
            if (pathArr.length) {
                var pathEl = pathArr.shift();

                if (currPath)
                    currPath += (currPath[currPath.length - 1] === PATH_SEP) ? pathEl : PATH_SEP + pathEl;
                else
                    currPath = pathEl + PATH_SEP;

                var encodePathDirectSlash = encodeURIComponent(currPath),
                    encodePathBackSlash = encodeURIComponent(currPath.replace(/\//g, '\\')),
                    $item = $el.find('li[' + PATH_ATTR + '="' + encodePathDirectSlash + '"]');

                if (!$item.length)
                    $item = $el.find('li[' + PATH_ATTR + '="' + encodePathBackSlash + '"]');

                //NOTE: live search support. Will find '\path\name_' in '\path\name_of_program'.
                if (!$item.length) {
                    var items = treeview.$el.find('li').map(function () {
                        return $(this).attr('data-path');
                    });

                    for (var index = 0, length = items.length; index < length; index++) {
                        if (items[index].indexOf(encodePathDirectSlash) === 0 ||
                            items[index].indexOf(encodePathBackSlash) === 0) {

                            $item = $el.find('li[' + PATH_ATTR + '="' + items[index] + '"]');

                            tmpEffect = treeview.settings.effect;
                            treeview.settings.effect = '';

                            break;
                        }
                    }
                }

                treeview._expandElm($item, function () {
                    if (tmpEffect)
                        treeview.settings.effect = tmpEffect;

                    expandNode();
                });

                $currItem = $item;

            } else {
                treeview.settings.asyncAction = tmp;
                treeview.settings.asyncAction();
                treeview.settings.effect = effectTmp;
            }
        };
        expandNode();
    };

    TreeView.prototype._initTreeview = function () {
        var treeview = this;

        treeview._expandElm(null, function () {
            if (treeview.settings.open)
                treeview._openNode(treeview.settings.open);
        });

        var expandHandler = function ($item, e) {
            if (treeview.settings.url && !$item.hasClass(EXPANDED_CLASS))
                treeview._expandElm($item, function () {
                });
            else {
                treeview._animateEl($item, true, function () {
                    $item.children('span').removeClass(EXPAND_BTN_OPENED_CLASS);
                    $item.removeClass(EXPANDED_CLASS).find('ul').remove();

                    treeview._callAsyncAction();
                });
            }

            e.stopPropagation();
        };

        $document.on('dblclick', treeview.$el.selector + ' li', function (e) {
            var $item = $(this);

            if ($item.hasClass(FOLDER_CLASS))
                expandHandler($item, e);

            e.stopImmediatePropagation();
        });

        $document.on('click', treeview.$el.selector + ' li', function (e) {
            treeview._setSelected($(this));

            if(treeview.settings.selectAction)
                treeview.settings.selectAction($(this));

            e.stopImmediatePropagation();
        });

        $document.on('click', treeview.$el.selector + ' ' + EXPAND_ICON, function (e) {
            var $item = $(this).parent();

            if ($item.hasClass(EXPANDED_CLASS)) {
                treeview._setSelected($item);
                $item.dblclick();
            }

            e.stopImmediatePropagation();
        });
    };

    $.fn.treeView = function (options) {
        return new TreeView(this, options);
    };
});