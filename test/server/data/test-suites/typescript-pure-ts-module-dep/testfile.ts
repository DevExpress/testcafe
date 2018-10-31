import * as exportableLib from 'testcafe';
import * as exportableLibInDep from 'test-module';

fixture `Fixture`;

test('Get common runtime funcs', async() => {
    return {
        exportableLibInDep,
        exportableLib
    };
});
