import { IsNotEmpty, IsString } from "class-validator";

export class ShortenDto {
  @IsString()
  @IsNotEmpty()
  long_url: string
}