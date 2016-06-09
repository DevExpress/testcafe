import commons from 'testcafe';
import commonsInDep from './dep';

fixture `Fixture`;

test('Get common runtime funcs', () => {
    return {
        commonsEql: commons === commonsInDep,
        commons:    commons
    };
});
