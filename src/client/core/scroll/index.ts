import { hasScroll, getScrollableParents } from '../utils/scroll';
import * as positionUtils from '../utils/position';
import * as promiseUtils from '../../core/utils/promise';
import isIframeWindow from '../../../utils/is-window-in-iframe';
import AxisValues, { LeftTopValues } from '../utils/values/axis-values';
import Dimensions from '../utils/values/dimensions';
import { Dictionary } from '../../../configuration/interfaces';
import { ScrollOptions } from '../../../test-run/commands/options';
import * as domUtils from '../utils/dom';
import * as styleUtils from '../utils/style';
import sendRequestToFrame from '../utils/send-request-to-frame';
// @ts-ignore
import { Promise } from '../deps/hammerhead';
import scrollController from './controller';

const DEFAULT_MAX_SCROLL_MARGIN   = 50;
const SCROLL_MARGIN_INCREASE_STEP = 20;

export default class ScrollAutomation {
    public static readonly SCROLL_REQUEST_CMD = 'automation|scroll|request';
    public static readonly SCROLL_RESPONSE_CMD = 'automation|scroll|response';

    private readonly _element: HTMLElement;
    private readonly _offsets: AxisValues<number>;
    private readonly _skipParentFrames: boolean;
    private readonly _scrollToCenter: boolean;
    private _maxScrollMargin: LeftTopValues<number>;
    private _scrollWasPerformed: boolean;

    public constructor (element: HTMLElement, scrollOptions: ScrollOptions, maxScrollMargin?: LeftTopValues<number>) {
        this._element          = element;
        this._offsets          = new AxisValues(scrollOptions.offsetX, scrollOptions.offsetY);
        this._scrollToCenter   = !!scrollOptions.scrollToCenter;
        this._skipParentFrames = !!scrollOptions.skipParentFrames;

        this._maxScrollMargin = maxScrollMargin || { left: DEFAULT_MAX_SCROLL_MARGIN, top: DEFAULT_MAX_SCROLL_MARGIN };

        this._scrollWasPerformed = false;
    }

    private static _isScrollValuesChanged (scrollElement: Element | Document, originalScroll: LeftTopValues<number>): boolean {
        return styleUtils.getScrollLeft(scrollElement) !== originalScroll.left ||
            styleUtils.getScrollTop(scrollElement) !== originalScroll.top;
    }

    private _setScroll (element: Element, { left, top }: LeftTopValues<number>): Promise<void> {
        const scrollElement = domUtils.isHtmlElement(element) ? domUtils.findDocument(element) : element;

        const originalScroll = {
            left: styleUtils.getScrollLeft(scrollElement),
            top:  styleUtils.getScrollTop(scrollElement),
        };

        left = Math.max(left, 0);
        top  = Math.max(top, 0);

        let scrollPromise = scrollController.waitForScroll(scrollElement);

        styleUtils.setScrollLeft(scrollElement, left);
        styleUtils.setScrollTop(scrollElement, top);

        if (!ScrollAutomation._isScrollValuesChanged(scrollElement, originalScroll)) {
            // @ts-ignore
            scrollPromise.cancel();

            return Promise.resolve();
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

    private _scrollToChild (parent: HTMLElement, child: HTMLElement, offsets: AxisValues<number>): Promise<void> {
        const parentDimensions = positionUtils.getClientDimensions(parent);
        const childDimensions  = positionUtils.getClientDimensions(child);
        const windowWidth      = styleUtils.getInnerWidth(window);
        const windowHeight     = styleUtils.getInnerHeight(window);

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
            return Promise.resolve();

        const elementDimensions = positionUtils.getClientDimensions(this._element);
        const scroll = this._getScrollToPoint(elementDimensions, this._offsets, this._maxScrollMargin);

        return this._setScroll(this._element, scroll);
    }

    private _scrollParents (): Promise<boolean | Dictionary<any>> {
        const parents        = getScrollableParents(this._element);
        let currentChild     = this._element;
        const scrollLeft     = styleUtils.getScrollLeft(currentChild);
        const scrollTop      = styleUtils.getScrollTop(currentChild);
        const currentOffset  = AxisValues.create(this._offsets).sub(new AxisValues(scrollLeft, scrollTop).round());
        let childDimensions  = null;
        let parentDimensions = null;

        const scrollParentsPromise = promiseUtils.times(parents.length, (i: number) => {
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

        if (!sendRequestToFrame)
            return scrollParentsPromise.then(() => state);

        return scrollParentsPromise
            .then(() => {
                if (this._skipParentFrames || !isIframeWindow(window))
                    return;

                state.cmd = ScrollAutomation.SCROLL_REQUEST_CMD;

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, consistent-return
                return sendRequestToFrame!(state, ScrollAutomation.SCROLL_RESPONSE_CMD, window.parent);
            })
            .then(() => this._scrollWasPerformed);
    }

    private static _getFixedAncestorOrSelf (element: Element): Node | null {
        return domUtils.findParent(element, true, styleUtils.isFixedElement);
    }

    private _isTargetElementObscuredInPoint (point: AxisValues<number>): boolean {
        const elementInPoint = positionUtils.getElementFromPoint(point);

        if (!elementInPoint)
            return false;

        const fixedElement = ScrollAutomation._getFixedAncestorOrSelf(elementInPoint);

        return !!fixedElement && !fixedElement.contains(this._element);
    }

    public run (): Promise<boolean | Dictionary<any>> {
        return this._scrollElement()
            .then(() => this._scrollParents());
    }
}
