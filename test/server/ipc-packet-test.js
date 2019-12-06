const { expect } = require('chai');
const proxyquire = require('proxyquire');
const Packet     = require('../../lib/services/utils/ipc/packet');


describe('IPC Packet', () => {
    it('Should serialize and parse data', () => {
        const originalMessage = Buffer.from('hello world');

        let packet        = Packet.serialize(originalMessage);
        let parsedMessage = Packet.parse(packet);

        expect(packet).be.instanceof(Buffer);
        expect(parsedMessage.header.head).equal(false);
        expect(parsedMessage.header.tail).equal(false);
        expect(parsedMessage.header.totalSize).equal(packet.length);
        expect(parsedMessage.header.size).equal(packet.length - Packet.HEADER_SIZE);
        expect(parsedMessage.data).deep.equal(originalMessage);

        packet        = Packet.serialize(originalMessage, { head: true });
        parsedMessage = Packet.parse(packet);

        expect(packet).be.instanceof(Buffer);
        expect(parsedMessage.header.head).equal(true);
        expect(parsedMessage.header.tail).equal(false);
        expect(parsedMessage.header.totalSize).equal(packet.length);
        expect(parsedMessage.header.size).equal(packet.length - Packet.HEADER_SIZE);
        expect(parsedMessage.data).deep.equal(originalMessage);

        packet        = Packet.serialize(originalMessage, { tail: true });
        parsedMessage = Packet.parse(packet);

        expect(packet).be.instanceof(Buffer);
        expect(parsedMessage.header.head).equal(false);
        expect(parsedMessage.header.tail).equal(true);
        expect(parsedMessage.header.totalSize).equal(packet.length);
        expect(parsedMessage.header.size).equal(packet.length - Packet.HEADER_SIZE);
        expect(parsedMessage.data).deep.equal(originalMessage);

        packet        = Packet.serialize(originalMessage, { head: true, tail: true });
        parsedMessage = Packet.parse(packet);

        expect(packet).be.instanceof(Buffer);
        expect(parsedMessage.header.head).equal(true);
        expect(parsedMessage.header.tail).equal(true);
        expect(parsedMessage.header.totalSize).equal(packet.length);
        expect(parsedMessage.header.size).equal(packet.length - Packet.HEADER_SIZE);
        expect(parsedMessage.data).deep.equal(originalMessage);
    });

    it('Should throw an error if data is too large', () => {
        const bigPacket = proxyquire('../../lib/services/utils/ipc/packet', {});

        bigPacket.MAX_PAYLOAD_SIZE = 2;
        bigPacket.MAX_PACKET_SIZE  = bigPacket.HEADER_SIZE + bigPacket.MAX_PAYLOAD_SIZE;

        const smallPacket = proxyquire('../../lib/services/utils/ipc/packet', {});

        smallPacket.MAX_PAYLOAD_SIZE = 1;
        smallPacket.MAX_PACKET_SIZE  = smallPacket.HEADER_SIZE + smallPacket.MAX_PAYLOAD_SIZE;

        expect(() => smallPacket.serialize(Buffer.from('XX'))).throw('The specified payload is too large to form an IPC packet.');

        expect(() => smallPacket.parse(bigPacket.serialize(Buffer.from('XX')))).throw('The specified payload is too large to form an IPC packet.');
    });

    it('Should parse packets from a stream data', () => {
        const originalMessageA = Buffer.from('A');
        const originalMessageB = Buffer.from('B');
        const originalMessageC = Buffer.from('C');

        const data = Buffer.concat([
            Packet.serialize(originalMessageA, { head: true }),
            Packet.serialize(originalMessageB),
            Packet.serialize(originalMessageC, { tail: true }),
        ]);

        const messageA = Packet.parse(data);

        expect(messageA.data).deep.equal(originalMessageA);
        expect(messageA.header.head).equal(true);
        expect(messageA.header.tail).equal(false);

        const messageB = Packet.parse(data.slice(messageA.header.totalSize));

        expect(messageB.data).deep.equal(originalMessageB);
        expect(messageB.header.head).equal(false);
        expect(messageB.header.tail).equal(false);

        const messageC = Packet.parse(data.slice(messageA.header.totalSize + messageB.header.totalSize));

        expect(messageC.data).deep.equal(originalMessageC);
        expect(messageC.header.head).equal(false);
        expect(messageC.header.tail).equal(true);
    });
});
