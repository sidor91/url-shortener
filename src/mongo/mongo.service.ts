import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Url } from './schemas/Url.schema';
import { Model } from 'mongoose';
import { CreateUrlDto } from './dto/create-url.dto';

@Injectable()
export class MongoService {
  constructor(@InjectModel(Url.name) private urlModel: Model<Url>) {}

  async create(dto: CreateUrlDto): Promise<Url> {
    const createdUrl = new this.urlModel(dto);
    return createdUrl.save();
  }

  async findAll(): Promise<Url[]> {
    return this.urlModel.find().exec();
  }
}
