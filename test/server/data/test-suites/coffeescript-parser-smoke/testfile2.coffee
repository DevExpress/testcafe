fixture('fixture 1').page 'https://page'

test.before((t) =>
	await t.wait 1
) 'test 1'
