import childProcess from 'child_process';
import fs from 'graceful-fs';
import mkdirp from 'mkdirp';
import psNode from 'ps-node';
import promisify from './promisify';


export const ensureDir  = promisify(mkdirp);
export const stat       = promisify(fs.stat);
export const writeFile  = promisify(fs.writeFile);
export const readFile   = promisify(fs.readFile);
export const deleteFile = promisify(fs.unlink);

export const findProcess = promisify(psNode.lookup);
export const killProcess = promisify(psNode.kill);

export const exec = promisify(childProcess.exec);
