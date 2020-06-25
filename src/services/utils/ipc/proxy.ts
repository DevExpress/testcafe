import TestCafeErrorList from '../../../errors/error-list';
import EventEmitter from '../../../utils/async-event-emitter';

import {
    ExternalError,
    isTestCafeErrorList,

    IPCPacket,
    IPCPacketType,
    IPCRequestPacket,
    IPCResponsePacket,
    IPCRequestData,
    isIPCErrorResponse,

    IPCTransportEvents,
    IPCTransport,
} from './interfaces';

import prerenderCallsite from '../../../utils/prerender-callsite';


interface RequestOptions {
    data: IPCRequestData;
    sync: boolean;
}

export class IPCProxy extends EventEmitter {
    private _transport: IPCTransport;
    private _requestCounter: number = 0;
    private readonly _handlers: { [name: string]: Function };

    public constructor (transport: IPCTransport) {
        super();

        this._transport = transport;

        this._handlers = {};

        this._transport.read();
        this._transport.on(IPCTransportEvents.data, rawPacket => this._onRead(rawPacket));
        this.on('request', data => this._onRequest(data));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _saveError (error: ExternalError): any {
        if (isTestCafeErrorList(error)) {
            for (const item of error.items) {
                if (item.callsite)
                    item.callsite = prerenderCallsite(item.callsite);
            }

            return error;
        }

        // NOTE: The properties of the 'Error' class lost during serialization using the 'JSON.stringify' way
        // because they are not enumerable.
        // We clone the object and copy these properties explicitly to mark these properties as enumerable.
        const errorData = Object.assign({}, error);

        errorData.name    = errorData.name || error.name;
        errorData.message = errorData.message || error.message;
        errorData.stack   = errorData.stack || error.stack;

        return errorData;
    }

    private async _onRead (packet: IPCPacket): Promise<void> {
        if (packet.type === IPCPacketType.response)
            this.emit(`response-${packet.id}`, packet);
        else
            this.emit('request', packet);
    }

    private async _onRequest (requestPacket: IPCRequestPacket): Promise<void> {
        let resultData = null;

        try {
            resultData = { result: await this._handlers[requestPacket.data.name](...requestPacket.data.args) };
        }
        catch (error) {
            resultData = { error: this._saveError(error) };
        }

        const responsePacket: IPCResponsePacket = {
            id:   requestPacket.id,
            type: IPCPacketType.response,
            sync: requestPacket.sync,

            data: resultData
        };

        await this._transport.write(responsePacket);
    }

    private _createPacket (opts: RequestOptions): IPCRequestPacket {
        return {
            id:   this._requestCounter++,
            type: IPCPacketType.request,
            sync: opts.sync,
            data: opts.data
        };
    }

    private _createPlainError (errorData: Error): Error {
        const error = new Error(errorData.message);

        Object.assign(error, errorData);

        return error;
    }

    private _createError (errorData: ExternalError): ExternalError {
        if (isTestCafeErrorList(errorData)) {
            const errorList = new TestCafeErrorList();

            errorList.items = errorData.items;

            return errorList;
        }

        return this._createPlainError(errorData);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public register (func: Function, context: any = null): void {
        if (this._handlers[func.name])
            return;

        this._handlers[func.name] = func.bind(context);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async call (target: string|Function, ...args: any[]): Promise<any> {
        const name            = typeof target === 'string' ? target : target.name;
        const packet          = this._createPacket({ data: { name, args }, sync: false });
        const responsePromise = this.once(`response-${packet.id}`);

        await this._transport.write(packet);

        const { data } = await responsePromise;

        if (isIPCErrorResponse(data))
            throw this._createError(data.error);

        return data.result;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public callSync (target: string|Function, ...args: any[]): any {
        const name          = typeof target === 'string' ? target : target.name;
        const requestPacket = this._createPacket({ data: { name, args }, sync: true });

        this._transport.writeSync(requestPacket);

        let responsePacket: IPCResponsePacket = this._transport.readSync();

        while (responsePacket.id !== requestPacket.id)
            responsePacket = this._transport.readSync();

        const response = responsePacket.data;

        if (isIPCErrorResponse(response))
            throw this._createError(response.error);

        return response.result;
    }
}
