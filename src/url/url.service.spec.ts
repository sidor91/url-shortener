import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { RedisService } from '../redis/redis.service';
import { MongoService } from '../mongo/mongo.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { NotFoundException } from '@nestjs/common';

describe('UrlService', () => {
  let service: UrlService;
  let redisService: RedisService;
  let mongoService: MongoService;
  let configService: ConfigService;

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockMongoService = {
    create: jest.fn(),
    findOne: jest.fn(),
    incrementClickCount: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      const config = {
        BASE_URL: 'http://localhost',
        PORT: '3000',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        { provide: RedisService, useValue: mockRedisService },
        { provide: MongoService, useValue: mockMongoService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    redisService = module.get<RedisService>(RedisService);
    mongoService = module.get<MongoService>(MongoService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('generateShortUrl', () => {
    it('should generate a short URL code', async () => {
      jest
        .spyOn(crypto, 'randomBytes')
        .mockReturnValue(Buffer.from('abcdef', 'hex') as any);

      const shortUrl = await service.generateShortUrl();
      expect(shortUrl).toBe('abcdef');
    });
  });

  describe('getShortenUrl', () => {
    it('should generate a short URL and save it', async () => {
      jest.spyOn(service, 'generateShortUrl').mockResolvedValue('abcdef');
      mockRedisService.set.mockResolvedValue(undefined);
      mockMongoService.create.mockResolvedValue(undefined);

      const dto = { long_url: 'https://example.com' };
      const result = await service.getShortenUrl(dto as any);

      expect(result).toEqual({ short_url: 'http://localhost:3000/abcdef' });
      expect(mockRedisService.set).toHaveBeenCalledWith('abcdef', dto.long_url);
      expect(mockMongoService.create).toHaveBeenCalledWith({
        short_url: 'abcdef',
        long_url: dto.long_url,
        click_count: 0,
      });
    });
  });

  describe('redirect', () => {
    it('should return cached URL if available', async () => {
      mockRedisService.get.mockResolvedValue('https://example.com');
      mockMongoService.incrementClickCount.mockResolvedValue(undefined);

      const url = await service.redirect('abcdef');
      expect(url).toBe('https://example.com');
      expect(mockMongoService.incrementClickCount).toHaveBeenCalledWith({
        short_url: 'abcdef',
      });
    });

    it('should return URL from MongoDB and cache it if not in Redis', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockMongoService.findOne.mockResolvedValue({
        short_url: 'abcdef',
        long_url: 'https://example.com',
        click_count: 0,
      });
      mockMongoService.incrementClickCount.mockResolvedValue(undefined);
      mockRedisService.set.mockResolvedValue(undefined);

      const url = await service.redirect('abcdef');
      expect(url).toBe('https://example.com');
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'abcdef',
        'https://example.com',
      );
      expect(mockMongoService.incrementClickCount).toHaveBeenCalledWith({
        short_url: 'abcdef',
      });
    });

    it('should throw NotFoundException if URL not found in Redis or MongoDB', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockMongoService.findOne.mockResolvedValue(null);

      await expect(service.redirect('abcdef')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStats', () => {
    it('should return URL stats', async () => {
      mockMongoService.findOne.mockResolvedValue({
        short_url: 'abcdef',
        long_url: 'https://example.com',
        click_count: 5,
      });

      const stats = await service.getStats('abcdef');
      expect(stats).toEqual({
        short_url: 'http://localhost:3000/abcdef',
        long_url: 'https://example.com',
        click_count: 5,
      });
    });

    it('should throw NotFoundException if stats are not found', async () => {
      mockMongoService.findOne.mockResolvedValue(null);

      await expect(service.getStats('abcdef')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
