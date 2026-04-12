import  { Prisma } from "src/generated/prisma/client";

export type StaffFrontEnd = Omit<
	Prisma.StaffGetPayload<{
		omit: {
			password: true;
		};
		include: {
			venueManagerAssignments: true;
			dutyManagerAssignments: true;
		};
	}>,
	"password"
>;

export type StaffPayload = {
	id: string;
	iat: number;
};
