describe('Scroll', () => {
    it('Should raise events for scroll', () => {
        return runTests('./testcafe-fixtures/raise-events.js');
    });

    // NOTE: https://github.com/DevExpress/testcafe/issues/4157
    it('Events initiated by scroll should have valid properties', () => {
        return runTests('./testcafe-fixtures/event-properties.js', null, { skip: 'iphone,ipad' });
    });
});

describe('Scroll automations', () => {
    it('html', () => {
        return runTests('./testcafe-fixtures/scroll-automations.js', 'html');
    });

    it('el', () => {
        return runTests('./testcafe-fixtures/scroll-automations.js', 'el');
    });

    it('wait for deferred el', () => {
        return runTests('./testcafe-fixtures/scroll-automations.js', 'wait for deferred el', { selectorTimeout: 5000 });
    });

    it('position for html', () => {
        return runTests('./testcafe-fixtures/scroll-automations.js', 'position for html');
    });

    it('position for el', () => {
        return runTests('./testcafe-fixtures/scroll-automations.js', 'position for el');
    });

    it('scrollby html', () => {
        return runTests('./testcafe-fixtures/scroll-automations.js', 'scrollby html');
    });

    it('scrollby el', () => {
        return runTests('./testcafe-fixtures/scroll-automations.js', 'scrollby el');
    });

    it('scroll into view', () => {
        return runTests('./testcafe-fixtures/scroll-automations.js', 'scroll into view');
    });

    it('scroll/scrollby options', () => {
        return runTests('./testcafe-fixtures/scroll-automations.js', 'scroll/scrollby options');
    });
});
