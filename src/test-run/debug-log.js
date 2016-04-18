import debugLogger from 'debug';

export default class TestRunDebugLog {
    constructor (userAgent) {
        this.driverMessageLogger = debugLogger(`testcafe:test-run:${userAgent}:driver-message`);
        this.commandLogger       = debugLogger(`testcafe:test-run:${userAgent}:command`);
        this.errorLogger         = debugLogger(`testcafe:test-run:${userAgent}:error`);
    }

    driverMessage (msg) {
        this.driverMessageLogger(JSON.stringify(msg, null, 2));
    }

    command (cmd) {
        this.commandLogger(JSON.stringify(cmd, null, 2));
    }

    error (err) {
        this.errorLogger(JSON.stringify(err, null, 2));
    }
}
