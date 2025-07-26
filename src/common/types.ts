import { Prisma } from '@prisma/client';

export type userWithRole = Prisma.UserGetPayload<{
  include: {
    role: true;
  };
}>;
