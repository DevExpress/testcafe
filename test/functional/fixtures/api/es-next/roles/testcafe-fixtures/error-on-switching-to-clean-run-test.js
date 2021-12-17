import { Role } from 'testcafe';

const role = Role('https://non-existing-url.com', () => {}, { preserveUrl: true });

fixture`Fixture`
    .beforeEach(
        async (t) => {
            await t.useRole(role);
        }
    );

test('test1', async () => {});

test('test2', async () => {});
