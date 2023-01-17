import { CursorUI } from '../types';
import AxisValues, { AxisValuesData } from '../../core/utils/values/axis-values';
// @ts-ignore
import { Promise } from '../../driver/deps/hammerhead';

export default class Cursor {
    private _activeWindow: Window;
    private _x: number;
    private _y: number;
    private readonly _ui: CursorUI;

    public constructor (activeWin: Window, ui: CursorUI) {
        this._ui = ui;

        // NOTE: the default position should be outside the page (GH-794)
        this._x = -1;
        this._y = -1;

        this._activeWindow = activeWin;
    }

    private _ensureActiveWindow (win: Window): void {
        if (this._activeWindow === win || this._activeWindow === win.parent)
            return;

        if (this._activeWindow.parent !== win)
            this._activeWindow = win;
    }

    public isActive (currWin: Window): boolean {
        this._ensureActiveWindow(currWin);

        return this._activeWindow === currWin;
    }

    public setActiveWindow (win: Window): void {
        this._activeWindow = win;
    }

    public getActiveWindow (currWin: Window): Window {
        this._ensureActiveWindow(currWin);

        return this._activeWindow;
    }

    public getPosition (): AxisValues<number> {
        return new AxisValues(this._x, this._y);
    }

    public get shouldRender (): boolean {
        return this._ui.shouldRender;
    }

    public set shouldRender (val: boolean) {
        this._ui.shouldRender = val;
    }

    public move (point: AxisValuesData<number>): Promise<void> {
        this._x = point.x;
        this._y = point.y;

        return this._ui.move(point);
    }

    public hide (): Promise<void> {
        if (this._ui.hide)
            return this._ui.hide();

        return Promise.resolve();
    }

    public show (): Promise<void> {
        if (this._ui.show)
            return this._ui.show();

        return Promise.resolve();
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
