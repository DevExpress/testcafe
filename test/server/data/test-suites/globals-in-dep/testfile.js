import globalsInDepUndefined from './dep';

fixture `Fixture`;

test('Test', () => {
    return typeof fixture === 'undefined' &&
           typeof tests === 'undefined' &&
           typeof page === 'undefined' &&
           globalsInDepUndefined();
});
