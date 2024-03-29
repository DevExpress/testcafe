import { Selector, RequestMock } from 'testcafe';
import DUMMY_URLS from '../../common/mock-routes.js';

const testPageMarkup = `
    <html>
        <body>
            <h1>Mocked page</h1>
            <h2></h2>
            <button onclick="sendRequest()">Send request</button>
            <script>
                function sendRequest() {
                    fetch('${DUMMY_URLS.secureGet}')
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
    .onRequestTo(DUMMY_URLS.secureMain)
    .respond(testPageMarkup)
    .onRequestTo(DUMMY_URLS.secureGet)
    .respond('Data from mocked fetch request')
    .onRequestTo(DUMMY_URLS.another)
    .respond();

fixture `Basic`;

test
    .requestHooks(requestMock)
    ('Basic', async t => {
        await t
            .navigateTo(DUMMY_URLS.secureMain)
            .expect(Selector('h1').textContent).eql('Mocked page')
            .click('button')
            .expect(Selector('h2').textContent).eql('Data from mocked fetch request')
            .navigateTo(DUMMY_URLS.another)
            .expect(Selector('body').exists).ok();
    });
