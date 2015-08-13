var expect         = require('chai').expect;
var buildAssertion = require('../../../lib/formatters/base').buildAssertion;
var wrapSourceCode = require('../../../lib/formatters/base').wrapSourceCode;
var wrapCode       = require('../../../lib/formatters/base').wrapCode;
var wrapLink       = require('../../../lib/formatters/base').wrapLink;
var wrapStepName   = require('../../../lib/formatters/base').wrapStepName;
var AssertTypes    = require('../../../lib/formatters/consts').ASSERT_TYPES;
var ErrTypes       = require('../../../lib/formatters/consts').ERR_TYPES;

var MAX_STRING_LENGTH = 10;

describe('Base formatter', function () {
    it('.buildAssertion - ok', function (done) {
        var err      = {
            stepName:          'Step',
            relatedSourceCode: 'ok(false)',
            actual:            'false'
        };
        var expected = '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                       '<step-name>Step</step-name>: ' +
                       '<related-code>ok(false)</related-code>\n' +
                       '<expected>not <js>null</js>, not <js>undefined</js>, not <js>false</js>, ' +
                       'not <js>NaN</js> and not <js>\'\'</js></expected>\n' +
                       '<actual><js>false</js></actual>\n';

        expect(expected).eql(buildAssertion(err, AssertTypes.OK));
        done();
    });

    it('.buildAssertion - notOk', function (done) {
        var err      = {
            stepName:          'Step',
            relatedSourceCode: 'notOk("test")',
            actual:            '"test"'
        };
        var expected = '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                       '<step-name>Step</step-name>: ' +
                       '<related-code>notOk("test")</related-code>\n' +
                       '<expected><js>null</js>, <js>undefined</js>, <js>false</js>, ' +
                       '<js>NaN</js> or <js>\'\'</js></expected>\n' +
                       '<actual><js>"test"</js></actual>\n';

        expect(expected).eql(buildAssertion(err, AssertTypes.NOT_OK));
        done();
    });

    it('.buildAssertion - notEq', function (done) {
        var err      = {
            stepName:          'Step',
            relatedSourceCode: 'notEq("test", "test")',
            actual:            '"test"',
            expected:          '"test"'
        };
        var expected = '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                       '<step-name>Step</step-name>: ' +
                       '<related-code>notEq("test", "test")</related-code>\n' +
                       '<expected>not <js>"test"</js></expected>\n' +
                       '<actual><js>"test"</js></actual>\n';

        expect(expected).eql(buildAssertion(err, AssertTypes.NOT_EQ));
        done();
    });

    it('.buildAssertion - eq', function (done) {
        var errs = [
            {
                //different types
                stepName:          'Step',
                relatedSourceCode: 'eq("test", 123)',
                actual:            123,
                expected:          '"test"',
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq("test", 123)</related-code>\n' +
                                   '<expected><js>"test"</js></expected>\n' +
                                   '<actual><js>123</js></actual>\n'
            },
            {
                //numbers
                stepName:          'Step',
                relatedSourceCode: 'eq(12345, 54321)',
                actual:            '54321',
                expected:          '12345',
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq(12345, 54321)</related-code>\n' +
                                   '<expected><js>12345</js></expected>\n' +
                                   '<actual><js>54321</js></actual>\n'
            },
            {
                //string - string length less than max output length
                stepName:          'Step',
                relatedSourceCode: 'eq("00001000", "0000000")',
                actual:            '"0000000"',
                expected:          '"00001000"',
                isStrings:         true,
                key:               4,
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq("00001000", "0000000")</related-code>\n\n' +
                                   'Strings differ at index <js>4</js>:\n\n' +
                                   '<expected><js>"00001000"</js></expected>\n' +
                                   '<actual><js>"0000000"</js></actual>\n' +
                                   '<diff-marker>     ^</diff-marker>'
            },
            {
                //string - string more than max output length: diff in the begin
                stepName:          'Step',
                relatedSourceCode: 'eq("12345678901", "00000000000")',
                actual:            '"00000000000"',
                expected:          '"12345678901"',
                isStrings:         true,
                key:               0,
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq("12345678901", "00000000000")</related-code>\n\n' +
                                   'Strings differ at index <js>0</js>:\n\n' +
                                   '<expected><js>"1234567..."</js></expected>\n' +
                                   '<actual><js>"0000000..."</js></actual>\n' +
                                   '<diff-marker> ^</diff-marker>'
            },
            {
                //string - string more than max output length: diff in the end
                stepName:          'Step',
                relatedSourceCode: 'eq("00000000000", "00000000001")',
                actual:            '"00000000001"',
                expected:          '"00000000000"',
                isStrings:         true,
                key:               10,
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq("00000000000", "00000000001")</related-code>\n\n' +
                                   'Strings differ at index <js>10</js>:\n\n' +
                                   '<expected><js>"...0000000"</js></expected>\n' +
                                   '<actual><js>"...0000001"</js></actual>\n' +
                                   '<diff-marker>          ^</diff-marker>'
            },
            {
                //string - string more than max output length: diff in middle
                stepName:          'Step',
                relatedSourceCode: 'eq("00000000000", "00000000001")',
                actual:            '"0000001000000"',
                expected:          '"0000000000000"',
                isStrings:         true,
                key:               6,
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq("00000000000", "00000000001")</related-code>\n\n' +
                                   'Strings differ at index <js>6</js>:\n\n' +
                                   '<expected><js>"...0000..."</js></expected>\n' +
                                   '<actual><js>"...0100..."</js></actual>\n' +
                                   '<diff-marker>     ^</diff-marker>'
            },
            {
                //Regression - string - string with new line
                stepName:          'Step',
                relatedSourceCode: 'eq("00\n0001\n0", "00\n000000")',
                actual:            '"00\n0000100\n0"',
                expected:          '"00\n00000000"',
                isStrings:         true,
                key:               6,
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq("00\n0001\n0", "00\n000000")</related-code>\n\n' +
                                   'Strings differ at index <js>6</js>:\n\n' +
                                   '<expected><js>"...0000000"</js></expected>\n' +
                                   '<actual><js>"...0100\\n0"</js></actual>\n' +
                                   '<diff-marker>     ^</diff-marker>'
            },
            {
                //arrays - different types
                stepName:          'Step',
                relatedSourceCode: 'eq([1, "test"], [1, 123])',
                isArrays:          true,
                key:               1,
                actual:            123,
                expected:          '"test"',
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq([1, "test"], [1, 123])</related-code>\n\n' +
                                   'Arrays differ at index <js>1</js>:\n\n' +
                                   '<expected><diff-index>[1]: </diff-index><js>"test"</js></expected>\n' +
                                   '<actual><diff-index>[1]: </diff-index><js>123</js></actual>\n'
            },
            {
                //arrays - numbers
                stepName:          'Step',
                relatedSourceCode: 'eq([12345], [54321])',
                isArrays:          true,
                key:               0,
                actual:            '54321',
                expected:          '12345',
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq([12345], [54321])</related-code>\n\n' +
                                   'Arrays differ at index <js>0</js>:\n\n' +
                                   '<expected><diff-index>[0]: </diff-index><js>12345</js></expected>\n' +
                                   '<actual><diff-index>[0]: </diff-index><js>54321</js></actual>\n'
            },
            {
                //arrays - two strings - string length less than max output length
                stepName:          'Step',
                relatedSourceCode: 'eq(["01000"], ["0000"])',
                actual:            '"0000"',
                expected:          '"01000"',
                isArrays:          true,
                diffType:          { isStrings: true, diffIndex: 1 },
                key:               0,
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq(["01000"], ["0000"])</related-code>\n\n' +
                                   'Arrays differ at index <js>0</js>:\n\n' +
                                   '<expected><diff-index>[0]: </diff-index><js>"01000"</js></expected>\n' +
                                   '<actual><diff-index>[0]: </diff-index><js>"0000"</js></actual>\n' +
                                   '<diff-marker>       ^</diff-marker>'
            },
            {
                //arrays - two strings - string - string more than max output length: diff in the begin
                stepName:          'Step',
                relatedSourceCode: 'eq("12345678901", "00000000000")',
                actual:            '"00000000000"',
                expected:          '"12345678901"',
                isArrays:          true,
                diffType:          { isStrings: true, diffIndex: 0 },
                key:               0,
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq("12345678901", "00000000000")</related-code>\n\n' +
                                   'Arrays differ at index <js>0</js>:\n\n' +
                                   '<expected><diff-index>[0]: </diff-index><js>"12..."</js></expected>\n' +
                                   '<actual><diff-index>[0]: </diff-index><js>"00..."</js></actual>\n' +
                                   '<diff-marker>      ^</diff-marker>'
            },
            {
                //arrays - two strings - string - string more than max output length: diff in the end
                stepName:          'Step',
                relatedSourceCode: 'eq("00000000000", "00000000001")',
                actual:            '"00000000001"',
                expected:          '"00000000000"',
                isArrays:          true,
                diffType:          { isStrings: true, diffIndex: 10 },
                key:               0,
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq("00000000000", "00000000001")</related-code>\n\n' +
                                   'Arrays differ at index <js>0</js>:\n\n' +
                                   '<expected><diff-index>[0]: </diff-index><js>"...00"</js></expected>\n' +
                                   '<actual><diff-index>[0]: </diff-index><js>"...01"</js></actual>\n' +
                                   '<diff-marker>          ^</diff-marker>'
            },
            {
                //arrays - two objects
                stepName:          'Step',
                relatedSourceCode: 'eq([1, {t:1}], [1, {t:2}])',
                actual:            '{t:2}',
                expected:          '{t:1}',
                isArrays:          true,
                key:               1,
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq([1, {t:1}], [1, {t:2}])</related-code>\n\n' +
                                   'Arrays differ at index <js>1</js>:\n\n' +
                                   '<expected><diff-index>[1]: </diff-index><js>{t:1}</js></expected>\n' +
                                   '<actual><diff-index>[1]: </diff-index><js>{t:2}</js></actual>\n'
            },
            {
                //arrays - comparing values more than max string length
                stepName:          'Step',
                relatedSourceCode: 'eq([1, {t:"1111111111"}], [1, {t:"222222222222"}])',
                actual:            '{t:"222222222222"}',
                expected:          '{t:"1111111111"}',
                isArrays:          true,
                key:               0,
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq([1, {t:"1111111111"}], [1, {t:"222222222222"}])</related-code>\n\n' +
                                   'Arrays differ at index <js>0</js>:\n\n' +
                                   '<expected><diff-index>[0]: </diff-index><js>{t:"111...</js></expected>\n' +
                                   '<actual><diff-index>[0]: </diff-index><js>{t:"222...</js></actual>\n'
            },
            {
                //objects - nested objects - diff in elemental values
                stepName:          'Step',
                relatedSourceCode: 'eq({t:{a:1}}, {t:{a:2}})',
                actual:            '2',
                expected:          '1',
                isObjects:         true,
                key:               't.a',
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq({t:{a:1}}, {t:{a:2}})</related-code>\n\n' +
                                   'Objects differ at the <js>t.a</js> field:\n\n' +
                                   '<expected><js>1</js></expected>\n' +
                                   '<actual><js>2</js></actual>\n'
            },
            {
                //objects - nested object - diff in objects structure
                stepName:          'Step',
                relatedSourceCode: 'eq({t:{a:{b:1}}}, {t:{a:{c:2}}})',
                actual:            '{c:2}',
                expected:          '{b:1}',
                isObjects:         true,
                key:               't.a',
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq({t:{a:{b:1}}}, {t:{a:{c:2}}})</related-code>\n\n' +
                                   'Objects differ at the <js>t.a</js> field:\n\n' +
                                   '<expected><js>{b:1}</js></expected>\n' +
                                   '<actual><js>{c:2}</js></actual>\n'
            },
            {
                //objects - diff in arrays
                stepName:          'Step',
                relatedSourceCode: 'eq({t: [1, 2, 3]}}, {t: [1, 2, 4]})',
                actual:            '[1, 2, 4]',
                expected:          '[1, 2, 3]',
                isObjects:         true,
                key:               't',
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq({t: [1, 2, 3]}}, {t: [1, 2, 4]})</related-code>\n\n' +
                                   'Objects differ at the <js>t</js> field:\n\n' +
                                   '<expected><js>[1, 2, 3]</js></expected>\n' +
                                   '<actual><js>[1, 2, 4]</js></actual>\n'
            },
            {
                //objects - comparing values more than max string length
                stepName:          'Step',
                relatedSourceCode: 'eq({a: {b:"1111111111111111"}, {a: {c:"222222222222"}})',
                actual:            '{c:"222222222222"}',
                expected:          '{b:"1111111111111111"}',
                isObjects:         true,
                key:               'a.b',
                res:               '<err-type>' + ErrTypes.ASSERT_ERROR + '</err-type>Assertion failed at step ' +
                                   '<step-name>Step</step-name>: ' +
                                   '<related-code>eq({a: {b:"1111111111111111"}, {a: {c:"222222222222"}})</related-code>\n\n' +
                                   'Objects differ at the <js>a.b</js> field:\n\n' +
                                   '<expected><js>{b:"111...</js></expected>\n' +
                                   '<actual><js>{c:"222...</js></actual>\n'
            }
        ];

        Object.keys(errs).forEach(function (key) {
            var err = errs[key];

            expect(err.res).eql(buildAssertion(err, AssertTypes.EQ, MAX_STRING_LENGTH));
        });

        done();
    });

    it('.wrapSourceCode', function (done) {
        var code     = 'var a = 1;';
        var expected = '<related-code>var a = 1;</related-code>';

        expect(expected).eql(wrapSourceCode(code));
        done();
    });

    it('.wrapCode', function (done) {
        var code     = 'var a = 1;';
        var expected = '<js>var a = 1;</js>';

        expect(expected).eql(wrapCode(code));
        done();
    });

    it('.wrapLink', function (done) {
        var link     = 'http://localhost';
        var expected = '<link>http://localhost</link>';

        expect(expected).eql(wrapLink(link));
        done();
    });

    it('.wrapStepName', function (done) {
        var stepName = 'Step';
        var expected = '<step-name>Step</step-name>';

        expect(expected).eql(wrapStepName(stepName));
        done();
    });
});
