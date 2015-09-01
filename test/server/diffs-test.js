var expect = require('chai').expect;
var buildDiff  = require('../../lib/test-error/diffs');

var MAX_STRING_LENGTH = 10;

describe('Diffs', function () {
    describe('Should format the assertion difference', function () {
        function compareDiff (err, expectedDiff) {
            var actualDiffs = buildDiff(err, MAX_STRING_LENGTH);

            expect(JSON.stringify(expectedDiff)).to.be.equal(JSON.stringify(actualDiffs));
        }

        it('different types', function () {
            var err = {
                expected: '"test"',
                actual:   123
            };

            var expectedDiff = {
                expected: '"test"',
                actual:   123,
                marker:   ''
            };

            compareDiff(err, expectedDiff);
        });

        it('numbers', function () {
            var err = {
                expected: '12345',
                actual:   '54321'
            };

            var expectedDiff = {
                expected: '12345',
                actual:   '54321',
                marker:   ''
            };

            compareDiff(err, expectedDiff);
        });

        it('truncate long values', function () {
            var err = {
                expected: '12345678910',
                actual:   '10987654321'
            };

            var expectedDiff = {
                expected: '1234567...',
                actual:   '1098765...',
                marker:   ''
            };

            compareDiff(err, expectedDiff);
        });

        it('string - at least one of string is empty', function () {
            var err = {
                expected:  '"str"',
                actual:    '""',
                isStrings: true,
                key:       0
            };

            var expectedDiff = {
                expected: '"str"',
                actual:   '""',
                marker:   ''
            };

            compareDiff(err, expectedDiff);
        });

        it('string - string length less than max output length', function () {
            var err = {
                expected:  '"00001000"',
                actual:    '"0000000"',
                isStrings: true,
                key:       4
            };

            var expectedDiff = {
                expected: '"00001000"',
                actual:   '"0000000"',
                marker:   '     ^'
            };

            compareDiff(err, expectedDiff);
        });

        it('string - string more than max output length: diff in the begin', function () {
            var err = {
                expected:  '"12345678901"',
                actual:    '"00000000000"',
                isStrings: true,
                key:       0
            };

            var expectedDiff = {
                expected: '"1234567..."',
                actual:   '"0000000..."',
                marker:   ' ^'
            };

            compareDiff(err, expectedDiff);
        });

        it('string - string more than max output length: diff in the end', function () {
            var err = {
                expected:  '"00000000000"',
                actual:    '"00000000001"',
                isStrings: true,
                key:       10
            };

            var expectedDiff = {
                expected: '"...0000000"',
                actual:   '"...0000001"',
                marker:   '          ^'
            };

            compareDiff(err, expectedDiff);
        });

        it('string - string more than max output length: diff in middle', function () {
            var err = {
                actual:    '"0000001000000"',
                expected:  '"0000000000000"',
                isStrings: true,
                key:       6
            };

            var expectedDiff = {
                expected: '"...0000..."',
                actual:   '"...0010..."',
                marker:   '      ^'
            };

            compareDiff(err, expectedDiff);
        });

        it('string - string with new line', function () {
            var err = {
                actual:    '"00\n000010\n0"',
                expected:  '"00\n0000000"',
                isStrings: true,
                key:       6
            };

            var expectedDiff = {
                expected: '"...0000000"',
                actual:   '"...0010\\n0"',
                marker:   '      ^'
            };

            compareDiff(err, expectedDiff);
        });

        it('arrays - different types', function () {
            var err = {
                isArrays: true,
                key:      1,
                expected: '"txt"',
                actual:   '123'
            };

            var expectedDiff = {
                expected: '[1]: "txt"',
                actual:   '[1]: 123',
                marker:   ''
            };

            compareDiff(err, expectedDiff);
        });

        it('arrays - numbers', function () {
            var err = {
                isArrays: true,
                key:      0,
                expected: '12345',
                actual:   '54321'
            };

            var expectedDiff = {
                expected: '[0]: 12345',
                actual:   '[0]: 54321',
                marker:   ''
            };

            compareDiff(err, expectedDiff);
        });

        it('arrays - two strings - string length less than max output length', function () {
            var err = {
                expected: '"01000"',
                actual:   '"0000"',
                isArrays: true,
                key:      0,
                diffType: {
                    isStrings: true,
                    diffIndex: 1
                }
            };

            var expectedDiff = {
                expected: '[0]: "01000"',
                actual:   '[0]: "0000"',
                marker:   '       ^'
            };

            compareDiff(err, expectedDiff);
        });

        it('arrays - two strings - string - string more than max output length: diff in the begin', function () {
            var err = {
                expected: '"12345678901"',
                actual:   '"00000000000"',
                key:      0,
                isArrays: true,
                diffType: {
                    isStrings: true,
                    diffIndex: 0
                }
            };

            var expectedDiff = {
                expected: '[0]: "12..."',
                actual:   '[0]: "00..."',
                marker:   '      ^'
            };

            compareDiff(err, expectedDiff);
        });

        it('arrays - two strings - string - string more than max output length: diff in the end', function () {
            var err = {
                expected: '"00000000000"',
                actual:   '"00000000001"',
                isArrays: true,
                key:      0,
                diffType: {
                    isStrings: true,
                    diffIndex: 10
                }
            };

            var expectedDiff = {
                expected: '[0]: "...00"',
                actual:   '[0]: "...01"',
                marker:   '          ^'
            };

            compareDiff(err, expectedDiff);
        });

        it('arrays - two objects', function () {
            var err = {
                expected: '{t:1}',
                actual:   '{t:2}',
                isArrays: true,
                key:      1
            };

            var expectedDiff = {
                expected: '[1]: {t:1}',
                actual:   '[1]: {t:2}',
                marker:   ''
            };

            compareDiff(err, expectedDiff);
        });

        it('arrays - comparing values more than max string length', function () {
            var err = {
                expected: '{t:"1111111111"}',
                actual:   '{t:"222222222222"}',
                isArrays: true,
                key:      0
            };

            var expectedDiff = {
                expected: '[0]: {t...',
                actual:   '[0]: {t...',
                marker:   ''
            };

            compareDiff(err, expectedDiff);
        });

        it('objects - nested objects - diff in elemental values', function () {
            var err = {
                expected:  '1',
                actual:    '2',
                isObjects: true,
                key:       't.a'
            };

            var expectedDiff = {
                expected: '1',
                actual:   '2',
                marker:   ''
            };

            compareDiff(err, expectedDiff);
        });

        it('objects - nested object - diff in objects structure', function () {
            var err = {
                expected:  '{b:1}',
                actual:    '{c:2}',
                isObjects: true,
                key:       't.a'
            };

            var expectedDiff = {
                expected: '{b:1}',
                actual:   '{c:2}',
                marker:   ''
            };

            compareDiff(err, expectedDiff);
        });

        it('objects - diff in arrays', function () {
            var err = {
                expected:  '[1, 2, 3]',
                actual:    '[1, 2, 4]',
                isObjects: true,
                key:       't'
            };

            var expectedDiff = {
                expected: '[1, 2, 3]',
                actual:   '[1, 2, 4]',
                marker:   ''
            };

            compareDiff(err, expectedDiff);
        });

        it('objects - comparing values more than max string length', function () {
            var err = {
                expected:  '{b:"1111111111111111"}',
                actual:    '{c:"222222222222"}',
                isObjects: true,
                key:       'a.b'
            };

            var expectedDiff = {
                expected: '{b:"111...',
                actual:   '{c:"222...',
                marker:   ''
            };

            compareDiff(err, expectedDiff);
        });
    });
});
