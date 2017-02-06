fixture `fixture1`.skip;

test.before(async t => {

})
('fixture1test1', async t => {
}).after(async t => {

});


fixture.skip`fixture2`;

test`fixture2test1`.skip;
test.skip`fixture2test2`;

test(`fixture2test3`).skip;
test.skip('fixture2test4');
