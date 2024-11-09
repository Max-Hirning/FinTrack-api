import path from "path";
import { promises as fs } from "fs";
import { FastifyInstance } from "fastify";
import { environmentVariables } from "@/config";

const applicationRoutes = async (fastify: FastifyInstance) => {
    fastify.get("/ping", async () => {
        return "pong";
    });
    fastify.post("/reset-cache", async () => {
        await fastify.redis.flushall();
        return "cache is reseted";
    });
    fastify.get("/flag/images", async () => {
        const categoryFolderPath = path.join(process.cwd(), "assets", "flag");
        const files = await fs.readdir(categoryFolderPath);
        const svgFiles = files.filter((file) => path.extname(file) === ".svg");
        const images = svgFiles.map(
            (el) => `${environmentVariables.API_URL}/assets/category/${el}`,
        );
        return images;
    });
    fastify.get("/category/images", async () => {
        const categoryFolderPath = path.join(process.cwd(), "assets", "category");
        const files = await fs.readdir(categoryFolderPath);
        const svgFiles = files.filter((file) => path.extname(file) === ".svg");
        const images = svgFiles.map(
            (el) => `${environmentVariables.API_URL}/assets/category/${el}`,
        );
        return images;
    });
};

export { applicationRoutes };
