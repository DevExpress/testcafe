fixture('Fixture1')
    .meta('metaField1', 'fixtureMetaValue1')
    .page('http://example.com')
    .meta({ metaField2: 'fixtureMetaValue2', metaField3: 'fixtureMetaValue3' })
    .meta('metaField2', 'fixtureMetaUpdatedValue2');

test
    .meta('metaField1', 'testMetaValue1')
    ('Fixture1Test1', async () => {
        // do nothing
    })
    .meta({ metaField4: 'testMetaValue4', metaField5: 'testMetaValue5' })
    .meta('metaField4', 'testMetaUpdatedValue4');

fixture('Fixture2')
    .meta('emptyField');

test('Fixture2Test1', async () => {
    // do nothing
}).meta('emptyField');