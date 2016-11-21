import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';

var Promise            = hammerhead.Promise;
var messageSandbox     = hammerhead.eventSandbox.message;
var domUtils           = testCafeCore.domUtils;
var styleUtils         = testCafeCore.styleUtils;
var positionUtils      = testCafeCore.positionUtils;
var sendRequestToFrame = testCafeCore.sendRequestToFrame;


const MIN_SCROLL_MARGIN   = 5;
const MAX_SCROLL_MARGIN   = 50;
const SCROLL_REQUEST_CMD  = 'automation|scroll|request';
const SCROLL_RESPONSE_CMD = 'automation|scroll|response';

// Setup cross-iframe interaction
messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
    if (e.message.cmd === SCROLL_REQUEST_CMD) {
        var element = domUtils.findIframeByWindow(e.source);
        var offsetX = e.message.offsetX;
        var offsetY = e.message.offsetY;
        var scroll  = new ScrollAutomation(element, { offsetX, offsetY });

        scroll
            .run()
            .then(() => messageSandbox.sendServiceMsg({ cmd: SCROLL_RESPONSE_CMD }, e.source));
    }
});

export default class ScrollAutomation {
    constructor (element, offsetOptions) {
        this.element = element;
        this.offsetX = offsetOptions.offsetX;
        this.offsetY = offsetOptions.offsetY;
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

    static _getScrollToPoint (elementDimensions, { x, y }) {
        var needForwardScrollLeft  = x >= elementDimensions.scroll.left + elementDimensions.width;
        var needBackwardScrollLeft = x <= elementDimensions.scroll.left;

        var needForwardScrollTop  = y >= elementDimensions.scroll.top + elementDimensions.height;
        var needBackwardScrollTop = y <= elementDimensions.scroll.top;

        var maxLeftScrollMargin = Math.min(MIN_SCROLL_MARGIN, Math.floor(elementDimensions.width / 2));
        var maxTopScrollMargin  = Math.min(MIN_SCROLL_MARGIN, Math.floor(elementDimensions.height / 2));

        var left = elementDimensions.scroll.left;
        var top  = elementDimensions.scroll.top;

        if (needForwardScrollLeft)
            left = x - elementDimensions.width + maxLeftScrollMargin;
        else if (needBackwardScrollLeft)
            left = x - maxLeftScrollMargin;

        if (needForwardScrollTop)
            top = y - elementDimensions.height + maxTopScrollMargin;
        else if (needBackwardScrollTop)
            top = y - maxTopScrollMargin;

        return { left, top };
    }

    static _getScrollToFullChildView (parentDimensions, childDimensions) {
        var fullViewScrollLeft = null;
        var fullViewScrollTop  = null;

        var canShowFullElementWidth  = parentDimensions.width >= childDimensions.width + MAX_SCROLL_MARGIN;
        var canShowFullElementHeight = parentDimensions.height >= childDimensions.height + MAX_SCROLL_MARGIN;

        var relativePosition = positionUtils.calcRelativePosition(childDimensions, parentDimensions);

        if (canShowFullElementWidth) {
            if (relativePosition.left < 0) {
                fullViewScrollLeft = Math.round(parentDimensions.scroll.left + relativePosition.left -
                                                MAX_SCROLL_MARGIN);
            }
            else if (relativePosition.left > 0 && relativePosition.right < 0) {
                fullViewScrollLeft = Math.round(parentDimensions.scroll.left +
                                                Math.min(relativePosition.left, -relativePosition.right) +
                                                MAX_SCROLL_MARGIN);
            }
        }

        if (canShowFullElementHeight) {
            if (relativePosition.top < 0)
                fullViewScrollTop = Math.round(parentDimensions.scroll.top + relativePosition.top - MAX_SCROLL_MARGIN);
            else if (relativePosition.top > 0 && relativePosition.bottom < 0) {
                fullViewScrollTop = Math.round(parentDimensions.scroll.top +
                                               Math.min(relativePosition.top, -relativePosition.bottom) +
                                               MAX_SCROLL_MARGIN);
            }
        }

        return {
            left: fullViewScrollLeft,
            top:  fullViewScrollTop
        };
    }

    static _scrollToChild (parent, child, { offsetX, offsetY }) {
        var parentDimensions = positionUtils.getClientDimensions(parent);
        var childDimensions  = positionUtils.getClientDimensions(child);

        var childPoint = {
            x: childDimensions.left - parentDimensions.left + parentDimensions.scroll.left +
               childDimensions.border.left + offsetX,
            y: childDimensions.top - parentDimensions.top + parentDimensions.scroll.top +
               childDimensions.border.top + offsetY
        };

        var scrollToFullView = ScrollAutomation._getScrollToFullChildView(parentDimensions, childDimensions);
        var scrollToPoint    = ScrollAutomation._getScrollToPoint(parentDimensions, childPoint);

        var left = scrollToFullView.left === null ? scrollToPoint.left : scrollToFullView.left;
        var top  = scrollToFullView.top === null ? scrollToPoint.top : scrollToFullView.top;

        ScrollAutomation._setScroll(parent, { left, top });
    }

    _scrollElement () {
        if (!styleUtils.hasScroll(this.element))
            return;

        var elementDimensions = positionUtils.getClientDimensions(this.element);
        var scroll            = ScrollAutomation._getScrollToPoint(elementDimensions, {
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
            ScrollAutomation._scrollToChild(parents[i], currentChild, {
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
                cmd:     SCROLL_REQUEST_CMD,
                offsetX: currentOffsetX,
                offsetY: currentOffsetY
            }, SCROLL_RESPONSE_CMD, window.parent);
        }

        return Promise.resolve();
    }

    run () {
        this._scrollElement();

        return this._scrollParents();
    }
}
