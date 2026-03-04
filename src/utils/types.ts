import { Staff } from "@prisma/client";

export type StaffNoPassword = Omit<Staff, "password">