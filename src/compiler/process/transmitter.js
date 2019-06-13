import EE from '../../utils/async-event-emitter';

export default class Transmitter extends EE {
    constructor (transport) {
        super();

        this.transport = transport;
        this.requestCounter = 0;

        this.transport.read();
        this.transport.on('data', rawPacket => this._onRead(rawPacket));
        this.on('request', data => this._onRequest(data));
    }

    _saveError (error) {
        if (error.isTestCafeErrorList) {
            const errorData = { ...error };

            errorData.items = errorData.items.map(err => this._saveError(err));

            return errorData;
        }

        return { message: error.message, stack: error.stack, ...error };
    }

    async _onRead (rawPacket) {
        const packet = rawPacket instanceof Buffer ? JSON.parse(rawPacket.toString()) : rawPacket;

        if (packet.type === 'response')
            this.emit(`response-${packet.id}`, packet);
        else
            this.emit('request', packet);
    }

    async _onRequest (requestPacket) {
        const results = {
            data:  void 0,
            error: void 0
        };

        try {
            results.data = (await this.emit(requestPacket.name, requestPacket.args))[0];
        }
        catch (error) {
            results.error = this._saveError(error);
        }

        const responsePacket = {
            id:   requestPacket.id,
            type: 'response',
            ...results
        };

        await this.transport.write(JSON.stringify(responsePacket), { syncChannel: requestPacket.sync });
    }

    _createPacket (name, args) {
        return {
            id:   this.requestCounter++,
            type: 'request',

            name,
            args
        };
    }

    _createError (errorData) {
        if (errorData.isTestCafeErrorList) {
            errorData.items = errorData.items.map(err => this._createError(err));

            return errorData;
        }

        const error = new Error(errorData.message);

        Object.assign(error, errorData);

        return error;
    }

    async send (name, args) {
        const packet          = this._createPacket(name, args);
        const responsePromise = this.once(`response-${packet.id}`);

        await this.transport.write(JSON.stringify(packet));

        const { error, data } = await responsePromise;

        if (error)
            throw this._createError(error);

        return data;
    }

    sendSync (name, args) {
        const requestPacket = this._createPacket(name, args);

        requestPacket.sync = true;

        this.transport.writeSync(JSON.stringify(requestPacket));

        let responsePacket = JSON.parse(this.transport.readSync().toString());

        while (responsePacket.id !== requestPacket.id)
            responsePacket = JSON.parse(this.transport.readSync().toString());

        const { error, data } = responsePacket;

        if (error)
            throw this._createError(error);

        return data;
    }
}
