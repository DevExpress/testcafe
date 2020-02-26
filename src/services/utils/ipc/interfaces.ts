import { UnsubscribeFn } from 'emittery';
import EventEmitter from '../../../utils/async-event-emitter';
import TestCafeErrorList from '../../../errors/error-list';


export type ExternalError = Error | TestCafeErrorList;

/* eslint-disable @typescript-eslint/interface-name-prefix */
export enum IPCPacketType {
    request,
    response
}

export interface IPCPacket {
    id: number;
    type: IPCPacketType;
    sync: boolean;
}

export interface IPCRequestData {
    name: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any[];
}

export interface IPCRequestPacket extends IPCPacket {
    data: IPCRequestData;
}

export interface IPCSuccessfulResponse {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
}

export interface IPCErrorResponse {
    error: ExternalError;
}

export interface IPCResponsePacket extends IPCPacket {
    data: IPCSuccessfulResponse | IPCErrorResponse;
}

export enum IPCTransportEvents {
    data = 'data'
}

export interface IPCTransport extends EventEmitter {
    on(event: IPCTransportEvents.data, handler: (data: IPCPacket) => Promise<void>): UnsubscribeFn;

    read(): void;
    write(packet: IPCPacket): Promise<void>;

    readSync(): IPCResponsePacket;
    writeSync(packet: IPCPacket): void;
}
/* eslint-enable @typescript-eslint/interface-name-prefix */


export function isTestCafeErrorList (err: ExternalError): err is TestCafeErrorList {
    return (err as TestCafeErrorList).name === TestCafeErrorList.name;
}

export function isIPCErrorResponse (response: IPCSuccessfulResponse | IPCErrorResponse): response is IPCErrorResponse {
    return !!(response as IPCErrorResponse).error;
}

export function isIPCResponsePacket (message: object): message is IPCResponsePacket {
    return ['id', 'type', 'sync', 'data'].every(prop => prop in message);
}
