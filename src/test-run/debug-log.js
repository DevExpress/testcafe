import debugLogger from 'debug';
import logEntry from '../utils/log-entry';

export default class TestRunDebugLog {
    constructor (userAgent) {
        this.driverMessageLogger = debugLogger(`testcafe:test-run:${userAgent}:driver-message`);
        this.commandLogger       = debugLogger(`testcafe:test-run:${userAgent}:command`);
    }

    static _addEntry (logger, data) {
        logEntry(logger, data);
    }

    driverMessage (msg) {
        TestRunDebugLog._addEntry(this.driverMessageLogger, msg);
    }

    command (cmd) {
        TestRunDebugLog._addEntry(this.commandLogger, cmd);
    }
}
