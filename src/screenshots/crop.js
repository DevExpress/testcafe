import fs from 'fs';
import Promise from 'pinkie';
import { PNG } from 'pngjs';
import promisifyEvent from 'promisify-event';
import limitNumber from '../utils/limit-number';
import { deleteFile } from '../utils/promisified-functions';
import renderTemplate from '../utils/render-template';
import { InvalidElementScreenshotDimensionsError } from '../errors/test-run/';
import { MARK_LENGTH, MARK_RIGHT_MARGIN, MARK_BYTES_PER_PIXEL } from './constants';
import WARNING_MESSAGES from '../notifications/warning-message';


function readPng (filePath) {
    const png           = new PNG();
    const parsedPromise = Promise.race([
        promisifyEvent(png, 'parsed'),
        promisifyEvent(png, 'error')
    ]);

    fs.createReadStream(filePath).pipe(png);

    return parsedPromise
        .then(() => png);
}

function writePng (filePath, png) {
    const outStream     = fs.createWriteStream(filePath);
    const finishPromise = Promise.race([
        promisifyEvent(outStream, 'finish'),
        promisifyEvent(outStream, 'error')
    ]);

    png.pack().pipe(outStream);

    return finishPromise;
}

function markSeedToId (markSeed) {
    let id = 0;

    for (let i = 0; i < MARK_LENGTH; i++)
        id = id * 2 + (markSeed[i * MARK_BYTES_PER_PIXEL] ? 1 : 0);

    return id;
}

function detectClippingArea (srcImage, { markSeed, clientAreaDimensions, cropDimensions, screenshotPath } = {}) {
    let clipLeft   = 0;
    let clipTop    = 0;
    let clipRight  = srcImage.width;
    let clipBottom = srcImage.height;
    let clipWidth  = srcImage.width;
    let clipHeight = srcImage.height;

    if (markSeed && clientAreaDimensions) {
        const mark = Buffer.from(markSeed);

        const markIndex = srcImage.data.indexOf(mark);

        if (markIndex < 0)
            throw new Error(renderTemplate(WARNING_MESSAGES.screenshotMarkNotFound, screenshotPath, markSeedToId(markSeed)));

        const endPosition = markIndex / MARK_BYTES_PER_PIXEL + MARK_LENGTH + MARK_RIGHT_MARGIN;

        clipRight  = endPosition % srcImage.width || srcImage.width;
        clipBottom = (endPosition - clipRight) / srcImage.width + 1;
        clipLeft   = clipRight - clientAreaDimensions.width;
        clipTop    = clipBottom - clientAreaDimensions.height;
    }

    const markLineNumber = clipBottom;

    if (cropDimensions) {
        clipRight  = limitNumber(clipLeft + cropDimensions.right, clipLeft, clipRight);
        clipBottom = limitNumber(clipTop + cropDimensions.bottom, clipTop, clipBottom);
        clipLeft   = limitNumber(clipLeft + cropDimensions.left, clipLeft, clipRight);
        clipTop    = limitNumber(clipTop + cropDimensions.top, clipTop, clipBottom);
    }

    if (markSeed && clipBottom === markLineNumber)
        clipBottom -= 1;

    clipWidth  = clipRight - clipLeft;
    clipHeight = clipBottom - clipTop;

    return {
        left:   clipLeft,
        top:    clipTop,
        right:  clipRight,
        bottom: clipBottom,
        width:  clipWidth,
        height: clipHeight
    };
}

function copyImagePart (srcImage, { left, top, width, height }) {
    const dstImage = new PNG({ width, height });
    const stride   = dstImage.width * MARK_BYTES_PER_PIXEL;

    for (let i = 0; i < height; i++) {
        const srcStartIndex = (srcImage.width * (i + top) + left) * MARK_BYTES_PER_PIXEL;

        srcImage.data.copy(dstImage.data, stride * i, srcStartIndex, srcStartIndex + stride);
    }

    return dstImage;
}

export default async function (screenshotPath, markSeed, clientAreaDimensions, cropDimensions) {
    const srcImage  = await readPng(screenshotPath);

    const clippingArea = detectClippingArea(srcImage, { markSeed, clientAreaDimensions, cropDimensions, screenshotPath });

    if (clippingArea.width <= 0 || clippingArea.height <= 0) {
        await deleteFile(screenshotPath);
        throw new InvalidElementScreenshotDimensionsError(clippingArea.width, clippingArea.height);
    }

    if (!markSeed && !cropDimensions)
        return true;

    const dstImage = copyImagePart(srcImage, clippingArea);

    await writePng(screenshotPath, dstImage);

    return true;
}
