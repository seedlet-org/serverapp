import { hashValue } from '../utils/helpers.utils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient().$extends({
  query: {
    user: {
      create({ args, query }) {
        if (args.data.password) {
          args.data.password = hashValue(args.data.password);
        }
        return query(args);
      },
      update({ args, query }) {
        if (args.data.password) {
          args.data.password = hashValue(args.data.password as string);
        }
        return query(args);
      },
    },
  },
});

export default prisma;
