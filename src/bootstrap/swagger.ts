import * as fastifyTypeProviderZod from "fastify-type-provider-zod";
import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyBasicAuth from "@fastify/basic-auth";
import { FastifyInstance } from "fastify";
import { environmentVariables } from "@/config";
import { UnauthorizedError } from "@/business/lib/errors";

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
const basicAuthUsername = "admin";
const basicAuthPassword = environmentVariables.DOCS_PASSWORD;

export const fastify = Fastify({
    logger: envToLogger[environmentVariables.NODE_ENV] ?? true,
});

export async function configureSwagger(fastify: FastifyInstance) {
    await fastify.register(fastifySwagger, {
        openapi: {
            openapi: "3.1.0",
            info: {
                version: "0.1.0",
                title: "Fastify template API",
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        // Name of the security scheme
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT", // Optional, specify if using JWT format
                    },
                },
            },
        },
        transform: fastifyTypeProviderZod.jsonSchemaTransform,
    });

    await fastify.register(fastifyBasicAuth, {
        validate(username, password, _req, _reply, done) {
            if (username === basicAuthUsername && password === basicAuthPassword) {
                done();
                return;
            }

            done(UnauthorizedError("Invalid credentials"));
        },
        authenticate: true,
    });

    await fastify.register(fastifySwaggerUi, {
        uiHooks: {
            onRequest: fastify.basicAuth,
        },
        routePrefix: "/api/docs",
    });

    return {
        username: basicAuthUsername,
        password: basicAuthPassword,
    };
}
