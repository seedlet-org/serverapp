import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';
// import prisma from 'src/prisma/prisma.middleware';
// import { User } from '@prisma/client';
import { userWithRole } from '../types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles: string[] = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const user = request.user as userWithRole;
    const role = user.role;

    if (!user || !role || !role.id) {
      return false;
    }

    // const role = await prisma.role.findUnique({
    //   where: { id: user.roleId },
    //   select: { name: true },
    // });

    // if (!role) return false;

    return requiredRoles.includes(role.name);
  }
}
