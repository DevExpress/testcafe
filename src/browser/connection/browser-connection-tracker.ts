import BrowserConnection from './index';

class BrowserConnectionTracker {
    public activeBrowserConnections: { [id: string]: BrowserConnection };

    public constructor () {
        this.activeBrowserConnections = {};
    }

    public add (connection: BrowserConnection): void {
        this.activeBrowserConnections[connection.id] = connection;
    }

    public remove (connection: BrowserConnection): void {
        delete this.activeBrowserConnections[connection.id];
    }
}

export default new BrowserConnectionTracker();
