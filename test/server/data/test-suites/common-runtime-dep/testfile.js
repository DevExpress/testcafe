import exportableLib from 'testcafe';
import exportableLibInDep from './dep';

fixture `Fixture`;

test('Get common runtime funcs', () => {
    return {
        exportableLibsEql: exportableLib === exportableLibInDep,
        exportableLib:     exportableLib
    };
});
