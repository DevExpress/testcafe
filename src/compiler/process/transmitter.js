import EE from '../../utils/async-event-emitter';

export default class Transmitter extends EE {
    constructor (transport) {
        super();

        this.transport = transport;
        this.requestCounter = 0;

        this.inBuffer = Buffer.alloc(64535);

        this.listen();

        this.on('request', data => this._onRequest(data));
    }

    async listen () {
        while (true) {
            const rawPacket = await this.transport.read();
            const packet    = JSON.parse(rawPacket.toString());

            if (packet.type === 'response')
                this.emit(`response-${packet.id}`, packet.data);
            else
                this.emit('request', packet.data);
        }
    }

    async _onRequest (data) {

    }

    _registerMessage (message) {
        return {
            id:   this.requestCounter++,
            data: message
        };
    }

    async send (message) {
        const packet          = this._registerMessage(message);
        const responsePromise = this.once(`response-${id}`);

        await this.transport.write(packet);

        return responsePromise;
    }
}
