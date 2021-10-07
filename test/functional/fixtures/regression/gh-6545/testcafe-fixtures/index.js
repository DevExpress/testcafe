import { ClientFunction } from 'testcafe';

const getHasCorrectContextValue = ClientFunction(() => !!window.hasCorrectContext);

fixture `HTML elements inside an iframe must have HTMLElement and Object type of iframe window`
    .page `http://localhost:3000/fixtures/regression/gh-6545/pages/index.html`;

test(`Use Mutation observer in the parent window to observe the child window`, async t => {
    await t.switchToIframe('iframe');

    const hasCorrectContext = await getHasCorrectContextValue();

    await t.expect(hasCorrectContext).eql(true);
});
