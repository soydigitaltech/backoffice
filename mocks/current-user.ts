import type { UserRole } from "@/types/user";

export type CurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export const CURRENT_USER: CurrentUser = {
  id: "usr-jhoseline",
  firstName: "Judith",
  lastName: "Blanco",
  fullName: "Jhoseline Apaza",
  email: "jhoseline.apaza@gencorpbo.com",
  role: "ASSIGNED_ADVISOR",
};
