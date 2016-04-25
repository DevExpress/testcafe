// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { Hybrid } from 'testcafe';
import { expect } from 'chai';

fixture `Hybrid function`
    .page `http://localhost:3000/api/es-next/hybrid-function/pages/index.html`;

const getLocation  = Hybrid(() => document.location.toString());
const getUserAgent = Hybrid(() => navigator.userAgent);

test('Dispatch', async () => {
    throw await getUserAgent();
});

test('Call with arguments', async () => {
    const getElementText = Hybrid((className, idx) => document.querySelectorAll('.' + className)[idx].textContent);
    const answer         = await getElementText('answer', 1);

    expect(answer.trim()).eql('42');
});

test('Hammerhead code instrumentation', async () => {
    const location = await getLocation();

    expect(location).eql('http://localhost:3000/api/es-next/hybrid-function/pages/index.html');
});
