import uuid from 'uuid';

export function create () {
    var id     = uuid.v4();
    var tokens = id.split('-');

    return tokens[tokens.length - 1];
}