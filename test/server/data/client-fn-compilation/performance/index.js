import { Selector } from 'testcafe';

const selectors = [];

for (let i = 0; i < 300; i++) {
    const str = i.toString();

    selectors.push(Selector(str).withAttribute(str).find(str));
}

fixture ('Fixture');

test('test', async t => { });
