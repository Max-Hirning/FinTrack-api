import * as fastifyTypeProviderZod from "fastify-type-provider-zod";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { configureRoutes } from "@/routes";
import { environmentVariables } from "@/config";
import { prisma } from "./database/prisma/prisma";
import { configureSwagger } from "./bootstrap/swagger";

const envToLogger = {
    development: {
        transport: {
            target: "pino-pretty",
            options: {
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
            },
        },
    },
    production: true,
    test: false,
};

async function main() {
    const fastify = Fastify({
        logger: envToLogger[environmentVariables.NODE_ENV] ?? true,
    });

    await fastify.register(fastifyCors, {
        origin: true,
        credentials: true,
    });

    fastify.setValidatorCompiler(fastifyTypeProviderZod.validatorCompiler);
    fastify.setSerializerCompiler(fastifyTypeProviderZod.serializerCompiler);

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
            `Docs login: ${credentials.username} | password: ${credentials.password}`
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
