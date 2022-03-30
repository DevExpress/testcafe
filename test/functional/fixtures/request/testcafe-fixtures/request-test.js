import { Request } from 'testcafe';
import Server from '../server';

fixture`Request`
    .before((ctx) => {
        ctx.serverPort = 1339;
        ctx.server     = new Server(ctx.serverPort);
    })
    .after((ctx) => {
        ctx.server.close();
    });

test('Should execute a GET request', async (t) => {
    const {
        status,
        statusText,
        headers,
        body,
    } = await Request(`http://localhost:${t.fixtureCtx.serverPort}/user`);

    await t
        .expect(status).eql(200)
        .expect(statusText).eql('OK')
        .expect(headers).contains({ 'content-type': 'application/json; charset=utf-8' })
        .expect(body).eql({
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

    const data = await Request(`http://localhost:${t.fixtureCtx.serverPort}/user`, options);

    await t.expect(data.body).eql({
        message: 'Data was posted',
    });
});

test('Should execute a request with method get', async (t) => {
    const data = await Request.get(`http://localhost:${t.fixtureCtx.serverPort}/user`);

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

    const data = await Request.post(`http://localhost:${t.fixtureCtx.serverPort}/user`, options);

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

    const data = await Request.delete(`http://localhost:${t.fixtureCtx.serverPort}/user`, options);

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

    const data = await Request.put(`http://localhost:${t.fixtureCtx.serverPort}/user`, options);

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

    const data = await Request.patch(`http://localhost:${t.fixtureCtx.serverPort}/user`, options);

    await t.expect(data.body).eql({
        message: 'Data was patched',
    });
});

test('Should execute a request with method head', async (t) => {
    const data = await Request.head(`http://localhost:${t.fixtureCtx.serverPort}/user`);

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
