fixture.before('fixture4').page('http://testPage');
fixture.beforeEach('fixture4').page('http://testPage');
fixture.after('fixture4').page('http://testPage');
fixture.afterEach('fixture4').page('http://testPage');

test.before('fixture4test1', async t => {
});
test.after(`fixture4test2`, async t => {
});
test.after(`fixture4test3`, async t => {
});
