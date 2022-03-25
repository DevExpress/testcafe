import { Request, RequestMock } from 'testcafe';

const mock = RequestMock()
    .onRequest({
        url:    'https://devexpress.github.io/testcafe/example/data/json',
        method: 'GET',
    })
    .respond({
        name:     'John Hearts',
        position: 'CTO',
    }, 200, { 'access-control-allow-origin': '*' })
    .onRequest({
        url:    'https://devexpress.github.io/testcafe/example/data/json',
        method: 'POST',
    })
    .respond({
        status: 'OK',
    }, 200, { 'access-control-allow-origin': '*' });

fixture`Request`
    .requestHooks(mock);

test('Should execute GET request', async (t) => {
    const data = await Request('https://devexpress.github.io/testcafe/example/data/json');

    await t.expect(data.body).eql({
        name:     'John Hearts',
        position: 'CTO',
    });
});

test('Should execute POST request', async (t) => {
    const options = {
        method: 'POST',
        body:   {
            name:     'John Hearts',
            position: 'CTO',
        },
    };

    const data = await Request('https://devexpress.github.io/testcafe/example/data/json', options);

    await t.expect(data.body).eql({
        status: 'OK',
    });
});

//TODO: added tests:
// 1) Requests with the additional methods get, post, delete, put, patch, head, options
// 2) Requests in assertions
// 3) Check full response in tests
// 4) Check bodies with the types: json, text, buffer, httpOutgoingMessage
// 5) Requests with relative paths
// 6) Requests with params
// 7) Requests with timeout
// 8) Requests withCredentials
// 9) Requests with auth
// 10) Requests with maxRedirects
// 11) Requests with proxy
