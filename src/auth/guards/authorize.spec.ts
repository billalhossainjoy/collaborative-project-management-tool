import { AuthorizeGuard } from './authorize.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { PrismaService } from '../../database/prisma/prisma.service';
import JwtConfig from '../config/jwt.config';
import { RedisService } from '../../database/redis/redis.service';

describe('AuthorizeGuard', () => {
  let authorizeGuard: AuthorizeGuard;
  let jwtService: JwtService;
  let reflector: Reflector;
  let prismaService: PrismaService;
  let redisService: RedisService;
  let jwtConfig: ConfigType<typeof JwtConfig>;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    } as unknown as JwtService;

    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;

    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;

    redisService = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as RedisService;

    jwtConfig = {} as ConfigType<typeof JwtConfig>;

    authorizeGuard = new AuthorizeGuard(
      jwtService,
      jwtConfig,
      prismaService,
      reflector,
      redisService,
    );
  });

  it('should allow access if the endpoint is public', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await authorizeGuard.canActivate(context);

    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
  });

  it('should throw UnauthorizedException if there is no token', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {},
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    await expect(authorizeGuard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should validate token and allow access when user is found in Redis', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'user123' });
    (redisService.get as jest.Mock).mockResolvedValue({ id: 'user123' });

    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'Bearer validToken',
          },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await authorizeGuard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith(
      'validToken',
      jwtConfig,
    );
    expect(redisService.get).toHaveBeenCalledWith('user:user123');
  });

  it('should validate token and fetch user from database if not found in Redis', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'user123' });
    (redisService.get as jest.Mock).mockResolvedValue(null);
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user123',
    });
    (redisService.set as jest.Mock).mockResolvedValue(undefined);

    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'Bearer validToken',
          },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await authorizeGuard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith(
      'validToken',
      jwtConfig,
    );
    expect(redisService.get).toHaveBeenCalledWith('user:user123');
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user123' },
    });
    expect(redisService.set).toHaveBeenCalledWith(
      'user:user123',
      { id: 'user123' },
      600,
    );
  });

  it('should throw UnauthorizedException if token verification fails', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
      new Error('Invalid token'),
    );

    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'Bearer invalidToken',
          },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    await expect(authorizeGuard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(jwtService.verifyAsync).toHaveBeenCalledWith(
      'invalidToken',
      jwtConfig,
    );
  });
});
