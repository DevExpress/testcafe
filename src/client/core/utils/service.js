import $ from '../deps/jquery';


export function inherit (Child, Parent) {
    var Func = function () {
    };

    Func.prototype              = Parent.prototype;

    $.extend(Child.prototype, new Func());
    Child.prototype.constructor = Child;
    Child.base                  = Parent.prototype;
}

// TODO: import the following functions in Hammerhead. (They are not published now)
// We can't use 'obj instanceof $' check because it depends on instance of the jQuery.
export function isJQueryObj (obj) {
    return obj && !!obj.jquery;
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

    if (listeners) {
        this.eventsListeners[evt] = listeners.filter(function (item) {
            return item !== listener;
        });
    }
};

EventEmitter.prototype.on = function (evt, listener) {
    if (!this.eventsListeners[evt])
        this.eventsListeners[evt] = [];

    this.eventsListeners[evt].push(listener);
};
