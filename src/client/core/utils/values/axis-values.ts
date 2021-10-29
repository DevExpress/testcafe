export default class AxisValues<T> {
    public x: T;
    public y: T;

    public constructor (x: T, y: T) {
        this.x = x;
        this.y = y;
    }

    public add (this: AxisValues<number>, p: AxisValues<number>): AxisValues<number> {
        this.x += p.x;
        this.y += p.y;

        return this;
    }

    public sub (this: AxisValues<number>, p: AxisValues<number>): AxisValues<number> {
        this.x -= p.x;
        this.y -= p.y;

        return this;
    }
}
