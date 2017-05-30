// @flow
export default class Rocket {
    country: string;
    year:    number;
    name:    string;

    constructor (country: string, name: string, year: number) {
        this.country = country;
        this.name    = name;
        this.year    = year;
    }

    launch (payload: number) {
        if (payload < 0 || payload > this.maxPayload)
            return 'We have a problem!';

        return 'Rocket launched succesfully!';
    }

    maxPayload: number = 6900;
}

