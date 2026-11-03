export type Role = "admin" | "editor" | "secretary";
export type Permission = "requests" | "content" | "settings" | "users" | "audit";

const MATRIX: Record<Role, Permission[]> = {
  admin: ["requests", "content", "settings", "users", "audit"],
  editor: ["content", "settings"],
  secretary: ["requests"],
};

export const ROLE_LABELS: Record<Role, string> = { admin: "Administrateur", editor: "Éditeur", secretary: "Secrétariat" };
export const can = (role: Role, p: Permission) => MATRIX[role].includes(p);
