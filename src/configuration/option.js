import optionSource from './option-source';

export default class Option {
    constructor (name, value, source = optionSource.configuration) {
        this.name   = name;
        this.value  = value;
        this.source = source;
    }
}
