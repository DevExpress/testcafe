import { Selector, RequestMock } from 'testcafe';

const DUMMY_URLS = {
    main:    'http://dummy-url.com',
    get:     'http://dummy-url.com/get',
    another: 'https://another-dummy-url.com',
};

const testPageMarkup = `
    <html>
        <body>
            <h1>Mocked page</h1>
            <h2></h2>
            <button onclick="sendRequest()">Send request</button>
            <script>
                function sendRequest() {
                    fetch('${DUMMY_URLS.get}')
                        .then(res => {
                            return res.text();
                        })
                        .then(text => {
                            document.querySelector('h2').textContent = text;
                        });
                }
            </script>
        </body>
    </html>
`;

const requestMock = RequestMock()
    .onRequestTo(DUMMY_URLS.main)
    .respond(testPageMarkup)
    .onRequestTo(DUMMY_URLS.get)
    .respond('Data from mocked fetch request')
    .onRequestTo(DUMMY_URLS.another)
    .respond();

fixture `Basic`;

test
    .requestHooks(requestMock)
    ('Basic', async t => {
        await t
            .navigateTo('http://dummy-url.com')
            .expect(Selector('h1').textContent).eql('Mocked page')
            .click('button')
            .expect(Selector('h2').textContent).eql('Data from mocked fetch request')
            .navigateTo('https://another-dummy-url.com')
            .expect(Selector('body').exists).ok();
    });
