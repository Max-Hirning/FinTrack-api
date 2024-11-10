import { File } from "@prisma/client";
import { FileTypes } from "@prisma/client";
import { prisma } from "@/database/prisma/prisma";
import { InternalServerError } from "@/business/lib/errors";
import {
    v2 as cloudinary,
    UploadApiOptions,
    UploadApiResponse,
} from "cloudinary";

const deletFile = async (file: File) => {
    try {
        await cloudinary.uploader.destroy(file.fileId);
        await prisma.file.delete({
            where: {
                id: file.id,
            },
        });
    } catch (error) {
        console.log(error);
    }

    return "File was deleted";
};

const saveFile = async (options: UploadApiOptions, fileBuffer?: Buffer) => {
    if (fileBuffer) {
        try {
            const response: UploadApiResponse = await new Promise(
                (resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        options,
                        (error, result) => {
                            if (result) resolve(result);
                            if (error)
                                reject(new Error(`Cloudinary upload error: ${error.message}`));
                            reject(new Error("Cloudinary upload error"));
                        },
                    );
                    uploadStream.end(fileBuffer);
                },
            );
            return response;
        } catch (error) {
            throw new InternalServerError((error as Error).message);
        }
    }
    throw new InternalServerError("No valid image file found");
};

const deleteProfileAvatar = async (userId: string) => {
    const files = await prisma.file.findMany({
        where: {
            userId,
        },
    });

    for (const file of files) {
        await deletFile(file);
    }

    return "Profile avatar was deleted";
};

const saveProfileAvatar = async (userId: string, fileBuffer?: Buffer) => {
    await deleteProfileAvatar(userId);

    const file = await fileService.saveFile(
        { folder: "avatar", resource_type: "image" },
        fileBuffer,
    );

    if (file) {
        try {
            await prisma.file.create({
                data: {
                    userId,
                    type: FileTypes.png,
                    url: file.secure_url,
                    fileId: file.public_id,
                },
            });
        } catch (error) {
            await cloudinary.uploader.destroy(file.public_id);
            throw new InternalServerError((error as Error).message);
        }
    }

    return "New profile avatar was saved";
};

export const fileService = {
    saveFile,
    deletFile,
    saveProfileAvatar,
    deleteProfileAvatar,
};
