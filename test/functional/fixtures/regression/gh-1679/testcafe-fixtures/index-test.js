import { ClientFunction } from 'testcafe';

fixture `gh-1679`;

test
    .page('http://localhost:3000/fixtures/regression/gh-1679/pages/index.html')
    ('Hover element', async t => {
        await t
            .hover('#btn')
            .expect(ClientFunction(() => window.btnHovered)()).ok();
    });
