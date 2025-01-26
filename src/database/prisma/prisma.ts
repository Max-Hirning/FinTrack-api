import { Server } from "net";
import { environmentVariables } from "@/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { buildProxyDatabaseConnection } from "./proxy";
import { Connector } from "@google-cloud/cloud-sql-connector";

// `prisma` is overridden with proxy connection string on production
let prisma = new PrismaClient();
let connector: Connector;
let proxy: Server;

const initializePrismaProxy = async () => {
    if (environmentVariables.NODE_ENV !== "production") {
        console.log(
            "Skipping Prisma proxy initialization for none production env...",
        );
        return;
    }

    connector = new Connector();

    const database = await buildProxyDatabaseConnection(connector);

    prisma = database.database;
    proxy = database.proxy;
};

const disconnectPrisma = async () => {
    await prisma.$disconnect();
    proxy?.close();
    connector?.close();
};

export { initializePrismaProxy, disconnectPrisma, prisma, Prisma };
