import { Selector, RequestMock } from 'testcafe';

const testPageMarkup = `
    <html>
        <body>
            <h1>Mocked page</h1>
            <h2></h2>
            <button onclick="sendRequest()"></button>
            <script>
                function sendRequest() {
                    fetch('http://dummy-url.com/get')
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
    .onRequestTo('http://dummy-url.com')
    .respond(testPageMarkup)
    .onRequestTo('http://dummy-url.com/get')
    .respond('Data from mocked fetch request')
    .onRequestTo('https://another-dummy-url.com')
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
