
import { Role } from "@prisma/client";

export function getSessionRole(session: any): Role {
  return session.role as Role;
}
