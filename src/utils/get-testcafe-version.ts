import logEntry from './log-entry';
import debug from 'debug';

const LOGGER = debug('testcafe:version');

export function logTestCafeVersion (): void {
    logEntry(LOGGER, getTestCafeVersion());
}

export function getTestCafeVersion (): string {
    try {
        return require('../../package.json').version;
    }
    catch (err) {
        logEntry(LOGGER, err);

        return '';
    }
}
