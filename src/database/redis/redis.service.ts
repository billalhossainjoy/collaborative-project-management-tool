import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.module';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) public readonly redisClient: Redis) {}

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
