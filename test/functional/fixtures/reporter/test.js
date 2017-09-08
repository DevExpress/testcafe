var expect = require('chai').expect;

describe('Reporter', function () {
    it('Should support several different reporters for a test run', function () {
        var data1   = '';
        var data2   = '';
        var stream1 = {
            write: function (data) {
                data1 += data;
            },

            end: function (data) {
                data1 += data;
            }
        };
        var stream2 = {
            write: function (data) {
                data2 += data;
            },

            end: function (data) {
                data2 += data;
            }
        };

        return runTests('testcafe-fixtures/index-test.js', 'Simple test', {
            only:      ['chrome'],
            reporters: [
                {
                    reporter:  'json',
                    outStream: stream1
                },
                {
                    reporter:  'list',
                    outStream: stream2
                }
            ]
        })
            .then(function () {
                expect(data1).to.contains('Chrome');
                expect(data1).to.contains('Reporter');
                expect(data1).to.contains('Simple test');
                expect(data2).to.contains('Chrome');
                expect(data2).to.contains('Reporter');
                expect(data2).to.contains('Simple test');
            });
    });
});
