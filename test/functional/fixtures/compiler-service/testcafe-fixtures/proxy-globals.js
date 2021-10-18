import { Selector, ClientFunction } from 'testcafe';

fixture `Proxy globals`
    .page('http://localhost:3000/fixtures/compiler-service/pages/proxy-globals.html');

const getCounter = ClientFunction(() => window['counter']);

const INCREASE_COUNTER_STR = "window['counter'] = window['counter'] + 1 || 0";

test('Selector', async t => {
    const TARGET_NODE_COUNT = 3;

    const el = Selector('#root').find(node => {
        const isNonTextNode = node.nodeType !== Node.TEXT_NODE;

        if (isNonTextNode) {
            console.log(node); // eslint-disable-line no-console

            eval(INCREASE_COUNTER_STR); // eslint-disable-line no-eval
        }

        return isNonTextNode;
    }, { INCREASE_COUNTER_STR });

    await t.expect(el.count).eql(TARGET_NODE_COUNT);

    const { log } = await t.getBrowserConsoleMessages();

    await t
        .expect(log.length).eql(TARGET_NODE_COUNT)
        .expect(getCounter()).eql(TARGET_NODE_COUNT - 1);
});

test('ClientFunction', async t => {
    const testFn = ClientFunction(() => {
        console.log(document.getElementById('#root')); // eslint-disable-line no-console

        eval(INCREASE_COUNTER_STR); // eslint-disable-line no-eval
    }, { dependencies: { INCREASE_COUNTER_STR } });

    await testFn();

    const { log } = await t.getBrowserConsoleMessages();

    await t
        .expect(log.length).eql(1)
        .expect(getCounter()).eql(0);
});
