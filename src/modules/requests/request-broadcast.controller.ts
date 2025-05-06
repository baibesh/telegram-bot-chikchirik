import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { RequestBroadcastService } from './request-broadcast.service';
import { RequestFormData, Group, User, Response } from '../../common/types/request.types';
@Controller('request-broadcast')
export class RequestBroadcastController {
  constructor(private readonly requestBroadcastService: RequestBroadcastService) {}

  @Post('broadcast')
  async broadcastRequest(
    @Body('request') request: RequestFormData & { id: number },
    @Body('groups') groups: Group[],
    @Body('template') template: string,
  ) {
    await this.requestBroadcastService.createRequestBroadcast(request, groups, template);
    return { success: true, message: 'Request broadcast initiated' };
  }

  @Post('update')
  async updateResponders(
    @Body('responses') responses: Array<{
      message: string;
      price_offer: number;
      request_id: RequestFormData;
      performer_id: { user_id: { id: string } };
    }>,
    @Body('changes') changes: Record<string, any>,
    @Body('template') template: string,
  ) {
    await this.requestBroadcastService.updateRequestBroadcast(
      responses,
      changes,
      template,
    );
    return { success: true, message: 'Update notifications sent' };
  }

  @Post('notify-customer/:requestId')
  async notifyCustomer(
    @Param('requestId') requestId: number,
    @Body('request') request: RequestFormData,
    @Body('customer') customer: User,
    @Body('performerId') performerId: number,
    @Body('response') response: Response,
    @Body('template') template: string,
  ) {
    const requestWithIdAndCustomer = { 
      ...request, 
      id: Number(requestId),
      customer 
    };

    await this.requestBroadcastService.notifyCustomerOnResponse(
      requestWithIdAndCustomer,
      performerId,
      response,
      template,
    );

    return { success: true, message: 'Customer notification sent' };
  }

  @Post('archive/:requestId')
  async archiveRequest(
    @Param('requestId') requestId: number,
    @Body('request') request: RequestFormData,
    @Body('responderIds') responderIds: number[],
    @Body('template') template: string,
  ) {
    const requestWithId = { ...request, id: Number(requestId) };
    await this.requestBroadcastService.archiveRequestBroadcast(
      requestWithId,
      responderIds,
      template,
    );
    return { success: true, message: 'Archive notifications sent' };
  }

  @Get('example')
  getExampleData() {
    return {
      request: {
        id: 1,
        services: [{ services_id: { title: 'Cleaning' } }, { services_id: { title: 'Cooking' } }],
        city_id: { title: 'Moscow' },
        start: new Date().toISOString().split('T')[0] + 'T10:00:00',
        end: new Date().toISOString().split('T')[0] + 'T14:00:00',
        address: 'Red Square, 1',
        title: 'Need help with house cleaning',
        budget: 5000,
        description: 'Looking for someone to help clean my apartment',
      },
      groups: [
        { group_id: 123456789, title: 'Cleaners Group' },
        { group_id: 987654321, title: 'Helpers Group' },
      ],
      responderIds: [111222333, 444555666],
      customer: {
        id: 777888999,
        firstName: 'Ivan',
        lastName: 'Petrov',
      },
      performerId: 111222333,
      response: {
        id: 1,
        request_id: 1,
        performer_id: 111222333,
        message: 'I can help you with cleaning',
        price_offer: 4500,
        date_created: new Date().toISOString(),
      },
      templates: {
        broadcast: 'New request: {{title}}\nBudget: {{budget}} Тенге\nLocation: {{city_id}}\nServices: {{services}}\nDescription: {{description}}',
        update: 'Request #{{id}} has been updated!\nNew budget: {{budget}} Тенге',
        notification: 'New response for your request "{{title}}"\nPrice offer: {{priceOffer}} Тенге\nMessage: {{responseMessage}}',
        archive: 'Request #{{id}} "{{title}}" has been archived',
      }
    };
  }
}
