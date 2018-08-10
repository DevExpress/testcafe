import 'testcafe'
import dep1Fn from './dep1'

fixture 'Fixture1'

test 'Fixture1Test1', =>
    res = await dep1Fn()
    "F1T1: #{res}"

test2Name = 'Fixture1Test2'

test test2Name, =>
    'F1T2'

fixture "Fixture#{1 + 1}"
    .page 'http://example.org'
    .beforeEach => 'yo'
    .afterEach => 'yo'

test 'Fixture2Test1', =>
    'F2T1'
