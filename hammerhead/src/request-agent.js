import Agent from 'yakaa';
import LRUCache from 'lru-cache';

// Const
const SSL3_HOST_CACHE_SIZE = 1000;

const TYPE = {
    SSLv3: 'SSLv3',
    TLSv1: 'TLSv1',
    HTTP:  'HTTP'
};


// Static
var SSLv3HostCache = new LRUCache({ max: SSL3_HOST_CACHE_SIZE });

// NOTE: we need agent with the proper keep-alive behavior.
// Such agent was landed in Node 0.12. Since we still support
// Node 0.10 we will use third-party agent which is basically is the
// extraction of the Node 0.12 Agent code.
var agents = {
    [TYPE.SSLv3]: {
        instance:       null,
        ctor:           Agent.SSL,
        secureProtocol: 'SSLv3_method'
    },

    [TYPE.TLSv1]: {
        instance:       null,
        ctor:           Agent.SSL,
        secureProtocol: 'TLSv1_method'
    },

    [TYPE.HTTP]: {
        instance: null,
        ctor:     Agent
    }
};


// Utils
function getAgent (type) {
    var agent = agents[type];

    if (!agent.instance) {
        agent.instance = new agent.ctor({
            keepAlive:      true,
            secureProtocol: agent.secureProtocol
        });
    }

    return agent.instance;
}

function isSSLProtocolErr (err) {
    return err.message && err.message.indexOf('SSL routines') > -1;
}


// API
export function assign (reqOpts) {
    var type = void 0;

    if (reqOpts.protocol === 'http:')
        type = TYPE.HTTP;

    else if (SSLv3HostCache.get(reqOpts.host))
        type = TYPE.SSLv3;

    else
        type = TYPE.TLSv1;

    reqOpts.agent = getAgent(type);
}

export function shouldRegressHttps (reqErr, reqOpts) {
    var currentAgentIsTLSv1 = reqOpts.agent.options.secureProtocol === agents[TYPE.TLSv1].secureProtocol;
    return currentAgentIsTLSv1 && isSSLProtocolErr(reqErr);
}

export function regressHttps (reqOpts) {
    SSLv3HostCache.set(reqOpts.host, true);
    reqOpts.agent = getAgent(TYPE.SSLv3);
}

// NOTE: since our agents are keep-alive, we need to manually
// reset connections when we switch servers in tests
export function resetKeepAliveConnections () {
    Object.keys(agents).forEach(function (type) {
        var agent = agents[type];

        if (agent.instance)
            agent.instance.destroy();

        agent.instance = null;
    });
}