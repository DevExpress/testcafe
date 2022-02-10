import ProtocolProxyApi from 'devtools-protocol/types/protocol-proxy-api';
import RuntimeApi = ProtocolProxyApi.RuntimeApi;
import Protocol from 'devtools-protocol/types/protocol';
import ConsoleAPICalledEvent = Protocol.Runtime.ConsoleAPICalledEvent;


type ConsoleMessageType = ConsoleAPICalledEvent['type'];
type MessagesMap = { [key in ConsoleMessageType]?: string[] };


export default class ConsoleCollector {
    private readonly _methods: ConsoleMessageType[];
    private _messages: MessagesMap;

    public constructor (methods: ConsoleMessageType[]) {
        this._methods = methods;
        this._messages = this._resetMessages();
    }

    private _resetMessages (): MessagesMap {
        return this._methods.reduce((map, method) => {
            map[method] = [];
            return map;
        }, {} as MessagesMap); // eslint-disable-line @typescript-eslint/no-object-literal-type-assertion
    }

    public read (): MessagesMap {
        const messages = this._messages;

        this._messages = this._resetMessages();

        return messages;
    }

    public initialize (Runtime: RuntimeApi): void {
        Runtime.on('consoleAPICalled', params => {
            if (!this._methods.includes(params.type))
                return;

            debugger // eslint-disable-line

            this._messages[params.type]!.push(params.args[0]?.description || String(params.args[0]?.value) || params.args[0]?.type); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        });
    }
}
