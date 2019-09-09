import process from 'process';
import readline from 'readline';
import { pull } from 'lodash';

const LOCK_KEY_PRESS_TIMEOUT = 1000;

let instance = null;

export default class LiveModeKeyboardEventObserver {
    constructor () {
        if (!instance) {
            this.controllers = [];

            this._listenKeyEvents();

            instance = this;
        }

        return instance;
    }

    _listenKeyEvents () {
        readline.emitKeypressEvents(process.stdin);

        process.stdin.on('keypress', this._onKeyPress.bind(this));
    }

    push (controller) {
        this.controllers.push(controller);

        if (process.stdin.isTTY)
            process.stdin.setRawMode(true);
    }

    remove (controller) {
        pull(this.controllers, controller);

        if (!this.controllers.length)
            process.stdin.setRawMode(false);
    }

    _onKeyPress (ch, key) {
        if (this.lockKeyPress)
            return null;

        this.lockKeyPress = true;

        setTimeout(() => {
            this.lockKeyPress = false;
        }, LOCK_KEY_PRESS_TIMEOUT);

        if (key && key.ctrl) {
            switch (key.name) {
                case 's':
                    return this._stop();
                case 'r':
                    return this._restart();
                case 'c':
                    return this._exit();
                case 'w':
                    return this._toggleWatching();
            }
        }

        return null;
    }

    _stop () {
        this.controllers.forEach(c => c._stop());
    }

    _restart () {
        this.controllers.forEach(c => c._restart());
    }

    _exit () {
        this.controllers.forEach(c => c._exit());
    }

    _toggleWatching () {
        this.controllers.forEach(c => c._toggleWatching());
    }
}
