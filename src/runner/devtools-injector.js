class DevToolsInjector {
    constructor (host, port, nodeTargetId) {
        this.host         = host;
        this.port         = port;
        this.nodeTargetId = nodeTargetId;

        this.target    = null;
        this.sessionId = null;

        this.messageHandler       = null;
        this.disconnectionHandler = null;

        this.targetManager   = SDK.targetManager;
        this.mainTarget      = this.targetManager.mainTarget();
        this.mainTargetAgent = this.mainTarget.targetAgent();
        this.devToolsTarget  = null;
    }

    _registerAsTargetDispatcher () {
        this.mainTarget.registerTargetDispatcher(this);
    }

    async _disableTargetsDiscovering () {
        await this.mainTargetAgent.setDiscoverTargets(false);
    }

    async _enableTargetsDiscovering () {
        await this.mainTargetAgent.setDiscoverTargets(true);
        await this.mainTargetAgent.setRemoteLocations([{ host: this.host, port: this.port }]);
    }

    async _addTargetToDevTools (target) {
        this.target         = target;
        this.sessionId      = await this.mainTargetAgent.attachToTarget(this.target.targetId);
        this.devToolsTarget = this.targetManager.createTarget(this.target.targetId, 'TestCafe Test Code', SDK.Target.Type.Node, this.mainTarget, undefined, undefined, this);

        this.devToolsTarget.runtimeAgent().runIfWaitingForDebugger();
    }

    static async inject (host, port, nodeTargetId) {
        const injector = new DevToolsInjector(host, port, nodeTargetId);

        await injector._disableTargetsDiscovering();
        await injector._registerAsTargetDispatcher();
        await injector._enableTargetsDiscovering();
    }

    targetCreated (target) {
        if (target.type !== 'node' || target.targetId.indexOf(this.port) < 0 || target.targetId.indexOf(this.host) < 0)
            return;

        this._addTargetToDevTools(target);
    }

    receivedMessageFromTarget (sessionId, message) {
        if (sessionId !== this.sessionId || !this.messageHandler)
            return;

        this.messageHandler.call(null, message);
    }

    setOnMessage (messageHandler) {
        this.messageHandler = messageHandler;
    }


    setOnDisconnect (disconnectionHandler) {
        this.disconnectionHandler = disconnectionHandler;
    }

    sendRawMessage (message) {
        this.mainTargetAgent.sendMessageToTarget(message, this.sessionId);
    }

    disconnect () {
        if (this.disconnectionHandler)
            this.disconnectionHandler.call(null, 'force disconnect');

        this.disconnectionHandler = null;
        this.messageHandler       = null;

        return this.mainTargetAgent.detachFromTarget(this.sessionId);
    }
}

exports.default = DevToolsInjector;
