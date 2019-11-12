const expect = require('chai').expect;
const actual = require('./actual').actual;

const expected = [
    '1 begin before',
    '1 end before',
    '1',
    '1 begin after',
    '1 end after',
    '2 begin before',
    '2 end before',
    '2',
    '2 begin after',
    '2 end after'
];

describe('[Regression](GH-3298) - Fixture hooks of subsequent tests should not overlap each other', function () {
    it('Run two tests with fixture hooks in sequence', function () {
        return runTests('testcafe-fixtures/index.js', null, { only: ['chrome'] })
            .then(() => {
                expect(actual).eql(expected);
            });
    });
});


