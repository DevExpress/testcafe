import fs from 'fs';
import Promise from 'pinkie';
import { PNG } from 'pngjs';
import promisifyEvent from 'promisify-event';
import { InvalidElementScreenshotDimensionsError } from '../errors/test-run/';


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

function enforceDimension (value, min, max) {
    return Math.max(Math.min(value, max), min);
}

export default async function (screenshotPath, markSeed, clientAreaDimensions, cropDimensions) {
    var mark = new Buffer(markSeed);

    var srcImage  = await readPng(screenshotPath);

    var markIndex = srcImage.data.indexOf(mark);

    if (markIndex < 0)
        return false;

    var endPosition = (markIndex + markSeed.length) / 4;
    var right       = endPosition % srcImage.width || srcImage.width;
    var bottom      = (endPosition - right) / srcImage.width + 1;
    var left        = right - clientAreaDimensions.width;
    var top         = bottom - clientAreaDimensions.height;

    if (cropDimensions) {
        right  = enforceDimension(left + cropDimensions.right, left, right);
        bottom = enforceDimension(top + cropDimensions.bottom, top, bottom);
        left   = enforceDimension(left + cropDimensions.left, left, right);
        top    = enforceDimension(top + cropDimensions.top, top, bottom);
    }
    else
        bottom -= 1;

    var width  = right - left;
    var height = bottom - top;

    if (width <= 0 || height <= 0)
        throw new InvalidElementScreenshotDimensionsError();

    var dstImage = new PNG({ width, height });
    var stride   = dstImage.width * 4;

    for (let i = 0; i < height; i++) {
        var srcStartIndex = (srcImage.width * (i + top) + left) * 4;

        srcImage.data.copy(dstImage.data, stride * i, srcStartIndex, srcStartIndex + stride);
    }

    await writePng(screenshotPath, dstImage);

    return true;
}
