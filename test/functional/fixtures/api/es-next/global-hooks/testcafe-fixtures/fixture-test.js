import { expect } from 'chai';

fixture`Fixture 1`;

test('Test1', async t => {
    await t
        .expect(global.fixtureBefore).eql(1)
        .expect(global.fixtureAfter).eql(0);
});

test('Test1', async t => {
    await t
        .expect(global.fixtureBefore).eql(1)
        .expect(global.fixtureAfter).eql(0);
});

fixture`Fixture2`;

test('Test1', async t => {
    await t
        .expect(global.fixtureBefore).eql(2)
        .expect(global.fixtureAfter).eql(1);
});

fixture`Fixture 3`
    .before(() => {
        global.fixtureBefore++;
    })
    .after(() => {
        global.fixtureAfter++;
    });

test('Test2', async t => {
    await t
        .expect(global.fixtureBefore).eql(2)
        .expect(global.fixtureAfter).eql(0);
});

test('Test2', async t => {
    await t
        .expect(global.fixtureBefore).eql(2)
        .expect(global.fixtureAfter).eql(0);
});

fixture`Fixture 4`
    .before(() => {
        global.fixtureBefore += 2;
    })
    .after(() => {
        global.fixtureAfter += 2;
    });

test('Test2', async t => {
    await t
        .expect(global.fixtureBefore).eql(5)
        .expect(global.fixtureAfter).eql(2);
});

fixture`Fixture 5`
    .before(() => {
        expect(global.fixtureBefore).eql(1);
        global.fixtureBefore++;
    })
    .after(() => {
        expect(global.fixtureBefore).eql(2);
        expect(global.fixtureAfter).eql(0);
        global.fixtureAfter++;
    });

test('Test3', async t => {
    await t
        .expect(global.fixtureBefore).eql(2)
        .expect(global.fixtureAfter).eql(0);
});

fixture`Fixture 6`
    .before(() => {
        expect(global.fixtureBefore).eql(3);
        global.fixtureBefore++;
    })
    .after(() => {
        expect(global.fixtureBefore).eql(4);
        expect(global.fixtureAfter).eql(2);
        global.fixtureAfter++;
    });

test('Test3', async t => {
    await t
        .expect(global.fixtureBefore).eql(4)
        .expect(global.fixtureAfter).eql(2);
});
