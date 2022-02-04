import utilsAdapter from '../utils/shared/adapter/index';
import scrollAdapter from './adapter/index';
import { hasScroll, getScrollableParents } from '../utils/shared/scroll';
import * as positionUtils from '../utils/shared/position';
import * as promiseUtils from '../../../shared/utils/promise';
import { isFixedElement } from '../utils/shared/style';
import isIframeWindow from '../../../utils/is-window-in-iframe';
import AxisValues, { LeftTopValues } from '../../../shared/utils/values/axis-values';
import Dimensions from '../../../shared/utils/values/dimensions';
import { Dictionary } from '../../../configuration/interfaces';
import { ScrollOptions } from '../../../test-run/commands/options';


export interface ScrollResultProxyless {
    scrollWasPerformed: boolean;
    offsetX: number;
    offsetY: number;
    maxScrollMargin: LeftTopValues<number>;
}


const DEFAULT_MAX_SCROLL_MARGIN   = 50;
const SCROLL_MARGIN_INCREASE_STEP = 20;

export default class ScrollAutomation {
    public static readonly SCROLL_REQUEST_CMD = 'automation|scroll|request';
    public static readonly SCROLL_RESPONSE_CMD = 'automation|scroll|response';

    private readonly _element: Element;
    private readonly _offsets: AxisValues<number>;
    private readonly _skipParentFrames: boolean;
    private readonly _scrollToCenter: boolean;
    private _maxScrollMargin: LeftTopValues<number>;
    private _scrollWasPerformed: boolean;

    public constructor (element: Element, scrollOptions: ScrollOptions, maxScrollMargin?: LeftTopValues<number>) {
        this._element          = element;
        this._offsets          = new AxisValues(scrollOptions.offsetX, scrollOptions.offsetY);
        this._scrollToCenter   = !!scrollOptions.scrollToCenter;
        this._skipParentFrames = !!scrollOptions.skipParentFrames;

        this._maxScrollMargin = maxScrollMargin || { left: DEFAULT_MAX_SCROLL_MARGIN, top: DEFAULT_MAX_SCROLL_MARGIN };

        this._scrollWasPerformed = false;
    }

    private static _isScrollValuesChanged (scrollElement: Element | Document, originalScroll: LeftTopValues<number>): boolean {
        return utilsAdapter.style.getScrollLeft(scrollElement) !== originalScroll.left ||
            utilsAdapter.style.getScrollTop(scrollElement) !== originalScroll.top;
    }

    private _setScroll (element: Element, { left, top }: LeftTopValues<number>): Promise<void> {
        const scrollElement = utilsAdapter.dom.isHtmlElement(element) ? utilsAdapter.dom.findDocument(element) : element;

        const originalScroll = {
            left: utilsAdapter.style.getScrollLeft(scrollElement),
            top:  utilsAdapter.style.getScrollTop(scrollElement),
        };

        left = Math.max(left, 0);
        top  = Math.max(top, 0);

        let scrollPromise = scrollAdapter.controller.waitForScroll(scrollElement);

        utilsAdapter.style.setScrollLeft(scrollElement, left);
        utilsAdapter.style.setScrollTop(scrollElement, top);

        if (!ScrollAutomation._isScrollValuesChanged(scrollElement, originalScroll)) {
            // @ts-ignore
            scrollPromise.cancel();

            return scrollAdapter.PromiseCtor.resolve();
        }

        scrollPromise = scrollPromise.then(() => {
            if (!this._scrollWasPerformed)
                this._scrollWasPerformed = ScrollAutomation._isScrollValuesChanged(scrollElement, originalScroll);
        });

        return scrollPromise;
    }

    private _getScrollToPoint (dimensions: Dimensions, point: AxisValues<number>, maxScrollMargin: LeftTopValues<number>): LeftTopValues<number> {
        const horizontalCenter = Math.floor(dimensions.width / 2);
        const verticalCenter   = Math.floor(dimensions.height / 2);
        const leftScrollMargin = this._scrollToCenter ? horizontalCenter : Math.min(maxScrollMargin.left, horizontalCenter);
        const topScrollMargin  = this._scrollToCenter ? verticalCenter : Math.min(maxScrollMargin.top, verticalCenter);
        let { left, top }      = dimensions.scroll;

        const needForwardScrollLeft  = point.x >= left + dimensions.width - leftScrollMargin;
        const needBackwardScrollLeft = point.x <= left + leftScrollMargin;

        const needForwardScrollTop  = point.y >= top + dimensions.height - topScrollMargin;
        const needBackwardScrollTop = point.y <= top + topScrollMargin;

        if (needForwardScrollLeft)
            left = point.x - dimensions.width + leftScrollMargin;
        else if (needBackwardScrollLeft)
            left = point.x - leftScrollMargin;

        if (needForwardScrollTop)
            top = point.y - dimensions.height + topScrollMargin;
        else if (needBackwardScrollTop)
            top = point.y - topScrollMargin;

        return { left, top };
    }

    private _getScrollToFullChildView (parentDimensions: Dimensions, childDimensions: Dimensions, maxScrollMargin: LeftTopValues<number>): LeftTopValues<number | null> {
        const fullViewScroll: LeftTopValues<number | null> = { left: null, top: null };

        const canShowFullElementWidth  = parentDimensions.width >= childDimensions.width;
        const canShowFullElementHeight = parentDimensions.height >= childDimensions.height;

        const relativePosition = positionUtils.calcRelativePosition(childDimensions, parentDimensions);

        if (canShowFullElementWidth) {
            const availableLeftScrollMargin = parentDimensions.width - childDimensions.width;
            let leftScrollMargin            = Math.min(maxScrollMargin.left, availableLeftScrollMargin);

            if (this._scrollToCenter)
                leftScrollMargin = availableLeftScrollMargin / 2;

            if (relativePosition.left < leftScrollMargin)
                fullViewScroll.left = Math.round(parentDimensions.scroll.left + relativePosition.left - leftScrollMargin);
            else if (relativePosition.right < leftScrollMargin) {
                fullViewScroll.left = Math.round(parentDimensions.scroll.left +
                                                 Math.min(relativePosition.left, -relativePosition.right) +
                                                 leftScrollMargin);
            }
        }

        if (canShowFullElementHeight) {
            const availableTopScrollMargin = parentDimensions.height - childDimensions.height;
            let topScrollMargin            = Math.min(maxScrollMargin.top, availableTopScrollMargin);

            if (this._scrollToCenter)
                topScrollMargin = availableTopScrollMargin / 2;

            if (relativePosition.top < topScrollMargin)
                fullViewScroll.top = Math.round(parentDimensions.scroll.top + relativePosition.top - topScrollMargin);
            else if (relativePosition.bottom < topScrollMargin) {
                fullViewScroll.top = Math.round(parentDimensions.scroll.top +
                                                Math.min(relativePosition.top, -relativePosition.bottom) +
                                                topScrollMargin);
            }
        }

        return fullViewScroll;
    }

    private static _getChildPoint (parentDimensions: Dimensions, childDimensions: Dimensions, offsets: AxisValues<number>): AxisValues<number> {
        return AxisValues.create(childDimensions)
            .sub(AxisValues.create(parentDimensions))
            .add(AxisValues.create(parentDimensions.scroll))
            .add(AxisValues.create(childDimensions.border))
            .add(offsets);
    }

    private _getScrollPosition (parentDimensions: Dimensions, childDimensions: Dimensions, offsets: AxisValues<number>, maxScrollMargin: LeftTopValues<number>): LeftTopValues<number> {
        const childPoint       = ScrollAutomation._getChildPoint(parentDimensions, childDimensions, offsets);
        const scrollToPoint    = this._getScrollToPoint(parentDimensions, childPoint, maxScrollMargin);
        const scrollToFullView = this._getScrollToFullChildView(parentDimensions, childDimensions, maxScrollMargin);

        return {
            left: Math.max(scrollToFullView.left === null ? scrollToPoint.left : scrollToFullView.left, 0),
            top:  Math.max(scrollToFullView.top === null ? scrollToPoint.top : scrollToFullView.top, 0),
        };
    }

    private static _getChildPointAfterScroll (parentDimensions: Dimensions, childDimensions: Dimensions, currentScroll: LeftTopValues<number>, offsets: AxisValues<number>): AxisValues<number> {
        return AxisValues.create(childDimensions)
            .add(AxisValues.create(parentDimensions.scroll))
            .sub(AxisValues.create(currentScroll))
            .add(offsets);
    }

    private _isChildFullyVisible (parentDimensions: Dimensions, childDimensions: Dimensions, offsets: AxisValues<number>): boolean {
        const childPoint = ScrollAutomation._getChildPointAfterScroll(parentDimensions, childDimensions, parentDimensions.scroll, offsets);
        const zeroMargin = { left: 0, top: 0 };

        const { left, top } = this._getScrollPosition(parentDimensions, childDimensions, offsets, zeroMargin);

        return !this._isTargetElementObscuredInPoint(childPoint) &&
               left === parentDimensions.scroll.left && top === parentDimensions.scroll.top;
    }

    private _scrollToChild (parent: Element, child: Element, offsets: AxisValues<number>): Promise<void> {
        const parentDimensions = positionUtils.getClientDimensions(parent);
        const childDimensions  = positionUtils.getClientDimensions(child);
        const windowWidth      = utilsAdapter.style.getInnerWidth(window);
        const windowHeight     = utilsAdapter.style.getInnerHeight(window);

        let scrollPos  = parentDimensions.scroll;
        let needScroll = !this._isChildFullyVisible(parentDimensions, childDimensions, offsets);

        while (needScroll) {
            scrollPos = this._getScrollPosition(parentDimensions, childDimensions, offsets, this._maxScrollMargin);

            const childPoint       = ScrollAutomation._getChildPointAfterScroll(parentDimensions, childDimensions, scrollPos, offsets);
            const isTargetObscured = this._isTargetElementObscuredInPoint(childPoint);

            this._maxScrollMargin.left += SCROLL_MARGIN_INCREASE_STEP;

            if (this._maxScrollMargin.left >= windowWidth) {
                this._maxScrollMargin.left = DEFAULT_MAX_SCROLL_MARGIN;

                this._maxScrollMargin.top += SCROLL_MARGIN_INCREASE_STEP;
            }

            needScroll = isTargetObscured && this._maxScrollMargin.top < windowHeight;
        }

        this._maxScrollMargin = { left: DEFAULT_MAX_SCROLL_MARGIN, top: DEFAULT_MAX_SCROLL_MARGIN };

        return this._setScroll(parent, scrollPos);
    }

    private _scrollElement (): Promise<void> {
        if (!hasScroll(this._element))
            return scrollAdapter.PromiseCtor.resolve();

        const elementDimensions = positionUtils.getClientDimensions(this._element);
        const scroll = this._getScrollToPoint(elementDimensions, this._offsets, this._maxScrollMargin);

        return this._setScroll(this._element, scroll);
    }

    private _scrollParents (): Promise<ScrollResultProxyless | boolean> {
        const parents        = getScrollableParents(this._element);
        let currentChild     = this._element;
        const scrollLeft     = utilsAdapter.style.getScrollLeft(currentChild);
        const scrollTop      = utilsAdapter.style.getScrollTop(currentChild);
        const currentOffset  = AxisValues.create(this._offsets).sub(new AxisValues(scrollLeft, scrollTop).round());
        let childDimensions  = null;
        let parentDimensions = null;

        const scrollParentsPromise = promiseUtils.times(parents.length, i => {
            return this._scrollToChild(parents[i], currentChild, currentOffset)
                .then(() => {
                    childDimensions  = positionUtils.getClientDimensions(currentChild);
                    parentDimensions = positionUtils.getClientDimensions(parents[i]);

                    currentOffset.add(AxisValues.create(childDimensions))
                        .sub(AxisValues.create(parentDimensions))
                        .add(AxisValues.create(parentDimensions.border));

                    currentChild = parents[i];
                });
        });

        const state: Dictionary<any> = {
            scrollWasPerformed: this._scrollWasPerformed,
            offsetX:            currentOffset.x,
            offsetY:            currentOffset.y,
            maxScrollMargin:    this._maxScrollMargin,
        };

        if (!utilsAdapter.sendRequestToFrame)
            return scrollParentsPromise.then(() => state as ScrollResultProxyless);

        return scrollParentsPromise
            .then(() => {
                if (this._skipParentFrames || !isIframeWindow(window))
                    return;

                state.cmd = ScrollAutomation.SCROLL_REQUEST_CMD;

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, consistent-return
                return utilsAdapter.sendRequestToFrame!(state, ScrollAutomation.SCROLL_RESPONSE_CMD, window.parent);
            })
            .then(() => this._scrollWasPerformed);
    }

    private static _getFixedAncestorOrSelf (element: Element): Node | null {
        return utilsAdapter.dom.findParent(element, true, isFixedElement);
    }

    private _isTargetElementObscuredInPoint (point: AxisValues<number>): boolean {
        const elementInPoint = positionUtils.getElementFromPoint(point);

        if (!elementInPoint)
            return false;

        const fixedElement = ScrollAutomation._getFixedAncestorOrSelf(elementInPoint);

        return !!fixedElement && !fixedElement.contains(this._element);
    }

    public run (): Promise<ScrollResultProxyless | boolean> {
        return this._scrollElement()
            .then(() => this._scrollParents());
    }
}
