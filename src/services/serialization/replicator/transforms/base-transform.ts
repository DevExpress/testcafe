export default abstract class BaseTransform {
    public readonly type: string;

    protected constructor (type: string) {
        this.type = type;
    }

    public toSerializable (value: unknown): unknown {
        return Object.assign({}, value);
    }
}
