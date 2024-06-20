import {
    AddressInfo,
    createServer,
    Server,
} from 'net';
import { ip, ipv6 } from 'address';

function createServerOnFreePort (): Promise<Server> {
    return new Promise(resolve => {
        const server = createServer();

        server.once('listening', () => {
            resolve(server);
        });

        server.listen(0);
    });
}

function closeServers (servers: Server[]): Promise<unknown[]> {
    return Promise.all(servers.map((server: Server) => {
        return new Promise(resolve => {
            server.once('close', resolve);
            server.close();
        });
    }));
}

function checkAvailability (port: number, hostname?: string): Promise<boolean> {
    return new Promise(resolve => {
        const server = createServer();

        server.once('error', () => {
            resolve(false);
        });

        server.once('listening', () => {
            server.once('close', () => {
                resolve(true);
            });

            server.close();
        });

        server.listen(port, hostname);
    });
}

export function isFreePort (port: number): Promise<boolean> {
    return checkAvailability(port);
}

export function getFreePort (): Promise<number> {
    return getFreePorts(1).then(ports => {
        return ports[0];
    });
}

function getFreePorts (count: number): Promise<number[]> {
    const serverPromises = [];
    let ports: number[]  = [];

    // NOTE: Sequentially collect listening
    // servers to avoid interference.
    for (let i = 0; i < count; i++)
        serverPromises.push(createServerOnFreePort());

    return Promise.all(serverPromises)
        .then(servers => {
            ports = servers.map((server: Server) => {
                return (server.address() as AddressInfo).port;
            });

            return servers;
        })
        .then(closeServers)
        .then(() => {
            return ports;
        });
}

export function isMyHostname (hostname: string): Promise<boolean> {
    return getFreePort()
        .then(port => {
            return checkAvailability(port, hostname);
        });
}

export function getIPAddress (): string | undefined {
    return ip() || ipv6();
}
