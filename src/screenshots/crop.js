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
    var png           = new PNG();
    var parsedPromise = Promise.race([
        promisifyEvent(png, 'parsed'),
        promisifyEvent(png, 'error')
    ]);

    fs.createReadStream(filePath).pipe(png);

    return parsedPromise
        .then(() => png);
}

function writePng (filePath, png) {
    var outStream     = fs.createWriteStream(filePath);
    var finishPromise = Promise.race([
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

export default async function (screenshotPath, markSeed, clientAreaDimensions, cropDimensions) {
    var mark = new Buffer(markSeed);

    var srcImage  = await readPng(screenshotPath);

    var markIndex = srcImage.data.indexOf(mark);

    if (markIndex < 0)
        throw new Error(renderTemplate(WARNING_MESSAGES.screenshotMarkNotFound, screenshotPath, markSeedToId(markSeed)));

    var endPosition = markIndex / MARK_BYTES_PER_PIXEL + MARK_LENGTH + MARK_RIGHT_MARGIN;
    var right       = endPosition % srcImage.width || srcImage.width;
    var bottom      = (endPosition - right) / srcImage.width + 1;
    var left        = right - clientAreaDimensions.width;
    var top         = bottom - clientAreaDimensions.height;

    const markLineNumber = bottom;

    if (cropDimensions) {
        right  = limitNumber(left + cropDimensions.right, left, right);
        bottom = limitNumber(top + cropDimensions.bottom, top, bottom);
        left   = limitNumber(left + cropDimensions.left, left, right);
        top    = limitNumber(top + cropDimensions.top, top, bottom);
    }

    if (bottom === markLineNumber)
        bottom -= 1;

    var width  = right - left;
    var height = bottom - top;

    if (width <= 0 || height <= 0) {
        await deleteFile(screenshotPath);
        throw new InvalidElementScreenshotDimensionsError(width, height);
    }

    var dstImage = new PNG({ width, height });
    var stride   = dstImage.width * MARK_BYTES_PER_PIXEL;

    for (let i = 0; i < height; i++) {
        var srcStartIndex = (srcImage.width * (i + top) + left) * MARK_BYTES_PER_PIXEL;

        srcImage.data.copy(dstImage.data, stride * i, srcStartIndex, srcStartIndex + stride);
    }

    await writePng(screenshotPath, dstImage);

    return true;
}
