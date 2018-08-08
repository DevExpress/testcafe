import path from 'path';
import Promise from 'pinkie';
import globby from 'globby';
import isGlob from 'is-glob';
import Compiler from '../compiler';
import { isEmpty } from 'lodash';
import { stat } from '../utils/promisified-functions';

const DEFAULT_TEST_LOOKUP_DIRS = ['test/', 'tests/'];
const TEST_FILE_GLOB_PATTERN   = `./**/*@(${Compiler.getSupportedTestFileExtensions().join('|')})`;

async function getDefaultDirs (baseDir) {
    return await globby(DEFAULT_TEST_LOOKUP_DIRS, {
        cwd:             baseDir,
        nocase:          true,
        onlyDirectories: true,
        onlyFiles:       false
    });
}

async function convertDirsToGlobs (fileList, baseDir) {
    fileList = await Promise.all(fileList.map(async file => {
        if (!isGlob(file)) {
            const absPath = path.resolve(baseDir, file);
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

export default async function parseFileList (fileList, baseDir) {
    if (isEmpty(fileList))
        fileList = await getDefaultDirs(baseDir);

    fileList = await convertDirsToGlobs(fileList, baseDir);
    fileList = await globby(fileList, { cwd: baseDir });

    return fileList.map(file => path.resolve(baseDir, file));
}
