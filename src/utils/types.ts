import { Prisma, Staff } from '@prisma/client';

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
  'password'
>;
