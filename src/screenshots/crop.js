import { readPng, copyImagePart } from './png';
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

export function updateClipInfoByMarkSeed (pngImage, path, markSeed, { width, height }) {
    const mark = Buffer.from(markSeed);

    const markIndex = pngImage.data.indexOf(mark);

    if (markIndex < 0)
        throw new Error(renderTemplate(WARNING_MESSAGES.screenshotMarkNotFound, path, markSeedToId(markSeed)));

    const endPosition = markIndex / MARK_BYTES_PER_PIXEL + MARK_LENGTH + MARK_RIGHT_MARGIN;

    const clipRight  = endPosition % pngImage.width || pngImage.width;
    const clipBottom = (endPosition - clipRight) / pngImage.width + 1;
    const clipLeft   = clipRight - width;
    const clipTop    = clipBottom - height;

    return {
        clipLeft,
        clipTop,
        clipRight,
        clipBottom
    };
}

export function updateClipInfoByCropDimensions ({ clipRight, clipLeft, clipBottom, clipTop }, cropDimensions) {
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

    let markLineNumber = null;

    if (markSeed && clientAreaDimensions) {
        clipInfo = updateClipInfoByMarkSeed(pngImage, path, markSeed, clientAreaDimensions);

        markLineNumber = clipInfo.clipBottom;
    }

    clipInfo = updateClipInfoByCropDimensions(clipInfo, cropDimensions);

    if (markSeed && clipInfo.clipBottom === markLineNumber)
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
