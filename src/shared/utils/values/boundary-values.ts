import AxisValues, { RightBottomValues } from './axis-values';

export interface BoundaryValuesData {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export default class BoundaryValues implements BoundaryValuesData {
    public top: number;
    public right: number;
    public bottom: number;
    public left: number;

    public constructor (top = 0, right = 0, bottom = 0, left = 0) {
        this.top    = top;
        this.right  = right;
        this.bottom = bottom;
        this.left   = left;
    }

    public static create (v: BoundaryValuesData): BoundaryValues {
        return new BoundaryValues(v.top, v.right, v.bottom, v.left);
    }

    public add (d: BoundaryValuesData): this {
        this.top    += d.top;
        this.right  += d.right;
        this.bottom += d.bottom;
        this.left   += d.left;

        return this;
    }

    public sub (d: BoundaryValuesData | RightBottomValues<number>): this {
        if ('top' in d) {
            this.top  -= d.top;
            this.left -= d.left;
        }

        this.bottom -= d.bottom;
        this.right  -= d.right;

        return this;
    }

    public round (leftTopRound = Math.round, rightBottomRound = leftTopRound): this {
        this.top    = leftTopRound(this.top);
        this.right  = rightBottomRound(this.right);
        this.bottom = rightBottomRound(this.bottom);
        this.left   = leftTopRound(this.left);

        return this;
    }

    public contains (point: AxisValues<number>): boolean {
        return point.x >= this.left && point.x <= this.right && point.y >= this.top && point.y <= this.bottom;
    }
}
