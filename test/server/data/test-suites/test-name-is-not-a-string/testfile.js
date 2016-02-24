fixture `Test name is not a string`;

// NOTE: we need to workaround the compiler's test file assertion
// (to treat a file as a test, it requires at least one fixture definition
//  with the string argument).
test('TheAnswer', () => {
});

test(42, () => {
});
