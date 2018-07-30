import hammerhead from '../deps/hammerhead';
import { domUtils, styleUtils, positionUtils, promiseUtils, scrollController, sendRequestToFrame } from '../deps/testcafe-core';


var Promise            = hammerhead.Promise;
var messageSandbox     = hammerhead.eventSandbox.message;


const DEFAULT_MAX_SCROLL_MARGIN   = 50;
const SCROLL_MARGIN_INCREASE_STEP = 20;

const SCROLL_REQUEST_CMD  = 'automation|scroll|request';
const SCROLL_RESPONSE_CMD = 'automation|scroll|response';


// Setup cross-iframe interaction
messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
    if (e.message.cmd === SCROLL_REQUEST_CMD) {
        var element             = domUtils.findIframeByWindow(e.source);
        var offsetX             = e.message.offsetX;
        var offsetY             = e.message.offsetY;
        var maxScrollMarginLeft = e.message.maxScrollMarginLeft;
        var maxScrollMarginTop  = e.message.maxScrollMarginTop;

        var scroll = new ScrollAutomation(element, { offsetX, offsetY });

        scroll.maxScrollMarginLeft = maxScrollMarginLeft;
        scroll.maxScrollMarginTop  = maxScrollMarginTop;

        scroll
            .run()
            .then(() => messageSandbox.sendServiceMsg({ cmd: SCROLL_RESPONSE_CMD }, e.source));
    }
});

export default class ScrollAutomation {
    constructor (element, scrollOptions) {
        this.element          = element;
        this.offsetX          = scrollOptions.offsetX;
        this.offsetY          = scrollOptions.offsetY;
        this.scrollToCenter   = scrollOptions.scrollToCenter;
        this.skipParentFrames = scrollOptions.skipParentFrames;

        this.maxScrollMarginLeft = DEFAULT_MAX_SCROLL_MARGIN;
        this.maxScrollMarginTop  = DEFAULT_MAX_SCROLL_MARGIN;
    }

    _isScrollValuesChanged (scrollElement, originalScroll) {
        return styleUtils.getScrollLeft(scrollElement) !== originalScroll.left
               || styleUtils.getScrollTop(scrollElement) !== originalScroll.top;
    }

    _setScroll (element, { left, top }) {
        var scrollElement = domUtils.isHtmlElement(element) ? domUtils.findDocument(element) : element;

        var originalScroll = {
            left: styleUtils.getScrollLeft(scrollElement),
            top:  styleUtils.getScrollTop(scrollElement)
        };

        left = Math.max(left, 0);
        top  = Math.max(top, 0);

        var scrollPromise = scrollController.waitForScroll();

        styleUtils.setScrollLeft(scrollElement, left);
        styleUtils.setScrollTop(scrollElement, top);

        if (!this._isScrollValuesChanged(scrollElement, originalScroll)) {
            scrollPromise.cancel();

            return Promise.resolve();
        }

        return scrollPromise;
    }

    _getScrollToPoint (elementDimensions, { x, y }) {
        var horizontalCenter = Math.floor(elementDimensions.width / 2);
        var verticalCenter   = Math.floor(Math.floor(elementDimensions.height / 2));
        var leftScrollMargin = this.scrollToCenter ? horizontalCenter : Math.min(this.maxScrollMarginLeft, horizontalCenter);
        var topScrollMargin  = this.scrollToCenter ? verticalCenter : Math.min(this.maxScrollMarginTop, verticalCenter);

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
            var availableLeftScrollMargin = parentDimensions.width - childDimensions.width;
            var leftScrollMargin          = this.scrollToCenter ? availableLeftScrollMargin /
                                                                  2 : Math.min(this.maxScrollMarginLeft, availableLeftScrollMargin);

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
            var availableTopScrollMargin = parentDimensions.height - childDimensions.height;
            var topScrollMargin          = this.scrollToCenter ? availableTopScrollMargin /
                                                                 2 : Math.min(this.maxScrollMarginTop, availableTopScrollMargin);

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

    _getScrollPosition (parentDimensions, childDimensions, offsetX, offsetY) {
        const childPoint = {
            x: childDimensions.left - parentDimensions.left + parentDimensions.scroll.left +
               childDimensions.border.left + offsetX,
            y: childDimensions.top - parentDimensions.top + parentDimensions.scroll.top +
               childDimensions.border.top + offsetY
        };

        const scrollToPoint    = this._getScrollToPoint(parentDimensions, childPoint);
        const scrollToFullView = this._getScrollToFullChildView(parentDimensions, childDimensions);

        const left = Math.max(scrollToFullView.left === null ? scrollToPoint.left : scrollToFullView.left, 0);
        const top  = Math.max(scrollToFullView.top === null ? scrollToPoint.top : scrollToFullView.top, 0);

        return { left, top };
    }

    _getChildPointAfterScroll (parentDimensions, childDimensions, left, top) {
        const x = childDimensions.left + parentDimensions.scroll.left - left +
                  Math.round(childDimensions.width / 2);
        const y = childDimensions.top + parentDimensions.scroll.top - top +
                  Math.round(childDimensions.height / 2);

        return { x, y };
    }

    _scrollToChild (parent, child, { offsetX, offsetY }) {
        const parentDimensions = positionUtils.getClientDimensions(parent);
        const childDimensions  = positionUtils.getClientDimensions(child);
        const windowWidth      = styleUtils.getInnerWidth(window);
        const windowHeight     = styleUtils.getInnerHeight(window);
        let scrollPos          = {};
        let needScroll         = true;

        while (needScroll) {
            scrollPos = this._getScrollPosition(parentDimensions, childDimensions, offsetX, offsetY);

            const { x, y }        = this._getChildPointAfterScroll(parentDimensions, childDimensions, scrollPos.left, scrollPos.top);
            const isHiddenByFixed = this._isElementOnPointHiddenByFixed(x, y);

            this.maxScrollMarginLeft += SCROLL_MARGIN_INCREASE_STEP;

            if (this.maxScrollMarginLeft >= windowWidth) {
                this.maxScrollMarginLeft = DEFAULT_MAX_SCROLL_MARGIN;
                this.maxScrollMarginTop += SCROLL_MARGIN_INCREASE_STEP;
            }

            needScroll = isHiddenByFixed && this.maxScrollMarginTop < windowHeight;
        }

        this.maxScrollMarginLeft = DEFAULT_MAX_SCROLL_MARGIN;
        this.maxScrollMarginTop  = DEFAULT_MAX_SCROLL_MARGIN;

        return this._setScroll(parent, scrollPos);
    }

    _scrollElement () {
        if (!styleUtils.hasScroll(this.element))
            return Promise.resolve();

        var elementDimensions = positionUtils.getClientDimensions(this.element);
        var scroll            = this._getScrollToPoint(elementDimensions, {
            x: this.offsetX,
            y: this.offsetY
        });

        return this._setScroll(this.element, scroll);
    }

    _scrollParents () {
        var parents = styleUtils.getScrollableParents(this.element);

        var currentChild   = this.element;
        var currentOffsetX = this.offsetX - Math.round(styleUtils.getScrollLeft(currentChild));
        var currentOffsetY = this.offsetY - Math.round(styleUtils.getScrollTop(currentChild));

        var childDimensions  = null;
        var parentDimensions = null;

        var scrollParentsPromise = promiseUtils.times(parents.length, i => {
            return this
                ._scrollToChild(parents[i], currentChild, {
                    offsetX: currentOffsetX,
                    offsetY: currentOffsetY
                })
                .then(() => {
                    childDimensions  = positionUtils.getClientDimensions(currentChild);
                    parentDimensions = positionUtils.getClientDimensions(parents[i]);

                    currentOffsetX += childDimensions.left - parentDimensions.left + parentDimensions.border.left;
                    currentOffsetY += childDimensions.top - parentDimensions.top + parentDimensions.border.top;

                    currentChild = parents[i];
                });
        });

        return scrollParentsPromise
            .then(() => {
                if (window.top !== window && !this.skipParentFrames) {
                    return sendRequestToFrame({
                        cmd:                 SCROLL_REQUEST_CMD,
                        offsetX:             currentOffsetX,
                        offsetY:             currentOffsetY,
                        maxScrollMarginLeft: this.maxScrollMarginLeft,
                        maxScrollMarginTop:  this.maxScrollMarginTop
                    }, SCROLL_RESPONSE_CMD, window.parent);
                }

                return Promise.resolve();
            });
    }

    _isElementOnPointHiddenByFixed (x, y) {
        const elementInPoint = positionUtils.getElementFromPoint(x, y);
        let el               = elementInPoint;
        let fixedElement     = null;

        while (el && !fixedElement) {
            if (styleUtils.isFixedElement(el))
                fixedElement = el;

            el = el.parentNode;
        }

        return elementInPoint && fixedElement && !fixedElement.contains(this.element);
    }

    run () {
        return this
            ._scrollElement()
            .then(() => this._scrollParents());
    }
}
