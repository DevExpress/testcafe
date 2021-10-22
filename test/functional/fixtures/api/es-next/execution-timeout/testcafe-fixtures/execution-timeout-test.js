fixture`Fixture 1`;

test('Test', async () => {
});

test('Test', async () => {
    await new Promise(() => {
    });
});

test('Test', async () => {
});

test
    .before(async () => {
        await new Promise(() => {
        });
    })
    ('Test with before hook', async () => {
    });

test
    .after(async () => {
        await new Promise(() => {
        });
    })
    ('Test with after hook', async () => {
    });

fixture`Fixture 2`
    .before(async () => {
        await new Promise(() => {
        });
    });

test('Feature with before hook', async () => {
});

fixture`Fixture 3`
    .after(async () => {
        await new Promise(() => {
        });
    });

test('Feature with after hook', async () => {
});
