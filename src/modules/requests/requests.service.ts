import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Requests } from './requests.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Requests)
    private readonly requestRepository: Repository<Requests>,
  ) {}

  async createRequests(telegramId: string, message: string): Promise<Requests> {
    const newReq = this.requestRepository.create({ telegramId, message });
    return this.requestRepository.save(newReq);
  }
}
