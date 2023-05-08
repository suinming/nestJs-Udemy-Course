import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';

interface JWTPayload {
  name: string;
  id: number;
  iat: number;
  exp: number;
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext) {
    // 1) determine the UserType that can execute the called endpoint
    const roles = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roles?.length) {
      // 2) grab the JWT from the request header and verify it
      const request = context.switchToHttp().getRequest();
      const token = request.headers?.authorization?.split('Bearer ')[1];
      try {
        const payload = jwt.verify(
          token,
          process.env.JSON_TOKEN_KEY,
        ) as JWTPayload;
        // 3) database request to get user by id
        const user = await this.prismaService.user.findUnique({
          where: { id: Number(payload.id) },
        });

        if (!user) return false;

        // 4) determine if the user has the permission
        if (roles.includes(user.user_Type)) return true;

        return false;
      } catch (error) {
        return false;
      }
    }
    return true;
  }
}
