import dep1Fn from './dep1';

export default async function() {
    return `${await dep1Fn()} and dep2`;
}
