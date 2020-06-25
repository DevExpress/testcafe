const { expect }         = require('chai');
const { createReporter } = require('../../../utils/reporter');

function timeout (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let startedReportTaskCount  = 0;
let finishedReportTaskCount = 0;


const getReporter = function (delay) {
    return {
        name: createReporter({
            reportTaskDone: async () => {
                startedReportTaskCount++;

                await timeout(delay);

                finishedReportTaskCount++;
            }
        }),
        output: {
            write: () => {
            },
            end: () => {
            }
        }
    };
};

describe('[Regression](GH-3835) - Should not stop while async report methods are executiing', function () {
    const reporters = [ getReporter(1), getReporter(500), getReporter(1000) ];

    it('Click on hidden element recreated on timeout', function () {
        return runTests('testcafe-fixtures/index.js', null, { reporter: reporters })
            .then(() => {
                expect(finishedReportTaskCount).eql(startedReportTaskCount);
                expect(finishedReportTaskCount).eql(reporters.length);
            });
    });
});


