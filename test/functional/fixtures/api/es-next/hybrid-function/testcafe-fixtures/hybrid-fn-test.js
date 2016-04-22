// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { Hybrid } from 'testcafe';

fixture `Hybrid function`
    .page `http://localhost:3000/api/es-next/hybrid-function/pages/index.html`;

const getUserAgent = Hybrid(() => navigator.userAgent);

test('Get user agent', async () => {
    throw await getUserAgent();
});

