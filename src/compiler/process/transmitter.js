import EE from '../../utils/async-event-emitter';

export default class Transmitter extends EE {
    constructor (transport) {
        super();

        this.transport = transport;
        this.requestCounter = 0;

        this.inBuffer = Buffer.alloc(64535);

        this.transport.read();
        this.transport.on('data', rawPacket => this._onRead(rawPacket));
        this.on('request', data => this._onRequest(data));
    }

    async _onRead (rawPacket) {
        const packet = JSON.parse(rawPacket.toString());

        if (packet.type === 'response')
            this.emit(`response-${packet.id}`, packet);
        else
            this.emit('request', packet);
    }

    async _onRequest (requestPacket) {
        const results = {
            data: void 0,
            error: void 0
        };
        
        console.log(requestPacket.name, requestPacket.args);

        try {
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

        await this.transport.write(JSON.stringify(responsePacket)); 
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
}
