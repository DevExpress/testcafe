HammerheadClient.define('DOMSandbox.ShadowUI', function (require, exports) {
    var $ = require('jQuery'),
        NativeMethods = require('DOMSandbox.NativeMethods'),
        PageProc = require('Shared.PageProc'),
        SharedConst = require('Shared.Const'),
        Util = require('Util');

    // Const
    var CLASSNAME_REGEX = /\.((?:\\.|[-\w]|[^\x00-\xa0])+)/g,
        ROOT_CLASS = 'root',
        ROOT_ID = 'root',
        HIDDEN_CLASS = 'hidden',
        BLIND_CLASS = 'blind';

    // Globals
    var $root = null,
        filter = true;

    function bringRootToWindowTopLeft() {
        if ($root.parents().filter(function () {
            return /fixed|relative|absolute/.test($(this).css('position'));
        }).length) {
            var rootOffset = Util.getOffsetPosition($root[0]);

            if (rootOffset.left !== 0 || rootOffset.top !== 0) {
                $root.css('left', ((parseFloat($root.css('left')) || 0) - rootOffset.left).toString() + 'px');
                $root.css('top', ((parseFloat($root.css('top')) || 0) - rootOffset.top).toString() + 'px');
            }
        }
    }

    function filterElement(element) {
        if (!filter || !element || element === document || element === window)
            return element;

        return Util.isShadowUIElement(element) ? null : element;
    }

    function filterNodeList(nodeList) {
        var filteredList = [],
            nlLength = nodeList.length;

        for (var i = 0; i < nlLength; i++) {
            var element = filterElement(nodeList[i]);

            if (element)
                filteredList.push(element);
        }

        filteredList.item = function (index) {
            return index >= filteredList.length ? null : filteredList[index];
        };

        filteredList.namedItem = function (name) {
            return nodeList.namedItem(name);
        };

        return filteredList.length === nlLength ? nodeList : filteredList;
    }

    //  --------- Move to the testcafe ------------
    exports.bind = function ($elem, event, handler) {
        $elem.each(function () {
            if ($.isWindow(this))
                NativeMethods.windowAddEventListener.call(this, event, handler, true);
            else
                NativeMethods.addEventListener.call(this, event, handler, true);
        });

        return $elem;
    };

    exports.unbind = function ($elem, event, handler) {
        $elem.each(function () {
            if ($.isWindow(this))
                NativeMethods.windowRemoveEventListener.call(this, event, handler, true);
            else
                NativeMethods.removeEventListener.call(this, event, handler, true);
        });

        return $elem;
    };
    //  ---------------------------------------------

    exports.getRoot = function () {
        if (!$root || /* T225944 */ !$.contains(document.body, $root[0])) {
            exports.overrideElement(document.body);

            if (!$root) {
                //B254893
                $root = $('<div>').attr('id', ROOT_ID).attr('contenteditable', 'false').appendTo(document.body);

                $root.attr('id', exports.patchClassNames(ROOT_ID));
                exports.addClass($root, ROOT_CLASS);

                var root = $root[0];

                for (var i = 0; i < PageProc.EVENTS.length; i++) {
                    if (root.addEventListener)
                        root.addEventListener(PageProc.EVENTS[i], Util.stopPropagation);
                    else
                        root.attachEvent(PageProc.EVENTS[i], Util.stopPropagation);
                }

                bringRootToWindowTopLeft();
                $(document).ready(bringRootToWindowTopLeft);
            }
            else
                $root.appendTo(document.body);
        }

        return $root;
    };

    exports.init = function (window, document) {
        (function overrideDocument() {
            document.elementFromPoint = function () {
                //T212974
                exports.addClass(exports.getRoot(), HIDDEN_CLASS);
                var res = filterElement(NativeMethods.elementFromPoint.apply(document, arguments));
                exports.removeClass(exports.getRoot(), HIDDEN_CLASS);
                return res;
            };

            document.getElementById = function () {
                return filterElement(NativeMethods.getElementById.apply(document, arguments));
            };

            document.getElementsByClassName = function () {
                return filterNodeList(NativeMethods.getElementsByClassName.apply(document, arguments));
            };

            document.getElementsByName = function () {
                return filterNodeList(NativeMethods.getElementsByName.apply(document, arguments));
            };

            document.getElementsByTagName = function () {
                return filterNodeList(NativeMethods.getElementsByTagName.apply(document, arguments));
            };

            document.querySelector = function () {
                return filterElement(NativeMethods.querySelector.apply(document, arguments));
            };

            document.querySelectorAll = function () {
                return filterNodeList(NativeMethods.querySelectorAll.apply(document, arguments));
            };

            // T195358
            document.querySelectorAll.toString = function () {
                return NativeMethods.querySelectorAll.toString();
            };

            document.getElementsByClassName.toString = function () {
                return NativeMethods.getElementsByClassName.toString();
            };
        })();
    };

    exports.onBodyContentChanged = function () {
        if ($root) {
            if (!$root.closest('html').length)
                $root.appendTo(document.body);
        }
    };

    //NOTE: fix for B239138 - unroll.me 'Cannot read property 'document' of null' error raised during recording
    //There were an issue then document.body was replaced, so we need to reattach UI to new body manually
    exports.onBodyElementMutation = function () {
        if ($root) {
            if ($root.parent()[0] !== document.body) {
                exports.overrideElement(document.body);
                $root.appendTo(document.body);
            }
        }
    };

    exports.overrideElement = function (el) {
        var tagName = el && el.tagName && el.tagName.toLowerCase();

        if (tagName && (tagName === 'body' || tagName === 'head')) {
            el.getElementsByClassName = function () {
                return filterNodeList(NativeMethods.elementGetElementsByClassName.apply(el, arguments));
            };

            el.getElementsByTagName = function () {
                return filterNodeList(NativeMethods.elementGetElementsByTagName.apply(el, arguments));
            };

            el.querySelector = function () {
                return filterElement(NativeMethods.elementQuerySelector.apply(el, arguments));
            };

            el.querySelectorAll = function () {
                return filterNodeList(NativeMethods.elementQuerySelectorAll.apply(el, arguments));
            };
        }
    };

    // Accessors
    exports.getFirstChild = function (el) {
        var childNodes = filterNodeList(el.childNodes);

        return (childNodes.length && childNodes[0]) ? childNodes[0] : null;
    };

    exports.getFirstElementChild = function (el) {
        var childNodes = filterNodeList(el.childNodes),
            cnLength = childNodes.length;

        for (var i = 0; i < cnLength; i++) {
            if (childNodes[i].nodeType === 1)
                return childNodes[i];
        }

        return null;
    };

    exports.getLastChild = function (el) {
        var childNodes = filterNodeList(el.childNodes),
            index = childNodes.length - 1;

        return index >= 0 ? childNodes[index] : null;
    };

    exports.getLastElementChild = function (el) {
        var childNodes = filterNodeList(el.childNodes),
            cnLength = childNodes.length;

        for (var i = cnLength - 1; i >= 0; i--) {
            if (childNodes[i].nodeType === 1)
                return childNodes[i];
        }

        return null;
    };

    // Utils
    exports.checkElementsPosition = function (collection) {
        if (collection.length) {
            var parent = collection[0].parentNode || collection[0].parentElement,
                shadowUIElements = [];

            if (parent) {
                for (var i = 0; i < collection.length; i++) {
                    if (Util.isShadowUIElement(collection[i]))
                        shadowUIElements.push(collection[i]);
                }

                for (var j = 0; j < shadowUIElements.length; j++)
                    NativeMethods.appendChild.call(parent, shadowUIElements[j]);
            }
        }
    };

    exports.isShadowContainer = function (el) {
        if (Util.isDomElement(el)) {
            var tagName = el.tagName.toLowerCase();

            return tagName === 'head' || tagName === 'body';
        }

        return false;
    };

    exports.isShadowContainerCollection = function (collection) {
        var parent = null;

        try {
            if (collection.length && !Util.isWindowInstance(collection) && collection[0] && collection[0].nodeType) {
                parent = collection[0].parentNode || collection[0].parentElement;

                if (parent && (parent.childNodes === collection || parent.children === collection))
                    return exports.isShadowContainer(parent);
            }
        } catch (e) {
        }

        return false;
    };

    exports.isShadowUIMutation = function (mutation) {
        if (mutation.removedNodes && mutation.removedNodes.length === 1) {
            if (Util.isShadowUIElement(mutation.removedNodes[0]))
                return true;
        }

        if (mutation.addedNodes && mutation.addedNodes.length === 1) {
            if (Util.isShadowUIElement(mutation.addedNodes[0]))
                return true;
        }

        return false;
    };

    // API
    exports.addClass = function ($elem, value) {
        $elem.addClass(exports.patchClassNames(value));
    };

    exports.hasClass = function ($elem, value) {
        return $elem.hasClass(exports.patchClassNames(value));
    };

    exports.patchClassNames = function (value) {
        var names = value.split(/\s+/);

        for (var i = 0; i < names.length; i++)
            names[i] += SharedConst.TEST_CAFE_UI_CLASSNAME_POSTFIX;

        return names.join(' ');
    };

    exports.removeClass = function ($elem, value) {
        $elem.removeClass(exports.patchClassNames(value));
    };

    exports.select = function (selector, $parent) {
        filter = false;

        //NOTE: append UI unique postfix to classnames in selector
        var patchedSelector = selector.replace(CLASSNAME_REGEX, function (className) {
            return className + SharedConst.TEST_CAFE_UI_CLASSNAME_POSTFIX;
        });

        var $res = $parent ? $parent.find(patchedSelector) : $(patchedSelector);

        filter = true;

        return $res;
    };

    exports.setBlind = function (value) {
        if (value)
            exports.addClass(exports.getRoot(), BLIND_CLASS);
        else
            exports.removeClass(exports.getRoot(), BLIND_CLASS);

    };
});