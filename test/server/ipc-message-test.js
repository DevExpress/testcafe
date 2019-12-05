const { expect }                           = require('chai');
const proxyquire                           = require('proxyquire');
const { MessageParser, MessageSerializer } = require('../../lib/services/utils/ipc/message');


describe('IPC Message', () => {
    it('Should serialize and deserialize small messages', () => {
        const serializer = new MessageSerializer();
        const parser     = new MessageParser();

        const originalMessage = { hello: 'world' };

        const data = serializer.serialize(originalMessage);

        expect(data.length).equal(1);
        expect(data[0]).be.instanceof(Buffer);

        const parsedMessages = parser.parse(data[0]);

        expect(parsedMessages.length).equal(1);
        expect(parsedMessages[0]).deep.equal(originalMessage);
    });

    it('Should serialize and deserialize large messages', () => {
        const smallPacket = proxyquire('../../lib/services/utils/ipc/packet', {});

        smallPacket.MAX_PAYLOAD_SIZE = 1;
        smallPacket.MAX_PACKET_SIZE  = smallPacket.HEADER_SIZE + smallPacket.MAX_PAYLOAD_SIZE;

        const smallMessage = proxyquire('../../lib/services/utils/ipc/message', {
            './packet': smallPacket
        });

        const serializer = new smallMessage.MessageSerializer();
        const parser     = new smallMessage.MessageParser();

        const originalMessage = { hello: 'world' };

        const data = serializer.serialize(originalMessage);

        expect(data.length).above(1);
        expect(Object.values(data).every(value => value instanceof Buffer)).equal(true, data);

        const parsedMessages = parser.parse(Buffer.concat(data));

        expect(parsedMessages.length).equal(1);
        expect(parsedMessages[0]).deep.equal(originalMessage);
    });

    it('Should parse messages from a stream data', () => {
        const serializer = new MessageSerializer();
        const parser     = new MessageParser();

        const originalMessageA = { a: 1 };
        const originalMessageB = { b: 2 };
        const originalMessageC = { c: 3 };

        const data = Buffer.concat([
            ...serializer.serialize(originalMessageA),
            ...serializer.serialize(originalMessageB),
            ...serializer.serialize(originalMessageC),
        ]);

        const parsedMessages = parser.parse(data);

        expect(parsedMessages.length).equal(3);
        expect(parsedMessages[0]).deep.equal(originalMessageA);
        expect(parsedMessages[1]).deep.equal(originalMessageB);
        expect(parsedMessages[2]).deep.equal(originalMessageC);
    });

    it('Should throw if an incorrect packet sequence is encountered', () => {
        const smallPacket = proxyquire('../../lib/services/utils/ipc/packet', {});

        smallPacket.MAX_PAYLOAD_SIZE = 2;
        smallPacket.MAX_PACKET_SIZE  = smallPacket.HEADER_SIZE + smallPacket.MAX_PAYLOAD_SIZE;

        const smallMessage = proxyquire('../../lib/services/utils/ipc/message', {
            './packet': smallPacket
        });

        const serializer = new smallMessage.MessageSerializer();
        const parser     = new smallMessage.MessageParser();

        // NOTE: must be serialized to [Buffer('"A'), Buffer('BB'), Buffer('C"')];
        const correctData = serializer.serialize('ABBC');

        expect(correctData.length).equal(3);

        const [head, body, tail] = correctData;
        const unexpectedHeadData = Buffer.concat([head, body, head]);
        const unexpectedBodyData = Buffer.concat([head, tail, body]);
        const unexpectedTailData = Buffer.concat([head, tail, tail]);

        expect(() => parser.parse(unexpectedHeadData)).throw('Cannot create an IPC message due to an unexpected IPC head packet.');
        expect(() => parser.parse(unexpectedBodyData)).throw('Cannot create an IPC message due to an unexpected IPC body packet.');
        expect(() => parser.parse(unexpectedTailData)).throw('Cannot create an IPC message due to an unexpected IPC tail packet.');
    });
});
