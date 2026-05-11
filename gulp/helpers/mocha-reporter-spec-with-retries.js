const Mocha = require('mocha');

function formatMilliseconds (duration) {
    if (duration < 1000)
        return `${duration}ms`;

    return `${(duration / 1000).toFixed(2).replace(/\.?0+$/, '')}s`;
}

const {
    EVENT_RUN_BEGIN,
    EVENT_RUN_END,
    EVENT_SUITE_BEGIN,
    EVENT_SUITE_END,
    EVENT_TEST_FAIL,
    EVENT_TEST_PASS,
    EVENT_TEST_PENDING,
    EVENT_TEST_RETRY,
} = Mocha.Runner.constants;

const { inherits } = Mocha.utils;

const Base  = Mocha.reporters.Base;
const color = Base.color;

exports = module.exports = SpecWithRetries;

function SpecWithRetries (runner, options) {
    Base.call(this, runner, options);

    this.stats.unstables = [];

    const self = this;
    let indents = 0;
    let n       = 0;

    function indent () {
        return Array(indents).join('  ');
    }

    function groupBy (collection, predicate) {
        return collection.reduce((r, v, i, a, k = predicate(v)) => ((r[k] || (r[k] = [])).push(v), r), {}); // eslint-disable-line no-sequences
    }

    function epilogue () {
        const stats = this.stats;
        let fmt;

        Base.consoleLog();

        // passes
        fmt =
            color('bright pass', ' ') +
            color('green', ' %d passing') +
            color('light', ' (%s)');

        Base.consoleLog(fmt, stats.passes || 0, formatMilliseconds(stats.duration));

        // pending
        if (stats.pending) {
            fmt = color('pending', ' ') + color('pending', ' %d pending');

            Base.consoleLog(fmt, stats.pending);
        }

        // failures
        if (stats.failures) {
            fmt = color('fail', '  %d failing');

            Base.consoleLog(fmt, stats.failures);

            Base.list(this.failures);
        }

        // unstable tests
        if (stats.unstables.length) {
            Base.consoleLog();

            fmt = color('bright yellow', '  Unstable test(s):');

            Base.consoleLog(fmt);

            const groupedByFile = groupBy(stats.unstables, unstable => unstable.file);

            Object.entries(groupedByFile)
                .forEach(([key, value]) => {
                    Base.consoleLog(color('bright yellow', '    %s'), key);

                    value.forEach(unstableTest => {
                        Base.consoleLog(color('bright yellow', '      %s'), unstableTest.title);
                    });
                });
        }

        Base.consoleLog();
    }

    function findTestIndex (collection, test) {
        return collection.findIndex(item => {
            return item.file === test.file &&
                item.title === test.title;
        });
    }

    function isInUnstables (test) {
        return findTestIndex(this.stats.unstables, test) > -1;
    }

    runner.on(EVENT_RUN_BEGIN, function () {
        Base.consoleLog();
    });

    runner.on(EVENT_SUITE_BEGIN, function (suite) {
        ++indents;
        Base.consoleLog(color('suite', '%s%s'), indent(), suite.title);
    });

    runner.on(EVENT_SUITE_END, function () {
        --indents;
        if (indents === 1)
            Base.consoleLog();
    });

    runner.on(EVENT_TEST_PENDING, function (test) {
        const fmt = indent() + color('pending', '  - %s');

        Base.consoleLog(fmt, test.title);
    });

    runner.on(EVENT_TEST_PASS, function (test) {
        let fmt;

        if (test.speed === 'fast') {
            fmt =
                indent() +
                color('checkmark', '  ' + Base.symbols.ok) +
                color('pass', ' %s');
            Base.consoleLog(fmt, test.title);
        }
        else {
            fmt =
                indent() +
                color('checkmark', '  ' + Base.symbols.ok) +
                color('pass', ' %s') +
                color(test.speed, ' (%dms)');
            Base.consoleLog(fmt, test.title, test.duration);
        }
    });

    runner.on(EVENT_TEST_FAIL, function (test) {
        Base.consoleLog(indent() + color('fail', '  %d) %s'), ++n, test.title);

        const index = findTestIndex(self.stats.unstables, test);

        if (index > -1)
            self.stats.unstables.splice(index, 1);
    });

    runner.on(EVENT_TEST_RETRY, test => {
        if (!isInUnstables.call(self, test))
            self.stats.unstables.push(test);
    });

    runner.once(EVENT_RUN_END, () => {
        epilogue.call(self);
    });
}

inherits(SpecWithRetries, Base);

SpecWithRetries.description = 'hierarchical & verbose & displays retried tests';
