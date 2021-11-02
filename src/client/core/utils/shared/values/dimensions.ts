import { BoundaryValuesData } from './boundary-values';
import {
    AxisValuesData,
    LeftTopValues,
    RightBottomValues,
} from './axis-values';

export interface DimensionsData extends BoundaryValuesData {
    width: number;
    height: number;
    scroll: LeftTopValues<number>;
    border: BoundaryValuesData;
    scrollbar: RightBottomValues<number>;
}

export default class Dimensions implements DimensionsData {
    public width: number;
    public height: number;
    public top: number;
    public left: number;
    public bottom: number;
    public right: number;
    public scroll: LeftTopValues<number>;
    public border: BoundaryValuesData;
    public scrollbar: RightBottomValues<number>;

    public constructor (width: number, height: number, position: AxisValuesData<number>, borders: BoundaryValuesData,
        elScroll: LeftTopValues<number>, scrollbar: RightBottomValues<number>) {

        this.width  = width;
        this.height = height;

        this.left   = position.x;
        this.top    = position.y;
        this.right  = position.x + width;
        this.bottom = position.y + height;

        this.border    = borders;
        this.scrollbar = scrollbar;
        this.scroll    = elScroll;
    }
}
