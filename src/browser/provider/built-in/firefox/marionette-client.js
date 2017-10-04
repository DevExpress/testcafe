import Promise from 'pinkie';
import { Socket } from 'net';
import promisifyEvent from 'promisify-event';
import EventEmitter from 'events';
import { writeFile } from '../../../../utils/promisified-functions';
import delay from '../../../../utils/delay';
import { GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from '../../utils/client-functions';


const CONNECTION_READY_TIMEOUT   = 300;
const MAX_CONNECTION_RETRY_COUNT = 100;
const MAX_RESIZE_RETRY_COUNT     = 2;
const HEADER_SEPARATOR           = ':';

module.exports = class MarionetteClient {
    constructor (port = 2828, host = '127.0.0.1') {
        this.currentPacketNumber = 1;
        this.events              = new EventEmitter();
        this.port                = port;
        this.host                = host;
        this.socket              = new Socket();
        this.buffer              = Buffer.alloc(0);
        this.getPacketPromise    = Promise.resolve();
        this.sendPacketPromise   = Promise.resolve();

        this.protocolInfo = {
            applicationType:    '',
            marionetteProtocol: '',
        };

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
                return delay(CONNECTION_READY_TIMEOUT);
            });
    }

    async _connectSocket (port, host) {
        var connected = await this._attemptToConnect(port, host);

        for (var i = 0; !connected && i < MAX_CONNECTION_RETRY_COUNT; i++)
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

        this.events.emit('new-data');
    }

    _getPacket () {
        this.getPacketPromise = this.getPacketPromise.then(async () => {
            var headerEndIndex = this.buffer.indexOf(HEADER_SEPARATOR);

            while (headerEndIndex < 0) {
                await promisifyEvent(this.events, 'new-data');

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
                    await promisifyEvent(this.events, 'new-data');

                packet.body = JSON.parse(this.buffer.toString('utf8', bodyStartIndex, bodyEndIndex));
            }

            this.buffer = this.buffer.slice(bodyEndIndex);

            return packet;
        });

        return this.getPacketPromise;
    }

    _sendPacket (payload) {
        this.sendPacketPromise = this.sendPacketPromise.then(async () => {
            var body       = [0, this.currentPacketNumber++, payload.command, payload.parameters];
            var serialized = JSON.stringify(body);
            var message    = Buffer.byteLength(serialized, 'utf8') + HEADER_SEPARATOR + serialized;

            this._writeSocket(message);
        });

        return this.sendPacketPromise;
    }

    _throwMarionetteError (error) {
        throw new Error(`${error.error}${error.message ? ': ' + error.message : ''}`);
    }

    async _getResponse (packet) {
        var packetNumber = this.currentPacketNumber;

        await this._sendPacket(packet);

        var responsePacket = await this._getPacket();

        while (!responsePacket.body || responsePacket.body[1] !== packetNumber)
            responsePacket = await this._getPacket();

        if (responsePacket.body[2])
            this._throwMarionetteError(responsePacket.body[2]);

        return responsePacket.body[3];
    }

    async connect () {
        await this._connectSocket(this.port, this.host);

        var infoPacket = await this._getPacket();

        this.protocolInfo = {
            applicationType:    infoPacket.body.applicationType,
            marionetteProtocol: infoPacket.body.marionetteProtocol
        };

        this.sessionInfo = await this._getResponse({ command: 'newSession' });
    }

    dispose () {
        this.socket.end();
        this.buffer = null;
    }

    async executeScript (code) {
        return await this._getResponse({ command: 'executeScript', parameters: { script: `return (${code})()` } });
    }

    async takeScreenshot (path) {
        var screenshot = await this._getResponse({ command: 'takeScreenshot' });

        await writeFile(path, screenshot.value, { encoding: 'base64' });
    }

    async setWindowSize (width, height) {
        var { value: pageRect } = await this.executeScript(GET_WINDOW_DIMENSIONS_INFO_SCRIPT);
        var attemptCounter      = 0;

        while (attemptCounter++ < MAX_RESIZE_RETRY_COUNT && (pageRect.width !== width || pageRect.height !== height)) {
            var currentRect = await this._getResponse({ command: 'getWindowRect' });

            await this._getResponse({
                command: 'setWindowRect',

                parameters: {
                    x:      currentRect.x,
                    y:      currentRect.y,
                    width:  width + (currentRect.width - pageRect.width),
                    height: height + (currentRect.height - pageRect.height)
                }
            });

            ({ value: pageRect } = await this.executeScript(GET_WINDOW_DIMENSIONS_INFO_SCRIPT));
        }
    }

    async quit () {
        await this._getResponse({ command: 'quit' });
    }
};

