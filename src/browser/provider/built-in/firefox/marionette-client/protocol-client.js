import Promise from 'pinkie';
import { Socket } from 'net';
import promisifyEvent from 'promisify-event';
import { noop } from 'lodash';
import EventEmitter from 'events';
import delay from '../../../../../utils/delay';


const CONNECTION_TIMEOUT     = 30000;
const CONNECTION_RETRY_DELAY = 300;
const HEADER_SEPARATOR       = ':';


export default class {
    constructor (port = 2828, host = '127.0.0.1') {
        this.currentPacketNumber = 1;
        this.events              = new EventEmitter();
        this.port                = port;
        this.host                = host;
        this.socket              = new Socket();
        this.buffer              = Buffer.alloc(0);
        this.getNewDataPromise = Promise.resolve();
        this.getPacketPromise    = Promise.resolve();
        this.sendPacketPromise   = Promise.resolve();
        this.getResponsePromise   = Promise.resolve();

        this.protocolInfo = {
            applicationType:    '',
            marionetteProtocol: '',
        };

        this.newDataCount = 0;

        this.sessionInfo = null;
    }

    async _attemptToConnect (port, host) {
        this.socket.connect(port, host);

        var connectionPromise = Promise.race([
            promisifyEvent(this.socket, 'connect'),
            promisifyEvent(this.socket, 'error')
        ]);

        return await connectionPromise
            .then(() => true)
            .catch(() => {
                this.socket.removeAllListeners('connect');
                return delay(CONNECTION_RETRY_DELAY);
            });
    }

    async _connectSocket (port, host) {
        const connectionStartTime = Date.now();

        var connected = await this._attemptToConnect(port, host);

        while (!connected && Date.now() - connectionStartTime < CONNECTION_TIMEOUT)
            connected = await this._attemptToConnect(port, host);

        if (!connected)
            throw new Error('Unable to connect');

        this.socket.on('data', data => this._handleNewData(data));
    }

    async _writeSocket (message) {
        if (!this.socket.write(message))
            await promisifyEvent(this.socket, 'drain');
    }

    _handleNewData (data) {
        if (!data)
            return;

        this.buffer = Buffer.concat([this.buffer, data]);

        this.newDataCount++;

        this.events.emit('new-data');
    }

    _chainCancelablePromise (chainPromise, cancelableAction) {
        let returnPromiseControl = null;

        const returnPromise = new Promise((resolve, reject) => {
            returnPromiseControl = { resolve, reject };
        });

        chainPromise = chainPromise
            .then(() => {
                const cancelPromise = promisifyEvent(this.events, 'cancel');

                cancelPromise.then(() => {
                    returnPromiseControl.resolve = noop;
                    returnPromiseControl.reject  = noop;
                });

                const actionPromise = cancelableAction()
                    .then(value => returnPromiseControl.resolve(value))
                    .catch(error => returnPromiseControl.reject(error))
                    .then(() => cancelPromise.cancel());

                return Promise.race([cancelPromise, actionPromise]);
            });

        return { chainPromise, returnPromise };
    }

    _getNewData () {
        const { chainPromise, returnPromise } = this._chainCancelablePromise(this.getNewDataPromise, async () => {
            if (!this.newDataCount)
                await promisifyEvent(this.events, 'new-data');

            this.newDataCount--;
        });

        this.getNewDataPromise = chainPromise;

        return returnPromise;
    }

    _getPacket () {
        const { chainPromise, returnPromise } = this._chainCancelablePromise(this.getPacketPromise, async () => {
            var headerEndIndex = this.buffer.indexOf(HEADER_SEPARATOR);

            while (headerEndIndex < 0) {
                await this._getNewData();

                headerEndIndex = this.buffer.indexOf(HEADER_SEPARATOR);
            }

            var packet = {
                length: NaN,
                body:   null
            };

            packet.length = parseInt(this.buffer.toString('utf8', 0, headerEndIndex), 10) || 0;

            var bodyStartIndex = headerEndIndex + HEADER_SEPARATOR.length;
            var bodyEndIndex   = bodyStartIndex + packet.length;

            if (packet.length) {
                while (this.buffer.length < bodyEndIndex)
                    await this._getNewData();

                packet.body = JSON.parse(this.buffer.toString('utf8', bodyStartIndex, bodyEndIndex));
            }

            this.buffer = this.buffer.slice(bodyEndIndex);

            return packet;
        });

        this.getPacketPromise = chainPromise;

        return returnPromise;
    }

    _sendPacket (payload) {
        const { chainPromise, returnPromise } = this._chainCancelablePromise(this.sendPacketPromise, async () => {
            var body       = [0, this.currentPacketNumber++, payload.command, payload.parameters];
            var serialized = JSON.stringify(body);
            var message    = Buffer.byteLength(serialized, 'utf8') + HEADER_SEPARATOR + serialized;

            await this._writeSocket(message);
        });

        this.sendPacketPromise = chainPromise;

        return returnPromise;
    }

    _throwMarionetteError (error) {
        throw new Error(`${error.error}${error.message ? ': ' + error.message : ''}`);
    }


    async connect () {
        await this._connectSocket(this.port, this.host);

        var infoPacket = await this._getPacket();

        this.protocolInfo = {
            applicationType:    infoPacket.body.applicationType,
            marionetteProtocol: infoPacket.body.marionetteProtocol
        };

        this.sessionInfo = await this.getResponse({ command: 'newSession' });
    }

    dispose () {
        this.socket.end();
        this.buffer = null;
    }

    getResponse (packet) {
        const { chainPromise, returnPromise } = this._chainCancelablePromise(this.getResponsePromise, async () => {
            var packetNumber = this.currentPacketNumber;

            await this._sendPacket(packet);

            var responsePacket = await this._getPacket();

            while (!responsePacket.body || responsePacket.body[1] !== packetNumber)
                responsePacket = await this._getPacket();

            if (responsePacket.body[2])
                this._throwMarionetteError(responsePacket.body[2]);

            return responsePacket.body[3];
        });

        this.getResponsePromise = chainPromise;

        return returnPromise;
    }

    cancelResponse () {
        this.events.emit('cancel');
    }
}

