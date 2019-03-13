import { basename } from 'path';
import { inspect } from 'util';
import del from 'del';
import Promise from 'pinkie';
import { noop } from 'lodash';
import { killBrowserProcess } from '../../process';
import COMMANDS from './commands';


const DIRECTORIES_TO_CLEANUP = {};

async function performCleanup (tempDirInfo) {
    await killBrowserProcess(basename(tempDirInfo.path));
    await del(tempDirInfo.path);

    if (tempDirInfo.lockFilePath)
        await del(tempDirInfo.lockFilePath);
}

function addDirectory (path, lockFilePath) {
    if (!DIRECTORIES_TO_CLEANUP[path])
        DIRECTORIES_TO_CLEANUP[path] = { path, lockFilePath };
}

async function removeDirectory (path) {
    if (!DIRECTORIES_TO_CLEANUP[path])
        return;

    let delPromise = DIRECTORIES_TO_CLEANUP[path].delPromise;

    if (!delPromise) {
        delPromise = performCleanup(DIRECTORIES_TO_CLEANUP[path]);

        DIRECTORIES_TO_CLEANUP[path].delPromise = delPromise;
    }

    await DIRECTORIES_TO_CLEANUP[path].delPromise;

    delete DIRECTORIES_TO_CLEANUP[path].delPromise;
}

async function dispatchCommand (message) {
    switch (message.command) {
        case COMMANDS.init:
            return;
        case COMMANDS.add:
            addDirectory(message.path, message.lockFilePath);
            return;
        case COMMANDS.remove:
            addDirectory(message.path);
            await removeDirectory(message.path);
            return;
    }
}

process.on('message', async message => {
    let error = '';

    try {
        await dispatchCommand(message);
    }
    catch (e) {
        error = inspect(e);
    }

    process.send({ id: message.id, error });
});

process.on('disconnect', async () => {
    const removePromises = Object
        .keys(DIRECTORIES_TO_CLEANUP)
        .map(dirPath => removeDirectory(dirPath).catch(noop));

    await Promise.all(removePromises);

    process.exit(0); //eslint-disable-line no-process-exit
});
