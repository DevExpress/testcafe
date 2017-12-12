import fs from 'fs';
import Promise from 'pinkie';
import { PNG } from 'pngjs';
import promisifyEvent from 'promisify-event';


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

function enforceDimension (value, reference) {
    if (value < 0)
        return 0;

    if (value > reference)
        return reference;

    return value;
}

export default async function (screenshotPath, screenshotMarkSeed, pageWidth, pageHeight, elementRect, cropDimensions) {
    var mark = new Buffer(screenshotMarkSeed);

    var srcImage  = await readPng(screenshotPath);

    var markIndex = srcImage.data.indexOf(mark);

    if (markIndex < 0)
        return false;

    var endPosition = (markIndex + screenshotMarkSeed.length) / 4;
    var right       = endPosition % srcImage.width || srcImage.width;
    var bottom      = (endPosition - right) / srcImage.width + 1;
    var left        = right - pageWidth;
    var top         = bottom - pageHeight;

    if (elementRect) {
        right  = enforceDimension(left + Math.ceil(elementRect.right), srcImage.width);
        bottom = enforceDimension(top + Math.ceil(elementRect.bottom), srcImage.height);
        left   = enforceDimension(left + Math.floor(elementRect.left), srcImage.width);
        top    = enforceDimension(top + Math.floor(elementRect.top), srcImage.height);
    }
    else
        bottom -= 1;

    var width  = right - left;
    var height = bottom - top;

    if (width <= 0 || height <= 0)
        return false;

    if (cropDimensions && (cropDimensions.cropWidth || cropDimensions.cropHeight || cropDimensions.cropX || cropDimensions.cropY)) {
        cropDimensions.cropWidth  = cropDimensions.cropWidth || width;
        cropDimensions.cropHeight = cropDimensions.cropHeight || height;

        if (!cropDimensions.cropX && cropDimensions.cropX !== 0)
            cropDimensions.cropX = enforceDimension(Math.floor(cropDimensions.offsetX - cropDimensions.cropWidth / 2), width);

        if (!cropDimensions.cropY && cropDimensions.cropY !== 0)
            cropDimensions.cropY = enforceDimension(Math.floor(cropDimensions.offsetY - cropDimensions.cropHeight / 2), height);

        left   = enforceDimension(left + cropDimensions.cropX, right);
        top    = enforceDimension(top + cropDimensions.cropY, bottom);
        right  = enforceDimension(left + cropDimensions.cropWidth, right);
        bottom = enforceDimension(top + cropDimensions.cropHeight, bottom);

        width  = right - left;
        height = bottom - top;

        if (width <= 0 || height <= 0)
            return false;
    }

    var dstImage = new PNG({ width, height });
    var stride   = dstImage.width * 4;

    for (let i = 0; i < height; i++) {
        var srcStartIndex = (srcImage.width * (i + top) + left) * 4;

        srcImage.data.copy(dstImage.data, stride * i, srcStartIndex, srcStartIndex + stride);
    }

    await writePng(screenshotPath, dstImage);

    return true;
}
