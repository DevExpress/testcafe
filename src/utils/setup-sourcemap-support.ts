import { Dictionary } from 'lodash';
import sourceMapSupport from 'source-map-support';

const fileContentsCache: Dictionary<string> = {};

function retrieveFile (fileName: string): string {
    return fileContentsCache[fileName];
}

function setupSourceMapSupport (): void {
    sourceMapSupport.install({
        hookRequire:              true,
        handleUncaughtExceptions: false,
        environment:              'node',
        retrieveFile,
    });
}

export { setupSourceMapSupport, fileContentsCache };
