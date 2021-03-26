const fs               = require('fs');
const EventEmitter     = require('../../../../lib/utils/async-event-emitter');
const createReplicator = require('../../../../lib/services/serialization/replicator/create-replicator');

const BUFFER_SIZE = 64000;

class Transport extends EventEmitter {
    constructor (inputChannel, outputChannel, syncChannel, isHost) {
        super();

        this.buffer = Buffer.alloc(BUFFER_SIZE);

        this.inputChannel  = inputChannel;
        this.outputChannel = outputChannel;

        this.syncChannel = syncChannel;
        this.isHost      = isHost;
        this.replicator  = createReplicator();

        if (typeof this.inputChannel === 'number')
            this.inputChannel = fs.createReadStream(null, { fd: this.inputChannel });

        if (typeof this.outputChannel === 'number')
            this.outputChannel = fs.createWriteStream(null, { fd: this.outputChannel });
    }

    read () {
        this.inputChannel.on('data', data => this.emit('data', this.replicator.decode(data.toString())));
    }

    write (packet) {
        const channel = this.isHost && packet.sync ? this.syncChannel : this.outputChannel;

        if (channel.write(this.replicator.encode(packet)))
            return Promise.resolve();

        return new Promise(r => channel.on('drain', r));
    }

    readSync () {
        if (this.isHost)
            return;

        const readLength = fs.readSync(this.syncChannel, this.buffer, 0, BUFFER_SIZE, null);

        return this.replicator.decode(this.buffer.slice(0, readLength).toString());
    }

    writeSync (packet) {
        if (this.isHost)
            return;

        fs.writeSync(this.outputChannel.fd, this.replicator.encode(packet));
    }
}

module.exports = Transport;
