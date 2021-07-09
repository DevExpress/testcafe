import BaseTransform from './base-transform';
import Role from '../../../../role/role';

export default class RoleTransform extends BaseTransform {
    public constructor () {
        super('Role');
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof Role;
    }

    public fromSerializable (value: unknown): Role {
        return Role.from(value) as Role;
    }
}
