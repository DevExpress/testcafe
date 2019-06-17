describe('Scroll', () => {
    it('Should raise events for scroll', () => {
        return runTests('./testcafe-fixtures/raise-events.js', null);
    });

    it('Events initiated by scroll should have valid properties', () => {
        return runTests('./testcafe-fixtures/event-properties.js', null);
    });
});
