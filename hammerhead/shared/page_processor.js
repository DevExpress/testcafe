(function () {
    var PageProc = {};

    var isNode = typeof module !== 'undefined' && module.exports;

    var $ = null,
        JSProcessor = null,
        NativeMethods = null,
        SharedConst = null,
        Util = null,
        UrlUtil = null;

    if (isNode) {
        JSProcessor = require('./js_processor');
        SharedConst = require('./const');
        UrlUtil = require('./../lib/url_util');

        var eventEmitter = new (require('events').EventEmitter)();

        PageProc.on = eventEmitter.on.bind(eventEmitter);
        PageProc.off = eventEmitter.removeListener.bind(eventEmitter);
        PageProc.emit = eventEmitter.emit.bind(eventEmitter);

        module.exports = PageProc;
    }

    else {
        SharedConst = HammerheadClient.get('Shared.Const');
        JSProcessor = HammerheadClient.get('Shared.JSProcessor');

        HammerheadClient.define('Shared.PageProc', function (require) {
            $ = require('jQuery');
            NativeMethods = require('DOMSandbox.NativeMethods');
            UrlUtil = require('UrlUtil');
            Util = require('Util');

            var eventEmitter = new (require('Util').EventEmitter)();

            PageProc.on = eventEmitter.on.bind(eventEmitter);
            PageProc.off = eventEmitter.off.bind(eventEmitter);
            PageProc.emit = eventEmitter.emit.bind(eventEmitter);

            this.exports = PageProc;
        });
    }

    var CSS_URL_PROPERTY_VALUE_PATTERN = /(url\s*\(\s*)(?:(')([^\s']*)(')|(")([^\s"]*)(")|([^\s\)]*))(\s*\))|(@import\s+)(?:(')([^\s']*)(')|(")([^\s"]*)("))/g,
        EVENTS = ['onblur', 'onchange', 'onclick', 'oncontextmenu', 'oncopy', 'oncut',
            'ondblclick', 'onerror', 'onfocus', 'onfocusin', 'onfocusout', 'onhashchange', 'onkeydown',
            'onkeypress', 'onkeyup', 'onload', 'onmousedown', 'onmouseenter', 'onmouseleave',
            'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onpaste', 'onreset',
            'onresize', 'onscroll', 'onselect', 'onsubmit', 'ontextinput', 'onunload', 'onwheel',
            'onpointerdown', 'onpoi nterup', 'onpointercancel', 'onpointermove', 'onpointerover', 'onpointerout',
            'onpointerenter', 'onpointerleave', 'ongotpointercapture', 'onlostpointercapture',
            'onmspointerdown', 'onmspointerup', 'onmspointercancel', 'onmspointermove', 'onmspointerover',
            'onmspointerout', 'onmspointerenter', 'onmspointerleave', 'onmsgotpointercapture', 'onmslostpointercapture'
        ],
        BOM_REGEX = new RegExp( // Byte Order Mark
            '^(\\xEF\\xBB\\xBF|' +
                '\\xFE\\xFF|' +
                '\\xFF\\xFE|' +
                '\\x00\\x00\\xFE\\xFF|' +
                '\\xFF\\xFE\\x00\\x00|' +
                '\\x2B\\x2F\\x76\\x38|' +
                '\\x2B\\x2F\\x76\\x39|' +
                '\\x2B\\x2F\\x76\\x2B|' +
                '\\x2B\\x2F\\x76\\x2F|' +
                '\\xF7\\x64\\x4C|' +
                '\\xDD\\x73\\x66\\x73|' +
                '\\x0E\\xFE\\xFF|' +
                '\\xFB\\xEE\\x28|' +
                '\\x84\\x31\\x95\\x33)'
        ),
        CDATA_REG_EX = /^(\s)*\/\/<!\[CDATA\[([\s\S]*)\/\/\]\]>(\s)*$/,
        EMPTY_URL_REG_EX = /^(\w+:)?\/\/\:0/,// Ignore '//:0/' url (http://www.myntra.com/)
        HTML_COMMENT_POSTFIX_REG_EX = /(\/\/[^\n]*|\n\s*)-->[^\n]*([\n\s]*)?$/,
        HTML_COMMENT_PREFIX_REG_EX = /^(\s)*<!--[^\n]*\n/,
        HTML_COMMENT_SIMPLE_POSTFIX_REG_EX = /-->\s*$/,
        HTML_STRING_REG_EX = /^\s*('|")\s*(<[\s\S]+>)\s*('|")\s*$/,
        JAVASCRIPT_PROTOCOL_REG_EX = /^\s*javascript\s*:/i,
        SOURCE_MAP_REG_EX = /#\s*sourceMappingURL\s*=\s*[^\s]+(\s|\*\/)/i,
        URL_ATTRS = [ 'href', 'src', 'action', 'manifest', 'data' ],
        URL_ATTR_TAGS = {
            href: ['a', 'link', 'image', 'area', 'base'],
            src: ['img', 'embed', 'script', 'source', 'video', 'audio', 'input', 'frame', 'iframe'],
            action: ['form'],
            manifest: ['html'],
            data: ['object']
        },
        OVERRIDE_DOM_METH_SCRIPT = 'window["' + SharedConst.DOM_SANDBOX_OVERRIDE_DOM_METHOD_NAME + '"]',
        SCRIPT_HEADER = '\r\ntypeof window !== "undefined" && ' + OVERRIDE_DOM_METH_SCRIPT + ' && ' + OVERRIDE_DOM_METH_SCRIPT + '();\r\n' + JSProcessor.MOCK_ACCESSORS,
        SCRIPT_HEADER_REG_EX = new RegExp('^\\s*typeof[^\\n]+' + SharedConst.DOM_SANDBOX_OVERRIDE_DOM_METHOD_NAME +
            '[^\\n]+\\n[^\\n]+\\n[^\\n]+\\n[^\\n]+\\n[^\\n]+\\n[^\\n]+\\n[^\\n]+\\n[^\\n]+__proc\\$Script;', 'i'),
        TARGET_ATTR_TAGS = {
            a: true,
            form: true,
            area: true,
            base: true
        },
        IFRAME_FLAG_TAGS = ['a', 'form'];

    PageProc.EVENTS = EVENTS;
    PageProc.HTML_STRING_REG_EX = HTML_STRING_REG_EX;
    PageProc.JAVASCRIPT_PROTOCOL_REG_EX = JAVASCRIPT_PROTOCOL_REG_EX;
    PageProc.SCRIPT_HEADER = SCRIPT_HEADER;
    PageProc.SCRIPT_HEADER_REG_EX = SCRIPT_HEADER_REG_EX;
    PageProc.TARGET_ATTR_TAGS = TARGET_ATTR_TAGS;
    PageProc.URL_ATTR_TAGS = URL_ATTR_TAGS;
    PageProc.URL_ATTRS = URL_ATTRS;

    PageProc.HTML_PROCESSING_REQUIRED = 'HTML_PROCESSING_REQUIRED';

    var getAttr = function (el, attr) {
        return isNode ? el.attribs[attr] : NativeMethods.getAttribute.call(el, attr);
    };

    var hasAttr = function (el, attr) {
        if (isNode)
            return attr in el.attribs;
        else {
            for (var i = 0; i < el.attributes.length; i++)
                if (el.attributes[i].name === attr)
                    return true;

            return false;
        }
    };

    var hasEventHandler = function (el) {
        if (isNode) {
            for (var attr in el.attribs) {
                if (EVENTS.indexOf(el.attribs[attr]))
                    return true;
            }

            return false;
        } else {
            var attrs = el.attributes;

            for (var i = 0; i < attrs.length; i++) {
                if (EVENTS.indexOf(attrs[i]))
                    return true;
            }

            return false;
        }
    };

    var getTagName = function (el) {
        return isNode ? el.name : el.tagName;
    };

    var setAttr = function (el, attr, value) {
        return isNode ? el.attribs[attr] = value : NativeMethods.setAttribute.call(el, attr, value);
    };

    var isTopParentIFrame = function (el) {
        var elWindow = el[SharedConst.DOM_SANDBOX_PROCESSED_CONTEXT];

        return elWindow && window.top === elWindow.parent;
    };

    // Element processors
    var processAutoComplete = function (el) {
            var storedUrlAttr = PageProc.getStoredAttrName('autocomplete'),
                processed = hasAttr(el, storedUrlAttr),
                attrValue = getAttr(el, processed ? storedUrlAttr : 'autocomplete');

            if (!processed)
                setAttr(el, storedUrlAttr, (attrValue || attrValue === '') ? attrValue : 'none');

            setAttr(el, 'autocomplete', 'off');
        },

        processJsAttr = function (el, attr, jsProtocol) {
            var storedUrlAttr = PageProc.getStoredAttrName(attr),
                processed = hasAttr(el, storedUrlAttr),
                attrValue = getAttr(el, processed ? storedUrlAttr : attr);

            var code = jsProtocol ? attrValue.replace(JAVASCRIPT_PROTOCOL_REG_EX, '') : attrValue,
                matches = code.match(HTML_STRING_REG_EX);

            var setAttributes = function (value, processedValue, processedAttrValue) {
                if (value !== processedValue) {
                    if (!processed)
                        setAttr(el, storedUrlAttr, attrValue);

                    setAttr(el, attr, processedAttrValue);
                }
            };

            if (matches && jsProtocol) {
                var html = matches[2];

                PageProc.emit(PageProc.HTML_PROCESSING_REQUIRED, html, function (processedHTML) {
                    var processedAttrValue = '';
                    /* jshint ignore:start */
                    processedAttrValue = 'javascript:\'' + processedHTML.replace(/'/g, "\\'") + '\'';
                    /* jshint ignore:end */
                    setAttributes(html, processedHTML, processedAttrValue);
                });

            } else {
                var processedCode = PageProc.processScript(code, true),
                    processedAttrValue = processedCode;

                /* jshint ignore:start */
                if (jsProtocol)
                    processedAttrValue = 'javascript:' + processedAttrValue;
                /* jshint ignore:end */

                setAttributes(code, processedCode, processedAttrValue);
            }
        },

        processEvtAttr = function (el) {
            for (var i = 0; i < EVENTS.length; i++) {
                var attrValue = getAttr(el, EVENTS[i]);

                if (attrValue)
                    processJsAttr(el, EVENTS[i], JAVASCRIPT_PROTOCOL_REG_EX.test(attrValue));
            }
        },

        processMetaElement = function (el, urlReplacer, pattern) {
            if (getAttr(el, 'http-equiv').toLowerCase() === 'refresh') {
                var attr = getAttr(el, pattern.urlAttr);

                attr = attr.replace(/(url=)(.*)$/i, function () {
                    return arguments[1] + urlReplacer(arguments[2]);
                });

                setAttr(el, pattern.urlAttr, attr);
            }
        },

        processSandboxedIframe = function (el) {
            var attrValue = getAttr(el, 'sandbox');

            if (attrValue.indexOf('allow-scripts') === -1) {
                var storedAttr = PageProc.getStoredAttrName('sandbox');

                setAttr(el, storedAttr, attrValue);
                setAttr(el, 'sandbox', attrValue + ' allow-scripts');
            }
        },

        processScriptElement = function (script) {
            var scriptContent = '';

            if (isNode) {
                // The $script.html() method is not used because it is not working properly, it adds garbage in the result.
                var contentChild = script.children.length ? script.children[0] : null;

                scriptContent = !!contentChild ? contentChild.data : '';
            } else {
                scriptContent = script.text;

                var scriptProcessedOnServer = JSProcessor.isScriptProcessed(scriptContent);

                if (scriptProcessedOnServer)
                    return;
            }

            if (!scriptContent)
                return;

            // NOTE: we do not process scripts that are not executed during a page loading. We process scripts with type
            // text/javascript, application/javascript etc. (list of MIME types is specified in the w3c.org html5
            // specification). If type is not set, it 'text/javascript' by default.
            var scriptType = getAttr(script, 'type'),
                executableScriptTypesRegEx = /(application\/((x-)?ecma|(x-)?java)script)|(text\/)(javascript(1\.{0-5})?|((x-)?ecma|x-java|js|live)script)/,
                isExecutableScript = !scriptType || executableScriptTypesRegEx.test(scriptType);

            if (isExecutableScript) {
                var result = scriptContent,
                    commentPrefix = '',
                    commentPrefixMatch = result.match(HTML_COMMENT_PREFIX_REG_EX),
                    commentPostfix = '',
                    commentPostfixMatch = null,
                    hasCDATA = CDATA_REG_EX.test(result);

                if (commentPrefixMatch) {
                    commentPrefix = commentPrefixMatch[0];
                    commentPostfixMatch = result.match(HTML_COMMENT_POSTFIX_REG_EX);

                    if (commentPostfixMatch)
                        commentPostfix = commentPostfixMatch[0];
                    else if (!HTML_COMMENT_SIMPLE_POSTFIX_REG_EX.test(commentPrefix))
                        commentPostfix = '//-->';

                    result = result.replace(commentPrefix, '').replace(commentPostfix, '');
                }

                if (hasCDATA)
                    result = result.replace(CDATA_REG_EX, '$2');

                result = commentPrefix + PageProc.processScript(result) + commentPostfix;

                if (hasCDATA)
                    result = '\n//<![CDATA[\n' + result + '//]]>';

                if (isNode)
                    script.children[0].data = result;
                else
                    script.text = result;
            }
        },

        processStyleAttr = function (el, urlReplacer) {
            var style = getAttr(el, 'style');

            if (style)
                setAttr(el, 'style', PageProc.processStylesheet(style, urlReplacer));
        },

        processStylesheetElement = function (el, urlReplacer) {
            if (isNode) {
                // The $el.html() method is not used because it is not working properly, it adds garbage in the result.
                var contentChild = el.children.length ? el.children[0] : null;

                if (contentChild && contentChild.data && urlReplacer)
                    contentChild.data = PageProc.processStylesheet(contentChild.data, urlReplacer, true);
            } else if (urlReplacer)
                el.innerHTML = PageProc.processStylesheet(el.innerHTML, urlReplacer, true);
        },

        processTargetBlank = function (el) {
            // NOTE: replace target='_blank' to avoid popups
            var attrValue = getAttr(el, 'target');

            // NOTE: Value may have whitespace
            attrValue = attrValue && attrValue.replace(/\s/g, '');

            if (attrValue === '_blank' || attrValue === 'blank')
                setAttr(el, 'target', '_self');
        },

        processUrlAttrs = function (el, urlReplacer, pattern, crossDomainPort, hasIFrameParent) {
            if (urlReplacer && pattern.urlAttr) {
                var storedUrlAttr = PageProc.getStoredAttrName(pattern.urlAttr),
                    resourceUrl = getAttr(el, pattern.urlAttr),
                    processedOnServer = !!getAttr(el, storedUrlAttr);

                // NOTE: page resource URL with proxy URL
                if ((resourceUrl || resourceUrl === '') && !processedOnServer) {
                    if (UrlUtil.isSupportedProtocol(resourceUrl) && !EMPTY_URL_REG_EX.test(resourceUrl)) {
                        var elTagName = getTagName(el).toLowerCase(),
                            isIframe = elTagName === 'iframe',
                            isScript = elTagName === 'script',
                            resourceType = null,
                            target = getAttr(el, 'target');

                        // On the server the elements shouldn't process with target=_parent,
                        // because we don't know who is the parent of the processing page (iframe or top window)
                        if (isNode && IFRAME_FLAG_TAGS.indexOf(elTagName) !== -1 && target === '_parent')
                            return;

                        if (isIframe || PageProc.isOpenLinkInIFrame(el, hasIFrameParent))
                            resourceType = UrlUtil.IFRAME;
                        else if (isScript)
                            resourceType = UrlUtil.SCRIPT;

                        var proxyUrl = resourceUrl ? urlReplacer(resourceUrl, resourceType) : '';

                        if (isIframe) {
                            var isRelativePath = !UrlUtil.parseUrl(resourceUrl).host;

                            if (!isRelativePath) {
                                var location = urlReplacer('/'),
                                    proxyUrlObj = UrlUtil.parseProxyUrl(location),
                                    originUrlObj = proxyUrlObj.originResourceInfo,
                                    originUrl = UrlUtil.formatUrl(originUrlObj);

                                // Cross-domain iframe
                                if (!UrlUtil.sameOriginCheck(originUrl, resourceUrl)) {
                                    var proxyHostname = UrlUtil.parseUrl(location).hostname;

                                    proxyUrl = resourceUrl ? UrlUtil.getCrossDomainIframeProxyUrl(resourceUrl, proxyHostname, crossDomainPort,
                                        proxyUrlObj.jobInfo.uid, proxyUrlObj.jobInfo.ownerToken) : '';
                                }
                            }
                        }
                        setAttr(el, storedUrlAttr, resourceUrl);

                        if (elTagName === 'img' && proxyUrl !== '')
                            setAttr(el, pattern.urlAttr, UrlUtil.resolveUrlAsOrigin(resourceUrl, urlReplacer));
                        else
                            setAttr(el, pattern.urlAttr, proxyUrl);
                    }
                }
            }
        },

        processUrlJsAttr = function (el, urlReplacer, pattern) {
            if (JAVASCRIPT_PROTOCOL_REG_EX.test(getAttr(el, pattern.urlAttr)))
                processJsAttr(el, pattern.urlAttr, true);
        };

    var SELECTORS = {
        HAS_HREF_ATTR: function (el) {
            var tagName = getTagName(el).toLowerCase();

            return URL_ATTR_TAGS.href.indexOf(tagName) !== -1;
        },
        HAS_SRC_ATTR: function (el) {
            var tagName = getTagName(el).toLowerCase();

            return URL_ATTR_TAGS.src.indexOf(tagName) !== -1;
        },
        HAS_ACTION_ATTR: function (el) {
            var tagName = getTagName(el).toLowerCase();

            return URL_ATTR_TAGS.action.indexOf(tagName) !== -1;
        },
        HAS_MANIFEST_ATTR: function (el) {
            var tagName = getTagName(el).toLowerCase();

            return URL_ATTR_TAGS.manifest.indexOf(tagName) !== -1;
        },
        HAS_DATA_ATTR: function (el) {
            var tagName = getTagName(el).toLowerCase();

            return URL_ATTR_TAGS.data.indexOf(tagName) !== -1;
        },
        HTTP_EQUIV_META: function (el) {
            var tagName = getTagName(el).toLowerCase();

            return tagName === 'meta' && hasAttr(el, 'http-equiv');
        },
        ALL: function () {
            return true;
        },
        IS_SCRIPT: function (el) {
            return getTagName(el).toLowerCase() === 'script';
        },
        IS_INPUT: function (el) {
            return getTagName(el).toLowerCase() === 'input';
        },
        IS_STYLE: function (el) {
            return getTagName(el).toLowerCase() === 'style';
        },
        HAS_EVENT_HANDLER: function (el) {
            return hasEventHandler(el);
        },
        IS_SANDBOXED_IFRAME: function (el) {
            return getTagName(el).toLowerCase() === 'iframe' && hasAttr(el, 'sandbox');
        }
    };

    var ELEMENT_PROCESSOR_PATTERNS = [
        { selector: SELECTORS.HAS_HREF_ATTR, urlAttr: 'href', elementProcessors: [processTargetBlank, processUrlAttrs, processUrlJsAttr] },
        { selector: SELECTORS.HAS_SRC_ATTR, urlAttr: 'src', elementProcessors: [processTargetBlank, processUrlAttrs, processUrlJsAttr] },
        { selector: SELECTORS.HAS_ACTION_ATTR, urlAttr: 'action', elementProcessors: [processTargetBlank, processUrlAttrs, processUrlJsAttr] },
        { selector: SELECTORS.HAS_MANIFEST_ATTR, urlAttr: 'manifest', elementProcessors: [processUrlAttrs, processUrlJsAttr] },
        { selector: SELECTORS.HAS_DATA_ATTR, urlAttr: 'data', elementProcessors: [processUrlAttrs, processUrlJsAttr] },
        { selector: SELECTORS.HTTP_EQUIV_META, urlAttr: 'content', elementProcessors: [processMetaElement] },
        { selector: SELECTORS.ALL, elementProcessors: [processStyleAttr] },
        { selector: SELECTORS.IS_SCRIPT, elementProcessors: [processScriptElement] },
        { selector: SELECTORS.IS_STYLE, elementProcessors: [processStylesheetElement] },
        { selector: SELECTORS.IS_INPUT, elementProcessors: [processAutoComplete] },
        { selector: SELECTORS.HAS_EVENT_HANDLER, elementProcessors: [processEvtAttr] },
        { selector: SELECTORS.IS_SANDBOXED_IFRAME, elementProcessors: [processSandboxedIframe]}
    ];

    var getElementForSelectorCheck = function (el) {
        //NOTE: we saved the browser definition by jquery for IE to not connect util and its only for IE9
        if (!isNode && $.browser.msie && parseInt($.browser.version, 10) === 9 && el.tagName.toLowerCase() === 'script') {
            var clone = NativeMethods.cloneNode.call(el, false);

            clone.src = clone.innerHTML = '';

            return clone;
        }

        return el;
    };

    var isTestCafeElement = function (el) {
        return typeof el.className === 'string' && el.className.indexOf(SharedConst.TEST_CAFE_UI_CLASSNAME_POSTFIX) > -1;
    };

    var isStylesheetProcessed = function (cssText) {
        return (new RegExp('^\\s*\\' + SharedConst.IS_STYLESHEET_PROCESSED_RULE)).test(cssText);
    };

    PageProc.processPage = function ($, urlReplacer, crossDomainPort, isIFrame) {
        var $base = $('base'),
            baseUrl = $base.length ? getAttr($base[0], 'href') : '',
            replacer = function (resourceUrl, resourceType) {
                return urlReplacer(resourceUrl, resourceType, baseUrl);
            },
            hasIFrameParent = function (el) {
                return isNode ? isIFrame : Util.hasIFrameParent(el);
            };

        var $all = $('*');

        for (var i = 0; i < ELEMENT_PROCESSOR_PATTERNS.length; i++) {
            var pattern = ELEMENT_PROCESSOR_PATTERNS[i];

            //NOTE: disable jshint W083 warning for this code
            /*jshint -W083 */
            $all.filter(function () {
                return pattern.selector(this);
            }).each(function () {
                    if (!this[SharedConst.ELEMENT_PROCESSED_FLAG]) {
                        for (var j = 0; j < pattern.elementProcessors.length; j++)
                            pattern.elementProcessors[j](this, replacer, pattern, crossDomainPort, hasIFrameParent);
                    }
                });
            /*jshint +W083 */
        }
    };

    PageProc.processElement = function (el, urlReplacer) {
        // NOTE: When the 'script' element created it is not executed. It occurs after the element is appended to a
        // document. But in IE 9 only, if you get script's 'document', 'children' or 'all' property, the script is executed
        // at the same time (before it is appended to a document). JQuery element's 'is' function implementation gets
        // 'document' property and the script is executed too early. Therefore we should check clone element instead it. (B237231)
        var elementForSelectorCheck = getElementForSelectorCheck(el);

        for (var i = 0; i < ELEMENT_PROCESSOR_PATTERNS.length; i++) {
            var pattern = ELEMENT_PROCESSOR_PATTERNS[i];

            if (pattern.selector(elementForSelectorCheck) && !isTestCafeElement(el)) {
                for (var j = 0; j < pattern.elementProcessors.length; j++)
                    pattern.elementProcessors[j](el, urlReplacer, pattern);
            }
        }
    };

// Utils
    PageProc.getStoredAttrName = function (attr) {
        return attr + SharedConst.DOM_SANDBOX_STORED_ATTR_POSTFIX;
    };

    PageProc.getBOM = function (text) {
        var match = text.match(BOM_REGEX);

        return match ? match[0] : null;
    };

    PageProc.processScript = function (text, withoutHeader) {
        var bom = PageProc.getBOM(text);

        if (bom)
            text = text.replace(bom, '');

        text = JSProcessor.process(text);

        // Overriding methods that work with the DOM.
        if (!JSProcessor.isDataScript(text) && !withoutHeader && text.indexOf(SharedConst.DOM_SANDBOX_OVERRIDE_DOM_METHOD_NAME) === -1)
            text = SCRIPT_HEADER + text;

        return bom ? bom + text : text;
    };

    PageProc.processManifest = function (manifest, urlReplacer) {
        var lines = manifest.split('\n'),
            trim = function (str) {
                return str.replace(/^\s+|\s+$/g, '');
            };

        for (var i = 0; i < lines.length; i++) {
            var line = trim(lines[i]);

            if (line && line !== 'CACHE MANIFEST' && line !== 'NETWORK:' && line !== 'FALLBACK:' &&
                line !== 'CACHE:' && line[0] !== '#' && line !== '*') {

                var isFallbackItem = line.indexOf(' ') !== -1;

                if (isFallbackItem) {
                    var urls = line.split(' ');

                    lines[i] = urlReplacer(urls[0]) + ' ' + urlReplacer(urls[1]);
                } else
                    lines[i] = urlReplacer(line);
            }
        }

        return lines.join('\n');
    };

    function replaceStylsheetUrls(css, processor) {
        return css.replace(CSS_URL_PROPERTY_VALUE_PATTERN, function () {
            var prefix = arguments[1] || arguments[10],
                openQuote = arguments[2] || arguments[5] || arguments[11] || arguments[14] || '',
                url = arguments[3] || arguments[6] || arguments[8] || arguments[12] || arguments[15],
                closeQuote = arguments[4] || arguments[7] || arguments[13] || arguments[16] || '',
                postfix = arguments[9] || '';

            return url ? (prefix + openQuote + processor(url) + closeQuote + postfix) : arguments[0];
        });
    }

    PageProc.processStylesheet = function (css, urlReplacer, isStylesheetTable) {
        if (typeof css === 'string' && !isStylesheetProcessed(css)) {
            var prefix = isStylesheetTable ? SharedConst.IS_STYLESHEET_PROCESSED_RULE + '\n' : '';

            // Replace :hover pseudo class
            css = css.replace(/\s*:\s*hover(\W)/gi, '[' + SharedConst.TEST_CAFE_HOVER_PSEUDO_CLASS_ATTR + ']$1');

            // Remove source map directive
            css = css.replace(SOURCE_MAP_REG_EX, '$1');

            // NOTE: replace URLs in css rules with the proxy URLs.
            return prefix + replaceStylsheetUrls(css, urlReplacer);
        }

        return css;
    };

    PageProc.cleanUpStylesheet = function (css, parseProxyUrl, formatUrl) {
        if (typeof css === 'string') {
            css = css.replace(new RegExp('\\[' + SharedConst.TEST_CAFE_HOVER_PSEUDO_CLASS_ATTR + '\\](\\W)', 'ig'), ":hover$1");

            return replaceStylsheetUrls(css, function (url) {
                var originUrlObj = parseProxyUrl(url);

                if (originUrlObj)
                    return formatUrl(originUrlObj.originResourceInfo);

                return url;
            });
        }

        return css;
    };

    PageProc.isOpenLinkInIFrame = function (el, hasIFrameParent) {
        var tagName = getTagName(el).toLowerCase(),
            target = getAttr(el, 'target');

        hasIFrameParent = hasIFrameParent || Util.hasIFrameParent;

        if (target !== '_top') {
            var mustProcessTag = IFRAME_FLAG_TAGS.indexOf(tagName) !== -1,
                isNameTarget = target ? target[0] !== '_' : false;

            if (target === '_parent')
                return mustProcessTag && !isTopParentIFrame(el);

            if (mustProcessTag && (hasIFrameParent(el) || isNameTarget))
                return true;
        }

        return false;
    };
})();
