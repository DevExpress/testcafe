import debugLogger from 'debug';
import indentString from 'indent-string';

export default class TestRunDebugLog {
    constructor (userAgent) {
        this.driverMessageLogger = debugLogger(`testcafe:test-run:${userAgent}:driver-message`);
        this.commandLogger       = debugLogger(`testcafe:test-run:${userAgent}:command`);
    }

    static _addEntry (logger, data) {
        var entry = data ?
            indentString(`\n${JSON.stringify(data, null, 2)}\n`, ' ', 4) :
            '';

        logger(entry);
    }

    driverMessage (msg) {
        TestRunDebugLog._addEntry(this.driverMessageLogger, msg);
    }

    command (cmd) {
        TestRunDebugLog._addEntry(this.commandLogger, cmd);
    }
}
