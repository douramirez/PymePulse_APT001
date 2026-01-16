export type Role = "OWNER" | "ADMIN" | "STAFF" | "VIEWER";

export function canManageCatalog(role: Role) {
  return role === "OWNER" || role === "ADMIN";
}

export function canSell(role: Role) {
  return role === "OWNER" || role === "ADMIN" || role === "STAFF";
}

export function canMoveInventory(role: Role) {
  return role === "OWNER" || role === "ADMIN" || role === "STAFF";
}

export function canView(role: Role) {
  return true; // todos
}

export function canCloseAlerts(role: Role) {
  return role === "OWNER" || role === "ADMIN";
}
