import type { MockAuthUser } from "@/types/auth";

export const MOCK_AUTH_USERS: MockAuthUser[] = [
  {
    id: "usr-001",
    firstName: "Hugo",
    lastName: "Soliz",
    fullName: "Hugo Soliz",
    email: "hugo@soydigital.tech",
    password: "123456",
    role: "SUPER_ADMIN",
  },
  {
    id: "usr-jhoseline",
    firstName: "Jhoseline",
    lastName: "Apaza",
    fullName: "Jhoseline Apaza",
    email: "jhoseline.apaza@gencorpbo.com",
    password: "123456",
    role: "ASSIGNED_ADVISOR",
  },
];
