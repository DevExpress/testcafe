const expect = require('chai').expect;

describe('[Regression](GH-4558)', () => {
    it('Should fail on click an element in invisible iframe', () => {
        return runTests('./testcafe-fixtures/index.js', 'Button click', { skip: ['ie'], shouldFail: true })
            .catch(err => {
                expect(err[0]).contains('The element: \'<button id="button" onclick="setSpanText()">OK</button>\' is outside the visible bounds of the document.');
            });
    });

    it('Should press key in iframe document', () => {
        return runTests('./testcafe-fixtures/index.js', 'Press key', { skip: ['ie'] });
    });

    it('Set files to upload and clear upload', () => {
        return runTests('./testcafe-fixtures/index.js', 'Set files to upload and clear upload', { skip: ['ie'] });
    });

    it('Dispatch a Click event', () => {
        return runTests('./testcafe-fixtures/index.js', 'Dispatch a Click event', { skip: ['ie'] });
    });

    it('Eval', () => {
        return runTests('./testcafe-fixtures/index.js', 'Eval', { skip: ['ie'] });
    });

    it('Set native dialog handler and get common dialog history', () => {
        return runTests('./testcafe-fixtures/index.js', 'Set native dialog handler and get common dialog history', { skip: ['ie'] });
    });

    it('Get browser console messages', () => {
        return runTests('./testcafe-fixtures/index.js', 'Get browser console messages', { skip: ['ie'] });
    });

    it('Switch to inner iframe', () => {
        return runTests('./testcafe-fixtures/index.js', 'Switch to inner iframe', { skip: ['ie'] });
    });

    it('Hidden by visibility style', () => {
        return runTests('./testcafe-fixtures/index.js', 'Hidden by visibility style', { skip: ['ie'], shouldFail: true })
            .catch(err => {
                expect(err[0]).contains('The element that matches the specified selector is not visible.');
            });
    });
});

