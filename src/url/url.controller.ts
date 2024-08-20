import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { ShortenDto, ShortenResponseDto } from './dto/shorten.dto';
import { Response } from 'express';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('URL Shortener Service')
@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  @ApiOperation({ summary: 'Create a shortened URL' })
  @ApiBody({ type: ShortenDto })
  @ApiResponse({
    status: 201,
    description: 'Short URL created successfully',
    type: ShortenResponseDto,
  })
  create(@Body() dto: ShortenDto) {
    return this.urlService.getShortenUrl(dto);
  }

  @Get('/:code')
  @ApiOperation({ summary: 'Redirect to the original URL' })
  @ApiParam({ name: 'code', description: 'Short URL code' })
  @ApiResponse({ status: 302, description: 'Redirection to original URL' })
  @ApiResponse({ status: 404, description: 'Short URL not found' })
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const url = await this.urlService.redirect(code);
    res.redirect(url);
  }

  @Get('/stats/:code')
  @ApiOperation({ summary: 'Get statistics for a shortened URL' })
  @ApiParam({ name: 'code', description: 'Short URL code' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Short URL not found' })
  async getUrlStats(@Param('code') code: string) {
    return this.urlService.getStats(code);
  }
}
