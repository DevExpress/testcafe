interface Fixture {
    page(string): any;
}

interface Test {
    before(any): any;
}

<Fixture>fixture('fixture 1').page('https://page');

<Test>test.before(async(t: TestController) => {
    await t.wait(1);
})('test 1');
