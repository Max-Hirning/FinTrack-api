import "fastify";
import * as fastifyTypeProviderZod from "fastify-type-provider-zod";
import fastifyJwt from "@fastify/jwt";
import fastifyAmqp from "fastify-amqp";
import fastifyCors from "@fastify/cors";
import { configureRoutes } from "@/routes";
import { Roles, User } from "@prisma/client";
import { IAccessToken } from "@/types/token";
import { environmentVariables } from "@/config";
import { prisma } from "@/database/prisma/prisma";
import { FastifyReply, FastifyRequest } from "fastify";
import { ForbiddenError } from "@/business/lib/errors";
import { configureSwagger, fastify } from "@/bootstrap/swagger";
import {
    setupEmailConsumer,
    setupImageConsumer,
    setupNotificationConsumer,
} from "@/business/lib/rabbitmq";

declare module "fastify" {
  export interface FastifyInstance {
    authorization: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    checkRole: (
      options?: Roles[],
    ) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: Pick<User, "role" | "id">;
  }
}

async function main() {
    fastify
        .register(fastifyAmqp, {
            url: environmentVariables.RABBITMQ_URL,
            port: +environmentVariables.RABBITMQ_PORT,
        })
        .after((err) => {
            if (err) throw err;
            setupEmailConsumer(fastify.amqp.channel);
            setupImageConsumer(fastify.amqp.channel);
            setupNotificationConsumer(fastify.amqp.channel);
        });
    await fastify.register(fastifyJwt, {
        secret: environmentVariables.APPLICATION_SECRET,
    });
    await fastify.register(fastifyCors, {
        origin: true,
        credentials: true,
    });

    fastify.setValidatorCompiler(fastifyTypeProviderZod.validatorCompiler);
    fastify.setSerializerCompiler(fastifyTypeProviderZod.serializerCompiler);
    fastify.decorate(
        "authorization",
        async (req: FastifyRequest, reply: FastifyReply) => {
            try {
                const headerToken = req.headers.authorization?.split(" ")[1];

                if (!headerToken) return reply.status(401).send("Unauthorized");
                const { userId, role } = fastify.jwt.verify<IAccessToken>(headerToken);

                req.user = {
                    role,
                    id: userId,
                };
            } catch (e) {
                console.log(e);
                return reply.status(401).send("Unauthorized");
            }
        },
    );
    fastify.decorate(
        "checkRole",
        (
            allowedRoles: Roles[] = Object.values(Roles),
        ): ((req: FastifyRequest, reply: FastifyReply) => Promise<void>) => {
            return async (req: FastifyRequest) => {
                const { id, role } = req.user;

                if (![...allowedRoles].includes(role)) {
                    throw new ForbiddenError("You are not allowed");
                }

                req.user = {
                    id,
                    role,
                };
            };
        },
    );

    const credentials = await configureSwagger(fastify);

    await configureRoutes(fastify);

    fastify.ready(async (err) => {
        if (err) {
            return;
        }

        await prisma.$connect();
    });

    try {
        const address = await fastify.listen({
            port: environmentVariables.PORT,
            host: environmentVariables.HOST,
        });

        fastify.log.info(`Documentation available at ${address}/api/docs/`);
        fastify.log.info(
            `Docs login: ${credentials.username} | password: ${credentials.password}`,
        );
        fastify.log.info("Please update in production");
    } catch (err) {
        fastify.log.error("Failed to start server");
        fastify.log.error(err);

        process.exit(1);
    }

    const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
    signals.forEach((signal) => {
        process.on(signal, async () => {
            fastify.log.info(`Received ${signal}, closing server`);

            // All the active connections, resources should be closed here.
            await prisma.$disconnect();
            await fastify.close();
            process.exit(0);
        });
    });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
