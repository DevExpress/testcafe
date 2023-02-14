import { ClientFunction } from 'testcafe';

import helper from '../test-helper.js';

fixture `Selector Inspector`
    .clientScripts `../../ui/utils/selector-inspector.js`
    .page `../pages/index.html`
    .after(() => {
        helper.emitter.emit('tests-completed');
    });

test('should indicate the correct number of elements matching the selector', async t => {
    await ClientFunction(() => {
        const { typeSelector, getMatchIndicatorInnerText, resumeTest } = window;

        typeSelector('button')
            .then(() => {
                return getMatchIndicatorInnerText();
            })
            .then(text => {
                if (text === 'Found: 2')
                    resumeTest();
            });
    })();

    await t.debug();
});
