import { Request } from 'testcafe';
import os from 'os';

fixture`Request`;

test('Should execute a GET request', async (t) => {
    const {
        status,
        statusText,
        headers,
        body,
    } = await Request(`http://localhost:3000/api/data`);

    await t
        .expect(status).eql(200)
        .expect(statusText).eql('OK')
        .expect(headers).contains({ 'content-type': 'application/json; charset=utf-8' })
        .expect(body.data).eql({
            name:     'John Hearts',
            position: 'CTO',
        });
});

test('Should execute a POST request', async (t) => {
    const options = {
        method: 'POST',
        body:   {
            name:     'John Hearts',
            position: 'CTO',
        },
    };

    const data = await Request(`http://localhost:3000/api/data`, options);

    await t.expect(data.body).eql({
        data: {
            name:     'John Hearts',
            position: 'CTO',
        },
        message: 'Data was posted',
    });
});

test('Should execute a request with method get', async (t) => {
    const { body } = await Request.get(`http://localhost:3000/api/data`);

    await t.expect(body.data).eql({
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

    const data = await Request.post(`http://localhost:3000/api/data`, options);

    await t.expect(data.body).eql({
        data: {
            name:     'John Hearts',
            position: 'CTO',
        },
        message: 'Data was posted',
    });
});

test('Should execute a request with method delete', async (t) => {
    const data = await Request.delete(`http://localhost:3000/api/data/1`);

    await t.expect(data.body).eql({
        data: {
            dataId: '1',
        },
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

    const data = await Request.put(`http://localhost:3000/api/data`, options);

    await t.expect(data.body).eql({
        data: {
            name:     'John Hearts',
            position: 'CTO',
        },
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

    const data = await Request.patch(`http://localhost:3000/api/data`, options);

    await t.expect(data.body).eql({
        data: {
            name:     'John Hearts',
            position: 'CTO',
        },
        message: 'Data was patched',
    });
});

test('Should execute a request with method head', async (t) => {
    const data = await Request.head(`http://localhost:3000/api/data`);

    await t
        .expect(data.headers).ok()
        .expect(data.body).notOk();
});

test('Should execute a request in an assertion', async (t) => {
    await t.expect(Request.get(`http://localhost:3000/api/data`)).contains({
        status: 200,
    });
});

test('Should re-execute a request in an assertion', async (t) => {
    await t.expect(Request.get(`http://localhost:3000/api/data/loading`).body).contains({
        name:     'John Hearts',
        position: 'CTO',
    });
});

test('Should execute basic auth', async (t) => {
    const options = {
        auth: {
            username: 'janedoe',
            password: 's00pers3cret',
        },
    };

    await t.expect(Request.post(`http://localhost:3000/api/auth/basic`, options).body).eql({
        token: 'Basic amFuZWRvZTpzMDBwZXJzM2NyZXQ=',
    });
});

test('Should execute bearer token auth', async (t) => {
    const options = {
        headers: {
            Authorization: 'Bearer amFuZWRvZTpzMDBwZXJzM2NyZXQ=',
        },
    };

    await t.expect(Request.post(`http://localhost:3000/api/auth/bearer`, options).body).eql('authorized');
});

test('Should execute API Key auth', async (t) => {
    const options = {
        headers: {
            'API-KEY': 'amFuZWRvZTpzMDBwZXJzM2NyZXQ=',
        },
    };

    await t.expect(Request.post(`http://localhost:3000/api/auth/key`, options).body).eql('authorized');
});

test('Should rise an error if url is not valid', async () => {
    await Request('crash');
});

test('Should execute request with proxy', async (t) => {
    const { body } = await Request.get(`http://localhost:3000/api/data`, {
        proxy: {
            host: os.hostname(),
            port: '3005',
        },
    });

    await t.expect(body.data).eql({
        name:     'John Hearts',
        position: 'CTO',
    });
});

test('Should execute basic auth with proxy', async (t) => {
    const options = {
        proxy: {
            host: os.hostname(),
            port: '3005',
            auth: {
                username: 'janedoe',
                password: 's00pers3cret',
            },
        },
    };

    await t.expect(Request.post(`http://localhost:3000/api/auth/proxy/basic`, options).body).eql({
        token: 'Basic amFuZWRvZTpzMDBwZXJzM2NyZXQ=',
    });
});

test('Should execute a request with params in the url', async (t) => {
    const { body } = await Request.get(`http://localhost:3000/api/data?param1=value1`);

    await t.expect(body.params).eql({
        param1: 'value1',
    });
});

test('Should execute a request with params in the options', async (t) => {
    const { body } = await Request.get(`http://localhost:3000/api/data`, {
        params: {
            param1: 'value1',
        },
    });

    await t.expect(body.params).eql({
        param1: 'value1',
    });
});

test('Should interrupt request by timeout', async (t) => {
    const { body } = await Request.get(`http://localhost:3000/api/hanging`, {
        timeout: 1000,
    });

    await t.expect(body).eql({
        param1: 'value1',
    });
});

test('Should send request with credentials', async (t) => {
    await t.setCookies({ apiCookie1: 'value1' }, 'http://localhost');

    const { body } = await Request.get(`http://localhost:3000/api/data`, {
        withCredentials: true,
    });

    await t.expect(body.cookies).eql('apiCookie1=value1');
});

test.page('https://devexpress.github.io/testcafe/example/')
('Should set cookies to the client from response', async (t) => {
    await Request.get('http://localhost:3000/api/cookies');

    const cookies = await t.getCookies({ domain: 'devexpress.github.io' });

    await t.expect(cookies[0].name).eql('cookieName');
    await t.expect(cookies[0].value).eql('cookieValue');
});

test('Should return parsed json', async (t) => {
    const { body } = await Request.get(`http://localhost:3000/api/data`);

    await t.expect(body.data).eql({
        name:     'John Hearts',
        position: 'CTO',
    });
});

test('Should return text', async (t) => {
    const { body } = await Request.get(`http://localhost:3000/api/data/text`);

    await t.expect(body).eql('{"name":"John Hearts","position":"CTO"}');
});

test('Should return buffer', async (t) => {
    const { body } = await Request.get(`http://localhost:3000/api/data/file`);

    await t
        .expect(Buffer.isBuffer(body)).ok()
        .expect(body.toString()).eql('{"name":"John Hearts","position":"CTO"}');
});

test('Should return httpIncomingMessage', async (t) => {
    const { body } = await Request.get(`http://localhost:3000/api/data`, {
        rawResponse: true,
    });

    await t.expect(body.constructor.name === 'IncomingMessage').ok();
});

test('Should execute a request with url in the options', async (t) => {
    const { body } = await Request.get({
        url: `http://localhost:3000/api/data`,
    });

    await t.expect(body.data).eql({
        name:     'John Hearts',
        position: 'CTO',
    });
});

test('Url from the argument should be more priority then url in the options', async (t) => {
    const { body } = await Request.get(`http://localhost:3000/api/data`, {
        url: `http://localhost:3000/api/data/text`,
    });

    await t.expect(body.data).eql({
        name:     'John Hearts',
        position: 'CTO',
    });
});

test.page('http://localhost:3000/fixtures/request/pages/index.html')
('Should execute a request with relative url', async (t) => {
    const { body } = await Request.get('/api/data');

    await t.expect(body.data).eql({
        name:     'John Hearts',
        position: 'CTO',
    });
});

test('Should rise request runtime error', async () => {
    await Request.get(`https://localhost1:3007/api/data`);
});

