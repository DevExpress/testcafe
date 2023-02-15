import os from 'os';

const MAIN_DOMAIN         = 'localhost';
const MAIN_PAGE_URL       = `http://${MAIN_DOMAIN}:3000/fixtures/request/pages/index.html`;
const API_URL             = `http://${MAIN_DOMAIN}:3000/api`;
const API_DATA_URL        = `${API_URL}/data`;
const API_SET_COOKIES_URL = `${API_URL}/cookies`;
const API_AUTH_URL        = `${API_URL}/auth`;
const EXTERNAL_DOMAIN     = '127.0.0.1';
const EXTERNAL_PAGE_URL   = `http://${EXTERNAL_DOMAIN}:3001/fixtures/request/pages/index.html`;

fixture`Request`;

test('Should execute a GET request', async (t) => {
    const {
        status,
        statusText,
        headers,
        body,
    } = await t.request(API_DATA_URL);

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

    const data = await t.request(API_DATA_URL, options);

    await t.expect(data.body).eql({
        data: {
            name:     'John Hearts',
            position: 'CTO',
        },
        message: 'Data was posted',
    });
});

test('Should execute a request with method get', async (t) => {
    const { body } = await t.request.get(API_DATA_URL);

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

    const data = await t.request.post(API_DATA_URL, options);

    await t.expect(data.body).eql({
        data: {
            name:     'John Hearts',
            position: 'CTO',
        },
        message: 'Data was posted',
    });
});

test('Should execute a request with method delete', async (t) => {
    const data = await t.request.delete(`${API_DATA_URL}/1`);

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

    const data = await t.request.put(API_DATA_URL, options);

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

    const data = await t.request.patch(API_DATA_URL, options);

    await t.expect(data.body).eql({
        data: {
            name:     'John Hearts',
            position: 'CTO',
        },
        message: 'Data was patched',
    });
});

test('Should execute a request with method head', async (t) => {
    const data = await t.request.head(API_DATA_URL);

    await t
        .expect(data.headers).ok()
        .expect(data.body).notOk();
});

test('Should execute a request in an assertion', async (t) => {
    await t.expect(t.request.get(API_DATA_URL)).contains({
        status: 200,
    });
});

test('Should re-execute a request in an assertion', async (t) => {
    await t.expect(t.request.get(`${API_DATA_URL}/loading`).body).contains({
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

    await t.expect(t.request.post(`${API_AUTH_URL}/basic`, options).body).eql({
        token: 'Basic amFuZWRvZTpzMDBwZXJzM2NyZXQ=',
    });
});

test('Should execute bearer token auth', async (t) => {
    const options = {
        headers: {
            Authorization: 'Bearer amFuZWRvZTpzMDBwZXJzM2NyZXQ=',
        },
    };

    await t.expect(t.request.post(`${API_AUTH_URL}/bearer`, options).body).eql('authorized');
});

test('Should execute API Key auth', async (t) => {
    const options = {
        headers: {
            'API-KEY': 'amFuZWRvZTpzMDBwZXJzM2NyZXQ=',
        },
    };

    await t.expect(t.request.post(`${API_AUTH_URL}/key`, options).body).eql('authorized');
});

test('Should rise an error if url is not valid', async (t) => {
    await t.request('crash');
});

test('Should execute request with proxy', async (t) => {
    const { body } = await t.request.get(API_DATA_URL, {
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

    await t.expect(t.request.post(`${API_AUTH_URL}/proxy/basic`, options).body).eql({
        token: 'Basic amFuZWRvZTpzMDBwZXJzM2NyZXQ=',
    });
});

test('Should execute a request with params in the url', async (t) => {
    const { body } = await t.request.get(`${API_DATA_URL}?param1=value1`);

    await t.expect(body.params).eql({
        param1: 'value1',
    });
});

test('Should execute a request with params in the options', async (t) => {
    const { body } = await t.request.get(API_DATA_URL, {
        params: {
            param1: 'value1',
        },
    });

    await t.expect(body.params).eql({
        param1: 'value1',
    });
});

test('Should interrupt request by timeout', async (t) => {
    const { body } = await t.request.get(`${API_URL}/hanging`, {
        timeout: 1000,
    });

    await t.expect(body).eql({
        param1: 'value1',
    });
});

test.page(MAIN_PAGE_URL)
('Should send request with cookies', async (t) => {
    await t.setCookies({ apiCookie1: 'value1' });

    const { body } = await t.request.get(API_DATA_URL);

    await t.expect(body.cookies).eql('apiCookie1=value1');
});

test.page(EXTERNAL_PAGE_URL)
('Should not set cookies to the client from response', async (t) => {
    await t.request.get(API_SET_COOKIES_URL);

    const cookies       = await t.getCookies({ domain: EXTERNAL_DOMAIN });
    const clientCookies = await t.eval(() => document.cookie);

    await t.expect(cookies.length).notOk();
    await t.expect(clientCookies).eql('');
});

test.page(EXTERNAL_PAGE_URL)
('Should set cookies to the client from response', async (t) => {
    await t.request.get(API_SET_COOKIES_URL, {
        withCredentials: true,
    });

    const cookies       = await t.getCookies({ domain: EXTERNAL_DOMAIN });
    const clientCookies = await t.eval(() => document.cookie);

    await t.expect(cookies[0].name).eql('cookieName');
    await t.expect(cookies[0].value).eql('cookieValue');
    await t.expect(clientCookies).eql('cookieName=cookieValue');
});

test.page(EXTERNAL_PAGE_URL)
('Should attach cookies to request with another domain if "withCredentials" is true', async (t) => {
    await t.setCookies({ cookieName: 'cookieValue' });

    const { body } = await t.request.get(API_DATA_URL, { withCredentials: true });

    await t.expect(body.cookies).eql('cookieName=cookieValue');
});

test.page(EXTERNAL_PAGE_URL)
('Should not attach cookies to request with another domain if "withCredentials" is false', async (t) => {
    await t.setCookies({ cookieName: 'cookieValue' });

    const { body } = await t.request.get(API_DATA_URL);

    await t.expect(body.cookies).eql(void 0);
});

test('Should return parsed json', async (t) => {
    const { body } = await t.request.get(API_DATA_URL);

    await t.expect(body.data).eql({
        name:     'John Hearts',
        position: 'CTO',
    });
});

test('Should return text', async (t) => {
    const { body } = await t.request.get(`${API_DATA_URL}/text`);

    await t.expect(body).eql('{"name":"John Hearts","position":"CTO"}');
});

test('Should return buffer', async (t) => {
    const { body } = await t.request.get(`${API_DATA_URL}/file`);

    await t
        .expect(Buffer.isBuffer(body)).ok()
        .expect(body.toString()).eql('{"name":"John Hearts","position":"CTO"}');
});

test('Should return httpIncomingMessage', async (t) => {
    const { body } = await t.request.get(API_DATA_URL, {
        rawResponse: true,
    });

    await t.expect(body.constructor.name === 'IncomingMessage').ok();
});

test('Should execute a request with url in the options', async (t) => {
    const { body } = await t.request.get({
        url: API_DATA_URL,
    });

    await t.expect(body.data).eql({
        name:     'John Hearts',
        position: 'CTO',
    });
});

test('Url from the argument should be more priority then url in the options', async (t) => {
    const { body } = await t.request.get(API_DATA_URL, {
        url: `${API_DATA_URL}/text`,
    });

    await t.expect(body.data).eql({
        name:     'John Hearts',
        position: 'CTO',
    });
});

test.page(MAIN_PAGE_URL)
('Should execute a request with relative url', async (t) => {
    const { body } = await t.request.get('/api/data');

    await t.expect(body.data).eql({
        name:     'John Hearts',
        position: 'CTO',
    });
});

test('Should rise request runtime error', async (t) => {
    await t.request.get(`https://localhost1:3007/api/data`, {
        proxy: {
            host: 'localhost1',
            port: '3005',
        },
    });
});

