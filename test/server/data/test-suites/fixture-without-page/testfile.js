fixture `Without page`;

test('Test1', () => {
    return 'no page';
});
test.page('./index.html')('Test2', () => {
    return 'no page';
});
