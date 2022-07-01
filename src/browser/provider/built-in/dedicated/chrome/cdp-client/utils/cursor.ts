import Protocol from 'devtools-protocol/types/protocol';
import ProtocolProxyApi from 'devtools-protocol/types/protocol-proxy-api';
import AxisValues, { AxisValuesData } from '../../../../../../../shared/utils/values/axis-values';
import { CursorUI } from '../../../../../../../shared/actions/types';

const DEFAULT_COLOR           = { r: 50, g: 50, b: 50, a: 0.5 };
const LEFT_BUTTON_DOWN_COLOR  = { r: 200, g: 50, b: 50, a: 0.5 };
const RIGHT_BUTTON_DOWN_COLOR = { r: 50, g: 200, b: 50, a: 0.5 };

const CURSOR_RECT = {
    width:  20,
    height: 20,
};

const HIGHTLIGHT_CONFIG: Protocol.Overlay.HighlightConfig = {
    showInfo:           true,
    showStyles:         true,
    showRulers:         true,
    showExtensionLines: true,
    eventTargetColor:   DEFAULT_COLOR,
};

export enum CursorState {
    default,
    leftButtonDown,
    rightButtonDown,
}

export class CursorUICdp implements CursorUI {
    private _position: AxisValuesData<number>;
    private _visible: boolean;
    private _state: CursorState;

    public constructor () {
        this._position = new AxisValues<number>(0, 0);
        this._visible  = false;
        this._state    = CursorState.default;
    }

    private get currentColor (): Protocol.DOM.RGBA {
        if (this._state === CursorState.leftButtonDown)
            return LEFT_BUTTON_DOWN_COLOR;
        if (this._state === CursorState.rightButtonDown)
            return RIGHT_BUTTON_DOWN_COLOR;
        return DEFAULT_COLOR;
    }

    private get overlay (): ProtocolProxyApi.OverlayApi {
        return {} as ProtocolProxyApi.OverlayApi;
    }

    private get DOM (): ProtocolProxyApi.DOMApi {
        return {} as ProtocolProxyApi.DOMApi;
    }

    public isVisible (): boolean {
        return this._visible;
    }

    public async move (position: AxisValuesData<number>): Promise<void> {
        this._position = position;

        if (this.isVisible())
            await this.show();
    }

    public async hide (): Promise<void> {
        this._visible = false;

        await this.overlay.hideHighlight();
    }

    public async show (): Promise<void> {
        this._visible = true;

        if (this._state === CursorState.default)
            await this.overlay.highlightRect(Object.assign({ }, CURSOR_RECT, { color: this.currentColor }, this._position));
        else {
            const nodeForLocation = await this.DOM.getNodeForLocation(this._position);
            const config          = { highlightConfig: Object.assign({ contentColor: this.currentColor }, HIGHTLIGHT_CONFIG) };

            await this.overlay.highlightNode(Object.assign(nodeForLocation, config ));
        }
    }

    public async leftButtonDown (): Promise<void> {
        this._state = CursorState.leftButtonDown;

        await this.show();
    }

    public async rightButtonDown (): Promise<void> {
        this._state = CursorState.rightButtonDown;

        await this.show();
    }

    public async buttonUp (): Promise<void> {
        this._state = CursorState.default;

        await this.show();
    }
}
