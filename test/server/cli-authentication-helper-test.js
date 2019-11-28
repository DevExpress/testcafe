const { noop }   = require('lodash');
const { expect } = require('chai');
const proxyquire = require('proxyquire');
const sinon      = require('sinon');
const Timer      = require('../../lib/utils/timer');


describe('CLI', () => {
    describe('Authentication helper', () => {
        it('Should retry until permissions granted', async () => {
            const getAnyKey        = sinon.stub();
            const TimerConstructor = sinon.stub();
            const log              = { write: sinon.stub() };

            const authFunction = sinon.stub();

            TimerConstructor.returns({ expired: false, promise: new Promise(noop) });

            getAnyKey
                .onCall(0).resolves()
                .onCall(1).resolves();

            authFunction
                .onCall(0).rejects(Error('Call 0'))
                .onCall(1).rejects(Error('Call 1'))
                .onCall(2).resolves('OK');

            const authenticationHelper = proxyquire('../../lib/cli/authentication-helper', {
                './log':                log,
                '../utils/timer':       TimerConstructor,
                '../utils/get-any-key': getAnyKey
            });

            const { result, error } = await authenticationHelper(authFunction, Error);

            expect(error).be.undefined;
            expect(result).equal('OK');
            expect(getAnyKey.callCount).equal(2);
            expect(log.write.callCount).equal(2);

            expect(
                log.write.alwaysCalledWith(
                    'TestCafe requires permission to record the screen. ' +
                    'Open \'System Preferences > Security & Privacy > Privacy > Screen Recording\' and check ' +
                    '\'TestCafe Browser Tools\' in the application list.\n' +
                    '\n' +
                    'Press any key to retry.'
                ),
                log.write.args
            ).be.true;
        });

        it('Should retry until the timeout expires until permissions granted', async () => {
            const getAnyKey        = sinon.stub();
            const TimerConstructor = sinon.stub();
            const log              = { write: sinon.stub() };

            const authFunction = sinon.stub();

            const fakeTimer = new Timer(0);

            TimerConstructor.returns(fakeTimer);

            getAnyKey.resolves(new Promise(noop));

            authFunction
                .onCall(0).rejects(Error('Call 0'))
                .onCall(1).resolves('OK');

            const authenticationHelper = proxyquire('../../lib/cli/authentication-helper', {
                './log':                log,
                '../utils/timer':       TimerConstructor,
                '../utils/get-any-key': getAnyKey
            });

            const { result, error } = await authenticationHelper(authFunction, Error);

            expect(error).be.undefined;
            expect(result).equal('OK');
            expect(TimerConstructor.callCount).equal(1);
            expect(TimerConstructor.args[0]).deep.equal([30000]);
            expect(log.write.callCount).equal(1);

            expect(log.write.args[0]).deep.equal([
                'TestCafe requires permission to record the screen. ' +
                'Open \'System Preferences > Security & Privacy > Privacy > Screen Recording\' and check ' +
                '\'TestCafe Browser Tools\' in the application list.\n' +
                '\n' +
                'Press any key to retry.'
            ]);
        });

        it('Should return an error if the timeout expires and no permissions granted', async () => {
            const getAnyKey        = sinon.stub();
            const TimerConstructor = sinon.stub();
            const log              = { write: sinon.stub() };

            const authFunction = sinon.stub();

            const fakeTimer = new Timer(0);

            TimerConstructor.returns(fakeTimer);

            getAnyKey.resolves(new Promise(noop));

            authFunction.rejects(Error('Call'));

            const authenticationHelper = proxyquire('../../lib/cli/authentication-helper', {
                './log':                log,
                '../utils/timer':       TimerConstructor,
                '../utils/get-any-key': getAnyKey
            });

            const { result, error } = await authenticationHelper(authFunction, Error);

            expect(error.message).equal('Call');
            expect(result).be.undefined;
            expect(authFunction.callCount).equal(2);
            expect(TimerConstructor.callCount).equal(1);
            expect(TimerConstructor.args[0]).deep.equal([30000]);
            expect(getAnyKey.callCount).equal(1);
            expect(log.write.callCount).equal(1);

            expect(log.write.args[0]).deep.equal([
                'TestCafe requires permission to record the screen. ' +
                'Open \'System Preferences > Security & Privacy > Privacy > Screen Recording\' and check ' +
                '\'TestCafe Browser Tools\' in the application list.\n' +
                '\n' +
                'Press any key to retry.'
            ]);
        });

        it('Should throw if an unexpected error occurs', async () => {
            class CustomError extends Error {

            }

            const getAnyKey        = sinon.stub();
            const TimerConstructor = sinon.stub();
            const log              = { write: sinon.stub() };

            const authFunction = sinon.stub();

            const fakeTimer = new Timer(0);

            TimerConstructor.returns(fakeTimer);

            getAnyKey.resolves(new Promise(noop));

            authFunction.rejects(Error('Unexpected'));

            const authenticationHelper = proxyquire('../../lib/cli/authentication-helper', {
                './log':                log,
                '../utils/timer':       TimerConstructor,
                '../utils/get-any-key': getAnyKey
            });

            let unexpectedError = null;
            let result          = null;
            let error           = null;

            try {
                ({ result, error } = await authenticationHelper(authFunction, CustomError));
            }
            catch (e) {
                unexpectedError = e;
            }

            expect(unexpectedError.message).equal('Unexpected');
            expect(result).be.null;
            expect(error).be.null;
            expect(authFunction.callCount).equal(1);
            expect(TimerConstructor.callCount).equal(0);
            expect(getAnyKey.callCount).equal(0);
            expect(log.write.callCount).equal(0);
        });
    });
});
