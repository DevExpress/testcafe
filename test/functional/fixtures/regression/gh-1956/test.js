const expect = require('chai').expect;

const browsersWithLimitations = [ 'ie', 'firefox', 'firefox-osx' ];

describe('Should support TextInput event[Regression](GH-1956)', function () {
    it('Prevent Input event on TextInput when type to input element', function () {
        return runTests('testcafe-fixtures/index.js',
            'Prevent Input event on TextInput when type to input element',
            { skip: browsersWithLimitations });
    });

    it('Prevent Input event on TextInput when type to input element IE11/Firefox', function () {
        return runTests('testcafe-fixtures/index.js',
            'Prevent Input event on TextInput when type to input element IE11/Firefox',
            { only: [ 'ie', 'firefox', 'firefox-osx' ], shouldFail: true })
            .catch(function (errs) {
                const errors = [ errs['ie'], errs['firefox'] ].filter(err => err);

                errors.forEach(err => {
                    expect(err[0]).contains('Input event has raised');
                });
            });
    });

    it('Prevent Input event on TextInput when type to ContentEditable div', function () {
        return runTests('testcafe-fixtures/index.js',
            'Prevent Input event on TextInput when type to ContentEditable div',
            { skip: browsersWithLimitations });
    });

    it('Prevent Input event on TextInput when type to ContentEditable div IE11', function () {
        return runTests('testcafe-fixtures/index.js',
            'Prevent Input event on TextInput when type to ContentEditable div IE11/Firefox',
            { only: [ 'ie' ] });
    });

    it('Prevent Input event on TextInput when type to ContentEditable div Firefox', function () {
        return runTests('testcafe-fixtures/index.js',
            'Prevent Input event on TextInput when type to ContentEditable div IE11/Firefox',
            { only: [ 'firefox', 'firefox-osx' ], shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('Input event has raised');
            });
    });

    it('Modify text node of ContentEditable div on TextInput event and prevent Input event', function () {
        return runTests('testcafe-fixtures/index.js',
            'Modify text node of ContentEditable div on TextInput event and prevent Input event',
            { skip: browsersWithLimitations });
    });

    it('Type to ContentEditable div when selected node was replaced on TextInput event', function () {
        return runTests('testcafe-fixtures/index.js',
            'Type to ContentEditable div when selected node was replaced on TextInput event',
            { skip: browsersWithLimitations });
    });

    it('Prevent Input event on TextInput when type to element node', function () {
        return runTests('testcafe-fixtures/index.js',
            'Prevent Input event on TextInput when type to element node',
            { skip: browsersWithLimitations });
    });
});
