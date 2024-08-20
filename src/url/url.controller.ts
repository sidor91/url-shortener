import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { ShortenDto } from './dto/shorten.dto';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  create(@Body() dto: ShortenDto) {
    return this.urlService.getShortenUrl(dto);
  }

  @Get('/:code')
  async redirect(@Param('code') code: string) {
    return this.urlService.redirect(code);
  }

  @Get('/stats/:code')
  async getUrlStats(@Param('code') code: string) {
    return this.urlService.getStats(code);
  }
}
