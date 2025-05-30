import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import JwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IsPublic } from '../decorators/public-route.decorator';
import { JwtPayload } from 'jsonwebtoken';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthorizeGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(JwtConfig.KEY)
    private readonly jwtConfig: ConfigType<typeof JwtConfig>,
    private readonly prisma: PrismaService,

    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IsPublic, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const token = request.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        this.jwtConfig,
      );
      const userId = payload.sub as string;
      const cacheKey = `user:${userId}`;

      let user = await this.redis.get<User>(cacheKey);

      if (!user) {
        user = await this.prisma.user.findUnique({
          where: {
            id: payload.sub as string,
          },
        });
        if (user) await this.redis.set(cacheKey, user, 600);
      }

      request.user = user;
    } catch (err) {
      throw new UnauthorizedException();
    }
    if (request.user) return true;

    return false;
  }
}
