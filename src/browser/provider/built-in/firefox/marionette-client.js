import Promise from 'pinkie';
import { Socket } from 'net';
import promisifyEvent from 'promisify-event';
import EventEmitter from 'events';
import { writeFile } from '../../../../utils/promisified-functions';
import delay from '../../../../utils/delay';
import { GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from '../../utils/client-functions';


const CONNECTION_TIMEOUT     = 30000;
const CONNECTION_RETRY_DELAY = 300;
const MAX_RESIZE_RETRY_COUNT = 2;
const HEADER_SEPARATOR       = ':';

const MARIONETTE_KEYMAP = {
    left:      '\uE012',
    escape:    '\uE00C',
    down:      '\uE015',
    right:     '\uE014',
    up:        '\uE013',
    backspace: '\uE003',
    capslock:  '\uE008',
    delete:    '\uE017',
    end:       '\uE010',
    enter:     '\uE007',
    esc:       '\uE00C',
    home:      '\uE011',
    ins:       '\uE016',
    pagedown:  '\uE00F',
    pageup:    '\uE00E',
    space:     '\uE00D',
    tab:       '\uE004',
    alt:       '\uE052',
    ctrl:      '\uE051',
    meta:      '\uE03D',
    shift:     '\uE008',
    plus:      '\uE025'
};

module.exports = class MarionetteClient {
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

                    returnPromiseControl.resolve = () => {};
                    returnPromiseControl.reject  = () => {};
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

    _getResponse (packet) {
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

    async performActions (actions) {
        await this._getResponse({ command: 'WebDriver:PerformActions', parameters: { actions } });
    }

    async quit () {
        await this._getResponse({ command: 'quit' });
    }

    async cancelAction () {
        this.events.emit('cancel');
    }

    async executeCommand (msg) {
        if (this.executingAction)
            this.cancelAction();

        this.executingAction = true;

        let mods = null;

        if (msg.modifiers && !msg.clearMods) {
            mods = ['ctrl', 'alt', 'shift', 'meta'].filter(key => msg.modifiers[key]);

            if (mods.length) {
                await this.performActions([{
                    id:      'keyboard',
                    type:    'key',
                    actions: mods.map(key => ({ type: 'keyDown', value: MARIONETTE_KEYMAP[key] }))
                }]);
            }
        }

        if (msg.type === 'move') {
            await this.performActions([{
                id:         'mouse',
                type:       'pointer',
                parameters: { pointerType: 'mouse' },

                actions: [
                    {
                        type:     'pointerMove',
                        duration: 1000,
                        x:        msg.x,
                        y:        msg.y
                    }
                ]
            }]);

        }
        else if (msg.type === 'click' || msg.type === 'right-click' || msg.type === 'double-click' || msg.type === 'mouse-down' || msg.type === 'mouse-up') {
            const button = msg.type === 'right-click' ? 2 : 0;
            const actions = [];

            if (msg.type !== 'mouse-up')
                actions.push({ type: 'pointerDown', button });

            if (msg.type !== 'mouse-down')
                actions.push({ type: 'pointerUp', button });

            if (msg.type === 'double-click')
                actions.push(...actions);

            await this.performActions([{
                id:         'mouse',
                type:       'pointer',
                parameters: { pointerType: 'mouse' },

                actions
            }]);
        }
        else if (msg.type === 'text') {
            const actions = [];

            Array.prototype.forEach.call(msg.text, char => {
                actions.push({ type: 'keyDown', value: char }, { type: 'keyUp', value: char });
            });

            await this.performActions([{
                id:   'keyboard',
                type: 'key',

                actions
            }]);
        }
        else if (msg.type === 'press') {
            const actions = [];

            msg.combinations.forEach(comb => {
                comb = comb.replace(/^\+/, 'plus').replace('++', '+plus');

                const keys = comb.split(/\+/);

                actions.push(...keys.map(key => ({ type: 'keyDown', value: MARIONETTE_KEYMAP[key] || key })));
                actions.push(...keys.map(key => ({ type: 'keyUp', value: MARIONETTE_KEYMAP[key] || key })));
            });

            await this.performActions([{
                id:   'keyboard',
                type: 'key',

                actions
            }]);
        }

        if (msg.modifiers && !msg.keepMods) {
            if (!mods)
                mods = ['ctrl', 'alt', 'shift', 'meta'].filter(key => msg.modifiers[key]);

            if (mods.length) {
                await this.performActions([{
                    id:      'keyboard',
                    type:    'key',
                    actions: mods.map(key => ({ type: 'keyUp', value: MARIONETTE_KEYMAP[key] }))
                }]);
            }
        }

        this.executingAction = false;
    }
};

