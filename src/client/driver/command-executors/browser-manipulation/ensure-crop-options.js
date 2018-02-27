import { styleUtils } from '../../deps/testcafe-core';
import { getOffsetOptions } from '../../deps/testcafe-automation';
import limitNumber from '../../../../utils/limit-number';
import { ActionInvalidScrollTargetError, InvalidElementScreenshotDimensionsError } from '../../../../errors/test-run';


function determineDimensionBounds (bounds, maximum) {
    var hasMin    = typeof bounds.min === 'number';
    var hasMax    = typeof bounds.max === 'number';
    var hasLength = typeof bounds.length === 'number';

    if (hasLength)
        bounds.length = limitNumber(bounds.length, 0, maximum);

    if (hasMin && bounds.min < 0)
        bounds.min += maximum;

    if (hasMax && bounds.max < 0)
        bounds.max += maximum;

    if (!hasMin)
        bounds.min = hasMax && hasLength ? bounds.max - bounds.length : 0;

    if (!hasMax)
        bounds.max = hasLength ? bounds.min + bounds.length : maximum;

    bounds.min    = limitNumber(bounds.min, 0, maximum);
    bounds.max    = limitNumber(bounds.max, 0, maximum);
    bounds.length = bounds.max - bounds.min;

    return bounds;
}

function determineScrollPoint (cropStart, cropEnd, viewportBound) {
    return Math.round(cropStart + limitNumber(cropEnd - cropStart, 0, viewportBound) / 2);
}

export default function ensureCropOptions (element, options) {
    var elementRectangle = element.getBoundingClientRect();

    var elementBounds = {
        left:   elementRectangle.left,
        right:  elementRectangle.right,
        top:    elementRectangle.top,
        bottom: elementRectangle.bottom
    };

    var elementMargin       = styleUtils.getElementMargin(element);
    var elementPadding      = styleUtils.getElementPadding(element);
    var elementBordersWidth = styleUtils.getBordersWidth(element);

    options.originOffset = { x: 0, y: 0 };

    var scrollRight  = elementBounds.left + element.scrollWidth + elementBordersWidth.left + elementBordersWidth.right;
    var scrollBottom = elementBounds.top + element.scrollHeight + elementBordersWidth.top + elementBordersWidth.bottom;

    elementBounds.right  = Math.max(elementBounds.right, scrollRight);
    elementBounds.bottom = Math.max(elementBounds.bottom, scrollBottom);

    if (!options.includeBorders || !options.includePaddings) {
        options.originOffset.x += elementBordersWidth.left;
        options.originOffset.y += elementBordersWidth.top;

        elementBounds.left   += elementBordersWidth.left;
        elementBounds.top    += elementBordersWidth.top;
        elementBounds.right  -= elementBordersWidth.right;
        elementBounds.bottom -= elementBordersWidth.bottom;

        if (!options.includePaddings) {
            options.originOffset.x += elementPadding.left;
            options.originOffset.y += elementPadding.top;

            elementBounds.left   += elementPadding.left;
            elementBounds.top    += elementPadding.top;
            elementBounds.right  -= elementPadding.right;
            elementBounds.bottom -= elementPadding.bottom;
        }
    }
    else if (options.includeMargins) {
        options.originOffset.x -= elementMargin.left;
        options.originOffset.y -= elementMargin.top;

        elementBounds.left   -= elementMargin.left;
        elementBounds.top    -= elementMargin.top;
        elementBounds.right  += elementMargin.right;
        elementBounds.bottom += elementMargin.bottom;
    }

    elementBounds.width  = elementBounds.right - elementBounds.left;
    elementBounds.height = elementBounds.bottom - elementBounds.top;

    var horizontalCropBounds = determineDimensionBounds({ min: options.crop.left, max: options.crop.right, length: options.crop.width }, elementBounds.width);
    var verticalCropBounds   = determineDimensionBounds({ min: options.crop.top, max: options.crop.bottom, length: options.crop.height }, elementBounds.height);

    options.crop.left  = horizontalCropBounds.min;
    options.crop.right = horizontalCropBounds.max;
    options.crop.width = horizontalCropBounds.length;

    options.crop.top    = verticalCropBounds.min;
    options.crop.bottom = verticalCropBounds.max;
    options.crop.height = verticalCropBounds.length;

    if (options.crop.width <= 0 || options.crop.height <= 0)
        throw new InvalidElementScreenshotDimensionsError(options.crop.width, options.crop.height);

    var viewportDimensions = styleUtils.getViewportDimensions();

    if (elementBounds.width > viewportDimensions.width || elementBounds.height > viewportDimensions.height)
        options.scrollToCenter = true;

    var hasScrollTargetX = typeof options.scrollTargetX === 'number';
    var hasScrollTargetY = typeof options.scrollTargetY === 'number';

    if (!hasScrollTargetX)
        options.scrollTargetX = determineScrollPoint(options.crop.left, options.crop.right, viewportDimensions.width);

    if (!hasScrollTargetY)
        options.scrollTargetY = determineScrollPoint(options.crop.top, options.crop.bottom, viewportDimensions.height);

    var { offsetX, offsetY } = getOffsetOptions(element, options.scrollTargetX, options.scrollTargetY);

    options.scrollTargetX = offsetX;
    options.scrollTargetY = offsetY;

    var isScrollTargetXValid = !hasScrollTargetX || options.scrollTargetX >= options.crop.left && options.scrollTargetX <= options.crop.right;
    var isScrollTargetYValid = !hasScrollTargetY || options.scrollTargetY >= options.crop.top && options.scrollTargetY <= options.crop.bottom;

    if (!isScrollTargetXValid || !isScrollTargetYValid)
        throw new ActionInvalidScrollTargetError(isScrollTargetXValid, isScrollTargetYValid);
}
