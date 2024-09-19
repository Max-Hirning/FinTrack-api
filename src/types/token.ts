import { Roles } from "@prisma/client";

interface IAccessToken {
  role: Roles;
  userId: string;
}

interface IRefreshToken {
  uuid: string;
  userId: string;
}

export type { IAccessToken, IRefreshToken };
