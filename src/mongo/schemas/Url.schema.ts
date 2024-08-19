import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<Url>;

@Schema()
export class Url {
  @Prop({ required: true })
  short_url: string;

  @Prop({ required: true })
  long_url: string;

  @Prop()
  click_count: number;
}

export const UrlSchema = SchemaFactory.createForClass(Url);
