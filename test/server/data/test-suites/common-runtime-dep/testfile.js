import { Hybrid } from 'testcafe';
import Role from './dep';

fixture `Fixture`;

test('Get common runtime funcs', () => {
    return { Hybrid, Role };
});
