/* global initHammerheadClient:true, isIFrameWithoutSrc:true */

HammerheadClient.define('DOMSandbox', function (require, exports) {
    var $                   = require('jQuery'),
        DomAccessorWrappers = require('DOMSandbox.DomAccessorWrappers'),
        EventSandbox        = require('DOMSandbox.Event'),
        HiddenInfo          = require('DOMSandbox.Upload.HiddenInfo'),
        IFrameSandbox       = require('DOMSandbox.IFrame'),
        InfoManager         = require('DOMSandbox.Upload.InfoManager'),
        JSProcessor         = require('Shared.JSProcessor'),
        MessageSandbox      = require('DOMSandbox.Message'),
        NativeMethods       = require('DOMSandbox.NativeMethods'),
        PageProc            = require('Shared.PageProc'),
        SandboxedJQuery     = require('SandboxedJQuery'),
        SandboxUtil         = require('DOMSandbox.Util'),
        ShadowUI            = require('DOMSandbox.ShadowUI'),
        SharedConst         = require('Shared.Const'),
        Transport           = require('Transport'),
        UploadSandbox       = require('DOMSandbox.Upload'),
        UrlUtil             = require('UrlUtil'),
        Util                = require('Util'),
        XhrSandbox          = require('DOMSandbox.Xhr');

    // Consts
    var BEFORE_DOCUMENT_CLEANED = 'beforeDocumentCleaned',
        BODY_CONTENT_CHANGED    = 'bodyContentChanged',
        BODY_CREATED            = 'bodyCreated',
        DOCUMENT_CLEANED        = 'documentCleaned',
        DOCUMENT_CLOSED         = 'documentClosed',
        IFRAME_ADDED            = 'iframeAdded',
        UNCAUGHT_JS_ERROR       = 'uncaughtJSError';

    var IFRAME_DOM_SANDBOXES_STORE = 'dom_sandboxes_store_5d9138e9';

    exports.BEFORE_DOCUMENT_CLEARED = BEFORE_DOCUMENT_CLEANED;
    exports.BODY_CREATED            = BODY_CREATED;
    exports.DOCUMENT_CLEARED        = DOCUMENT_CLEANED;
    exports.DOCUMENT_CLOSED         = DOCUMENT_CLOSED;
    exports.IFRAME_ADDED            = IFRAME_ADDED;
    exports.UNCAUGHT_JS_ERROR       = UNCAUGHT_JS_ERROR;

    var eventEmitter = new Util.EventEmitter();

    exports.on  = eventEmitter.on.bind(eventEmitter);
    exports.off = eventEmitter.off.bind(eventEmitter);

    function onIFrameAddedToDOM (iframe) {
        if (!Util.isCrossDomainIframe(iframe, true)) {
            eventEmitter.emit(IFRAME_ADDED, {
                iframe: iframe
            });

            IFrameSandbox.iframeAddedToDom(iframe);
        }
    }

    function onBodyContentChanged () {
        ShadowUI.onBodyContentChanged();
    }

    function onBodyCreated () {
        EventSandbox.initDocumentBodyListening(document);
        eventEmitter.emit(BODY_CREATED, {
            body: document.body
        });
    }

    function onBodyElementMutation () {
        ShadowUI.onBodyElementMutation();
    }

    IFrameSandbox.on(IFrameSandbox.IFRAME_READY_TO_INIT_INTERNAL, function (e) {
        // Eval Hammerhead code script
        initHammerheadClient(e.iframe.contentWindow, true);
    });

    IFrameSandbox.on(IFrameSandbox.IFRAME_DOCUMENT_CREATED, function (e) {
        // Override only document (In fact, we only need 'write' and 'writeln' methods)
        overrideDocument(e.iframe.contentWindow, e.iframe.contentDocument);
    });

    IFrameSandbox.on(IFrameSandbox.IFRAME_DOCUMENT_RECREATED, function (e) {
        // We should informs iframe DomSandbox so that it restore communication with the recreated document
        exports.rebindDomSandboxToIframe(e.iframe);
    });

    function overrideElementDomMethods (el) {
        if (el[SharedConst.DOM_SANDBOX_PROCESSED_CONTEXT] !== window) {
            el[SharedConst.DOM_SANDBOX_PROCESSED_CONTEXT] = window;

            overrideElement(el, true);
            EventSandbox.overrideElement(el, true);
            ShadowUI.overrideElement(el, true);
        }
    }

    exports.raiseBodyCreatedEvent = onBodyCreated;

    exports.rebind = function (iframe) {
        // Assign exists DomSandbox to cleared document
        onDocumentCleaned(iframe.contentWindow, iframe.contentDocument);
    };

    exports.rebindDomSandboxToIframe = function (iframe) {
        if (iframe) {
            var topSameDomainWindow = Util.getTopSameDomainWindow(window),
                domSandboxesStore   = topSameDomainWindow[IFRAME_DOM_SANDBOXES_STORE];

            // Find iframe DomSandbox
            for (var i = 0; i < domSandboxesStore.length; i++) {
                if (domSandboxesStore[i].iframe === iframe) {
                    // Inform the DomSandbox so that it restore communication with the recreated document
                    domSandboxesStore[i].domSandbox.rebind(iframe);

                    return;
                }
            }

            // If the iframe DomSandbox is not found, this means that iframe not initialized,
            // in this case we should inject Hammerhead

            // Hack: IE10 clean up overrided methods after document.write calling
            NativeMethods.restoreNativeDocumentMeth(iframe.contentDocument);

            // DomSandbox for this iframe not found (iframe not yet initialized).
            // Inform the IFrameSandbox about it, and it inject Hammerhead
            IFrameSandbox.onIframeBeganToRun(iframe);
        }
    };

    exports.overrideDomMethods = function (el, doc) {
        if (!el) {
            doc = doc || document;

            EventSandbox.overrideElement(doc);

            if (doc.documentElement)
                exports.overrideDomMethods(doc.documentElement);
        } else {
            //OPTIMIZATION: use querySelectorAll to iterate over descendant nodes
            if (el.querySelectorAll) {
                overrideElementDomMethods(el);

                var children = el.querySelectorAll('*');

                for (var i = 0; i < children.length; i++)
                    overrideElementDomMethods(children[i]);
            }

            //NOTE: if querySelectorAll is not available fallback to recursive algorithm
            else if (el.nodeType === 1 || el.nodeType === 11) {
                overrideElementDomMethods(el);

                var cnLength = el.childNodes.length;

                if (cnLength) {
                    for (var j = 0; j < cnLength; j++)
                        exports.overrideDomMethods(el.childNodes[j]);
                }
            }
        }
    };

    // Overrided methods
    function getIframes (el) {
        if (el.tagName && el.tagName.toLowerCase() === 'iframe')
            return [el];
        else
            return el.querySelectorAll('iframe');
    }

    function onElementAdded (el) {
        if ((el.nodeType === 1 || el.nodeType === 9) && Util.isElementInDocument(el)) {
            var iframes = getIframes(el);

            if (iframes.length) {
                for (var i = 0; i < iframes.length; i++)
                    onIFrameAddedToDOM(iframes[i]);
            } else if (el.tagName && el.tagName.toLowerCase() === 'body')
                onBodyElementMutation();
        }

        var $el = $(el);

        $el.add($el.find('*')).each(function () {
            if (Util.isFileInput(this))
                HiddenInfo.addInputInfo(this, InfoManager.getFiles(this), InfoManager.getValue(this));
        });
    }

    function onElementRemoved (el) {
        if (el.nodeType === 1 && el.tagName && el.tagName.toLowerCase() === 'body')
            onBodyElementMutation();
    }

    function overridedInsertBefore (newNode, refNode) {
        exports.overrideDomMethods(newNode);

        var result = NativeMethods.insertBefore.call(this, newNode, refNode);

        onElementAdded(newNode);

        return result;
    }

    function overridedAppendChild (child) {
        //NOTE: we should process a TextNode as a script if it is appended to a script element (B254284)
        if (child.nodeType === 3 && this.tagName && this.tagName.toLowerCase() === 'script')
            child.data = PageProc.processScript(child.data);

        exports.overrideDomMethods(child);

        var result = null;

        if (this.tagName && this.tagName.toLowerCase() === 'body' && this.children.length) {
            // NOTE: We should to append element before shadow ui root
            var lastChild = this.children[this.children.length - 1];

            result = NativeMethods.insertBefore.call(this, child, lastChild);
        } else
            result = NativeMethods.appendChild.call(this, child);

        onElementAdded(child);

        return result;
    }

    function overridedRemoveChild (child) {
        var $el = $(child);

        $el.add($el.find('*')).each(function () {
            if (Util.isFileInput(this))
                HiddenInfo.removeInputInfo(this);
        });

        var result = NativeMethods.removeChild.call(this, child);

        onElementRemoved(child);

        return result;
    }

    function overridedCloneNode () {
        var clone = NativeMethods.cloneNode.apply(this, arguments);

        exports.overrideDomMethods(clone);

        return clone;
    }

    function overridedGetAttribute (attr) {
        return overridedGetAttributeCore(this, attr);
    }

    function overridedGetAttributeNS (ns, attr) {
        return overridedGetAttributeCore(this, attr, ns);
    }

    function overridedGetAttributeCore (el, attr, ns) {
        var getAttrMeth = ns ? NativeMethods.getAttributeNS : NativeMethods.getAttribute;

        // Optimization: hasAttribute meth is very slow
        if (isUrlAttr(el, attr) || attr === 'sandbox' || PageProc.EVENTS.indexOf(attr) !== -1 ||
            attr === 'autocomplete') {
            var storedAttr = PageProc.getStoredAttrName(attr);

            if (attr === 'autocomplete' && getAttrMeth.apply(el, ns ? [ns, storedAttr] : [storedAttr]) === 'none')
                return null;
            else if (el.hasAttribute(storedAttr))
                attr = storedAttr;
        }

        return getAttrMeth.apply(el, ns ? [ns, attr] : [attr]);
    }

    function overridedSetAttribute (attr, value) {
        return overridedSetAttributeCore(this, attr, value);
    }

    function overridedSetAttributeNS (ns, attr, value) {
        return overridedSetAttributeCore(this, attr, value, ns);
    }

    function overridedSetAttributeCore (el, attr, value, ns) {
        var setAttrMeth         = ns ? NativeMethods.setAttributeNS : NativeMethods.setAttribute,
            tagName             = el.tagName.toLowerCase(),
            isSupportedProtocol = UrlUtil.isSupportedProtocol(value),
            urlAttr             = isUrlAttr(el, attr),
            isEventAttr         = PageProc.EVENTS.indexOf(attr) !== -1;

        value = value + '';

        if ((urlAttr && !isSupportedProtocol) || isEventAttr) {
            var isJsProtocol = PageProc.JAVASCRIPT_PROTOCOL_REG_EX.test(value),
                storedJsAttr = PageProc.getStoredAttrName(attr);

            if ((urlAttr && isJsProtocol) || isEventAttr) {
                /* jshint ignore:start */
                var valueWithoutProtocol = value.replace(PageProc.JAVASCRIPT_PROTOCOL_REG_EX, ''),
                    matches              = valueWithoutProtocol.match(PageProc.HTML_STRING_REG_EX),
                    processedValue       = '';

                if (matches && isJsProtocol) {
                    var html = matches[2];

                    if (!SandboxUtil.isPageHtml(html))
                        html = '<html><body>' + html + '</body></html>'

                    processedValue = 'javascript:\'' + SandboxUtil.processHtml(html).replace(/'/g, "\\'") + '\'';
                }
                else
                    processedValue = (isJsProtocol ? 'javascript:' : '') +
                                     PageProc.processScript(valueWithoutProtocol, true);

                if (processedValue !== value) {
                    setAttrMeth.apply(el, ns ? [ns, storedJsAttr, value] : [storedJsAttr, value]);
                    value = processedValue;
                }
                /* jshint ignore:end */
            } else
                setAttrMeth.apply(el, ns ? [ns, storedJsAttr, value] : [storedJsAttr, value]);
        } else if (urlAttr && isSupportedProtocol) {
            var storedUrlAttr = PageProc.getStoredAttrName(attr);

            setAttrMeth.apply(el, ns ? [ns, storedUrlAttr, value] : [storedUrlAttr, value]);

            if (tagName !== 'img') {
                if (value !== '') {
                    var isIframe         = tagName === 'iframe',
                        isScript         = tagName === 'script',
                        isCrossDomainUrl = isSupportedProtocol && !UrlUtil.sameOriginCheck(location.toString(), value),
                        resourceType     = null;

                    if (isScript)
                        resourceType = UrlUtil.SCRIPT;
                    else if (isIframe || PageProc.isOpenLinkInIFrame(el))
                        resourceType = UrlUtil.IFRAME;

                    value = (isIframe && isCrossDomainUrl) ? UrlUtil.getCrossDomainIframeProxyUrl(value) :
                            UrlUtil.getProxyUrl(value, null, null, null, null, resourceType);
                }
            } else {
                if (value && !UrlUtil.parseProxyUrl(value))
                    value = UrlUtil.resolveUrlAsOrigin(value);
            }
        } else if (attr === 'autocomplete') {
            var storedAutocompleteAttr = PageProc.getStoredAttrName(attr);

            setAttrMeth.apply(el, ns ? [ns, storedAutocompleteAttr, value] : [storedAutocompleteAttr, value]);
            value                      = 'off';
        }
        else if (attr === 'target' && value === '_blank' && PageProc.TARGET_ATTR_TAGS[tagName])
            return;
        else if (attr === 'sandbox' && value.indexOf('allow-scripts') === -1) {
            var storedSandboxAttr = PageProc.getStoredAttrName(attr);

            setAttrMeth.apply(el, ns ? [ns, storedSandboxAttr, value] : [storedSandboxAttr, value]);
            value += ' allow-scripts';
        }

        return setAttrMeth.apply(el, ns ? [ns, attr, value] : [attr, value]);
    }

    function overridedRemoveAttribute () {
        overridedRemoveAttributeCore.call(this, false, arguments);
    }

    function overridedRemoveAttributeNS () {
        overridedRemoveAttributeCore.call(this, true, arguments);
    }

    function overridedRemoveAttributeCore (ns, arg) {
        var attr           = ns ? arg[1] : arg[0],
            removeAttrFunc = ns ? NativeMethods.removeAttributeNS : NativeMethods.removeAttribute;

        if (isUrlAttr(this, attr) || attr === 'sandbox' || attr === 'autocomplete' ||
            PageProc.EVENTS.indexOf(attr) !== -1) {
            var storedAttr = PageProc.getStoredAttrName(attr);

            if (attr === 'autocomplete')
                NativeMethods.setAttribute.call(this, storedAttr, 'none');
            else
                removeAttrFunc.apply(this, ns ? [arg[0], storedAttr] : [storedAttr]);
        }

        if (attr !== 'autocomplete')
            return removeAttrFunc.apply(this, arg);
    }

    function overridedInsertRow () {
        var tagName    = this.tagName.toLowerCase(),
            nativeMeth = tagName === 'table' ? NativeMethods.insertTableRow : NativeMethods.insertTBodyRow,
            row        = nativeMeth.apply(this, arguments);

        exports.overrideDomMethods(row);

        return row;
    }

    function overridedInsertCell () {
        var cell = NativeMethods.insertCell.apply(this, arguments);

        exports.overrideDomMethods(cell);

        return cell;
    }

    function overridedInsertAdjacentHTML (pos, html) {
        if (html !== null)
            html = SandboxUtil.processHtml('' + html, this.parentNode && this.parentNode.tagName);

        NativeMethods.insertAdjacentHTML.call(this, pos, html);
        exports.overrideDomMethods(this.parentNode || this);
    }

    function overridedFormSubmit () {
        var form = this;

        Transport.waitCookieMsg(function () {
            NativeMethods.formSubmit.apply(form, arguments);
        });
    }

    // Utils
    function isUninitializedIframeWithoutSrc (window) {
        try {
            return window !== window.top && UrlUtil.isIframeWithoutSrc(window.frameElement) &&
                   !IFrameSandbox.isIframeInitialized(window.frameElement);
        } catch (e) {
            return false;
        }
    }

    function isUrlAttr (el, attr) {
        var tagName = el.tagName.toLowerCase();

        return PageProc.URL_ATTR_TAGS[attr] && PageProc.URL_ATTR_TAGS[attr].indexOf(tagName) !== -1;
    }

    function overrideElement (el, overridePrototypeMeths) {
        var isDocFragment = el.nodeType === 11,
            elTagName     = el.tagName && el.tagName.toLowerCase(),
            isForm        = elTagName === 'form',
            isIframe      = elTagName === 'iframe';

        if (!isDocFragment)
            PageProc.processElement(el, UrlUtil.convertToProxyUrl);

        if (elTagName === 'img') {
            el.addEventListener('error', function (e) {
                var storedAttr = NativeMethods.getAttribute.call(el, PageProc.getStoredAttrName('src'));

                if (storedAttr && !UrlUtil.parseProxyUrl(el.src) && UrlUtil.isSupportedProtocol(el.src)) {
                    NativeMethods.setAttribute.call(el, 'src', UrlUtil.getProxyUrl(storedAttr));
                    Util.stopPropagation(e);
                }
            }, false);
        }

        if (isIframe && !Util.isCrossDomainIframe(el, true))
            IFrameSandbox.overrideIframe($(el));

        if ('insertAdjacentHTML' in el)
            el.insertAdjacentHTML = overridedInsertAdjacentHTML;

        if (!SandboxUtil.BROWSER_HAS_ELEMENT_PROTOTYPE || overridePrototypeMeths) {
            el.insertBefore = overridedInsertBefore;
            el.appendChild  = overridedAppendChild;
            el.removeChild  = overridedRemoveChild;
            el.cloneNode    = overridedCloneNode;

            if (!isDocFragment) {
                el.setAttribute      = overridedSetAttribute;
                el.setAttributeNS    = overridedSetAttributeNS;
                el.getAttribute      = overridedGetAttribute;
                el.getAttributeNS    = overridedGetAttributeNS;
                el.removeAttribute   = overridedRemoveAttribute;
                el.removeAttributeNS = overridedRemoveAttributeNS;
            }

            if ('insertRow' in el)
                el.insertRow = overridedInsertRow;

            if ('insertCell' in el)
                el.insertCell = overridedInsertCell;

            if (isForm)
                el.submit = overridedFormSubmit;
        }
    }

    function raiseUncaughtJsErrorEvent (msg, window, pageUrl) {
        if (Util.isCrossDomainWindows(window, window.top))
            return;

        var sendToTopWindow = window !== window.top;

        if (!pageUrl)
            pageUrl = UrlUtil.OriginLocation.get();

        if (sendToTopWindow) {
            eventEmitter.emit(UNCAUGHT_JS_ERROR, {
                msg:      msg,
                pageUrl:  pageUrl,
                inIFrame: true
            });

            MessageSandbox.sendServiceMsg({
                cmd:     UNCAUGHT_JS_ERROR,
                pageUrl: pageUrl,
                msg:     msg
            }, window.top);
        } else {
            eventEmitter.emit(UNCAUGHT_JS_ERROR, {
                msg:     msg,
                pageUrl: pageUrl
            });
        }
    }

    //NOTE: DOM sandbox hides evidence of the content proxying from page-native script. Proxy replaces URLs for
    //resources. Our goal is to make native script think that all resources are fetched from origin resource not
    //from proxy and also provide proxying for dynamicly created elements.
    exports.init = function (window, document) {
        onInit(window);

        ShadowUI.init(window, document);
        EventSandbox.init(window, document);
        XhrSandbox.init(window, document);
        MessageSandbox.init(window, document);
        UploadSandbox.init(window, document);
        DomAccessorWrappers.init(window, document);

        DomAccessorWrappers.on(DomAccessorWrappers.BODY_CONTENT_CHANGED, function (el) {
            var elContextWindow = el[SharedConst.DOM_SANDBOX_PROCESSED_CONTEXT];

            if (elContextWindow !== window) {
                MessageSandbox.sendServiceMsg({
                    cmd: BODY_CONTENT_CHANGED
                }, elContextWindow);
            } else
                onBodyContentChanged();
        });

        initInternal(window, document);

        SandboxedJQuery.init(window, undefined);

        MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, function (e) {
            var message = e.message;

            if (message.cmd === UNCAUGHT_JS_ERROR)
                raiseUncaughtJsErrorEvent(message.msg, window, message.pageUrl);

            if (message.cmd === BODY_CONTENT_CHANGED)
                onBodyContentChanged();
        });
    };

    function initInternal (window, document) {
        // NOTE: Iframe loses its contentWindow after reinserting in the DOM (in the FF).
        if (Util.isMozilla) {
            exports.on(IFRAME_ADDED, function (e) {
                IFrameSandbox.overrideIframe($(e.iframe));
            });
        }

        // NOTE: in some browsers (for example Firefox) 'window.document' are different objects when iframe is created
        // just now and on document ready event. Therefore we should update 'document' object to override its methods (Q527555).
        $(document).ready(function () {
            exports.overrideDomMethods(null, document);
        });

        overrideDocument(window, document);
        overrideWindow(window);
    }

    function onDocumentCleaned (window, document) {
        if (Util.isIE) {
            var needToUpdateNativeDomMeths     = false,
                needToUpdateNativeElementMeths = false,
                needToUpdateNativeWindowMeths  = false;

            try {
                needToUpdateNativeDomMeths = !document.createElement ||
                                             (NativeMethods.createElement.toString() ===
                                              document.createElement.toString());
            } catch (e) {
                needToUpdateNativeDomMeths = true;
            }

            try {
                var nativeElement = NativeMethods.createElement.call(document, 'div');

                needToUpdateNativeElementMeths = nativeElement.getAttribute.toString() ===
                                                 NativeMethods.getAttribute.toString();
            } catch (e) {
                needToUpdateNativeElementMeths = true;
            }

            try {
                NativeMethods.setTimeout.call(window, function () {
                }, 0);

                needToUpdateNativeWindowMeths = window.setTimeout.toString() === NativeMethods.setTimeout.toString();
            } catch (e) {
                needToUpdateNativeWindowMeths = true;
            }

            // T173709
            if (needToUpdateNativeDomMeths)
                NativeMethods.refreshDocument(document);

            if (needToUpdateNativeElementMeths)
                NativeMethods.refreshElementMeths(document);

            // T239109
            if (needToUpdateNativeWindowMeths)
                NativeMethods.refreshWindowMeths(window);
        }

        EventSandbox.initDocumentListening();

        if (Util.isWebKit)
            EventSandbox.restartElementListening(window);

        ShadowUI.init(window, document);
        DomAccessorWrappers.init(window, document); // T182337

        eventEmitter.emit(DOCUMENT_CLEANED, {
            document:           document,
            isIFrameWithoutSrc: isIFrameWithoutSrc
        });

        overrideDocument(window, document);
    }

    function onInit (window) {
        var topSameDomainWindow = Util.getTopSameDomainWindow(window);

        if (isIFrameWithoutSrc) {
            topSameDomainWindow[IFRAME_DOM_SANDBOXES_STORE].push({
                iframe:     window.frameElement,
                domSandbox: exports
            });
        } else if (window === topSameDomainWindow) {
            window[IFRAME_DOM_SANDBOXES_STORE] = [];
        }
    }

    function overrideDocument (window, document) {
        var storedDocumentWriteContent = '',
            writeBlockCounter          = 0;

        function beforeDocumentCleaned () {
            eventEmitter.emit(BEFORE_DOCUMENT_CLEANED, {
                document:           document,
                isIFrameWithoutSrc: isIFrameWithoutSrc
            });
        }

        function onDocumentClosed () {
            eventEmitter.emit(DOCUMENT_CLOSED, {
                document:           document,
                isIFrameWithoutSrc: isIFrameWithoutSrc
            });
        }

        function overridedDocumentWrite (args, ln) {
            args = Array.prototype.slice.call(args);

            var separator = ln ? '\n' : '',
                lastArg   = args.length ? args[args.length - 1] : '',
                isBegin   = lastArg === JSProcessor.DOCUMENT_WRITE_BEGIN_PARAM,
                isEnd     = lastArg === JSProcessor.DOCUMENT_WRITE_END_PARAM;

            if (isBegin)
                writeBlockCounter++;
            else if (isEnd)
                writeBlockCounter--;

            if (isBegin || isEnd)
                args.pop();

            var str = separator + args.join(separator);

            var needWriteOnEndMarker = isEnd && !writeBlockCounter;

            if (needWriteOnEndMarker ||
                SandboxUtil.isPageHtml(str) ||
                (SandboxUtil.isWellFormattedHtml(str) && !storedDocumentWriteContent)) {
                writeBlockCounter          = 0;
                str                        = storedDocumentWriteContent + str;
                storedDocumentWriteContent = '';
            } else if (isBegin || storedDocumentWriteContent) {
                storedDocumentWriteContent += str;

                return;
            }

            var isUninitializedIframe = isUninitializedIframeWithoutSrc(window);

            str = SandboxUtil.processHtml('' + str);

            if (!isUninitializedIframe)
                beforeDocumentCleaned();

            // FireFox, IE recreate window instance during the document.write function execution T213930
            if ((Util.isMozilla || Util.isIE) && !SandboxUtil.isPageHtml(str))
                str = SandboxUtil.INIT_SCRIPT_FOR_IFRAME_TEMPLATE + str;

            var result = NativeMethods.documentWrite.call(document, str);

            if (!isUninitializedIframe) {
                onDocumentCleaned(window, document);
                exports.overrideDomMethods(null, document); // B234357
            }

            return result;
        }

        document.open = function () {
            var isUninitializedIframe = isUninitializedIframeWithoutSrc(window);

            if (!isUninitializedIframe)
                beforeDocumentCleaned();

            var result = NativeMethods.documentOpen.call(document);

            if (!isUninitializedIframe)
                onDocumentCleaned(window, document);
            else
            // If iframe initialization in progress, we should once again override document.write and document.open meths
            // because they were cleaned after native document.open meth calling
                overrideDocument(window, document);

            return result;
        };

        document.close = function () {
            // IE10 and IE9 rise "load" event only when document.close meth called.
            // We should restore overrided document.open and document.write meths before Hammerhead injection
            // if window not initialized
            if (Util.isIE && !IFrameSandbox.isWindowInited(window))
                NativeMethods.restoreNativeDocumentMeth(document);

            var result = NativeMethods.documentClose.call(document);

            if (!isUninitializedIframeWithoutSrc(window))
                onDocumentClosed();

            return result;
        };

        document.createElement = function (tagName) {
            var el = NativeMethods.createElement.call(document, tagName);

            exports.overrideDomMethods(el);

            return el;
        };

        document.createElementNS = function (ns, tagName) {
            var el = NativeMethods.createElementNS.call(document, ns, tagName);

            exports.overrideDomMethods(el);

            return el;
        };

        document.write = function () {
            return overridedDocumentWrite(arguments);
        };

        document.writeln = function () {
            return overridedDocumentWrite(arguments, true);
        };

        document.createDocumentFragment = function () {
            var fragment = NativeMethods.createDocumentFragment.apply(document, arguments);

            exports.overrideDomMethods(fragment);

            return fragment;
        };
    }

    function overrideWindow (window) {
        // Additional methods for the DOM
        window[SharedConst.DOM_SANDBOX_OVERRIDE_DOM_METHOD_NAME] = exports.overrideDomMethods;

        window.CanvasRenderingContext2D.prototype.drawImage = function () {
            var args = Array.prototype.slice.call(arguments, 0),
                img  = args.shift(),
                src  = img.src;

            if (UrlUtil.sameOriginCheck(location.toString(), src)) {
                img     = NativeMethods.createElement.call(window.document, 'img');
                img.src = UrlUtil.getProxyUrl(src);
            }

            args.unshift(img);

            return NativeMethods.canvasContextDrawImage.apply(this, args);
        };

        // Override uncaught error handling
        window.onerror = function (msg, url, line, col, errObj) {
            // FireFox raises NS_ERROR_NOT_INITIALIZED exception after widnow has been removed from the dom
            if (msg.indexOf('NS_ERROR_NOT_INITIALIZED') !== -1)
                return true;

            var originalOnErrorHandler = window[DomAccessorWrappers.ORIGINAL_WINDOW_ON_ERROR_HANDLER_KEY],
                caught                 = originalOnErrorHandler &&
                                         originalOnErrorHandler.call(window, msg, url, line, col, errObj) === true;

            if (caught)
                return true;

            raiseUncaughtJsErrorEvent(msg, window);

            return false;
        };

        window.open = function () {
            var newArgs = [];

            newArgs.push(UrlUtil.getProxyUrl(arguments[0]));
            newArgs.push('_self');

            if (arguments.length > 2)
                newArgs.push(arguments[2]);
            if (arguments.length > 3)
                newArgs.push(arguments[3]);

            return NativeMethods.windowOpen.apply(window, newArgs);
        };

        window.Worker = function (scriptURL) {
            scriptURL = UrlUtil.getProxyUrl(scriptURL);

            return new NativeMethods.workerCtor(scriptURL);
        };

        window.EventSource = function (url) {
            url = UrlUtil.getProxyUrl(url);

            return new NativeMethods.eventSourceCtor(url);
        };

        if (window.MutationObserver) {
            window.MutationObserver = function (callback) {
                var wrapper = function (mutations) {
                    var result = [];

                    for (var i = 0; i < mutations.length; i++) {
                        if (!ShadowUI.isShadowUIMutation(mutations[i]))
                            result.push(mutations[i]);
                    }

                    if (result.length)
                        callback(result);
                };

                return new NativeMethods.mutationObserverCtor(wrapper);
            };
        }

        if (window.navigator && window.navigator.serviceWorker) {
            window.navigator.serviceWorker.register = function (url) {
                url = UrlUtil.getProxyUrl(url);

                return NativeMethods.registerServiceWorker.call(window.navigator.serviceWorker, url);
            };
        }

        window.Image = function () {
            var image = null;

            if (!arguments.length)
                image = new NativeMethods.imageCtor();
            else if (arguments.length === 1)
                image = new NativeMethods.imageCtor(arguments[0]);
            else
                image = new NativeMethods.imageCtor(arguments[0], arguments[1]);

            exports.overrideDomMethods(image);

            return image;
        };

        // Override native DOM methods
        if (SandboxUtil.BROWSER_HAS_ELEMENT_PROTOTYPE) {
            window.Element.prototype.insertBefore              = overridedInsertBefore;
            window.Element.prototype.appendChild               = overridedAppendChild;
            window.Element.prototype.removeChild               = overridedRemoveChild;
            window.Element.prototype.setAttribute              = overridedSetAttribute;
            window.Element.prototype.setAttributeNS            = overridedSetAttributeNS;
            window.Element.prototype.getAttribute              = overridedGetAttribute;
            window.Element.prototype.getAttributeNS            = overridedGetAttributeNS;
            window.Element.prototype.removeAttribute           = overridedRemoveAttribute;
            window.Element.prototype.removeAttributeNS         = overridedRemoveAttributeNS;
            window.Element.prototype.cloneNode                 = overridedCloneNode;
            window.Node.prototype.cloneNode                    = overridedCloneNode;
            window.Node.prototype.appendChild                  = overridedAppendChild;
            window.Node.prototype.removeChild                  = overridedRemoveChild;
            window.Node.prototype.insertBefore                 = overridedInsertBefore;
            window.HTMLTableElement.prototype.insertRow        = overridedInsertRow;
            window.HTMLTableSectionElement.prototype.insertRow = overridedInsertRow;
            window.HTMLTableRowElement.prototype.insertCell    = overridedInsertCell;
            window.HTMLFormElement.prototype.submit            = overridedFormSubmit;
        }

        if (typeof window.history.pushState === 'function' && typeof window.history.replaceState === 'function') {
            window.history.pushState = function (data, title, url) {
                var args = [data, title];

                if (arguments.length > 2)
                    args.push(url ? UrlUtil.getProxyUrl(url) : url);

                return NativeMethods.historyPushState.apply(history, args);
            };

            window.history.replaceState = function (data, title, url) {
                var args = [data, title];

                if (arguments.length > 2)
                    args.push(url ? UrlUtil.getProxyUrl(url) : url);

                return NativeMethods.historyReplaceState.apply(history, args);
            };
        }

        if (window.navigator.registerProtocolHandler) {
            window.navigator.registerProtocolHandler = function () {
                var args           = Array.prototype.slice.call(arguments),
                    urlIndex       = 1,
                    originHostname = UrlUtil.OriginLocation.getParsed().hostname,
                    isOriginUrl    = $.browser.mozilla ?
                                     UrlUtil.isSubDomain(originHostname, UrlUtil.parseUrl(args[urlIndex]).hostname) :
                                     UrlUtil.sameOriginCheck(UrlUtil.OriginLocation.get(), args[urlIndex]);

                if (isOriginUrl)
                    args[urlIndex] = UrlUtil.getProxyUrl(args[urlIndex]);

                return NativeMethods.registerProtocolHandler.apply(navigator, args);
            };
        }
    }
});
