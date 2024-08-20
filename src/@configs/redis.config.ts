import { CacheModuleAsyncOptions } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-store";

export const RedisConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  useFactory: async (configService: ConfigService) => {
    const store = await redisStore({
      url: configService.get('REDIS_URL'),
    });
    return {
      store: () => store,
    };
  },
};
