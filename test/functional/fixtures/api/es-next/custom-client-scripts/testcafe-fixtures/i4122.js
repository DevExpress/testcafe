import { ClientFunction } from 'testcafe';

fixture `Fixture`
    .clientScripts({ content: 'window["property1"] = true;' });

const getPropertyValue = ClientFunction(propName => window[propName]);

test('test', async t => {
    await t
        .expect(getPropertyValue('property1')).ok()
        .expect(getPropertyValue('property2')).ok();
}).clientScripts({ content: 'window["property2"] = true;' });
