var expect = require('chai').expect;
var formatPlainText = require('../../../lib/formatters/plain-text').formatPlainText;

describe('Plain text formatter', function () {
    it('.formatPlainText', function (done) {
        var testData = [
            {
                msg: '<step-name>Step</step-name>',
                expected: '"Step"'
            },
            {
                msg: '<diff-marker>^</diff-marker>',
                expected: '          ^'
            },
            {
                msg: '<related-code>ok(true)</related-code>',
                expected: 'ok(true)'
            },
            {
                msg: '<expected>value</expected>',
                expected: 'Expected: value'
            },
            {
                msg: '<actual>value</actual>',
                expected: 'Actual:   value'
            },
            {
                msg: 'test\n\ntest\ntest',
                expected: 'test\ntest\ntest'
            },
            {
                msg: '<err-type>type</err-type>',
                expected: ''
            },
            {
                msg: '<diff-index>0</diff-index>',
                expected: ''
            },
            {
                msg: '<div>some html</div>',
                expected: '<div>some html</div>'
            },
            {
                msg: '<js>var a = 1</js>',
                expected: 'var a = 1'
            },
            {
                msg: '<link>http://localhost</link>',
                expected: 'http://localhost'
            }
        ];

        testData.forEach(function (testCase) {
            expect(testCase.expected).eql(formatPlainText(testCase.msg));
        });

        done();
    });
});
