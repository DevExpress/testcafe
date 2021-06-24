const Role       = require('../../lib/role/role');
const RolePhase  = require('../../lib/role/phase');
const { expect } = require('chai');

describe('IPC serialization', () => {
    it('Role', () => {
        const initFn = () => 123;
        const opts   = { preserveUrl: true };

        const role = new Role('https://example.com', initFn, opts);

        role.phase         = RolePhase.pendingInitialization;
        role.redirectUrl   = 'https://redirect-url.com';
        role.stateSnapshot = { cookie: 'key=value' };
        role.initErr       = new Error();

        const serizalizedRole  = Object.assign(role);
        const deserializedRole = Role.from(serizalizedRole);

        expect(role.id).eql(deserializedRole.id);
        expect(role.phase).eql(deserializedRole.phase);
        expect(role.loginUrl).eql(deserializedRole.loginUrl);
        expect(role._initFn).eql(deserializedRole._initFn);
        expect(role.opts).deep.equal(deserializedRole.opts);
        expect(role.redirectUrl).eql(deserializedRole.redirectUrl);
        expect(role.stateSnapshot).eql(deserializedRole.stateSnapshot);
        expect(role.initErr).eql(deserializedRole.initErr);
    });
});
