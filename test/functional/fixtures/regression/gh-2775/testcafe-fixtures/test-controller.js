fixture`TestController method`
    .page('http://localhost:3000/fixtures/regression/gh-2775/pages/index.html');

const clientErrorMessage = 'Custom client error';

test('Should skip JS errors with boolean param', async t => {
    await t.skipJsErrors(true);
    await t.click('button');
});

test('Should skip JS errors with only message param', async t => {
    await t.skipJsErrors({ message: clientErrorMessage });
    await t.click('button');
});

test('Should skip JS errors with multiple options', async t => {
    await t.skipJsErrors({
        message: clientErrorMessage,
        pageUrl: 'http://localhost:3000/fixtures/regression/gh-2775/pages/index.html'
    });
    await t.click('button');
});

test('Should skip JS errors with callback function', async t => {
    await t.skipJsErrors(({ message, pageUrl }) =>
        message.includes('Custom client error')
        && pageUrl === 'http://localhost:3000/fixtures/regression/gh-2775/pages/index.html'
    );

    await t.click('button');
});

test('Should skip JS errors with callback function with dependencies', async t => {
    const deps = {
        expectedMessage: 'Custom client error',
        expectedPageUrl: 'http://localhost:3000/fixtures/regression/gh-2775/pages/index.html'
    }

    await t.skipJsErrors(({ message, pageUrl }) => {
        return message.includes(expectedMessage) && pageUrl === expectedPageUrl;
    }, deps);

    await t.click('button');
});

test('Should fail due to incorrect message option', async t => {
    await t.skipJsErrors({ message: 'Incorrect message' })
    await t.click('button');
});

test('Should fail if at least one option is incorrect', async t => {
    await t.skipJsErrors({ message: clientErrorMessage, pageUrl: 'incorrect page url' })
    await t.click('button');
});

test('Should fail with callback function', async t => {
    await t.skipJsErrors(({ message, pageUrl }) =>
            message === clientErrorMessage
            && pageUrl === 'incorrect url',
        { clientErrorMessage });
    await t.click('button');
});


test.only.page('../pages/index.html')('Should drop the test due to error in callback function', async t => {

    await t.skipJsErrors(({ message }) =>
        message === clientErrorMessage.r);
    await t.click('button');
});
