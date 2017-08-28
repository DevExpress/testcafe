function getPageUrl(index: number) {
	return `http://page/${index}`;
}

fixture(<string>'fixture 1').page(<string>getFixtureName(1));

async function doSmthg(selector: string, t: any): Promise<any> { await (<TestController>t).click(selector); }

test('test 1', async(t: TestController) => {
    await doSmthg('#my-el', t);
});

(function(fixtureName: string, testName: string) {
	fixture(fixtureName).page('http://myPage');
	test(testName, async t => {
	});
})('fixture 2', 'test 2');
