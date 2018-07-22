import 'testcafe'

fixture 'CoffeeScript callsites'

doSmthg = (selector, t) -> await t.click selector

test 'Test', (t) =>
    await doSmthg '#heyheyhey', t
