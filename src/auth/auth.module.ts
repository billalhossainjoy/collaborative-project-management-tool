import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HashingProvider } from './provider/hashing.provider';
import { BcryptProvider } from './provider/bcrypt.provider';
import { PrismaModule } from '../database/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import JwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthorizeGuard } from './guards/authorize.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';
import { RedisModule } from '../database/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forFeature(JwtConfig),
    JwtModule.registerAsync(JwtConfig.asProvider()),
    forwardRef(() => UsersModule),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthorizeGuard,
    RolesGuard,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizeGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [
    AuthService,
    HashingProvider,
    AuthorizeGuard,
    RolesGuard,
    JwtModule,
  ],
})
export class AuthModule {}
