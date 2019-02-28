import { readPng, copyImagePart } from './utils';
import limitNumber from '../utils/limit-number';
import renderTemplate from '../utils/render-template';
import { InvalidElementScreenshotDimensionsError } from '../errors/test-run/';
import { MARK_LENGTH, MARK_RIGHT_MARGIN, MARK_BYTES_PER_PIXEL } from './constants';
import WARNING_MESSAGES from '../notifications/warning-message';


function markSeedToId (markSeed) {
    let id = 0;

    for (let i = 0; i < MARK_LENGTH; i++)
        id = id * 2 + (markSeed[i * MARK_BYTES_PER_PIXEL] ? 1 : 0);

    return id;
}

export function calculateMarkPosition (pngImage, markSeed) {
    const mark      = Buffer.from(markSeed);
    const markIndex = pngImage.data.indexOf(mark);

    if (markIndex < 0)
        return null;

    const endPosition = markIndex / MARK_BYTES_PER_PIXEL + MARK_LENGTH + MARK_RIGHT_MARGIN;

    const x = endPosition % pngImage.width || pngImage.width;
    const y = (endPosition - x) / pngImage.width + 1;

    return { x, y };
}

export function getClipInfoByMarkPosition (markPosition, { width, height }) {
    const { x, y } = markPosition;

    const clipRight  = x;
    const clipBottom = y;
    const clipLeft   = clipRight - width;
    const clipTop    = clipBottom - height;

    return {
        clipLeft,
        clipTop,
        clipRight,
        clipBottom
    };
}

export function getClipInfoByCropDimensions ({ clipRight, clipLeft, clipBottom, clipTop }, cropDimensions) {
    if (cropDimensions) {
        const { right, top, bottom, left } = cropDimensions;

        clipRight  = limitNumber(clipLeft + right, clipLeft, clipRight);
        clipBottom = limitNumber(clipTop + bottom, clipTop, clipBottom);
        clipLeft   = limitNumber(clipLeft + left, clipLeft, clipRight);
        clipTop    = limitNumber(clipTop + top, clipTop, clipBottom);
    }

    return {
        clipLeft,
        clipTop,
        clipRight,
        clipBottom
    };
}

export function calculateClipInfo (pngImage, path, markSeed, clientAreaDimensions, cropDimensions) {
    let clipInfo = {
        clipRight:  pngImage.width,
        clipBottom: pngImage.height,
        clipLeft:   0,
        clipTop:    0
    };

    let markPosition = null;

    if (markSeed && clientAreaDimensions) {
        markPosition = calculateMarkPosition(pngImage, markSeed);

        if (!markPosition)
            throw new Error(renderTemplate(WARNING_MESSAGES.screenshotMarkNotFound, path, markSeedToId(markSeed)));

        clipInfo = getClipInfoByMarkPosition(markPosition, clientAreaDimensions);
    }

    clipInfo = getClipInfoByCropDimensions(clipInfo, cropDimensions);

    if (markPosition && markPosition.y === clipInfo.clipBottom)
        clipInfo.clipBottom--;

    const clipWidth  = clipInfo.clipRight - clipInfo.clipLeft;
    const clipHeight = clipInfo.clipBottom - clipInfo.clipTop;

    if (clipWidth <= 0 || clipHeight <= 0)
        throw new InvalidElementScreenshotDimensionsError(clipWidth, clipHeight);

    return clipInfo;
}

export async function cropScreenshot (path, markSeed, clientAreaDimensions, cropDimensions, binaryImage) {
    if (!markSeed && !cropDimensions)
        return null;

    const pngImage = await readPng(binaryImage);
    const clip     = calculateClipInfo(pngImage, path, markSeed, clientAreaDimensions, cropDimensions);

    return copyImagePart(pngImage, clip);
}
