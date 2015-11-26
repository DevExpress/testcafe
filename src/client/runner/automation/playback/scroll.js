import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import async from '../../deps/async';

var browserUtils   = hammerhead.utils.browser;
var messageSandbox = hammerhead.eventSandbox.message;

var $                     = testCafeCore.$;
var CROSS_DOMAIN_MESSAGES = testCafeCore.CROSS_DOMAIN_MESSAGES;
var domUtils              = testCafeCore.domUtils;
var positionUtils         = testCafeCore.positionUtils;
var styleUtils            = testCafeCore.styleUtils;


const MAX_SCROLL_MARGIN = 50;
const MIN_SCROLL_STEP   = 10;
const SCROLL_SPEED      = 1;
const SCROLL_DELAY      = 10;


function getScrollOption ($currentScrollable, target, offsetX, offsetY) {
    var targetDimensions     = positionUtils.getClientDimensions(target),
        scrollableDimensions = positionUtils.getClientDimensions($currentScrollable[0]),

        scrollTop            = null,
        scrollLeft           = null,
        maxLeftScrollMargin  = Math.min(MAX_SCROLL_MARGIN, Math.floor(scrollableDimensions.width / 2)),
        maxTopScrollMargin   = Math.min(MAX_SCROLL_MARGIN, Math.floor(scrollableDimensions.height / 2)),

        isScrollDown         = -1,
        isScrollRight        = -1;

    var relation = {
        top:    targetDimensions.top - (scrollableDimensions.top + scrollableDimensions.border.top),
        bottom: scrollableDimensions.bottom - scrollableDimensions.border.bottom -
                scrollableDimensions.scrollbar.bottom - targetDimensions.bottom,
        left:   targetDimensions.left - (scrollableDimensions.left + scrollableDimensions.border.left),
        right:  scrollableDimensions.right - scrollableDimensions.border.right - scrollableDimensions.scrollbar.right -
                targetDimensions.right
    };

    // vertical scroll
    if (relation.top < 0)
        scrollTop = Math.round(scrollableDimensions.scroll.top + relation.top - maxTopScrollMargin);
    else if (relation.top > 0 && relation.bottom < 0) {
        scrollTop    = Math.round(scrollableDimensions.scroll.top + Math.min(relation.top, -relation.bottom) +
                                  maxTopScrollMargin);
        isScrollDown = 1;
    }

    // horizontal scroll
    if (relation.left < 0)
        scrollLeft = Math.round(scrollableDimensions.scroll.left + relation.left - maxLeftScrollMargin);
    else if (relation.left > 0 && relation.right < 0) {
        scrollLeft    = Math.round(scrollableDimensions.scroll.left + Math.min(relation.left, -relation.right) +
                                   maxLeftScrollMargin);
        isScrollRight = 1;
    }

    //NOTE: we should check: can we show the full element
    var targetElementWidth  = Math.abs(targetDimensions.right - targetDimensions.left),
        targetElementHeight = Math.abs(targetDimensions.bottom - targetDimensions.top);

    if (scrollableDimensions.width <= targetElementWidth &&
        offsetX >= scrollableDimensions.width - (scrollableDimensions.border.left + scrollableDimensions.border.right))
        scrollLeft = (scrollLeft === null ? offsetX : scrollLeft + offsetX - isScrollRight * maxLeftScrollMargin) -
                     maxLeftScrollMargin;

    if (scrollableDimensions.height <= targetElementHeight &&
        offsetY >= scrollableDimensions.height - (scrollableDimensions.border.top + scrollableDimensions.border.bottom))
        scrollTop = (scrollTop === null ? offsetY : scrollTop + offsetY - isScrollDown * maxTopScrollMargin) -
                    maxTopScrollMargin;

    if (scrollLeft !== null || scrollTop !== null) {
        return {
            top:  scrollTop,
            left: scrollLeft
        };
    }

    return null;
}

function scrollElement ($el, left, top, scrollCallback) {
    var leftScrollStep        = null,
        topScrollStep         = null,

        elementScroll         = styleUtils.getElementScroll($el[0]),
        startLeftScroll       = elementScroll.left,
        startTopScroll        = elementScroll.top,

        scrollLeftDirection   = 0,
        scrollTopDirection    = 0,
        currentScrollLeft     = null,
        currentScrollTop      = null,

        lastScrollLeft        = null,
        lastScrollTop         = null,

        requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame,
        scrollingStep         = null,
        startScrollingStamp   = null;

    function getScrollDirection (newScrollValue, isLeft) {
        if (newScrollValue === null)
            return 0;
        if (newScrollValue > (isLeft ? startLeftScroll : startTopScroll))
            return 1;
        return -1;
    }

    function assignScrollValues () {
        $el.scrollLeft(currentScrollLeft);
        $el.scrollTop(currentScrollTop);

        lastScrollLeft = currentScrollLeft;
        lastScrollTop  = currentScrollTop;
    }

    scrollLeftDirection = getScrollDirection(left, true);
    scrollTopDirection  = getScrollDirection(top, false);

    //we assign this minimum possible scroll step to avoid too slow action
    leftScrollStep = Math.max(Math.abs(left - startLeftScroll) / SCROLL_SPEED, MIN_SCROLL_STEP);
    topScrollStep  = Math.max(Math.abs(top - startTopScroll) / SCROLL_SPEED, MIN_SCROLL_STEP);

    async.whilst(
        function () {
            if (!scrollLeftDirection && !scrollTopDirection)
                return false;

            var elementScroll = styleUtils.getElementScroll($el[0]);
            currentScrollLeft = Math.round(elementScroll.left + scrollLeftDirection * leftScrollStep);
            currentScrollLeft = scrollLeftDirection ===
                                1 ? Math.min(currentScrollLeft, left) : Math.max(currentScrollLeft, left);

            currentScrollTop = Math.round(elementScroll.top + scrollTopDirection * topScrollStep);
            currentScrollTop = scrollTopDirection ===
                               1 ? Math.min(currentScrollTop, top) : Math.max(currentScrollTop, top);

            return currentScrollLeft !== lastScrollLeft || currentScrollTop !== lastScrollTop;
        },

        function (callback) {
            //NOTE: for IOS > 6 (B254728)
            if (browserUtils.isSafari && requestAnimationFrame) {
                scrollingStep = function (timeStamp) {
                    if (!startScrollingStamp)
                        startScrollingStamp = timeStamp;

                    assignScrollValues();

                    if (timeStamp - startScrollingStamp >= SCROLL_SPEED)
                        callback();
                    else
                        requestAnimationFrame(scrollingStep);
                };

                requestAnimationFrame(scrollingStep);
            }
            else {
                assignScrollValues();
                window.setTimeout(function () {
                    callback();
                }, SCROLL_DELAY);
            }
        },

        function () {
            scrollCallback();
        }
    );
}

export default function (to, actionOptions, currentDocument, actionCallback) {
    var afterScrollDelay    = browserUtils.isTouchDevice && browserUtils.isFirefox ? 200 : 0,
        isDomElement        = domUtils.isDomElement(to),
        isHtmlElement       = isDomElement && /html/i.test(to.tagName),
        scrollableParents   = [],
        pointTo             = null,

        $target             = null,
        targetRect          = null,
        targetWidth         = null,
        targetHeight        = null,
        offsetX             = null,
        offsetY             = null,

        maxLeftScrollMargin = null,
        maxTopScrollMargin  = null,


        ownScroll           = null,
        newOwnScrollLeft    = null,
        newOwnScrollTop     = null,

        currentOffsetX      = 0,
        currentOffsetY      = 0,
        windowTopResponse   = null;

    function considerWindowTopScroll (msg, callback) {
        windowTopResponse = function (e) {
            if (e.message.cmd === CROSS_DOMAIN_MESSAGES.SCROLL_TOP_WINDOW_RESPONSE_CMD) {
                messageSandbox.off(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, windowTopResponse);
                windowTopResponse = null;

                callback();
            }
        };

        messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, windowTopResponse);

        messageSandbox.sendServiceMsg(msg, window.top);
    }

    async.series({
        scrollElement: function (scrollElementCallback) {
            if (!isDomElement) {
                scrollElementCallback();
                return;
            }

            $target             = $(to);
            targetRect          = $target[0].getBoundingClientRect();
            targetWidth         = isHtmlElement ? $target[0].clientWidth : targetRect.width;
            targetHeight        = isHtmlElement ? $target[0].clientHeight : targetRect.height;
            offsetX             = actionOptions && typeof actionOptions.offsetX !==
                                                   'undefined' ? actionOptions.offsetX : Math.round(targetWidth / 2);
            offsetY             = actionOptions && typeof actionOptions.offsetY !==
                                                   'undefined' ? actionOptions.offsetY : Math.round(targetHeight / 2);
            maxLeftScrollMargin = Math.min(MAX_SCROLL_MARGIN, Math.floor(targetWidth / 2));
            maxTopScrollMargin  = Math.min(MAX_SCROLL_MARGIN, Math.floor(targetHeight / 2));
            ownScroll           = styleUtils.getElementScroll(to);

            if (!styleUtils.hasScroll(to, currentDocument)) {
                scrollElementCallback();
                return;
            }

            if (offsetX >= ownScroll.left + targetWidth)
                newOwnScrollLeft = offsetX - maxLeftScrollMargin;
            else if (offsetX <= ownScroll.left)
                newOwnScrollLeft = offsetX - maxLeftScrollMargin;

            if (offsetY >= ownScroll.top + targetHeight)
                newOwnScrollTop = offsetY - maxTopScrollMargin;
            else if (offsetY <= ownScroll.top)
                newOwnScrollTop = offsetY - maxTopScrollMargin;

            async.series({
                scrollBody: function (callback) {
                    if (isHtmlElement)
                        scrollElement($target.find('body'), newOwnScrollLeft, newOwnScrollTop, callback);
                    else
                        callback();
                },
                ownScroll:  function (callback) {
                    scrollElement($target, newOwnScrollLeft, newOwnScrollTop, callback);
                },
                callback:   function () {
                    scrollElementCallback();
                }
            });
        },

        scrollElementParents: function (scrollParentsCallback) {
            scrollableParents = isDomElement ? styleUtils.getScrollableParents(to, currentDocument) : [document.documentElement];

            if (!scrollableParents.length) {
                scrollParentsCallback();
                return;
            }

            var currentTarget = pointTo ? pointTo : to;

            currentOffsetX = $target ? offsetX - $target.scrollLeft() : offsetX;
            currentOffsetY = $target ? offsetY - $target.scrollTop() : offsetY;


            async.forEachSeries(scrollableParents,
                function (el, callback) {
                    var $el          = $(el),
                        scrollOption = getScrollOption($el, currentTarget, Math.max(0, currentOffsetX), Math.max(0, currentOffsetY));

                    function parentScrollCallback () {
                        var newTargetDimensions     = positionUtils.getClientDimensions(currentTarget),
                            newScrollableDimensions = positionUtils.getClientDimensions($el[0]);

                        currentOffsetX = newTargetDimensions.left - newScrollableDimensions.left +
                                         newScrollableDimensions.border.left + offsetX;
                        currentOffsetY = newTargetDimensions.top - newScrollableDimensions.top +
                                         newScrollableDimensions.border.top + offsetY;

                        currentTarget = el;
                        callback();
                    }

                    if (!scrollOption) {
                        parentScrollCallback();
                        return;
                    }

                    async.series({
                        scrollBody: function (callback) {
                            if (/html/i.test(el.tagName))
                                scrollElement($el.find('body'), scrollOption.left, scrollOption.top, callback);
                            else
                                callback();
                        },
                        ownScroll:  function () {
                            scrollElement($el, scrollOption.left, scrollOption.top, parentScrollCallback);
                        }
                    });
                },

                function () {
                    scrollParentsCallback();
                });
        },

        callback: function () {
            window.setTimeout(function () {
                if (window.top === window.self) {
                    actionCallback();
                    return;
                }

                if (isDomElement) {
                    var msg = {
                        cmd:     CROSS_DOMAIN_MESSAGES.SCROLL_TOP_WINDOW_REQUEST_CMD,
                        options: {
                            offsetX: Math.max(0, currentOffsetX),
                            offsetY: Math.max(0, currentOffsetY)
                        }
                    };

                    considerWindowTopScroll(msg, actionCallback);
                }
                else {
                    windowTopResponse = function (e) {
                        if (e.message.cmd === CROSS_DOMAIN_MESSAGES.GET_IFRAME_POSITION_DATA_RESPONSE_CMD) {
                            messageSandbox.off(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, windowTopResponse);
                            windowTopResponse = null;

                            var documentScroll = styleUtils.getElementScroll(document),

                                msg            = {
                                    cmd:   CROSS_DOMAIN_MESSAGES.SCROLL_TOP_WINDOW_REQUEST_CMD,
                                    point: {
                                        x: to.x - documentScroll.left + e.message.scroll.left,
                                        y: to.y - documentScroll.top + e.message.scroll.top
                                    }
                                };

                            considerWindowTopScroll(msg, actionCallback);
                        }
                    };

                    messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, windowTopResponse);

                    messageSandbox.sendServiceMsg({ cmd: CROSS_DOMAIN_MESSAGES.GET_IFRAME_POSITION_DATA_REQUEST_CMD }, window.top);
                }
            }, afterScrollDelay);
        }
    });
};
