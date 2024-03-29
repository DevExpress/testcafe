const expect = require('chai').expect;

describe('[Regression](GH-4558)', () => {
    it('Should fail on click an element in invisible iframe', () => {
        return runTests('./testcafe-fixtures/index.js', 'Button click', { shouldFail: true })
            .catch(err => {
                expect(err[0]).contains('The action target (<button id="button" onclick="setSpanText()">OK</button>) is located outside the the layout viewport.');
            });
    });

    it('Should press key in iframe document', () => {
        return runTests('./testcafe-fixtures/index.js', 'Press key');
    });

    it('Set files to upload and clear upload', () => {
        return runTests('./testcafe-fixtures/index.js', 'Set files to upload and clear upload');
    });

    it('Dispatch a Click event', () => {
        return runTests('./testcafe-fixtures/index.js', 'Dispatch a Click event');
    });

    it('Eval', () => {
        return runTests('./testcafe-fixtures/index.js', 'Eval');
    });

    it('Set native dialog handler and get common dialog history', () => {
        return runTests('./testcafe-fixtures/index.js', 'Set native dialog handler and get common dialog history');
    });

    it('Get browser console messages', () => {
        return runTests('./testcafe-fixtures/index.js', 'Get browser console messages');
    });

    it('Switch to inner iframe', () => {
        return runTests('./testcafe-fixtures/index.js', 'Switch to inner iframe');
    });

    it('Hidden by visibility style', () => {
        return runTests('./testcafe-fixtures/index.js', 'Hidden by visibility style', { shouldFail: true })
            .catch(err => {
                expect(err[0]).contains('The element that matches the specified selector is not visible.');
            });
    });
});

