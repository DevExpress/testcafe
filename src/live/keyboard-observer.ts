import process from 'process';
import { emitKeypressEvents, Key } from 'readline';
import { pull } from 'lodash';
import LiveModeController from './controller';

const LOCK_KEY_PRESS_TIMEOUT = 1000;

let instance: LiveModeKeyboardEventObserver;

export default class LiveModeKeyboardEventObserver {
    private controllers: LiveModeController[] = [];
    private lockKeyPress: boolean = false;

    public constructor () {
        if (!instance) {
            this._listenKeyEvents();

            instance = this;
        }

        return instance;
    }

    public push (controller: LiveModeController): void {
        this.controllers.push(controller);

        if (process.stdin.isTTY)
            this.setRawMode(true);
    }

    public remove (controller: LiveModeController): void {
        pull(this.controllers, controller);

        if (!this.controllers.length)
            this.setRawMode(false);
    }

    protected _listenKeyEvents (): void {
        emitKeypressEvents(process.stdin);

        process.stdin.on('keypress', this._onKeyPress.bind(this));
    }

    private setRawMode (value: boolean): void {
        if (process.stdin.setRawMode !== void 0)
            process.stdin.setRawMode(value);
    }

    private _onKeyPress (string: string, key: Key): void {
        if (this.lockKeyPress)
            return;

        this.lockKeyPress = true;

        setTimeout(() => {
            this.lockKeyPress = false;
        }, LOCK_KEY_PRESS_TIMEOUT);

        if (key && key.ctrl) {
            switch (key.name) {
                case 's':
                    this._stop();
                    return;
                case 'r':
                    this._restart();
                    return;
                case 'c':
                    this._exit();
                    return;
                case 'w':
                    this._toggleWatching();
                    return;
            }
        }
    }

    private _stop (): void {
        this.controllers.forEach(c => c.stop());
    }

    private _restart (): void {
        this.controllers.forEach(c => c.restart());
    }

    private _exit (): void {
        this.controllers.forEach(c => c.exit());
    }

    private _toggleWatching (): void {
        this.controllers.forEach(c => c.toggleWatching());
    }
}
