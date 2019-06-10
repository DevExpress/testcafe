import Promise from 'pinkie';
import ClientScript from './client-script';

export default async function (scriptInits) {
    const scripts = scriptInits.map(scriptInit => new ClientScript(scriptInit));

    await Promise.all(scripts.map(script => script.load()));

    return scripts;
}
