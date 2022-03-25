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
        message: 'Data was posted',
    }, 200, { 'access-control-allow-origin': '*' })
    .onRequest({
        url:    'https://devexpress.github.io/testcafe/example/data/json',
        method: 'DELETE',
    })
    .respond({
        message: 'Data was deleted',
    }, 200, { 'access-control-allow-origin': '*' })
    .onRequest({
        url:    'https://devexpress.github.io/testcafe/example/data/json',
        method: 'PUT',
    })
    .respond({
        message: 'Data was putted',
    }, 200, { 'access-control-allow-origin': '*' })
    .onRequest({
        url:    'https://devexpress.github.io/testcafe/example/data/json',
        method: 'PATCH',
    })
    .respond({
        message: 'Data was patched',
    }, 200, { 'access-control-allow-origin': '*' })
    .onRequest({
        url:    'https://devexpress.github.io/testcafe/example/data/json',
        method: 'HEAD',
    })
    .respond(null, 200, { 'access-control-allow-origin': '*' });

fixture`Request`
    .requestHooks(mock);

test('Should execute a GET request', async (t) => {
    const expected = {
        status:     200,
        statusText: 'OK',
        headers:    {},
        body:       {
            name:     'John Hearts',
            position: 'CTO',
        },
    };

    const data = await Request('https://devexpress.github.io/testcafe/example/data/json');

    await t.expect(data.body).eql(expected);
});

test('Should execute a POST request', async (t) => {
    const options = {
        method: 'POST',
        body:   {
            name:     'John Hearts',
            position: 'CTO',
        },
    };

    const data = await Request('https://devexpress.github.io/testcafe/example/data/json', options);

    await t.expect(data.body).eql({
        message: 'Data was posted',
    });
});

test('Should execute a request with method get', async (t) => {
    const data = await Request.get('https://devexpress.github.io/testcafe/example/data/json');

    await t.expect(data.body).eql({
        name:     'John Hearts',
        position: 'CTO',
    });
});

test('Should execute a request with method post', async (t) => {
    const options = {
        body: {
            name:     'John Hearts',
            position: 'CTO',
        },
    };

    const data = await Request.post('https://devexpress.github.io/testcafe/example/data/json', options);

    await t.expect(data.body).eql({
        message: 'Data was posted',
    });
});

test('Should execute a request with method delete', async (t) => {
    const options = {
        body: {
            name:     'John Hearts',
            position: 'CTO',
        },
    };

    const data = await Request.delete('https://devexpress.github.io/testcafe/example/data/json', options);

    await t.expect(data.body).eql({
        message: 'Data was deleted',
    });
});

test('Should execute a request with method put', async (t) => {
    const options = {
        body: {
            name:     'John Hearts',
            position: 'CTO',
        },
    };

    const data = await Request.put('https://devexpress.github.io/testcafe/example/data/json', options);

    await t.expect(data.body).eql({
        message: 'Data was putted',
    });
});

test('Should execute a request with method patch', async (t) => {
    const options = {
        body: {
            name:     'John Hearts',
            position: 'CTO',
        },
    };

    const data = await Request.patch('https://devexpress.github.io/testcafe/example/data/json', options);

    await t.expect(data.body).eql({
        message: 'Data was patched',
    });
});

test('Should execute a request with method head', async (t) => {
    const data = await Request.head('https://devexpress.github.io/testcafe/example/data/json');

    await t
        .expect(data.headers).ok()
        .expect(data.body).notOk();
});

test('Should execute a request in an assertion', async (t) => {
    await t.expect(Request.get('https://devexpress.github.io/testcafe/example/data/json')).eql({
        name:     'John Hearts',
        position: 'CTO',
    });
});

//TODO: added tests:
// 1) Requests with params
// 2) Requests with timeout
// 3) Requests withCredentials
// 4) Requests with maxRedirects
// 5) Check bodies with the types: json, text, buffer, httpOutgoingMessage
// 6) Requests with proxy
// 7) Requests with auth
// 8) Requests with relative paths
// 9) Requests with the additional methods options
