import childProcess from 'child_process';
import fs from 'graceful-fs';
import { PNG } from 'pngjs';
import promisifyEvent from 'promisify-event';
import { promisify } from 'util';
import makeDir from 'make-dir';
import { dirname } from 'path';

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

export async function writePng (filePath, png) {
    await ensureDir(filePath);

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

async function ensureDir (filePath) {
    const dirName = dirname(filePath);

    try {
        await stat(dirName);
    }
    catch (err) {
        await makeDir(dirName);
    }
}
