const { PassThrough: PassThroughStream } = require('stream');
const { expect }                         = require('chai');
const proxyquire                         = require('proxyquire');
const sinon                              = require('sinon');
const delay                              = require('../../lib/utils/delay');
const EventEmitter                       = require('../../lib/utils/async-event-emitter');


const RECEIVED_MESSAGES_PROCESSING_DELAY = 100;

describe('IPC IO', () => {
    it('Should operate on a stream with AsyncReader and AsyncWriter', async () => {
        const events = new EventEmitter();
        const stream = new PassThroughStream();

        const { AsyncReader, AsyncWriter } = require('../../lib/services/utils/ipc/io');

        const reader = new AsyncReader(stream);
        const writer = new AsyncWriter(stream);

        const receivedMessages = [];

        let processingReceivedMessage = false;
        let messageHandlersOverlapped = false;
        let messagesCount             = 0;

        const messageReceived = events.once('message-received');
        const testDone        = events.once('test-done');

        reader.on('data', async message => {

            if (processingReceivedMessage)
                messageHandlersOverlapped = true;

            processingReceivedMessage = true;

            await delay(RECEIVED_MESSAGES_PROCESSING_DELAY);
            receivedMessages.push(message);

            processingReceivedMessage = false;

            messagesCount += 1;

            if (messagesCount === 1)
                await events.emit('message-received');

            if (messagesCount === 3)
                await events.emit('test-done');
        });


        reader.read();
        await writer.write({ a: 1 });

        await messageReceived;

        await writer.write({ b: 2 });
        await writer.write({ c: 3 });

        await testDone;

        expect(receivedMessages).deep.equal([{ a: 1 }, { b: 2 }, { c: 3 }]);
        expect(messageHandlersOverlapped).equal(false);
    });

    it('Should operate on a file descriptor synchronously with SyncReader and SyncWriter', () => {
        const writeSyncStub = sinon.spy();

        const readSyncStub = sinon.stub().callsFake((fd, buffer) => {
            const writeArgs   = writeSyncStub.args.filter(([arg0]) => arg0 === fd);
            const currentCall = readSyncStub.callCount - 1;
            const writeBuffer = writeArgs[currentCall][1];

            writeBuffer.copy(buffer);

            return writeBuffer.length;
        });

        const { SyncReader, SyncWriter } = proxyquire('../../lib/services/utils/ipc/io', {
            'fs': {
                readSync:  readSyncStub,
                writeSync: writeSyncStub
            }
        });

        const fd = 42;

        const reader = new SyncReader(fd);
        const writer = new SyncWriter(fd);

        writer.writeSync({ a: 1 });

        let message = reader.readSync();

        expect(message).deep.equal({ a: 1 });

        writer.writeSync({ b: 2 });
        writer.writeSync({ c: 3 });

        message = reader.readSync();

        expect(message).deep.equal({ b: 2 });

        message = reader.readSync();

        expect(message).deep.equal({ c: 3 });

        expect(writeSyncStub.alwaysCalledWith(fd)).equal(true);
        expect(readSyncStub.alwaysCalledWith(fd)).equal(true);
    });
});
