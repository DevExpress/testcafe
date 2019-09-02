import { ClientFunction } from 'testcafe';
import helper from '../test-helper';

const getTestVariableValue = ClientFunction(() => window.test);

fixture `Fixture`
    .clientScripts({ content: 'window.test = true;' })
    .afterEach(() => {
        helper.counter++;
    })
    .after(() => {
        helper.watcher.emit('test-complete');
    });

test('test', async () => {
    helper.data[helper.counter] = await getTestVariableValue();
});
