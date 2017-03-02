import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import whilst from '../utils/promise-whilst';


var Promise            = hammerhead.Promise;
var messageSandbox     = hammerhead.eventSandbox.message;
var domUtils           = testCafeCore.domUtils;
var styleUtils         = testCafeCore.styleUtils;
var positionUtils      = testCafeCore.positionUtils;
var sendRequestToFrame = testCafeCore.sendRequestToFrame;


const DEFAULT_MAX_SCROLL_MARGIN   = 50;
const SCROLL_MARGIN_INCREASE_STEP = 20;

const SCROLL_REQUEST_CMD  = 'automation|scroll|request';
const SCROLL_RESPONSE_CMD = 'automation|scroll|response';

// Setup cross-iframe interaction
messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
    if (e.message.cmd === SCROLL_REQUEST_CMD) {
        var element         = domUtils.findIframeByWindow(e.source);
        var offsetX         = e.message.offsetX;
        var offsetY         = e.message.offsetY;
        var maxScrollMargin = e.message.maxScrollMargin;

        var scroll          = new ScrollAutomation(element, { offsetX, offsetY });

        scroll.maxScrollMargin = maxScrollMargin;

        scroll
            .run()
            .then(() => messageSandbox.sendServiceMsg({ cmd: SCROLL_RESPONSE_CMD }, e.source));
    }
});

export default class ScrollAutomation {
    constructor (element, offsetOptions) {
        this.element         = element;
        this.offsetX         = offsetOptions.offsetX;
        this.offsetY         = offsetOptions.offsetY;
        this.maxScrollMargin = DEFAULT_MAX_SCROLL_MARGIN;
    }

    static _setScroll (element, { left, top }) {
        left = Math.max(left, 0);
        top  = Math.max(top, 0);

        if (domUtils.isHtmlElement(element)) {
            styleUtils.setScrollLeft(document.body, left);
            styleUtils.setScrollTop(document.body, top);
        }

        styleUtils.setScrollLeft(element, left);
        styleUtils.setScrollTop(element, top);
    }

    _getScrollToPoint (elementDimensions, { x, y }) {
        var leftScrollMargin = Math.min(this.maxScrollMargin, Math.floor(elementDimensions.width / 2));
        var topScrollMargin  = Math.min(this.maxScrollMargin, Math.floor(elementDimensions.height / 2));

        var needForwardScrollLeft  = x >= elementDimensions.scroll.left + elementDimensions.width - leftScrollMargin;
        var needBackwardScrollLeft = x <= elementDimensions.scroll.left + leftScrollMargin;

        var needForwardScrollTop  = y >= elementDimensions.scroll.top + elementDimensions.height - topScrollMargin;
        var needBackwardScrollTop = y <= elementDimensions.scroll.top + topScrollMargin;

        var left = elementDimensions.scroll.left;
        var top  = elementDimensions.scroll.top;

        if (needForwardScrollLeft)
            left = x - elementDimensions.width + leftScrollMargin;
        else if (needBackwardScrollLeft)
            left = x - leftScrollMargin;

        if (needForwardScrollTop)
            top = y - elementDimensions.height + topScrollMargin;
        else if (needBackwardScrollTop)
            top = y - topScrollMargin;

        return { left, top };
    }

    _getScrollToFullChildView (parentDimensions, childDimensions) {
        var fullViewScrollLeft = null;
        var fullViewScrollTop  = null;

        var canShowFullElementWidth  = parentDimensions.width >= childDimensions.width;
        var canShowFullElementHeight = parentDimensions.height >= childDimensions.height;

        var relativePosition = positionUtils.calcRelativePosition(childDimensions, parentDimensions);

        if (canShowFullElementWidth) {
            var availableLeftScrollMargin = Math.floor((parentDimensions.width - childDimensions.width) / 2);
            var leftScrollMargin          = Math.min(this.maxScrollMargin, availableLeftScrollMargin);

            if (relativePosition.left < leftScrollMargin) {
                fullViewScrollLeft = Math.round(parentDimensions.scroll.left + relativePosition.left -
                                                leftScrollMargin);
            }
            else if (relativePosition.right < leftScrollMargin) {
                fullViewScrollLeft = Math.round(parentDimensions.scroll.left +
                                                Math.min(relativePosition.left, -relativePosition.right) +
                                                leftScrollMargin);
            }
        }

        if (canShowFullElementHeight) {
            var availableTopScrollMargin = Math.floor((parentDimensions.height - childDimensions.height) / 2);
            var topScrollMargin          = Math.min(this.maxScrollMargin, availableTopScrollMargin);

            if (relativePosition.top < topScrollMargin)
                fullViewScrollTop = Math.round(parentDimensions.scroll.top + relativePosition.top - topScrollMargin);
            else if (relativePosition.bottom < topScrollMargin) {
                fullViewScrollTop = Math.round(parentDimensions.scroll.top +
                                               Math.min(relativePosition.top, -relativePosition.bottom) +
                                               topScrollMargin);
            }
        }

        return {
            left: fullViewScrollLeft,
            top:  fullViewScrollTop
        };
    }

    _scrollToChild (parent, child, { offsetX, offsetY }) {
        var parentDimensions = positionUtils.getClientDimensions(parent);
        var childDimensions  = positionUtils.getClientDimensions(child);

        var childPoint = {
            x: childDimensions.left - parentDimensions.left + parentDimensions.scroll.left +
               childDimensions.border.left + offsetX,
            y: childDimensions.top - parentDimensions.top + parentDimensions.scroll.top +
               childDimensions.border.top + offsetY
        };

        var scrollToFullView = this._getScrollToFullChildView(parentDimensions, childDimensions);
        var scrollToPoint    = this._getScrollToPoint(parentDimensions, childPoint);

        var left = scrollToFullView.left === null ? scrollToPoint.left : scrollToFullView.left;
        var top  = scrollToFullView.top === null ? scrollToPoint.top : scrollToFullView.top;

        ScrollAutomation._setScroll(parent, { left, top });
    }

    _scrollElement () {
        if (!styleUtils.hasScroll(this.element))
            return;

        var elementDimensions = positionUtils.getClientDimensions(this.element);
        var scroll            = this._getScrollToPoint(elementDimensions, {
            x: this.offsetX,
            y: this.offsetY
        });

        ScrollAutomation._setScroll(this.element, scroll);
    }

    _scrollParents () {
        var parents = styleUtils.getScrollableParents(this.element);

        var currentChild   = this.element;
        var currentOffsetX = this.offsetX - Math.round(styleUtils.getScrollLeft(currentChild));
        var currentOffsetY = this.offsetY - Math.round(styleUtils.getScrollTop(currentChild));

        var childDimensions  = null;
        var parentDimensions = null;

        for (var i = 0; i < parents.length; i++) {
            this._scrollToChild(parents[i], currentChild, {
                offsetX: currentOffsetX,
                offsetY: currentOffsetY
            });

            childDimensions  = positionUtils.getClientDimensions(currentChild);
            parentDimensions = positionUtils.getClientDimensions(parents[i]);

            currentOffsetX += childDimensions.left - parentDimensions.left + parentDimensions.border.left;
            currentOffsetY += childDimensions.top - parentDimensions.top + parentDimensions.border.top;

            currentChild = parents[i];
        }

        if (window.top !== window) {
            return sendRequestToFrame({
                cmd:             SCROLL_REQUEST_CMD,
                offsetX:         currentOffsetX,
                offsetY:         currentOffsetY,
                maxScrollMargin: this.maxScrollMargin
            }, SCROLL_RESPONSE_CMD, window.parent);
        }

        return Promise.resolve();
    }

    _isElementHiddenByFixed () {
        var clientDimensions = positionUtils.getClientDimensions(this.element);
        var elementInPoint   = positionUtils.getElementFromPoint(clientDimensions.left +
                                                                 this.offsetX, clientDimensions.top + this.offsetY);

        return elementInPoint && styleUtils.getComputedStyle(elementInPoint).position === 'fixed';
    }

    _isScrollMarginTooBig () {
        var minWindowDimension = Math.min(styleUtils.getInnerWidth(window), styleUtils.getInnerHeight(window));

        return this.maxScrollMargin >= minWindowDimension / 2;
    }

    run () {
        this._scrollElement();

        return this
            ._scrollParents()
            .then(() => whilst(() => !this._isScrollMarginTooBig() && this._isElementHiddenByFixed(), () => {
                this.maxScrollMargin += SCROLL_MARGIN_INCREASE_STEP;

                return this._scrollParents();
            }));
    }
}
