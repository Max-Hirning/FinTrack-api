import * as fastifyTypeProviderZod from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyBasicAuth from "@fastify/basic-auth";
import { FastifyInstance } from "fastify";
import { environmentVariables } from "@/config";
import { UnauthorizedError } from "@/business/lib/errors";

const basicAuthUsername = "admin";
const basicAuthPassword = environmentVariables.DOCS_PASSWORD;

export async function configureSwagger(fastify: FastifyInstance) {
    await fastify.register(fastifySwagger, {
        openapi: {
            openapi: "3.1.0",
            info: {
                title: "Fastify template API",
                version: "0.1.0",
            },
        },
        transform: fastifyTypeProviderZod.jsonSchemaTransform,
    });

    await fastify.register(fastifyBasicAuth, {
        validate(username, password, _req, _reply, done) {
            if (
                username === basicAuthUsername &&
                password === basicAuthPassword
            ) {
                done();
                return;
            }

            done(UnauthorizedError("Invalid credentials"));
        },
        authenticate: true,
    });

    await fastify.register(fastifySwaggerUi, {
        routePrefix: "/api/docs",
        uiHooks: {
            onRequest: fastify.basicAuth,
        },
    });

    return {
        username: basicAuthUsername,
        password: basicAuthPassword,
    };
}
