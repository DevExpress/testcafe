describe('[Regression](GH-6949)', () => {
    it('Should change checkbox state when clicking checkbox label', () => {
        return runTests('./testcafe-fixtures/with-link.js', 'Click checkbox label');
    });

    it('Should NOT change checkbox state when clicking a LINK inside the checkbox label', () => {
        return runTests('./testcafe-fixtures/with-link.js', 'Click link inside checkbox label');
    });

    it('Should change checkbox state when clicking a LINK without href attribute inside the checkbox label', () => {
        //The behaviour in IE is different, so we should to exclude it from this test:
        return runTests('./testcafe-fixtures/with-link-without-href.js', 'Click link without href inside checkbox label', { skip: 'ie' });
    });

    it('Should NOT change checkbox state when clicking a BUTTON inside the checkbox label', () => {
        //The behaviour in IE is different, so we should to exclude it from this test:
        return runTests('./testcafe-fixtures/with-button.js', 'Click button inside checkbox label', { skip: 'ie' });
    });

    it('Should change checkbox state when clicking a DIV with onclick handler inside the checkbox label', () => {
        return runTests('./testcafe-fixtures/with-div.js', 'Click div inside checkbox label');
    });

    it('Should NOT change checkbox state when clicking the label of the disabled checkbox', () => {
        return runTests('./testcafe-fixtures/with-disabled-checkbox.js', 'Click disabled checkbox label');
    });
});
