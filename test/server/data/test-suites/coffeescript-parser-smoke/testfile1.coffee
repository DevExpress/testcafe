getPageUrl = (index) ->
	"http://page/#{index}"

fixture('fixture 1').page getFixtureName(1)

doSmthg = (selector, t) ->
	await t.click selector

test 'test 1', (t) =>
	await doSmthg '#my-el', t

((fixtureName, testName) ->
	fixture(fixtureName).page 'http://myPage'
	test testName, (t) =>
) 'fixture 2', 'test 2'
