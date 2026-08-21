import { Role } from "generated/prisma/enums";

export interface AuthenticatedUser {
  userId: string;
  username: string;
  role: Role;
  isActive: boolean;
}