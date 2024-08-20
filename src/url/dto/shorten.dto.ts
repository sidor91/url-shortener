import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ShortenDto {
  @ApiProperty({
    description: 'The long URL to be shortened',
    example: 'https://example.com',
  })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  long_url: string;
}

export class ShortenResponseDto {
  @ApiProperty({
    description: 'The short URL ended with 6 characters of alphanumeric text',
    example: 'http://base-url/fc63d2',
  })
  @IsString()
  @IsNotEmpty()
  short_url: string;
}