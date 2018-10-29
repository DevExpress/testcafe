import childProcess from 'child_process';
import fs from 'graceful-fs';
import { lookup, kill } from './close-process';
import promisify from './promisify';


export const readDir    = promisify(fs.readdir);
export const stat       = promisify(fs.stat);
export const writeFile  = promisify(fs.writeFile);
export const readFile   = promisify(fs.readFile);
export const deleteFile = promisify(fs.unlink);

export const findProcess = promisify(lookup);
export const killProcess = promisify(kill);

export const exec = promisify(childProcess.exec);

export const sendMessageToChildProcess = promisify((process, ...args) => process.send(...args));
