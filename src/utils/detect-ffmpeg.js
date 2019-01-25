import { isWin } from 'os-family';
import resolveCwd from 'resolve-cwd';
import { exec } from './promisified-functions';

const FFMPEG_MODULE_NAME    = '@ffmpeg-installer/ffmpeg';
const FFMPEG_SEARCH_COMMAND = isWin ? 'where' : 'which';
const FFMPEG_BINARY_NAME    = 'ffmpeg';

async function findFFMPEGinPath () {
    try {
        const ffmpegPath = await exec(`${FFMPEG_SEARCH_COMMAND} ${FFMPEG_BINARY_NAME}`);

        return ffmpegPath.trim();
    }
    catch (e) {
        return '';
    }
}

async function requireFFMPEGModuleFromCwd () {
    try {
        const ffmpegModulePath = resolveCwd(FFMPEG_MODULE_NAME);

        return require(ffmpegModulePath).path;
    }
    catch (e) {
        return '';
    }
}

async function requireFFMPEGModule () {
    try {
        return require(FFMPEG_MODULE_NAME).path;
    }
    catch (e) {
        return '';
    }
}

export default async function () {
    return process.env.FFMPEG_PATH ||
        await requireFFMPEGModuleFromCwd() ||
        await requireFFMPEGModule() ||
        await findFFMPEGinPath();
}
