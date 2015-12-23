/*!
    * Sizzle CSS Selector Engine
    *  Copyright 2012 jQuery Foundation and other contributors
    *  Released under the MIT license
    *  http://sizzlejs.com/
    */
(function (window, undefined) {
    var dirruns, cachedruns, assertGetIdNotName, Expr, getText, isXML, contains, compile, sortOrder, hasDuplicate, baseHasDuplicate = true, strundefined = "undefined", expando = ("sizcache" +
                                                                                                                                                                                   Math.random()).replace(".", ""), document = window.document, docElem = document.documentElement, done = 0, slice = [].slice, push = [].push,
        // Augment a function for special use by Sizzle
        markFunction = function (fn, value) {
            fn[expando] = value || true;
            return fn;
        }, createCache = function () {
            var cache = {}, keys = [];
            return markFunction(function (key, value) {
                // Only keep the most recent entries
                if (keys.push(key) > Expr.cacheLength) {
                    delete cache[keys.shift()];
                }
                return window.__set$(cache, key, value);
            }, cache);
        }, classCache = createCache(), tokenCache = createCache(), compilerCache = createCache(),
        // Regex
        // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
        whitespace = "[\\x20\\t\\r\\n\\f]",
        // http://www.w3.org/TR/css3-syntax/#characters
        characterEncoding = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",
        // Loosely modeled on CSS identifier characters
        // An unquoted value should be a CSS identifier (http://www.w3.org/TR/css3-selectors/#attribute-selectors)
        // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
        identifier = characterEncoding.replace("w", "w#"),
        // Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
        operators = "([*^$|!~]?=)", attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" +
                                                 whitespace + "*(?:" + operators + whitespace +
                                                 "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier +
                                                 ")|)|)" + whitespace + "*\\]",
        // Prefer arguments not in parens/brackets,
        //   then attribute selectors and non-pseudos (denoted by :),
        //   then anything else
        // These preferences are here to reduce the number of selectors
        //   needing tokenize in the PSEUDO preFilter
        pseudos = ":(" + characterEncoding + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" +
                  attributes + ")|[^:]|\\\\.)*|.*))\\)|)",
        // For matchExpr.POS and matchExpr.needsContext
        pos = ":(nth|eq|gt|lt|first|last|even|odd)(?:\\(((?:-\\d)?\\d*)\\)|)(?=[^-]|$)",
        // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
        rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace +
                           "+$", "g"), rcomma = new RegExp("^" + whitespace + "*," + whitespace +
                                                           "*"), rcombinators = new RegExp("^" + whitespace +
                                                                                           "*([\\x20\\t\\r\\n\\f>+~])" +
                                                                                           whitespace +
                                                                                           "*"), rpseudo = new RegExp(pseudos),
        // Easily-parseable/retrievable ID or TAG or CLASS selectors
        rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/, rnot = /^:not/, rsibling = /[\x20\t\r\n\f]*[+~]/, rendsWithNot = /:not\($/, rheader = /h\d/i, rinputs = /input|select|textarea|button/i, rbackslash = /\\(?!\\)/g, matchExpr = {
            "ID":           new RegExp("^#(" + characterEncoding + ")"),
            "CLASS":        new RegExp("^\\.(" + characterEncoding + ")"),
            "NAME":         new RegExp("^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]"),
            "TAG":          new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
            "ATTR":         new RegExp("^" + attributes),
            "PSEUDO":       new RegExp("^" + pseudos),
            "CHILD":        new RegExp("^:(only|nth|last|first)-child(?:\\(" + whitespace +
                                       "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" +
                                       whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
            "POS":          new RegExp(pos, "ig"),
            // For use in libraries implementing .is()
            "needsContext": new RegExp("^" + whitespace + "*[>+~]|" + pos, "i")
        },
        // Support
        // Used for testing something on an element
        assert = function (fn) {
            var div = document.createElement("div");
            try {
                return fn(div);
            } catch (e) {
                return false;
            } finally {
                // release memory in IE
                div = null;
            }
        },
        // Check if getElementsByTagName("*") returns only elements
        assertTagNameNoComments = assert(function (div) {
            div.appendChild(document.createComment(""));
            return !div.getElementsByTagName("*").length;
        }),
        // Check if getAttribute returns normalized href attributes
        assertHrefNotNormalized = assert(function (div) {
            div.innerHTML = "<a href='#'></a>";
            return div.firstChild &&
                   typeof div.firstChild.getAttribute !== strundefined &&
                   div.firstChild.getAttribute("href") === "#";
        }),
        // Check if attributes should be retrieved by attribute nodes
        assertAttributes = assert(function (div) {
            div.innerHTML = "<select></select>";
            var type      = typeof div.lastChild.getAttribute("multiple");
            // IE8 returns a string for some attributes even when not present
            return type !== "boolean" && type !== "string";
        }),
        // Check if getElementsByClassName can be trusted
        assertUsableClassName = assert(function (div) {
            // Opera can't find a second classname (in 9.6)
            div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
            if (!div.getElementsByClassName || !div.getElementsByClassName("e").length) {
                return false;
            }
            // Safari 3.2 caches class attributes and doesn't catch changes
            div.lastChild.className = "e";
            return div.getElementsByClassName("e").length === 2;
        }),
        // Check if getElementById returns elements by name
        // Check if getElementsByName privileges form controls or returns elements by ID
        assertUsableName = assert(function (div) {
            // Inject content
            div.id        = expando + 0;
            div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
            docElem.insertBefore(div, docElem.firstChild);
            // Test
            var pass           = document.getElementsByName && // buggy browsers will return fewer than the correct 2
                                 document.getElementsByName(expando).length ===
                                 2 + document.getElementsByName(expando + 0).length;
            assertGetIdNotName = !document.getElementById(expando);
            // Cleanup
            docElem.removeChild(div);
            return pass;
        });
    // If slice is not available, provide a backup
    try {
        slice.call(docElem.childNodes, 0)[0].nodeType;
    } catch (e) {
        slice = function (i) {
            var elem, results = [];
            for (; elem = window.__get$(this, i); i++) {
                results.push(elem);
            }
            return results;
        };
    }
    function Sizzle (selector, context, results, seed) {
        results                           = results || [];
        context                           = context || document;
        var match, elem, xml, m, nodeType = context.nodeType;
        if (nodeType !== 1 && nodeType !== 9) {
            return [];
        }
        if (!selector || typeof selector !== "string") {
            return results;
        }
        xml = isXML(context);
        if (!xml && !seed) {
            if (match = rquickExpr.exec(selector)) {
                // Speed-up: Sizzle("#ID")
                if (m = match[1]) {
                    if (nodeType === 9) {
                        elem = context.getElementById(m);
                        // Check parentNode to catch when Blackberry 4.6 returns
                        // nodes that are no longer in the document #6963
                        if (elem && elem.parentNode) {
                            // Handle the case where IE, Opera, and Webkit return items
                            // by name instead of ID
                            if (elem.id === m) {
                                results.push(elem);
                                return results;
                            }
                        }
                        else {
                            return results;
                        }
                    }
                    else {
                        // Context is not a document
                        if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
                            contains(context, elem) && elem.id === m) {
                            results.push(elem);
                            return results;
                        }
                    }
                }
                else if (match[2]) {
                    push.apply(results, slice.call(context.getElementsByTagName(selector), 0));
                    return results;
                }
                else if ((m = match[3]) && assertUsableClassName && context.getElementsByClassName) {
                    push.apply(results, slice.call(context.getElementsByClassName(m), 0));
                    return results;
                }
            }
        }
        // All others
        return select(selector, context, results, seed, xml);
    }

    Sizzle.matches         = function (expr, elements) {
        return Sizzle(expr, null, null, elements);
    };
    Sizzle.matchesSelector = function (elem, expr) {
        return window.__get$(Sizzle(expr, null, null, [elem]), "length") > 0;
    };
    // Returns a function to use in pseudos for input types
    function createInputPseudo (type) {
        return function (elem) {
            var name = elem.nodeName.toLowerCase();
            return name === "input" && elem.type === type;
        };
    }

    // Returns a function to use in pseudos for buttons
    function createButtonPseudo (type) {
        return function (elem) {
            var name = elem.nodeName.toLowerCase();
            return (name === "input" || name === "button") && elem.type === type;
        };
    }

    /**
     * Utility function for retrieving the text value of an array of DOM nodes
     * @param {Array|Element} elem
     */
    getText = Sizzle.getText = function (elem) {
        var node, ret = "", i = 0, nodeType = elem.nodeType;
        if (nodeType) {
            if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                // Use textContent for elements
                // innerText usage removed for consistency of new lines (see #11153)
                if (typeof window.__get$(elem, "textContent") === "string") {
                    return window.__get$(elem, "textContent");
                }
                else {
                    // Traverse its children
                    for (elem = window.__get$(elem, "firstChild"); elem; elem = elem.nextSibling) {
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
            for (; node = window.__get$(elem, i); i++) {
                // Do not traverse comment nodes
                ret = ret + getText(node);
            }
        }
        return ret;
    };
    isXML = Sizzle.isXML = function isXML (elem) {
        // documentElement is verified for cases where it doesn't yet exist
        // (such as loading iframes in IE - #4833)
        var documentElement = elem && (elem.ownerDocument || elem).documentElement;
        return documentElement ? documentElement.nodeName !== "HTML" : false;
    };
    // Element contains another
    contains = Sizzle.contains = docElem.contains ? function (a, b) {
        var adown = a.nodeType === 9 ? a.documentElement : a, bup = b && b.parentNode;
        return a === bup || !!(bup && bup.nodeType === 1 && adown.contains && adown.contains(bup));
    } : docElem.compareDocumentPosition ? function (a, b) {
        return b && !!(a.compareDocumentPosition(b) & 16);
    } : function (a, b) {
        while (b = b.parentNode) {
            if (b === a) {
                return true;
            }
        }
        return false;
    };
    Sizzle.attr = function (elem, name) {
        var attr, xml = isXML(elem);
        if (!xml) {
            name = name.toLowerCase();
        }
        if (window.__get$(Expr.attrHandle, name)) {
            return window.__call$(Expr.attrHandle, name, [elem]);
        }
        if (assertAttributes || xml) {
            return elem.getAttribute(name);
        }
        attr = elem.getAttributeNode(name);
        return attr ? typeof window.__get$(elem, name) ===
                      "boolean" ? window.__get$(elem, name) ? name : null : attr.specified ? window.__get$(attr, "value") : null : null;
    };
    Expr        = Sizzle.selectors = {
        // Can be adjusted by the user
        cacheLength:  50,
        createPseudo: markFunction,
        match:        matchExpr,
        order:        new RegExp("ID|TAG" + (assertUsableName ? "|NAME" : "") +
                                 (assertUsableClassName ? "|CLASS" : "")),
        // IE6/7 return a modified href
        attrHandle:   assertHrefNotNormalized ? {} : {
            "href": function (elem) {
                return elem.getAttribute("href", 2);
            },
            "type": function (elem) {
                return elem.getAttribute("type");
            }
        },
        find:         {
            "ID":    assertGetIdNotName ? function (id, context, xml) {
                if (typeof context.getElementById !== strundefined && !xml) {
                    var m = context.getElementById(id);
                    // Check parentNode to catch when Blackberry 4.6 returns
                    // nodes that are no longer in the document #6963
                    return m && m.parentNode ? [m] : [];
                }
            } : function (id, context, xml) {
                if (typeof context.getElementById !== strundefined && !xml) {
                    var m = context.getElementById(id);
                    return m ? m.id === id || typeof m.getAttributeNode !== strundefined &&
                                              window.__get$(m.getAttributeNode("id"), "value") ===
                                              id ? [m] : undefined : [];
                }
            },
            "TAG":   assertTagNameNoComments ? function (tag, context) {
                if (typeof context.getElementsByTagName !== strundefined) {
                    return context.getElementsByTagName(tag);
                }
            } : function (tag, context) {
                var results = context.getElementsByTagName(tag);
                // Filter out possible comments
                if (tag === "*") {
                    var elem, tmp = [], i = 0;
                    for (; elem = window.__get$(results, i); i++) {
                        if (elem.nodeType === 1) {
                            tmp.push(elem);
                        }
                    }
                    return tmp;
                }
                return results;
            },
            "NAME":  function (tag, context) {
                if (typeof context.getElementsByName !== strundefined) {
                    return context.getElementsByName(name);
                }
            },
            "CLASS": function (className, context, xml) {
                if (typeof context.getElementsByClassName !== strundefined && !xml) {
                    return context.getElementsByClassName(className);
                }
            }
        },
        relative:     {
            ">": {
                dir:   "parentNode",
                first: true
            },
            " ": { dir: "parentNode" },
            "+": {
                dir:   "previousSibling",
                first: true
            },
            "~": { dir: "previousSibling" }
        },
        preFilter:    {
            "ATTR":   function (match) {
                match[1] = match[1].replace(rbackslash, "");
                // Move the given value to match[3] whether quoted or unquoted
                match[3] = (match[4] || match[5] || "").replace(rbackslash, "");
                if (match[2] === "~=") {
                    match[3] = " " + match[3] + " ";
                }
                return match.slice(0, 4);
            },
            "CHILD":  function (match) {
                /* matches from matchExpr.CHILD
        1 type (only|nth|...)
        2 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
        3 xn-component of xn+y argument ([+-]?\d*n|)
        4 sign of xn-component
        5 x of xn-component
        6 sign of y-component
        7 y of y-component
    */
                match[1] = match[1].toLowerCase();
                if (match[1] === "nth") {
                    // nth-child requires argument
                    if (!match[2]) {
                        Sizzle.error(match[0]);
                    }
                    // numeric x and y parameters for Expr.filter.CHILD
                    // remember that false/true cast respectively to 0/1
                    match[3] = +(match[3] ? match[4] + (match[5] || 1) : 2 * (match[2] === "even" ||
                                                                              match[2] === "odd"));
                    match[4] = +(match[6] + match[7] || match[2] === "odd");
                }
                else if (match[2]) {
                    Sizzle.error(match[0]);
                }
                return match;
            },
            "PSEUDO": function (match, context, xml) {
                var unquoted, excess;
                if (matchExpr["CHILD"].test(match[0])) {
                    return null;
                }
                if (match[3]) {
                    match[2] = match[3];
                }
                else if (unquoted = match[4]) {
                    // Only check arguments that contain a pseudo
                    if (rpseudo.test(unquoted) && (excess = tokenize(unquoted, context, xml, true)) &&
                        (excess = unquoted.indexOf(")", window.__get$(unquoted, "length") - excess) -
                                  window.__get$(unquoted, "length"))) {
                        // excess is a negative index
                        unquoted = unquoted.slice(0, excess);
                        match[0] = match[0].slice(0, excess);
                    }
                    match[2] = unquoted;
                }
                // Return only captures needed by the pseudo filter method (type and argument)
                return match.slice(0, 3);
            }
        },
        filter:       {
            "ID":     assertGetIdNotName ? function (id) {
                id = id.replace(rbackslash, "");
                return function (elem) {
                    return elem.getAttribute("id") === id;
                };
            } : function (id) {
                id = id.replace(rbackslash, "");
                return function (elem) {
                    var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
                    return node && window.__get$(node, "value") === id;
                };
            },
            "TAG":    function (nodeName) {
                if (nodeName === "*") {
                    return function () {
                        return true;
                    };
                }
                nodeName = nodeName.replace(rbackslash, "").toLowerCase();
                return function (elem) {
                    return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                };
            },
            "CLASS":  function (className) {
                var pattern = window.__get$(window.__get$(classCache, expando), className);
                if (!pattern) {
                    pattern = classCache(className, new RegExp("(^|" + whitespace + ")" + className + "(" +
                                                               whitespace + "|$)"));
                }
                return function (elem) {
                    return pattern.test(elem.className || typeof elem.getAttribute !== strundefined &&
                                                          elem.getAttribute("class") || "");
                };
            },
            "ATTR":   function (name, operator, check) {
                if (!operator) {
                    return function (elem) {
                        return Sizzle.attr(elem, name) != null;
                    };
                }
                return function (elem) {
                    var result = Sizzle.attr(elem, name), value = result + "";
                    if (result == null) {
                        return operator === "!=";
                    }
                    switch (operator) {
                        case "=":
                            return value === check;
                        case "!=":
                            return value !== check;
                        case "^=":
                            return check && value.indexOf(check) === 0;
                        case "*=":
                            return check && value.indexOf(check) > -1;
                        case "$=":
                            return check &&
                                   value.substr(window.__get$(value, "length") - window.__get$(check, "length")) ===
                                   check;
                        case "~=":
                            return (" " + value + " ").indexOf(check) > -1;
                        case "|=":
                            return value === check ||
                                   value.substr(0, window.__get$(check, "length") + 1) === check + "-";
                    }
                };
            },
            "CHILD":  function (type, argument, first, last) {
                if (type === "nth") {
                    var doneName = done++;
                    return function (elem) {
                        var parent, diff, count = 0, node = elem;
                        if (first === 1 && last === 0) {
                            return true;
                        }
                        parent = elem.parentNode;
                        if (parent && (window.__get$(parent, expando) !== doneName || !elem.sizset)) {
                            for (node = window.__get$(parent, "firstChild"); node; node = node.nextSibling) {
                                if (node.nodeType === 1) {
                                    node.sizset = ++count;
                                    if (node === elem) {
                                        break;
                                    }
                                }
                            }
                            window.__set$(parent, expando, doneName);
                        }
                        diff = elem.sizset - last;
                        if (first === 0) {
                            return diff === 0;
                        }
                        else {
                            return diff % first === 0 && diff / first >= 0;
                        }
                    };
                }
                return function (elem) {
                    var node = elem;
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
                    }
                };
            },
            "PSEUDO": function (pseudo, argument, context, xml) {
                // pseudo-class names are case-insensitive
                // http://www.w3.org/TR/selectors/#pseudo-classes
                // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
                var args, fn = window.__get$(Expr.pseudos, pseudo) || window.__get$(Expr.pseudos, pseudo.toLowerCase());
                if (!fn) {
                    Sizzle.error("unsupported pseudo: " + pseudo);
                }
                // The user may use createPseudo to indicate that
                // arguments are needed to create the filter function
                // just as Sizzle does
                if (!window.__get$(fn, expando)) {
                    if (window.__get$(fn, "length") > 1) {
                        args = [
                            pseudo,
                            pseudo,
                            "",
                            argument
                        ];
                        return function (elem) {
                            return fn(elem, 0, args);
                        };
                    }
                    return fn;
                }
                return fn(argument, context, xml);
            }
        },
        pseudos:      {
            "not":      markFunction(function (selector, context, xml) {
                // Trim the selector passed to compile
                // to avoid treating leading and trailing
                // spaces as combinators
                var matcher = compile(selector.replace(rtrim, "$1"), context, xml);
                return function (elem) {
                    return !matcher(elem);
                };
            }),
            "enabled":  function (elem) {
                return elem.disabled === false;
            },
            "disabled": function (elem) {
                return elem.disabled === true;
            },
            "checked":  function (elem) {
                // In CSS3, :checked should return both checked and selected elements
                // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                var nodeName = elem.nodeName.toLowerCase();
                return nodeName === "input" && !!elem.checked || nodeName === "option" && !!elem.selected;
            },
            "selected": function (elem) {
                // Accessing this property makes selected-by-default
                // options in Safari work properly
                if (elem.parentNode) {
                    elem.parentNode.selectedIndex;
                }
                return elem.selected === true;
            },
            "parent":   function (elem) {
                return !Expr.pseudos["empty"](elem);
            },
            "empty":    function (elem) {
                // http://www.w3.org/TR/selectors/#empty-pseudo
                // :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
                //   not comment, processing instructions, or others
                // Thanks to Diego Perini for the nodeName shortcut
                //   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
                var nodeType;
                elem = window.__get$(elem, "firstChild");
                while (elem) {
                    if (elem.nodeName > "@" || (nodeType = elem.nodeType) === 3 || nodeType === 4) {
                        return false;
                    }
                    elem = elem.nextSibling;
                }
                return true;
            },
            "contains": markFunction(function (text) {
                return function (elem) {
                    return (window.__get$(elem, "textContent") || window.__get$(elem, "innerText") ||
                            getText(elem)).indexOf(text) > -1;
                };
            }),
            "has":      markFunction(function (selector) {
                return function (elem) {
                    return window.__get$(Sizzle(selector, elem), "length") > 0;
                };
            }),
            "header":   function (elem) {
                return rheader.test(elem.nodeName);
            },
            "text":     function (elem) {
                var type, attr;
                // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
                // use getAttribute instead to test this case
                return elem.nodeName.toLowerCase() === "input" && (type = elem.type) === "text" &&
                       ((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === type);
            },
            // Input types
            "radio":    createInputPseudo("radio"),
            "checkbox": createInputPseudo("checkbox"),
            "file":     createInputPseudo("file"),
            "password": createInputPseudo("password"),
            "image":    createInputPseudo("image"),
            "submit":   createButtonPseudo("submit"),
            "reset":    createButtonPseudo("reset"),
            "button":   function (elem) {
                var name = elem.nodeName.toLowerCase();
                return name === "input" && elem.type === "button" || name === "button";
            },
            "input":    function (elem) {
                return rinputs.test(elem.nodeName);
            },
            "focus":    function (elem) {
                var doc = elem.ownerDocument;
                return elem === window.__get$(doc, "activeElement") && (!doc.hasFocus || doc.hasFocus()) &&
                       !!(elem.type || window.__get$(elem, "href"));
            },
            "active":   function (elem) {
                return elem === window.__get$(elem.ownerDocument, "activeElement");
            }
        },
        setFilters:   {
            "first": function (elements, argument, not) {
                return not ? elements.slice(1) : [elements[0]];
            },
            "last":  function (elements, argument, not) {
                var elem = elements.pop();
                return not ? elements : [elem];
            },
            "even":  function (elements, argument, not) {
                var results = [], i = not ? 1 : 0, len = window.__get$(elements, "length");
                for (; i < len; i = i + 2) {
                    results.push(window.__get$(elements, i));
                }
                return results;
            },
            "odd":   function (elements, argument, not) {
                var results = [], i = not ? 0 : 1, len = window.__get$(elements, "length");
                for (; i < len; i = i + 2) {
                    results.push(window.__get$(elements, i));
                }
                return results;
            },
            "lt":    function (elements, argument, not) {
                return not ? elements.slice(+argument) : elements.slice(0, +argument);
            },
            "gt":    function (elements, argument, not) {
                return not ? elements.slice(0, +argument + 1) : elements.slice(+argument + 1);
            },
            "eq":    function (elements, argument, not) {
                var elem = elements.splice(+argument, 1);
                return not ? elements : elem;
            }
        }
    };
    function siblingCheck (a, b, ret) {
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
    }

    sortOrder        = docElem.compareDocumentPosition ? function (a, b) {
        if (a === b) {
            hasDuplicate = true;
            return 0;
        }
        return (!a.compareDocumentPosition ||
                !b.compareDocumentPosition ? a.compareDocumentPosition : a.compareDocumentPosition(b) &
                                                                         4) ? -1 : 1;
    } : function (a, b) {
        // The nodes are identical, we can exit early
        if (a === b) {
            hasDuplicate = true;
            return 0;
        }
        else if (a.sourceIndex && b.sourceIndex) {
            return a.sourceIndex - b.sourceIndex;
        }
        var al, bl, ap = [], bp = [], aup = a.parentNode, bup = b.parentNode, cur = aup;
        // If the nodes are siblings (or identical) we can do a quick check
        if (aup === bup) {
            return siblingCheck(a, b);
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
        al = window.__get$(ap, "length");
        bl = window.__get$(bp, "length");
        // Start walking down the tree looking for a discrepancy
        for (var i = 0; i < al && i < bl; i++) {
            if (window.__get$(ap, i) !== window.__get$(bp, i)) {
                return siblingCheck(window.__get$(ap, i), window.__get$(bp, i));
            }
        }
        // We ended someplace up the tree so do a sibling check
        return i === al ? siblingCheck(a, window.__get$(bp, i), -1) : siblingCheck(window.__get$(ap, i), b, 1);
    };
    // Always assume the presence of duplicates if sort doesn't
    // pass them to our comparison function (as in Google Chrome).
    [
        0,
        0
    ].sort(sortOrder);
    baseHasDuplicate = !hasDuplicate;
    // Document sorting and removing duplicates
    Sizzle.uniqueSort = function (results) {
        var elem, i  = 1;
        hasDuplicate = baseHasDuplicate;
        results.sort(sortOrder);
        if (hasDuplicate) {
            for (; elem = window.__get$(results, i); i++) {
                if (elem === window.__get$(results, i - 1)) {
                    results.splice(i--, 1);
                }
            }
        }
        return results;
    };
    Sizzle.error      = function (msg) {
        throw new Error("Syntax error, unrecognized expression: " + msg);
    };
    function tokenize (selector, context, xml, parseOnly) {
        var matched, match, tokens, type, soFar, groups, group, i, preFilters, filters, checkContext = !xml &&
                                                                                                       context !==
                                                                                                       document,
            // Token cache should maintain spaces
            key = (checkContext ? "<s>" : "") +
                  selector.replace(rtrim, "$1<s>"), cached = window.__get$(window.__get$(tokenCache, expando), key);
        if (cached) {
            return parseOnly ? 0 : slice.call(cached, 0);
        }
        soFar      = selector;
        groups     = [];
        i          = 0;
        preFilters = Expr.preFilter;
        filters    = Expr.filter;
        while (soFar) {
            // Comma and first run
            if (!matched || (match = rcomma.exec(soFar))) {
                if (match) {
                    soFar           = soFar.slice(window.__get$(match[0], "length"));
                    tokens.selector = group;
                }
                groups.push(tokens = []);
                group = "";
                // Need to make sure we're within a narrower context if necessary
                // Adding a descendant combinator will generate what is needed
                if (checkContext) {
                    soFar = " " + soFar;
                }
            }
            matched = false;
            // Combinators
            if (match = rcombinators.exec(soFar)) {
                group = group + match[0];
                soFar = soFar.slice(window.__get$(match[0], "length"));
                // Cast descendant combinators to space
                matched = tokens.push({
                    part:     match.pop().replace(rtrim, " "),
                    string:   match[0],
                    captures: match
                });
            }
            // Filters
            for (type in filters) {
                if ((match = window.__get$(matchExpr, type).exec(soFar)) &&
                    (!window.__get$(preFilters, type) || (match = window.__call$(preFilters, type, [
                        match,
                        context,
                        xml
                    ])))) {
                    group   = group + match[0];
                    soFar   = soFar.slice(window.__get$(match[0], "length"));
                    matched = tokens.push({
                        part:     type,
                        string:   match.shift(),
                        captures: match
                    });
                }
            }
            if (!matched) {
                break;
            }
        }
        // Attach the full group as a selector
        if (group) {
            tokens.selector = group;
        }
        // Return the length of the invalid excess
        // if we're just parsing
        // Otherwise, throw an error or return tokens
        return parseOnly ? window.__get$(soFar, "length") : soFar ? Sizzle.error(selector) : slice.call(tokenCache(key, groups), 0);
    }

    function addCombinator (matcher, combinator, context, xml) {
        var dir = combinator.dir, doneName = done++;
        if (!matcher) {
            // If there is no matcher to check, check against the context
            matcher = function (elem) {
                return elem === context;
            };
        }
        return combinator.first ? function (elem) {
            while (elem = window.__get$(elem, dir)) {
                if (elem.nodeType === 1) {
                    return matcher(elem) && elem;
                }
            }
        } : xml ? function (elem) {
            while (elem = window.__get$(elem, dir)) {
                if (elem.nodeType === 1) {
                    if (matcher(elem)) {
                        return elem;
                    }
                }
            }
        } : function (elem) {
            var cache, dirkey = doneName + "." + dirruns, cachedkey = dirkey + "." + cachedruns;
            while (elem = window.__get$(elem, dir)) {
                if (elem.nodeType === 1) {
                    if ((cache = window.__get$(elem, expando)) === cachedkey) {
                        return elem.sizset;
                    }
                    else if (typeof cache === "string" && cache.indexOf(dirkey) === 0) {
                        if (elem.sizset) {
                            return elem;
                        }
                    }
                    else {
                        window.__set$(elem, expando, cachedkey);
                        if (matcher(elem)) {
                            elem.sizset = true;
                            return elem;
                        }
                        elem.sizset = false;
                    }
                }
            }
        };
    }

    function addMatcher (higher, deeper) {
        return higher ? function (elem) {
            var result = deeper(elem);
            return result && higher(result === true ? elem : result);
        } : deeper;
    }

    // ["TAG", ">", "ID", " ", "CLASS"]
    function matcherFromTokens (tokens, context, xml) {
        var token, matcher, i = 0;
        for (; token = window.__get$(tokens, i); i++) {
            if (window.__get$(Expr.relative, token.part)) {
                matcher = addCombinator(matcher, window.__get$(Expr.relative, token.part), context, xml);
            }
            else {
                matcher = addMatcher(matcher, window.__get$(Expr.filter, token.part).apply(null, token.captures.concat(context, xml)));
            }
        }
        return matcher;
    }

    function matcherFromGroupMatchers (matchers) {
        return function (elem) {
            var matcher, j = 0;
            for (; matcher = window.__get$(matchers, j); j++) {
                if (matcher(elem)) {
                    return true;
                }
            }
            return false;
        };
    }

    compile = Sizzle.compile = function (selector, context, xml) {
        var group, i, len, cached = window.__get$(window.__get$(compilerCache, expando), selector);
        // Return a cached group function if already generated (context dependent)
        if (cached && cached.context === context) {
            return cached;
        }
        // Generate a function of recursive functions that can be used to check each element
        group = tokenize(selector, context, xml);
        for (i = 0, len = window.__get$(group, "length"); i < len; i++) {
            window.__set$(group, i, matcherFromTokens(window.__get$(group, i), context, xml));
        }
        // Cache the compiled function
        cached         = compilerCache(selector, matcherFromGroupMatchers(group));
        cached.context = context;
        cached.runs    = cached.dirruns = 0;
        return cached;
    };
    function multipleContexts (selector, contexts, results, seed) {
        var i = 0, len = window.__get$(contexts, "length");
        for (; i < len; i++) {
            Sizzle(selector, window.__get$(contexts, i), results, seed);
        }
    }

    function handlePOSGroup (selector, posfilter, argument, contexts, seed, not) {
        var results, fn = window.__get$(Expr.setFilters, posfilter.toLowerCase());
        if (!fn) {
            Sizzle.error(posfilter);
        }
        if (selector || !(results = seed)) {
            multipleContexts(selector || "*", contexts, results = [], seed);
        }
        return window.__get$(results, "length") > 0 ? fn(results, argument, not) : [];
    }

    function handlePOS (groups, context, results, seed) {
        var group, part, j, groupLen, token, selector, anchor, elements, match, matched, lastIndex, currentContexts, not, i = 0, len = window.__get$(groups, "length"), rpos = matchExpr["POS"],
            // This is generated here in case matchExpr["POS"] is extended
            rposgroups                                                                                                      = new RegExp("^" +
                                                                                                                                         rpos.source +
                                                                                                                                         "(?!" +
                                                                                                                                         whitespace +
                                                                                                                                         ")", "i"),
            // This is for making sure non-participating
            // matching groups are represented cross-browser (IE6-8)
            setUndefined                                                                                                    = function () {
                var i = 1, len = window.__get$(arguments, "length") - 2;
                for (; i < len; i++) {
                    if (window.__get$(arguments, i) === undefined) {
                        window.__set$(match, i, undefined);
                    }
                }
            };
        for (; i < len; i++) {
            group    = window.__get$(groups, i);
            part     = "";
            elements = seed;
            for (j = 0, groupLen = window.__get$(group, "length"); j < groupLen; j++) {
                token    = window.__get$(group, j);
                selector = token.string;
                if (token.part === "PSEUDO") {
                    // Reset regex index to 0
                    rpos.exec("");
                    anchor = 0;
                    while (match = rpos.exec(selector)) {
                        matched   = true;
                        lastIndex = rpos.lastIndex = match.index + window.__get$(match[0], "length");
                        if (lastIndex > anchor) {
                            part            = part + selector.slice(anchor, match.index);
                            anchor          = lastIndex;
                            currentContexts = [context];
                            if (rcombinators.test(part)) {
                                if (elements) {
                                    currentContexts = elements;
                                }
                                elements = seed;
                            }
                            if (not = rendsWithNot.test(part)) {
                                part = part.slice(0, -5).replace(rcombinators, "$&*");
                                anchor++;
                            }
                            if (window.__get$(match, "length") > 1) {
                                match[0].replace(rposgroups, setUndefined);
                            }
                            elements = handlePOSGroup(part, match[1], match[2], currentContexts, elements, not);
                        }
                        part = "";
                    }
                }
                if (!matched) {
                    part = part + selector;
                }
                matched = false;
            }
            if (part) {
                if (rcombinators.test(part)) {
                    multipleContexts(part, elements || [context], results, seed);
                }
                else {
                    Sizzle(part, context, results, seed ? seed.concat(elements) : elements);
                }
            }
            else {
                push.apply(results, elements);
            }
        }
        // Do not sort if this is a single filter
        return len === 1 ? results : Sizzle.uniqueSort(results);
    }

    function select (selector, context, results, seed, xml) {
        // Remove excessive whitespace
        selector                                                                                   = selector.replace(rtrim, "$1");
        var elements, matcher, cached, elem, i, tokens, token, lastToken, findContext, type, match = tokenize(selector, context, xml), contextNodeType = context.nodeType;
        // POS handling
        if (matchExpr["POS"].test(selector)) {
            return handlePOS(match, context, results, seed);
        }
        if (seed) {
            elements = slice.call(seed, 0);
        }
        else if (window.__get$(match, "length") === 1) {
            // Take a shortcut and set the context if the root selector is an ID
            if (window.__get$(tokens = slice.call(match[0], 0), "length") > 2 && (token = tokens[0]).part === "ID" &&
                contextNodeType === 9 && !xml && window.__get$(Expr.relative, tokens[1].part)) {
                context = Expr.find["ID"](token.captures[0].replace(rbackslash, ""), context, xml)[0];
                if (!context) {
                    return results;
                }
                selector = selector.slice(window.__get$(tokens.shift().string, "length"));
            }
            findContext = (match = rsibling.exec(tokens[0].string)) && !match.index && context.parentNode ||
                          context;
            // Reduce the set if possible
            lastToken = "";
            for (i = window.__get$(tokens, "length") - 1; i >= 0; i--) {
                token     = window.__get$(tokens, i);
                type      = token.part;
                lastToken = token.string + lastToken;
                if (window.__get$(Expr.relative, type)) {
                    break;
                }
                if (Expr.order.test(type)) {
                    elements = window.__call$(Expr.find, type, [
                        token.captures[0].replace(rbackslash, ""),
                        findContext,
                        xml
                    ]);
                    if (elements == null) {
                        continue;
                    }
                    else {
                        selector = selector.slice(0, window.__get$(selector, "length") -
                                                     window.__get$(lastToken, "length")) +
                                   lastToken.replace(window.__get$(matchExpr, type), "");
                        if (!selector) {
                            push.apply(results, slice.call(elements, 0));
                        }
                        break;
                    }
                }
            }
        }
        // Only loop over the given elements once
        if (selector) {
            matcher = compile(selector, context, xml);
            dirruns = matcher.dirruns++;
            if (elements == null) {
                elements = Expr.find["TAG"]("*", rsibling.test(selector) && context.parentNode || context);
            }
            for (i = 0; elem = window.__get$(elements, i); i++) {
                cachedruns = matcher.runs++;
                if (matcher(elem)) {
                    results.push(elem);
                }
            }
        }
        return results;
    }

    if (document.querySelectorAll) {
        (function () {
            var disconnectedMatch, oldSelect = select, rescape = /'|\\/g, rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g, rbuggyQSA = [],
                // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
                // A support test would require too much code (would include document ready)
                // just skip matchesSelector for :active
                rbuggyMatches                = [":active"], matches = docElem.matchesSelector ||
                                                                      docElem.mozMatchesSelector ||
                                                                      docElem.webkitMatchesSelector ||
                                                                      docElem.oMatchesSelector ||
                                                                      docElem.msMatchesSelector;
            // Build QSA regex
            // Regex strategy adopted from Diego Perini
            assert(function (div) {
                // Select is set to empty string on purpose
                // This is to test IE's treatment of not explictly
                // setting a boolean content attribute,
                // since its presence should be enough
                // http://bugs.jquery.com/ticket/12359
                div.innerHTML = "<select><option selected=''></option></select>";
                if (!div.querySelectorAll("[selected]").length) {
                    rbuggyQSA.push("\\[" + whitespace +
                                   "*(?:checked|disabled|ismap|multiple|readonly|selected|value)");
                }
                // Webkit/Opera - :checked should return selected option elements
                // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                // IE8 throws error here (do not put tests after this one)
                if (!div.querySelectorAll(":checked").length) {
                    rbuggyQSA.push(":checked");
                }
            });
            assert(function (div) {
                // Opera 10-12/IE9 - ^= $= *= and empty values
                // Should not select anything
                div.innerHTML = "<p test=''></p>";
                if (div.querySelectorAll("[test^='']").length) {
                    rbuggyQSA.push("[*^$]=" + whitespace + "*(?:\"\"|'')");
                }
                div.innerHTML = "<input type='hidden'/>";
                if (!div.querySelectorAll(":enabled").length) {
                    rbuggyQSA.push(":enabled", ":disabled");
                }
            });
            rbuggyQSA                        = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
            select                           = function (selector, context, results, seed, xml) {
                // Only use querySelectorAll when not filtering,
                // when this is not xml,
                // and when no QSA bugs apply
                if (!seed && !xml && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
                    if (context.nodeType === 9) {
                        try {
                            push.apply(results, slice.call(window.__call$(context, "querySelectorAll", [selector]), 0));
                            return results;
                        } catch (qsaError) {
                        }
                    }
                    else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                        var groups, i, len, old = context.getAttribute("id"), nid = old ||
                                                                                    expando, newContext = rsibling.test(selector) &&
                                                                                                          context.parentNode ||
                                                                                                          context;
                        if (old) {
                            nid = nid.replace(rescape, "\\$&");
                        }
                        else {
                            context.setAttribute("id", nid);
                        }
                        groups = tokenize(selector, context, xml);
                        // Trailing space is unnecessary
                        // There is always a context check
                        nid = "[id='" + nid + "']";
                        for (i = 0, len = window.__get$(groups, "length"); i < len; i++) {
                            window.__set$(groups, i, nid + window.__get$(groups, i).selector);
                        }
                        try {
                            push.apply(results, slice.call(window.__call$(newContext, "querySelectorAll", [groups.join(",")]), 0));
                            return results;
                        } catch (qsaError) {
                        } finally {
                            if (!old) {
                                context.removeAttribute("id");
                            }
                        }
                    }
                }
                return oldSelect(selector, context, results, seed, xml);
            };
            if (matches) {
                assert(function (div) {
                    // Check to see if it's possible to do matchesSelector
                    // on a disconnected node (IE 9)
                    disconnectedMatch = matches.call(div, "div");
                    // This should fail with an exception
                    // Gecko does not error, returns false instead
                    try {
                        matches.call(div, "[test!='']:sizzle");
                        rbuggyMatches.push(matchExpr["PSEUDO"].source, matchExpr["POS"].source, "!=");
                    } catch (e) {
                    }
                });
                // rbuggyMatches always contains :active, so no need for a length check
                rbuggyMatches          = /* rbuggyMatches.length && */
                    new RegExp(rbuggyMatches.join("|"));
                Sizzle.matchesSelector = function (elem, expr) {
                    // Make sure that attribute selectors are quoted
                    expr = expr.replace(rattributeQuotes, "='$1']");
                    // rbuggyMatches always contains :active, so no need for an existence check
                    if (!isXML(elem) && !rbuggyMatches.test(expr) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
                        try {
                            var ret = matches.call(elem, expr);
                            // IE 9's matchesSelector returns false on disconnected nodes
                            if (ret || disconnectedMatch || // As well, disconnected nodes are said to be in a document
                                // fragment in IE 9
                                elem.document && elem.document.nodeType !== 11) {
                                return ret;
                            }
                        } catch (e) {
                        }
                    }
                    return window.__get$(Sizzle(expr, null, null, [elem]), "length") > 0;
                };
            }
        }());
    }
    // Deprecated
    Expr.setFilters["nth"] = Expr.setFilters["eq"];
    // Back-compat
    Expr.filters = Expr.pseudos;

    module.exports = Sizzle;
}(window));
