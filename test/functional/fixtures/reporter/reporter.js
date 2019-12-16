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

function generateReport (log, emitOnStart, emitOnDone, includeBrowserInfo, includeTestInfo) {
    return function () {
        return Object.assign({}, baseReport, {
            async reportTestActionStart (name, { browser, test }) {
                if (!emitOnStart)
                    return;

                const item = { action: 'start', name };

                if (includeBrowserInfo)
                    item.browser = browser.alias.split(':')[0];

                if (includeTestInfo)
                    item.test = test;

                log.push(item);
            },

            async reportTestActionDone (name, { command, test, errors }) {
                if (!emitOnDone)
                    return;

                const item = { name, action: 'done', command };

                if (errors && errors.length)
                    item.errors = errors.map(err => err.code);

                if (includeTestInfo)
                    item.test = test;

                log.push(item);
            }
        });
    };
}

module.exports = generateReport;
