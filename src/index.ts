import "fastify";
import * as fastifyTypeProviderZod from "fastify-type-provider-zod";
import path from "path";
import cron from "node-cron";
import middie from "@fastify/middie";
import fastifyJwt from "@fastify/jwt";
import fastifyAmqp from "fastify-amqp";
import serveStatic from "serve-static";
import fastifyCors from "@fastify/cors";
import fastifyRedis from "@fastify/redis";
import fastifyMultipart from "@fastify/multipart";
import { configureRoutes } from "@/routes";
import { IAccessToken } from "@/types/token";
import { v2 as cloudinary } from "cloudinary";
import { environmentVariables } from "@/config";
import { subHours, subMinutes } from "date-fns";
import { cronTasks } from "./business/lib/cron";
import { prisma } from "@/database/prisma/prisma";
import { Periods, Roles, User } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { ForbiddenError } from "@/business/lib/errors";
import { configureSwagger, fastify } from "@/bootstrap/swagger";
import { budgetServcice, otpService, tokenService } from "./business/services";
import { notificationService } from "./business/services/inform/notification.service";
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
    cloudinary.config({
        api_key: environmentVariables.CLOUDINARY_API_KEY,
        cloud_name: environmentVariables.CLOUDINARY_CLOUD_NAME,
        api_secret: environmentVariables.CLOUDINARY_API_SECRET,
    });
    await fastify.register(middie);
    await fastify.register(fastifyJwt, {
        secret: environmentVariables.APPLICATION_SECRET,
    });
    await fastify.register(fastifyCors, {
        origin: true,
        credentials: true,
    });
    await fastify.register(fastifyRedis, {
        url: environmentVariables.REDIS_URL,
    });
    await fastify.register(fastifyMultipart, {
        limits: {
            fileSize: 50000000, // 50 mb
        },
    });
    await fastify.use(
        "/assets",
        serveStatic(path.resolve(__dirname, "../assets")),
    );

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
            } catch {
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

        cron.schedule("* * * * *", async () => {
            fastify.log.info("CRON Runs every 1 minute");
            await cronTasks({
                cleanupTasks: [
                    async () =>
                        otpService.deleteOtps({
                            createdAt: {
                                lt: subMinutes(new Date(), 5),
                            },
                        }),
                    async () =>
                        tokenService.deleteTokens({
                            createdAt: {
                                lt: subHours(new Date(), 1),
                            },
                        }),
                ],
            });
        });

        cron.schedule("0 0 * * *", async () => {
            fastify.log.info("CRON Runs every 1 day");
            await cronTasks({
                notificationTasks: [
                    async () => notificationService.happyBirthday(),
                    async () => notificationService.budgets(),
                    async () => notificationService.loans(),
                    async () => notificationService.goals(),
                ],
            });
        });
        cron.schedule("0 0 * * 1", async () => {
            fastify.log.info("CRON Runs every monday");
            await cronTasks({
                criticalTasks: [
                    async () => budgetServcice.updateBudgetsDateRange(Periods.week),
                ],
            });
        });
        cron.schedule("0 0 1 * *", async () => {
            fastify.log.info("CRON Runs every 1st day of every month");
            await cronTasks({
                criticalTasks: [
                    async () => budgetServcice.updateBudgetsDateRange(Periods.month),
                ],
            });
        });
        cron.schedule("0 0 1 1 *", async () => {
            fastify.log.info("CRON Runs every January 1st");
            await cronTasks({
                criticalTasks: [
                    async () => budgetServcice.updateBudgetsDateRange(Periods.year),
                ],
            });
        });
        cron.schedule("0 0 31 12 *", async () => {
            fastify.log.info("CRON Runs every December 31st");
            await cronTasks({
                notificationTasks: [async () => notificationService.happyNewYear()],
            });
        });
        cron.schedule("0 0 25 12 *", async () => {
            fastify.log.info("CRON Runs every December 25th");
            await cronTasks({
                notificationTasks: [async () => notificationService.happyChristmas()],
            });
        });

        if (environmentVariables.NODE_ENV === "development") {
            fastify.log.info(`Documentation available at ${address}/api/docs/`);
            fastify.log.info(
                `Docs login: ${credentials.username} | password: ${credentials.password}`,
            );
            fastify.log.info("Please update in production");
        }
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

main().catch((error) => {
    fastify.log.error((error as Error).message);
    process.exit(1);
});
