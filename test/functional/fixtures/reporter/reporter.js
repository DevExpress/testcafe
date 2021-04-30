const baseReport = {
    async reportTaskStart () {
    },
    async reportFixtureStart () {
    },
    async reportTestDone () {
    },
    async reportTaskDone () {
    }
};

function generateReporter (log, options = {}) {
    const {
        emitOnStart = true,
        emitOnDone = true,
        includeBrowserInfo = false,
        includeTestInfo = false,
        includeCommandInfo = false
    } = options;

    return function () {
        return Object.assign({}, baseReport, {
            async reportTestActionStart (name, { browser, test, fixture, command }) {
                if (!emitOnStart)
                    return;

                const item = { action: 'start', name };

                if (includeBrowserInfo)
                    item.browser = browser.alias.split(':')[0];

                if (includeTestInfo) {
                    if (test.id) {
                        item.test = {
                            id:    'test-id',
                            name:  test.name,
                            phase: test.phase
                        };
                    }

                    if (fixture.id) {
                        item.fixture = {
                            id:   'fixture-id',
                            name: fixture.name
                        };
                    }
                }

                if (includeCommandInfo)
                    item.command = command;

                log.push(item);
            },

            async reportTestActionDone (name, { command, test, fixture, err }) {
                if (!emitOnDone)
                    return;

                if (command.selector)
                    command.selector = command.selector.expression;

                const item = { name, action: 'done', command };

                if (err)
                    item.err = err.code;

                if (includeTestInfo) {
                    if (test.id) {
                        item.test = {
                            id:    'test-id',
                            name:  test.name,
                            phase: test.phase
                        };
                    }

                    if (fixture.id) {
                        item.fixture = {
                            id:   'fixture-id',
                            name: fixture.name
                        };
                    }
                }

                log.push(item);
            }
        });
    };
}

module.exports = generateReporter;
