
interface ClientScriptCommon {
    page?: any;
}

interface ClientScriptContent extends ClientScriptCommon {
    content?: string;
}

interface ClientScriptModule extends ClientScriptCommon {
    module?: string;
}

interface ClientScriptPath extends ClientScriptCommon {
    path?: string;
}

type ClientScript = ClientScriptContent | ClientScriptModule | ClientScriptPath;
