import 'testcafe'
import dep2Fn from './dep2'

fixture 'Fixture3'
    .page 'https://example.com'
    .afterEach => 'yo'
    .beforeEach => 'yo'

fixture3Name = 'Fixture3Test1'

test fixture3Name, =>
    res = await dep2Fn()
    "F3T1: #{res}"
