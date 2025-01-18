import net from "net";
import { TLSSocket } from "tls";

import { environmentVariables } from "@/config";

type StreamFunction = () => TLSSocket;

const buildProxy = (stream: StreamFunction) => {
    const proxy = net.createServer((netSocket) => {
        const TLSSocket = stream();
        netSocket.pipe(TLSSocket);
        TLSSocket.pipe(netSocket);

        netSocket.on("error", (err) => {
            console.log("Net socket error");
            console.error(err);
        });
    });

    proxy.on("error", (err) => {
        console.log("Proxy error");
        console.log(err);
    });

    proxy.listen(environmentVariables.DB_PORT);

    return proxy;
};

export { buildProxy };
