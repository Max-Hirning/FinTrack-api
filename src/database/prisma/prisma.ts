import { Server } from "net";
import { fastify } from "@/bootstrap";
import { environmentVariables } from "@/config";
import { hashing } from "@/business/lib/hashing";
import { Prisma, PrismaClient } from "@prisma/client";
import { buildProxyDatabaseConnection } from "./proxy";
import { checkerService } from "@/business/services/checker";
import { Connector } from "@google-cloud/cloud-sql-connector";

// `prisma` is overridden with proxy connection string on production
let prisma = new PrismaClient();
let connector: Connector;
let proxy: Server;

const initializePrismaProxy = async () => {
    if (environmentVariables.NODE_ENV !== "production") {
        fastify.log.warn(
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

prisma.$use(async (params, next) => {
    if (params.model == "User") {
        if (params.action == "update") {
            const args: Prisma.UserUpdateArgs = params.args;
            const role = args.data.role;
            await Promise.all([
                role && role instanceof Object
                    ? checkerService.checkUpdateCreateRole({
                        userWhere: args.where,
                        userRole: role.set,
                    })
                    : checkerService.checkUpdateCreateRole({
                        userWhere: args.where,
                        userRole: role,
                    }),
            ]);
            params.args.data = {
                ...args.data,
                ...(typeof args.data.password === "string" && {
                    password: hashing.hashPassword(args.data.password),
                }),
            };
        }
        if (params.action == "updateMany") {
            const args: Prisma.UserUpdateManyArgs = params.args;
            const role = args.data.role;
            await Promise.all([
                role && role instanceof Object
                    ? checkerService.checkUpdateCreateRole({
                        userWhere: args.where,
                        userRole: role.set,
                    })
                    : checkerService.checkUpdateCreateRole({
                        userWhere: args.where,
                        userRole: role,
                    }),
            ]);
            params.args.data = {
                ...args.data,
                ...(typeof args.data.password === "string" && {
                    password: hashing.hashPassword(args.data.password),
                }),
            };
        }
        if (params.action == "create") {
            const args: Prisma.UserCreateArgs = params.args;
            await Promise.all([
                checkerService.checkUpdateCreateRole({
                    userRole: args.data.role,
                }),
            ]);
            params.args.data = {
                ...args.data,
                password: hashing.hashPassword(args.data.password),
            };
        }
        if (params.action == "createMany") {
            const args: Prisma.UserCreateManyArgs = params.args;
            const users = Array.isArray(args.data) ? args.data : [args.data];

            for (const user of users) {
                await Promise.all([
                    checkerService.checkUpdateCreateRole({
                        userRole: user.role,
                    }),
                ]);

                user.password = hashing.hashPassword(user.password);
            }
            params.args.data = users;
        }
    }
    return next(params);
});

export { initializePrismaProxy, disconnectPrisma, prisma, Prisma };
