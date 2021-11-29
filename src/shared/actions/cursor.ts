import { adapter } from '../adapter';
import { CursorUI } from './types';
import AxisValues, { AxisValuesData } from '../utils/values/axis-values';


interface Window {
    parent: Window;
}

export default class Cursor<W extends Window> {
    private _activeWindow: W;
    private _x: number;
    private _y: number;
    private readonly _ui: CursorUI;

    public constructor (activeWin: W, ui: CursorUI) {
        this._ui = ui;

        // NOTE: the default position should be outside of the page (GH-794)
        this._x = -1;
        this._y = -1;

        this._activeWindow = activeWin;
    }

    private _ensureActiveWindow (win: W): void {
        if (this._activeWindow === win || this._activeWindow === win.parent)
            return;

        if (this._activeWindow.parent !== win)
            this._activeWindow = win;
    }

    public isActive (currWin: W): boolean {
        this._ensureActiveWindow(currWin);

        return this._activeWindow === currWin;
    }

    public setActiveWindow (win: W): void {
        this._activeWindow = win;
    }

    public getActiveWindow (currWin: W): W {
        this._ensureActiveWindow(currWin);

        return this._activeWindow;
    }

    public getPosition (): AxisValues<number> {
        return new AxisValues(this._x, this._y);
    }

    private move (point: AxisValuesData<number>): Promise<void> {
        this._x = point.x;
        this._y = point.y;

        return this._ui.move(point);
    }

    public hide (): Promise<void> {
        if (this._ui.hide)
            return this._ui.hide();

        return adapter.PromiseCtor.resolve();
    }

    public show (): Promise<void> {
        if (this._ui.show)
            return this._ui.show();

        return adapter.PromiseCtor.resolve();
    }

    public leftButtonDown (): Promise<void> {
        return this._ui.leftButtonDown();
    }

    public rightButtonDown (): Promise<void> {
        return this._ui.rightButtonDown();
    }

    public buttonUp (): Promise<void> {
        return this._ui.buttonUp();
    }
}
