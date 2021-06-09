import { t } from 'testcafe';

export default async function methodWithFailedAssertion () {
    await t.expect(1).eql(2);
}
