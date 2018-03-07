import { Selector } from 'testcafe';

fixture `Selector`
    .page `http://localhost:3000/fixtures/api/es-next/selector/pages/index.html`;

test('Error in code', async () => {
    const selector = Selector(() => {
        throw new Error('Hey ya!');
    });

    await selector();
});

test('Return non-DOM node', async () => {
    await Selector(() => 'hey')();
});

test('Selector fn is not a function or string', async () => {
    await Selector(123)();
});

test("Snapshot property shorthand - selector doesn't match any element", async () => {
    await Selector('#someUnknownElement').tagName;
});

test("Snapshot shorthand method - selector doesn't match any element", async () => {
    await Selector('#someUnknownElement').getStyleProperty('width');
});

test('Snapshot property shorthand - selector error', async () => {
    await Selector(() => [].someUndefMethod()).nodeType;
});

test('Snapshot shorthand method - selector error', async () => {
    await Selector(() => [].someUndefMethod()).hasClass('yo');
});

test('Snapshot "count" property - selector error', async () => {
    await Selector(() => [].someUndefMethod()).count;
});

test('Snapshot "exists" property - selector error', async () => {
    await Selector(() => [].someUndefMethod()).exists;
});

test('Add custom DOM properties method - property throws an error', async () => {
    const el = Selector('rect').addCustomDOMProperties({
        prop: () => {
            throw new Error('test');
        }
    });

    await el();
});

test('Add custom method - method throws an error', async () => {
    const el = Selector('rect').addCustomMethods({
        customMethod: () => {
            throw new Error('test');
        }
    });

    await el.customMethod();
});

test('Add custom method - method throws an error - Selector mode', async () => {
    const el = Selector('rect').addCustomMethods({
        customMethod: () => {
            throw new Error('test');
        }
    }, { returnDOMNodes: true });

    await el.customMethod()();
});
