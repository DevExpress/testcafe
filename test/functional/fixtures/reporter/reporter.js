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

function generateReport (log, emitOnStart, emitOnDone, includeBrowserInfo) {
    return function () {
        return Object.assign({}, baseReport, {
            async reportTestRunCommandStart (name, { browser }) {
                if (!emitOnStart)
                    return;

                const item = { action: 'start', name };

                if (includeBrowserInfo)
                    item.browser = browser.alias.split(':')[0];

                log.push(item);
            },

            async reportTestRunCommandDone (name, { command, errors }) {
                if (!emitOnDone)
                    return;

                const item = { name, action: 'done', command };

                if (errors && errors.length)
                    item.errors = errors.map(err => err.code);

                log.push(item);
            }
        });
    };
}

module.exports = generateReport;
