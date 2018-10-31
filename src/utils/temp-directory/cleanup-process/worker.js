import path from 'path';
import { inspect } from 'util';
import del from 'del';
import Promise from 'pinkie';
import { noop } from 'lodash';
import { killBrowserProcess } from '../../process';
import COMMANDS from './commands';


const DIRECTORIES_TO_CLEANUP = {};

function addDirectory (dirPath) {
    if (!DIRECTORIES_TO_CLEANUP[dirPath])
        DIRECTORIES_TO_CLEANUP[dirPath] = {};
}

async function removeDirectory (dirPath) {
    if (!DIRECTORIES_TO_CLEANUP[dirPath])
        return;

    let delPromise = DIRECTORIES_TO_CLEANUP[dirPath].delPromise;

    if (!delPromise) {
        delPromise = killBrowserProcess(path.basename(dirPath))
            .then(() => del(dirPath, { force: true }));

        DIRECTORIES_TO_CLEANUP[dirPath].delPromise = delPromise;
    }

    await DIRECTORIES_TO_CLEANUP[dirPath].delPromise;

    delete DIRECTORIES_TO_CLEANUP[dirPath].delPromise;
}

async function dispatchCommand (message) {
    switch (message.command) {
        case COMMANDS.init:
            return;
        case COMMANDS.add:
            addDirectory(message.path);
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
