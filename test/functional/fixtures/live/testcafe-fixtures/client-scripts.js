import { ClientFunction } from 'testcafe';
import helper from '../test-helper';

const getTestVariableValue = ClientFunction(() => window.test);

fixture `Fixture`
    .clientScripts({ content: 'window.test = true;' })
    .after(() => {
        helper.counter++;
        helper.emitter.emit('tests-completed');
    });

test('test', async () => {
    helper.data[helper.counter] = await getTestVariableValue();
});
