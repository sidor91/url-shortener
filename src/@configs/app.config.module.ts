import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_DB_ATLAS_URL'),
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            limit: configService.get<number>('THROTTLER_LIMIT'),
            ttl: configService.get<number>('THROTTLER_TTL_SECONDS'),
          },
        ],
        storage: new ThrottlerStorageRedisService(
          configService.get<string>('REDIS_URL'),
        ),
      }),
    }),
  ],
})
export class AppConfigModule {}
