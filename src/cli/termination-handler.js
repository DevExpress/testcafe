import EventEmitter from 'events';


const TERMINATION_TYPES = {
    sigint:   'sigint',
    sigbreak: 'sigbreak',
    shutdown: 'shutdown'
};

const TERMINATION_LEVEL_INCREASED_EVENT = 'termination-level-increased';

export default class TerminationHandler extends EventEmitter {
    constructor () {
        super();

        this.handledSignalsCount = {
            [TERMINATION_TYPES.sigint]:   0,
            [TERMINATION_TYPES.sigbreak]: 0,
            [TERMINATION_TYPES.shutdown]: 0
        };

        this.terminationLevel = 0;

        this._setupHandlers();
    }

    _exitEventHandler (terminationType) {
        this.handledSignalsCount[terminationType]++;

        if (this.handledSignalsCount[terminationType] > this.terminationLevel) {
            this.terminationLevel = this.handledSignalsCount[terminationType];

            this.emit(TERMINATION_LEVEL_INCREASED_EVENT, this.terminationLevel);
        }
    }

    _setupHandlers () {
        process.on('SIGINT', () => this._exitEventHandler(TERMINATION_TYPES.sigint));
        process.on('SIGBREAK', () => this._exitEventHandler(TERMINATION_TYPES.sigbreak));

        process.on('message', message => message === 'shutdown' && this._exitEventHandler(TERMINATION_TYPES.shutdown));
    }
}

TerminationHandler.TERMINATION_LEVEL_INCREASED_EVENT = TERMINATION_LEVEL_INCREASED_EVENT;
