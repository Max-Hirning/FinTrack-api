import { buildProxy } from "./proxy";
import { PrismaClient } from "@prisma/client";
import { environmentVariables } from "@/config";
import {
    AuthTypes,
    Connector,
    IpAddressTypes,
} from "@google-cloud/cloud-sql-connector";

const buildProxyDatabaseConnection = async (connector: Connector) => {
    const { stream } = await connector.getOptions({
        instanceConnectionName: environmentVariables.INSTANCE_CONNECTION_NAME,
        ipType: IpAddressTypes.PUBLIC,
        authType: AuthTypes.PASSWORD,
    });

    const proxy = buildProxy(stream);
    const prisma = new PrismaClient({
        datasourceUrl: environmentVariables.DATABASE_URL,
    });

    return { proxy, database: prisma };
};

export { buildProxyDatabaseConnection };
