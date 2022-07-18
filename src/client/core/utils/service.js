import hammerhead from '../deps/hammerhead';
import SharedEventEmitter from './event-emitter';


export const EventEmitter = SharedEventEmitter;

export function inherit (Child, Parent) {
    const Func = function () {
    };

    Func.prototype = Parent.prototype;

    hammerhead.utils.extend(Child.prototype, new Func());
    Child.prototype.constructor = Child;
    Child.base                  = Parent.prototype;
}
