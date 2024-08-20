import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Url } from './schemas/Url.schema';
import { Model } from 'mongoose';
import { CreateUrlDto } from 'src/mongo/dto/create-url.dto';

@Injectable()
export class MongoService {
  constructor(@InjectModel(Url.name) private urlModel: Model<Url>) {}

  async create(dto: CreateUrlDto): Promise<Url> {
    const createdRecord = new this.urlModel(dto);
    return createdRecord.save();
  }

  async findOne(short_url: string): Promise<Url> {
    return this.urlModel.findOne({ short_url }).exec();
  }

  async incrementClickCount({
    short_url,
  }: {
    short_url: string;
  }): Promise<void> {
    await this.urlModel
      .updateOne({ short_url }, { $inc: { click_count: 1 } })
      .exec();
  }
}
