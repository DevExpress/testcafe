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

        console.log(requestPacket.name, requestPacket.args);

        try {
            console.log(this.listenerCount(requestPacket.name));
            if (requestPacket.name === 'use-role')
                debugger;
            results.data = (await this.emit(requestPacket.name, requestPacket.args))[0];
        }
        catch (error) {
            results.error = error;

            console.log(error)
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

    async send (name, args) {
        const packet          = this._createPacket(name, args);
        const responsePromise = this.once(`response-${packet.id}`);

        await this.transport.write(JSON.stringify(packet));

        const { error, data } = await responsePromise;

        if (error)
            throw error;

        return data;
    }

    sendSync (name, args) {
        const requestPacket = this._createPacket(name, args);

        requestPacket.sync = true;

        this.transport.writeSync(JSON.stringify(requestPacket));

        console.log('written');

        let responsePacket = JSON.parse(this.transport.readSync().toString());

        console.log(responsePacket);

        while (responsePacket.id !== requestPacket.id)
            responsePacket = JSON.parse(this.transport.readSync().toString());

        const { error, data } = responsePacket;

        if (error)
            throw error;

        return data;
    }
}
