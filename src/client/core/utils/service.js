import hammerhead from '../deps/hammerhead';
import { filter } from './array';

export function inherit (Child, Parent) {
    var Func = function () {
    };

    Func.prototype = Parent.prototype;

    hammerhead.utils.extend(Child.prototype, new Func());
    Child.prototype.constructor = Child;
    Child.base                  = Parent.prototype;
}

export var EventEmitter = function () {
    this.eventsListeners = [];
};

EventEmitter.prototype.emit = function (evt) {
    var listeners = this.eventsListeners[evt];

    if (listeners) {
        for (var i = 0; i < listeners.length; i++) {
            try {
                if (listeners[i])
                    listeners[i].apply(this, Array.prototype.slice.apply(arguments, [1]));
            }
            catch (e) {
                // Hack for IE: after document.write calling IFrameSandbox event handlers
                // rises 'Can't execute code from a freed script' exception because document has been
                // recreated
                if (e.message && e.message.indexOf('freed script') > -1)
                    listeners[i] = null;
                else
                    throw e;
            }
        }
    }
};

EventEmitter.prototype.off = function (evt, listener) {
    var listeners = this.eventsListeners[evt];

    if (listeners)
        this.eventsListeners[evt] = filter(listeners, item => item !== listener);
};

EventEmitter.prototype.on = function (evt, listener) {
    if (!this.eventsListeners[evt])
        this.eventsListeners[evt] = [];

    this.eventsListeners[evt].push(listener);
};

EventEmitter.prototype.once = function (evt, listener) {
    this.on(evt, (...args) => {
        this.off(evt, listener);

        return listener(...args);
    });
};
