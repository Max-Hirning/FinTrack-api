import "fastify";
/*
 * File contains type definitions for the project.
 * */

declare module "fastify" {
    // Enhance the Fastify instance with additional properties
    // e.g. "authenticate" decorator.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface FastifyInstance {}
}
