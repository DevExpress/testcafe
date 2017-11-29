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

    var markPosition = (markIndex + screenshotMarkSeed.length) / 4;
    var width   = markPosition % srcImage.width;
    var height  = (markPosition - width) / srcImage.width;
    var offsetX = width - pageWidth;
    var offsetY = height - pageHeight;

    width  -= offsetX;
    height -= offsetY;

    var dstImage = new PNG({ width, height });

    for (let i = 0; i < height; i++)
        srcImage.data.copy(dstImage.data, dstImage.width * i * 4, (srcImage.width * (i + offsetY) + offsetX) * 4, (srcImage.width * (i + offsetY) + offsetX + dstImage.width) * 4);

    await writePng(screenshotPath, dstImage);

    return true;
}
