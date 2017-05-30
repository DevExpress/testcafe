/*
  @flow
*/
declare var fixture: any;
declare var test: any;

import Rocket from './rocket';
import RocketLaunch from './rocket-launch';


const x: number        = 42;
let y: ?string         = 'yo';
var z: string | number = 13;

function repeat (str: string, n: number = 7): string {
    return new Array(n + 1).join(str);
}

const arrow = (str: string, n: number = 13): string => {
    return repeat(str, n);
};

function vecLength<T: { x: number, y: number }> (point: T): number {
    var x: number = point.x;
    var y: number = point.y;

    return Math.sqrt(x * x + y * y);
}

function launch<T: Rocket> (rocket: T): RocketLaunch<T> {
    var launch = new RocketLaunch(rocket, x);

    launch.launchRocket();

    return launch;
}

var soyuzFG: Rocket = new Rocket('Russia', 'Soyuz-FG', 2016);

var soyuzFGLaunch: RocketLaunch<Rocket> = launch(soyuzFG);

type Money = [number, string];

var millionBucks: Money = [1e6, 'USD'];

var yoyos: Array<number | string> = [42, 'yoyo'];

fixture `Flow`.page `https://example.com`;

test('test', async () => {
    var yo = y || 'yo';
    var n  = typeof z === 'string' ? 13 : z;

    return {
        repeated1: repeat(yo, n),
        repeated2: arrow(yo),

        length: vecLength({ x: 3, y: 4 }),

        launchStatus: soyuzFGLaunch.status,

        cash: `${millionBucks[0]} ${millionBucks[1]}`,

        inventory: yoyos[0] + ' ' + yoyos[1]
    };
});


