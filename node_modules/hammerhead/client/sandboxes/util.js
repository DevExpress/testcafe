HammerheadClient.define('DOMSandbox.Util', function (require, exports) {
    var $ = require('jQuery'),
        NativeMethods = require('DOMSandbox.NativeMethods'),
        PageProc = require('Shared.PageProc'),
        SharedConst = require('Shared.Const'),
        UrlUtil = require('UrlUtil'),
        Util = require('Util');

    var TEXT_NODE_COMMENT_MARKER = '16c959db8754',
        INIT_SCRIPT_FOR_IFRAME_TEMPLATE =
            '<script class="' + SharedConst.TEST_CAFE_SCRIPT_CLASSNAME + '" type="text/javascript">' +
            'var parentHammerhead = null;' +
            'try {' +
            '   parentHammerhead = window.parent.Hammerhead;' +
            '} catch(e) {}' +
            'if (parentHammerhead) parentHammerhead._rebindDomSandboxToIframe(window.frameElement);' +
            'var script = document.currentScript || document.scripts[document.scripts.length - 1];' +
            'script.parentNode.removeChild(script);' +
            '<\/script>';

    exports.BROWSER_HAS_ELEMENT_PROTOTYPE = window.Element && Element.prototype && !$.browser.mozilla;
    exports.INIT_SCRIPT_FOR_IFRAME_TEMPLATE = INIT_SCRIPT_FOR_IFRAME_TEMPLATE;

    exports.isPageHtml = isPageHtml;

    var htmlDocument = document.implementation.createHTMLDocument('title'),
        htmlParser = htmlDocument.createDocumentFragment();

    PageProc.on(PageProc.HTML_PROCESSING_REQUIRED, function (html, callback) {
        if (!exports.isPageHtml(html))
            html = '<html><body>' + html + '</body></html>';

        callback(exports.processHtml(html));
    });

    function getHtmlDocument() {
        try {
            // IE bug: access denied
            if (htmlDocument.location)
                htmlDocument.location.toString();
        } catch (e) {
            htmlDocument = document.implementation.createHTMLDocument('title');
            htmlParser = htmlDocument.createDocumentFragment();
        }

        return htmlDocument;
    }

    function isPageHtml(html) {
        return /^\s*(<\s*(!doctype|html|head|body)[^>]*>)/i.test(html);
    }

    function processPageTag(pageTagHtml, process) {
        pageTagHtml = pageTagHtml.replace(/^(\s*<\s*)(head|body|html)/i, '$1fakeTagName_$2');

        return process(pageTagHtml).replace(/<\/fakeTagName_[\s\S]+$/i, '').replace(/fakeTagName_/i, '');
    }

    function processPageHtml(html, process) {
        var doctypeRegEx = /^(\s*<\s*!doctype[^>]*>)([\s\S]*)$/i,
            headBodyRegEx = /^(\s*<\s*(head|body)[^>]*>)([\s\S]*?)(<\s*\/(head|body)\s*>\s*)?$/i,
            htmlContentRegEx = /^(\s*<\s*head[^>]*>)([\s\S]*?)(<\s*\/head\s*>\s*<\s*body[^>]*>)([\s\S]*?)(<\s*\/body\s*>\s*)?$/i,
            htmlRegEx = /^(\s*<\s*html[^>]*>)([\s\S]*?)(<\s*\/html\s*>\s*)?$/i;

        var doctypeMatches = html.match(doctypeRegEx);

        if (doctypeMatches)
            return doctypeMatches[1] + process(doctypeMatches[2]);

        var htmlMatches = html.match(htmlRegEx);

        if (htmlMatches)
            return [processPageTag(htmlMatches[1], process), process(htmlMatches[2], 'html'), htmlMatches[3]].join('');

        var htmlContentMatches = html.match(htmlContentRegEx);

        if (htmlContentMatches) {
            return [htmlContentMatches[1], process(htmlContentMatches[2], 'head'), htmlContentMatches[3],
                process(htmlContentMatches[4], 'body'), htmlContentMatches[5]].join('');
        }

        var headBodyMatches = html.match(headBodyRegEx);

        if (headBodyMatches)
            return [processPageTag(headBodyMatches[1], process), process(headBodyMatches[3], headBodyMatches[2]), headBodyMatches[4]].join('');
    }

    function wrapTextNodes(html) {
        var textNodeRegEx = /(<\s*(table|tbody|\/tbody|\/tfoot|\/thead|\/tr|tfoot|thead|tr|\/td)[^>]*>)(\s*[^<\s]+[^<]*)(?=<)/ig,
            index = 0;

        return html.replace(textNodeRegEx, function (str, p1, p2, p3) {
            var marker = TEXT_NODE_COMMENT_MARKER + (index++).toString();

            return p1 + '<!--' + marker + p3 + marker + '-->';
        });
    }

    function unwrapTextNodes(html) {
        var i = 0,
            marker = '';

        do {
            marker = TEXT_NODE_COMMENT_MARKER + i;
            html = html.replace('<!--' + marker, '').replace(marker + '-->', '');
        } while (html.indexOf(TEXT_NODE_COMMENT_MARKER + (++i)) !== -1);

        return html;
    }

    function processHtml(html, parentTag, process) {
        html = wrapTextNodes(html);

        var container = getHtmlDocument().createElement('div');

        htmlParser.innerHTML = '';
        NativeMethods.appendChild.call(htmlParser, container);

        parentTag = parentTag ? parentTag.toLowerCase() : '';

        var isRow = parentTag === 'tr',
            isTable = parentTag === 'table' || parentTag === 'tbody',
            isScript = parentTag === 'script';

        if (isTable)
            html = '<table>' + html + '</table>';
        else if (isRow)
            html = '<table><tr>' + html + '</tr></table>';
        else if (isScript)
            html = '<script>' + html + '</script>';

        container.innerHTML = html;

        if (process(container))
            html = container.innerHTML;

        if (isTable)
            html = html.replace(/^<table>(<tbody>)?|(<\/tbody>)?<\/table>$/ig, '');
        else if (isRow)
            html = html.replace(/^<table>(<tbody>)?<tr>|<\/tr>(<\/tbody>)?<\/table>$/ig, '');
        else if (isScript)
            html = html.replace(/^<script>|<\/script>$/ig, '');

        return unwrapTextNodes(html);
    }

    function AttributesWrapper(attributes) {
        var length = 0;

        for (var i = 0; i < attributes.length; i++) {
            var attr = attributes[i];

            if (!Util.isHammerheadAttr(attr.name)) {
                var storedAttrName = attributes[PageProc.getStoredAttrName(attr.name)];

                if (storedAttrName) {
                    attr = attr.cloneNode();
                    attr.value = storedAttrName.value;
                    Object.defineProperty(this, attr.name, {value: attr});
                }

                Object.defineProperty(this, length, {value: attr});
                length++;
            }
        }

        Object.defineProperty(this, 'length', {value: length});

        this.item = function (index) {
            return this[index];
        };

        for (var funcName in attributes) {
            if (typeof this[funcName] === 'function' && funcName !== 'item')
                this[funcName] = attributes[funcName].bind(attributes);
        }
    }

    exports.cleanUpHtml = function (html, parentTag) {
        if (isPageHtml(html))
            return processPageHtml(html, exports.cleanUpHtml);

        return processHtml(html, parentTag, function (container) {
            var changed = false;

            for (var i = 0; i < PageProc.URL_ATTRS.length; i++) {
                var attr = PageProc.URL_ATTRS[i],
                    storedAttr = PageProc.getStoredAttrName(attr),
                    $els = $(container).find('[' + storedAttr + ']');

                for (var j = 0; j < $els.length; j++) {
                    var el = $els[j];

                    if (el.hasAttribute(attr)) {
                        NativeMethods.setAttribute.call(el, attr, NativeMethods.getAttribute.call(el, storedAttr));
                        NativeMethods.removeAttribute.call(el, storedAttr);

                        changed = true;
                    }
                }
            }

            var $container = $(container);

            $container.find('[class*="' + SharedConst.TEST_CAFE_UI_CLASSNAME_POSTFIX + '"]').each(function () {
                $(this).remove();

                changed = true;
            });

            $container.find('script').each(function () {
                var innerHTML = this.innerHTML;

                if (PageProc.SCRIPT_HEADER_REG_EX.test(innerHTML)) {
                    this.innerHTML = innerHTML.replace(PageProc.SCRIPT_HEADER_REG_EX, '');

                    changed = true;
                }
            });

            $container.find('[' + SharedConst.TEST_CAFE_HOVER_PSEUDO_CLASS_ATTR + ']').each(function () {
                NativeMethods.removeAttribute.call(this, SharedConst.TEST_CAFE_HOVER_PSEUDO_CLASS_ATTR);

                changed = true;
            });

            if (parentTag === 'head' || parentTag === 'body') {
                if (container.innerHTML.indexOf(INIT_SCRIPT_FOR_IFRAME_TEMPLATE) !== -1) {
                    container.innerHTML = container.innerHTML.replace(INIT_SCRIPT_FOR_IFRAME_TEMPLATE, '');

                    changed = true;
                }
            }

            return changed;
        });
    };

    exports.processHtml = function (html, parentTag) {
        if (isPageHtml(html))
            return processPageHtml(html, exports.processHtml);

        return processHtml(html, parentTag, function (container) {
            //NOTE: we check this condition to avoid unnecessary calling the querySelectorAll function
            if (container.children.length === 1 && container.children[0].children && !container.children[0].children.length)
                PageProc.processElement(container.children[0], UrlUtil.convertToProxyUrl);
            else {
                var children = container.querySelectorAll('*');

                for (var i = 0; i < children.length; i++)
                    PageProc.processElement(children[i], UrlUtil.convertToProxyUrl);
            }

            if (parentTag === 'head' || parentTag === 'body')
                container.innerHTML = INIT_SCRIPT_FOR_IFRAME_TEMPLATE + container.innerHTML;

            return true;
        });
    };

    exports.createPropertyDesc = function (descBase) {
        descBase.configurable = true;
        descBase.enumerable = true;
        return descBase;
    };

    exports.getAttributesProperty = function (el) {
        for (var i = 0; i < el.attributes.length; i++) {
            if (Util.isHammerheadAttr(el.attributes[i].name)) {
                AttributesWrapper.prototype = el.attributes;

                return new AttributesWrapper(el.attributes);
            }
        }

        return el.attributes;
    };

    exports.isWellFormattedHtml = function (html) {
        Array.prototype.last = function () {
            return this[this.length - 1];
        };

        Array.prototype.contains = function (item) {
            return this.indexOf(item) !== -1;
        };

        var parseStartTag = function (tag, tagName, attributes, unary) {
            if (!voidElements.contains(tagName)) {
                if (!unary) {
                    tagName = tagName.toLowerCase();
                    tagStack.push(tagName);
                }
            }
        };

        var parseEndTag = function (tag, tagName) {
            tagName = tagName.toLowerCase();

            if (tagName === tagStack.last()) {
                tagStack.pop();
            } else if (selfClosedTags.contains(tagStack.last())) {
                tagStack.pop();
                parseEndTag(tag, tagName);
            } else if (voidElements.contains(tagName)) {
                throw new Error('Empty tags cannot have end-closed tag part');
            } else {
                throw new Error('Cannot find open tag for ' + tagStack.last());
            }
        };

        var startTagReg = /^<(\w+)([\s\S]*?)(\/?)>/,
            endTagReg = /^<\/(\w+)[^>]*>/,
            doctypeReg = /^<!doctype[^>]*>/i;

        //http://www.w3.org/TR/html5/syntax.html#void-elements
        var voidElements = ['area', 'base', 'basefont', 'br', 'col', 'embed', 'frame', 'hr', 'img', 'input', 'keygen', 'isindex', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

        //http://www.w3.org/TR/html5/syntax.html#raw-text-elements
        var rawTextElements = ['script', 'style'];

        //Real cases are very hard - http://www.w3.org/TR/html5/syntax.html#optional-tags
        //Use a simplified algorithm
        //Also not check self-closed elements for SVG(http://www.w3.org/TR/SVG/struct.html) and MathML(http://www.w3.org/wiki/MathML/Elements)
        var selfClosedTags = ['colgroup', 'dd', 'dt', 'li', 'options', 'p', 'td', 'tfoot', 'th', 'thead', 'tr'];

        var BEGIN_COMMENT = '<!--',
            END_COMMENT = '-->',
            BEGIN_TAG = '<',
            END_TAG = '</',
            DOCTYPE_DECLARATION = '<!';

        var charIndex,
            isPlanText,
            match,
            tagStack = [],
            previousStepHtml = html,
            wellFormatted = true;

        try {
            while (html) {
                isPlanText = true;

                // Not in a script or style element
                if (!tagStack.last() || !rawTextElements.contains(tagStack.last())) {
                    // html comment
                    if (html.indexOf(BEGIN_COMMENT) === 0) {
                        charIndex = html.indexOf(END_COMMENT);
                        html = html.substring(charIndex + 3);
                        isPlanText = false;
                    }
                    // doctype declaration
                    else if (html.indexOf(DOCTYPE_DECLARATION) === 0) {
                        match = html.match(doctypeReg);

                        if (match) {
                            html = html.substring(match[0].length);
                            isPlanText = false;
                        }
                    }
                    // end tag
                    else if (html.indexOf(END_TAG) === 0) {
                        match = html.match(endTagReg);

                        if (match) {
                            html = html.substring(match[0].length);
                            match[0].replace(endTagReg, parseEndTag);
                            isPlanText = false;
                        }

                        // start tag
                    } else if (html.indexOf(BEGIN_TAG) === 0) {
                        match = html.match(startTagReg);

                        if (match) {
                            html = html.substring(match[0].length);
                            match[0].replace(startTagReg, parseStartTag);
                            isPlanText = false;
                        }
                    }

                    if (isPlanText) {
                        charIndex = html.indexOf(BEGIN_TAG);
                        html = charIndex === -1 ? '' : html.substring(charIndex);
                    }

                } else {
                    var tagContentReg = new RegExp('^([\\s\\S]*?)<\/' + tagStack.last() + '[^>]*>');

                    match = html.match(tagContentReg);

                    if (match) {
                        html = html.substring(match[0].length);
                        parseEndTag('', tagStack.last());
                    } else
                        throw new Error('Cannot process rawTextElement content');
                }

                if (html === previousStepHtml)
                    throw new Error('Html parser error');

                previousStepHtml = html;
            }
            if (tagStack.last())
                throw new Error('There are non closed tag -' + tagStack.last());
        } catch (err) {
            wellFormatted = false;
        }

        delete Array.prototype.last;
        delete Array.prototype.contains;

        return wellFormatted;
    };
});
