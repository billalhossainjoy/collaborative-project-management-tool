import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import redisConfig from './redis.config';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [
    RedisService,
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.get('redis.host'),
          port: config.get('redis.port'),
          password: config.get('redis.password'),
        });
      },
    },
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
