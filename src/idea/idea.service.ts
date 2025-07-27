import { Injectable } from '@nestjs/common';
import prisma from 'src/prisma/prisma.middleware';
@Injectable()
export class IdeaService {
  async getAllIdeas() {
    // return prisma.idea.findMany({
    //   where: {
    //     deletedAt: null,
    //   },
    //   include: {
    //     user: true,
    //   },
    // });
  }
}
