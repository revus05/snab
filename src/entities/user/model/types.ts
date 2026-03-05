import type { UserRole } from "@prisma/client";

export type UserEntity = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl: string | null;
};
