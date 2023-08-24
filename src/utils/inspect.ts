import { inspect } from 'util';

const INSPECT_OPTIONS = {
    compact: false,
    sorted:  true,
    depth:   null,
};

export default function (value: any): void {
    inspect(value, INSPECT_OPTIONS);
}
