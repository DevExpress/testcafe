var BROADCAST_EVENTS_OWNER_TOKEN = 'PROXY_BROADCAST';

//Emitter
var EventEmitter = function () {
    this.eventHandlers = {};
};

EventEmitter.prototype.listen = function (evtName, handler) {
    this.eventHandlers[evtName] = handler;
};

EventEmitter.prototype.emit = function (evtName) {
    var handler = this.eventHandlers[evtName];

    if (handler) {
        var params = Array.prototype.slice.call(arguments, 1);

        handler.apply(this, params);
    }
};

//Events
var Events = module.exports = function () {
    this.emitters = {};
    this.broadcast = this.for(BROADCAST_EVENTS_OWNER_TOKEN);
};

Events.prototype.for = function (ownerToken) {
    if (!this.emitters[ownerToken])
        this.emitters[ownerToken] = new EventEmitter();

    return this.emitters[ownerToken];
};

Events.prototype.in = function (ctx) {
    var ownerToken = ctx.jobInfo && ctx.jobInfo.ownerToken,
        emitter = this.for(ownerToken);

    return {
        emit: function () {
            var params = Array.prototype.slice.call(arguments, 0);

            //NOTE: make ctx first parameter of event
            params.splice(1, 0, ctx);

            emitter.emit.apply(emitter, params);
        },

        canHandle: function (evtName) {
            return !!emitter.eventHandlers[evtName];
        }
    };
};
