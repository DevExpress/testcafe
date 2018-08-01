import path from 'path';
import globby from 'globby';
import { statSync } from 'fs';
import isGlob from 'is-glob';
import Compiler from '../compiler';
import { isEmpty } from 'lodash';

const DEFAULT_TEST_LOOKUP_DIRS = ['test/', 'tests/'];
const TEST_FILE_GLOB_PATTERN   = `./**/*@(${Compiler.getSupportedTestFileExtensions().join('|')})`;

function getDefaultDirs (cwd) {
    return globby.sync(DEFAULT_TEST_LOOKUP_DIRS, {
        cwd:             cwd,
        nocase:          true,
        onlyDirectories: true,
        onlyFiles:       false
    });
}

function convertDirsToGlobs (fileList, cwd) {
    return fileList.map(file => {
        if (!isGlob(file)) {
            const absPath = path.resolve(cwd, file);
            let fileStat  = null;

            try {
                fileStat = statSync(absPath);
            }
            catch (err) {
                return null;
            }

            if (fileStat.isDirectory())
                return path.join(file, TEST_FILE_GLOB_PATTERN);
        }

        return file;
    }).filter(file => !!file);
}

export default function parseFileList (fileList, cwd) {
    if (isEmpty(fileList))
        fileList = getDefaultDirs(cwd);

    fileList = convertDirsToGlobs(fileList, cwd);

    return globby
        .sync(fileList, { cwd: cwd })
        .map(file => path.resolve(cwd, file));
}
