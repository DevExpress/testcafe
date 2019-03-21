import childProcess from 'child_process';
import fs from 'graceful-fs';
import Promise from 'pinkie';
import { PNG } from 'pngjs';
import promisifyEvent from 'promisify-event';
import promisify from './promisify';


export const readDir    = promisify(fs.readdir);
export const stat       = promisify(fs.stat);
export const writeFile  = promisify(fs.writeFile);
export const readFile   = promisify(fs.readFile);
export const deleteFile = promisify(fs.unlink);

export const exec = promisify(childProcess.exec);

export const sendMessageToChildProcess = promisify((process, ...args) => process.send(...args));

export function readPng (buffer) {
    const png = new PNG();

    const parsedPromise = Promise.race([
        promisifyEvent(png, 'parsed'),
        promisifyEvent(png, 'error')
    ]);

    png.parse(buffer);

    return parsedPromise
        .then(() => png);
}

export async function readPngFile (filePath) {
    const buffer = await readFile(filePath);

    return await readPng(buffer);
}

export function writePng (filePath, png) {
    const outStream = fs.createWriteStream(filePath);
    const pngStream = png.pack();

    const finishPromise = Promise.race([
        promisifyEvent(outStream, 'finish'),
        promisifyEvent(outStream, 'error'),
        promisifyEvent(pngStream, 'error')
    ]);

    pngStream.pipe(outStream);

    return finishPromise;
}


