import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';
import { MongoModule } from './mongo/mongo.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from './redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { UrlModule } from './url/url.module';

import { RedisConfig } from './@configs/redis.config';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_DB_ATLAS_URL),
    CacheModule.register(RedisConfig),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            limit: configService.get('THROTTLER_LIMIT'),
            ttl: configService.get('THROTTLER_TTL_SECONDS'),
          },
        ],
        storage: new ThrottlerStorageRedisService(),
      }),
    }),
    MongoModule,
    RedisModule,
    UrlModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
