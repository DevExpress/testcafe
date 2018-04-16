import { Selector, RequestMock } from 'testcafe';

const requestMock = RequestMock()
    .onRequestTo('http://dummy-url.com')
    .respond('<html><body><h1>Mocked page</h1></body></html>')
    .onRequestTo('https://another-dummy-url.com')
    .respond();

fixture `Basic`;

test
    .requestHooks(requestMock)
    ('Basic', async t => {
        await t
            .navigateTo('http://dummy-url.com')
            .expect(Selector('h1').textContent).eql('Mocked page')
            .navigateTo('https://another-dummy-url.com')
            .expect(Selector('body').exists).ok();
    });
