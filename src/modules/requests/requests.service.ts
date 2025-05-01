import { Injectable } from '@nestjs/common';
import { Request } from './requests.entity';

@Injectable()
export class RequestsService {
  // In-memory storage for requests
  private requests: Request[] = [];
  private nextId = 1;

  constructor() {}

  async createRequests(telegramId: string, message: string): Promise<Request> {
    const newReq: Request = {
      id: this.nextId++,
      telegramId,
      message,
      createdAt: new Date()
    };

    this.requests.push(newReq);
    return newReq;
  }

  // Additional methods can be added as needed
  async getAllRequests(): Promise<Request[]> {
    return this.requests;
  }

  async getRequestById(id: number): Promise<Request | undefined> {
    return this.requests.find(req => req.id === id);
  }
}
