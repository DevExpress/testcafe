import OptionSource from './option-source';

export default class Option {
    public name: string;
    public value: OptionValue;
    public source: OptionSource;

    public constructor (name: string, value: OptionValue, source = OptionSource.Configuration) {
        this.name   = name;
        this.value  = value;
        this.source = source;
    }
}
