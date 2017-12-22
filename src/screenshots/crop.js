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

export default async function (screenshotPath, screenshotMarkSeed, pageWidth, pageHeight) {
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
    var width       = right - left;
    var height      = bottom - top - 1;


    var dstImage = new PNG({ width, height });
    var stride   = dstImage.width * 4;

    for (let i = 0; i < height; i++) {
        var srcStartIndex = (srcImage.width * (i + top) + left) * 4;

        srcImage.data.copy(dstImage.data, stride * i, srcStartIndex, srcStartIndex + stride);
    }

    await writePng(screenshotPath, dstImage);

    return true;
}
