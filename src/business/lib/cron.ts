import { fastify } from "@/bootstrap";

const cronTasks = async ({
    cleanupTasks = [],
    criticalTasks = [],
    notificationTasks = [],
}: {
  cleanupTasks?: (() => Promise<unknown>)[];
  criticalTasks?: (() => Promise<unknown>)[];
  notificationTasks?: (() => Promise<unknown>)[];
}) => {
    try {
        if (criticalTasks.length > 0) {
            // Группа 1: Ключевые операции
            fastify.log.info(`${criticalTasks.length} critical tasks started`);
            const criticalResults = await Promise.allSettled(
                criticalTasks.map((task) => task()),
            );
            criticalResults.forEach((result, index) => {
                if (result.status === "rejected") {
                    fastify.log.error(
                        `Critical task ${index + 1} failed:`,
                        result.reason,
                    );
                }
            });
        }

        if (cleanupTasks.length > 0) {
            // Группа 2: Очистка данных
            fastify.log.info(`${criticalTasks.length} cleanup tasks started`);
            const cleanupResults = await Promise.allSettled(
                cleanupTasks.map((task) => task()),
            );
            cleanupResults.forEach((result, index) => {
                if (result.status === "rejected") {
                    fastify.log.error(`Cleanup task ${index + 1} failed:`, result.reason);
                }
            });
        }

        if (notificationTasks.length > 0) {
            // Группа 3: Уведомления и финальные задачи
            fastify.log.info(`${criticalTasks.length} notification tasks started`);
            const notificationResults = await Promise.allSettled(
                notificationTasks.map((task) => task()),
            );
            notificationResults.forEach((result, index) => {
                if (result.status === "rejected") {
                    fastify.log.error(
                        `Notification task ${index + 1} failed:`,
                        result.reason,
                    );
                }
            });
        }

        fastify.log.info("CRON job completed successfully");
    } catch (error) {
        fastify.log.error("Unexpected error in CRON job", error);
    }
};

export { cronTasks };
