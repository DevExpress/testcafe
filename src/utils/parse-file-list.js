import path from 'path';
import Promise from 'pinkie';
import globby from 'globby';
import isGlob from 'is-glob';
import Compiler from '../compiler';
import { isEmpty } from 'lodash';
import { stat } from '../utils/promisified-functions';

const DEFAULT_TEST_LOOKUP_DIRS = ['test/', 'tests/'];
const TEST_FILE_GLOB_PATTERN   = `./**/*@(${Compiler.getSupportedTestFileExtensions().join('|')})`;

async function getDefaultDirs (cwd) {
    return await globby(DEFAULT_TEST_LOOKUP_DIRS, {
        cwd:             cwd,
        nocase:          true,
        onlyDirectories: true,
        onlyFiles:       false
    });
}

async function convertDirsToGlobs (fileList, cwd) {
    fileList = await Promise.all(fileList.map(async file => {
        if (!isGlob(file)) {
            const absPath = path.resolve(cwd, file);
            let fileStat  = null;

            try {
                fileStat = await stat(absPath);
            }
            catch (err) {
                return null;
            }

            if (fileStat.isDirectory())
                return path.join(file, TEST_FILE_GLOB_PATTERN);
        }

        return file;
    }));

    return fileList.filter(file => !!file);
}

export default async function parseFileList (fileList, cwd) {
    if (isEmpty(fileList))
        fileList = await getDefaultDirs(cwd);

    fileList = await convertDirsToGlobs(fileList, cwd);
    fileList = await globby(fileList, { cwd: cwd });

    return fileList.map(file => path.resolve(cwd, file));
}
