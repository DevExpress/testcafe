export interface AxisValuesData<T> {
    x: T;
    y: T;
}

export interface LeftTopValues<T> {
    left: T;
    top: T;
}

export interface RightBottomValues<T> {
    right: T;
    bottom: T;
}

export default class AxisValues<T> implements AxisValuesData<T> {
    public x: T;
    public y: T;

    public constructor (x: T, y: T) {
        this.x = x;
        this.y = y;
    }

    public static create<T> (a: AxisValuesData<T> | LeftTopValues<T> | RightBottomValues<T>): AxisValues<T> {
        if ('left' in a)
            return new AxisValues(a.left, a.top);
        else if ('right' in a)
            return new AxisValues(a.right, a.bottom);

        return new AxisValues(a.x, a.y);
    }

    public add (this: AxisValues<number>, p: AxisValuesData<number>): AxisValues<number> {
        this.x += p.x;
        this.y += p.y;

        return this;
    }

    public sub (this: AxisValues<number>, p: AxisValuesData<number>): AxisValues<number> {
        this.x -= p.x;
        this.y -= p.y;

        return this;
    }

    public round (this: AxisValues<number>, fn = Math.round): AxisValues<number> {
        this.x = fn(this.x);
        this.y = fn(this.y);

        return this;
    }

    public eql (p: AxisValuesData<T>): boolean {
        return this.x === p.x && this.y === p.y;
    }

    public mul (this: AxisValues<number>, n: number): AxisValues<number> {
        this.x *= n;
        this.y *= n;

        return this;
    }

    public distance (this: AxisValues<number>, p: AxisValuesData<number>): number {
        return Math.sqrt(Math.pow(this.x - p.x, 2) + Math.pow(this.y - p.y, 2));
    }
}
