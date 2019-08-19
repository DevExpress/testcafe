import ClientScript from './client-script';

export default async function (scriptInits, basePath) {
    basePath = basePath || process.cwd();

    const scripts = scriptInits.map(scriptInit => new ClientScript(scriptInit, basePath));

    await Promise.all(scripts.map(script => script.load()));

    return scripts;
}
