import { IsNumber, IsString } from 'class-validator';

export class CreateUrlDto {
  @IsString()
  short_url: string;

  @IsString()
  long_url: string;

  @IsNumber()
  click_count: number;
}

export type FindUrlDto = Partial<CreateUrlDto> 