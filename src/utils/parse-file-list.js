import path from 'path';
import globby from 'globby';
import isGlob from 'is-glob';
import Compiler from '../compiler';
import OS from 'os-family';
import { isEmpty, flatten } from 'lodash';
import { stat } from '../utils/promisified-functions';

const DEFAULT_TEST_LOOKUP_DIRS = ['test', 'tests'];
const TEST_FILE_GLOB_PATTERN   = `./**/*@(${Compiler.getSupportedTestFileExtensions().join('|')})`;
const GLOB_POSIX_SLASH_ENDING  = '*' + path.posix.sep;

function modifyFileRoot (baseDir, file) {
    const absPath            = path.resolve(baseDir, file);
    const fileIsOnOtherDrive = path.isAbsolute(path.relative(baseDir, file));

    if (!path.isAbsolute(file) || fileIsOnOtherDrive)
        return file;

    const { root, dir, base } = path.parse(absPath);

    return path.join(path.parse(baseDir).root, path.relative(root, dir), base);
}

async function getDefaultDirs (baseDir) {
    return await globby(DEFAULT_TEST_LOOKUP_DIRS, {
        cwd:                baseDir,
        absolute:           true,
        caseSensitiveMatch: false,
        expandDirectories:  false,
        onlyDirectories:    true,
        suppressErrors:     true
    });
}

// NOTE: glob patterns can only contain forward-slashes (https://github.com/sindresorhus/globby#api)
function ensurePosix (fileString) {
    return fileString.split(path.win32.sep).join(path.posix.sep);
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

            if (fileStat.isDirectory()) {
                file = path.join(file, TEST_FILE_GLOB_PATTERN);

                return ensurePosix(file);
            }

            if (OS.win)
                file = modifyFileRoot(baseDir, file);
        }
        // TODO: remove this workaround after resolving https://github.com/mrmlnc/fast-glob/issues/290
        else {
            file = ensurePosix(file);

            if (file.endsWith(GLOB_POSIX_SLASH_ENDING))
                return file.slice(0, -1);
        }

        return ensurePosix(file);
    }));

    return fileList.filter(file => !!file);
}

async function getFiles (globTask) {
    const files = await globby(globTask.pattern, globTask.options);

    return files.sort((fileA, fileB) => fileA.localeCompare(fileB));
}

async function execFileGlobs (globs, baseDir) {
    // NOTE: We have to create glob tasks, execute them and sort their results separately to preserve the same item order
    // as in the older globby versions (<7.1.1)
    const tasks = globby.generateGlobTasks(globs, { cwd: baseDir, expandDirectories: false, onlyFiles: true });
    const files = await Promise.all(tasks.map(getFiles));

    return flatten(files);
}

export default async function parseFileList (fileList, baseDir) {
    if (isEmpty(fileList))
        fileList = await getDefaultDirs(baseDir);

    fileList = await convertDirsToGlobs(fileList, baseDir);
    fileList = await execFileGlobs(fileList, baseDir);

    return fileList.map(file => path.resolve(baseDir, file));
}
