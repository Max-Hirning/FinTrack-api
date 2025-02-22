import { Prisma, Roles } from "@prisma/client";
import { ForbiddenError } from "../lib/errors";
import { prisma } from "@/database/prisma/prisma";

const checkUpdateCreateRole = async ({
    userRole,
    userWhere,
}: {
  userRole?: Roles;
  userWhere?: Prisma.UserWhereInput;
}) => {
    if (userRole) {
        if (userWhere) {
            if (!(Roles.user === userRole || Roles.guest === userRole)) {
                throw new ForbiddenError(
                    "You can update only these roles: user and guest",
                );
            }
            return;
        }
        const superAdmin = await prisma.user.findFirst({
            where: {
                role: Roles.admin,
            },
            select: {
                role: true,
            },
        });
        if (superAdmin?.role === userRole)
            throw new ForbiddenError("Only one admin can exist");
        return;
    }
};

export const checkerService = {
    checkUpdateCreateRole,
};
