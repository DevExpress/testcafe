// @flow
import Rocket from './rocket';


export default class RocketLaunch<T: Rocket> {

    rocket: T;
    payload: number;

    status: string = 'Not ready yet';
    
    constructor (rocket: T, payload: number) {
        this.payload = payload;
        this.rocket  = rocket;
    }

    launchRocket (): T {
        this.status = this.rocket.launch(this.payload);

        return this.rocket;
    }
}
