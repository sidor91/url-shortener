import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUrlDto } from '../mongo/dto/create-url.dto';
import { RedisService } from 'src/redis/redis.service';
import { MongoService } from 'src/mongo/mongo.service';
import * as crypto from 'crypto';
import { ShortenDto } from './dto/shorten.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UrlService {
  BASE_URL: string;

  constructor(
    private readonly redisService: RedisService,
    private readonly mongoService: MongoService,
    private readonly configService: ConfigService,
  ) {
    this.BASE_URL = this.configService.get('BASE_URL');
  }

  async save(dto: CreateUrlDto): Promise<void> {
    const { short_url, long_url } = dto;
    await this.redisService.set(short_url, long_url);
    await this.mongoService.create(dto);
  }

  async generateShortUrl() {
    return crypto.randomBytes(3).toString('hex');
  }

  async getShortenUrl(dto: ShortenDto): Promise<Record<string, string>> {
    const short_url = await this.generateShortUrl();

    await this.save({ short_url, long_url: dto.long_url, click_count: 0 });
    return { short_url: `${this.BASE_URL}/${short_url}` };
  }

  async redirect(short_url: string): Promise<string> {
    const cachedUrl = await this.redisService.get(short_url);

    if (cachedUrl) {
      await this.mongoService.incrementClickCount({ short_url });
      return cachedUrl;
    }

    const url = await this.mongoService.findOne({ short_url });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    await this.redisService.set(short_url, url.long_url);
    await this.mongoService.incrementClickCount({ short_url });

    return url.long_url;
  }

  async getStats(url: string): Promise<any> {
    const item = await this.mongoService.findOne({ short_url: url });
    if (!item) {
      throw new NotFoundException('URL not found');
    }
    const { short_url, long_url, click_count } = item;

    return {
      short_url: `${this.BASE_URL}/${short_url}`,
      long_url,
      click_count,
    };
  }
}
