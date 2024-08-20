import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { RedisModule } from 'src/redis/redis.module';
import { MongoModule } from 'src/mongo/mongo.module';

@Module({
  imports: [RedisModule, MongoModule],
  controllers: [UrlController],
  providers: [UrlService],
})
export class UrlModule {}
