import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiTags('App')
  @Get()
  @ApiOperation({ summary: 'Get a welcome message' })
  @ApiResponse({
    status: 200,
    description: 'Successful response with a welcome message',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
