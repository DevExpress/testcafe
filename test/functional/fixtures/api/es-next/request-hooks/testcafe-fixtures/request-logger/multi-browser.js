import { RequestLogger, Selector, ClientFunction } from 'testcafe';
import parseUserAgent from '../../../../../../../../lib/utils/parse-user-agent';

const pageUrl = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/multi-browser.html';

const logger = new RequestLogger(
    {
        url:    /get-browser-name/,
        isAjax: true
    },
    {
        logResponseBody:       true,
        stringifyResponseBody: true
    });

fixture `RequestLogger`
    .page(pageUrl);

test
    .requestHooks(logger)
    ('Multi-browser', async t => {
        const buttonSelector = Selector('button');
        const userAgentStr   = await ClientFunction(() => window.navigator.userAgent)();
        const browserName    = parseUserAgent(userAgentStr).name;

        await t
            .click(buttonSelector)
            .expect(buttonSelector.textContent).eql('Done')
            .expect(logger.contains(r => r.response.body === browserName)).ok()
            .expect(logger.contains(r => r.request.url === pageUrl)).notOk();
    });
