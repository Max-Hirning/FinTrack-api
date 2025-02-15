import net from "net";
import { TLSSocket } from "tls";
import { fastify } from "@/bootstrap";
import { environmentVariables } from "@/config";

type StreamFunction = () => TLSSocket;

const buildProxy = (stream: StreamFunction) => {
    const proxy = net.createServer((netSocket) => {
        const TLSSocket = stream();
        netSocket.pipe(TLSSocket);
        TLSSocket.pipe(netSocket);

        netSocket.on("error", (error) => {
            fastify.log.error("Net socket error", (error as Error).message);
        });
    });

    proxy.on("error", (error) => {
        fastify.log.error("Proxy error", (error as Error).message);
    });

    proxy.listen(environmentVariables.DB_PORT);

    return proxy;
};

export { buildProxy };
