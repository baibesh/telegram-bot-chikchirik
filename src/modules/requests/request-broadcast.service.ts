import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RequestFormData, Group, User, Response } from '../../common/types/request.types';

@Injectable()
export class RequestBroadcastService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @InjectQueue('request-broadcast') private readonly broadcastQueue: Queue,
  ) {}

  /**
   * Creates a broadcast message for a request and sends it to specified groups
   * @param request - The request data with ID
   * @param groups - The groups to broadcast to
   * @param template - The template string with placeholders
   */
  async createRequestBroadcast(
    request: RequestFormData & { id: number },
    groups: Group[],
    template: string,
  ): Promise<void> {
    const message = this.formatMessage(template, request);

    // Add jobs to the queue for each group (limited to 30 messages per second)
    for (const group of groups) {
      await this.broadcastQueue.add('send-group-message', {
        groupId: group.group_id,
        message,
        requestId: request.id,
      });
    }
  }

  /**
   * Updates responders about changes to a request
   * @param request - The updated request data with ID
   * @param responderIds - IDs of users who have already responded
   * @param template - The template string with placeholders
   */
  async updateRequestBroadcast(
    request: RequestFormData & { id: number },
    responderIds: number[],
    template: string,
  ): Promise<void> {
    // Format the message using the template
    const message = this.formatMessage(template, request);


    // Send personal message to each responder
    for (const responderId of responderIds) {
      await this.broadcastQueue.add('send-personal-message', {
        userId: responderId,
        message,
        requestId: request.id,
      });
    }
  }

  /**
   * Notifies a customer about a new response to their request
   * @param request - The request data with ID and customer info
   * @param performerId - ID of the performer who responded
   * @param response - The response data
   * @param template - The template string with placeholders
   */
  async notifyCustomerOnResponse(
    request: RequestFormData & { id: number; customer: User },
    performerId: number,
    response: Response,
    template: string,
  ): Promise<void> {
    // Format the message using the template
    const message = this.formatMessage(template, {
      ...request,
      performerId,
      responseMessage: response.message || '',
      priceOffer: response.price_offer || 0,
    });

    // Add profile link
    const messageWithLink = `${message}\n\nПрофиль исполнителя: tg://user?id=${performerId}`;

    // Send message to customer
    await this.broadcastQueue.add('send-personal-message', {
      userId: request.customer.id,
      message: messageWithLink,
      requestId: request.id,
    });
  }

  /**
   * Notifies responders that a request has been archived
   * @param request - The request data
   * @param responderIds - IDs of all users who responded
   * @param template - The template string with placeholders
   */
  async archiveRequestBroadcast(
    request: RequestFormData & { id: number },
    responderIds: number[],
    template: string,
  ): Promise<void> {
    // Format the message using the template
    const message = this.formatMessage(template, request);

    // Add deep link to Mini App
    const messageWithLink = `${message}\n\nОткрыть в приложении: https://t.me/your_bot_username/app`;

    // Send message to each responder
    for (const responderId of responderIds) {
      await this.broadcastQueue.add('send-personal-message', {
        userId: responderId,
        message: messageWithLink,
        requestId: request.id,
      });
    }
  }

  /**
   * Formats a message by replacing placeholders with actual values
   * @param template - The template string with placeholders
   * @param data - The data to use for replacements
   * @returns Formatted message string
   */
  private formatMessage(template: string, data: any): string {
    let message = template;

    // Replace all placeholders in the format {{key}} with corresponding values
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Handle nested objects
        if (Array.isArray(value) && key === 'services') {
          // Format services array
          const servicesText = value.map((service: any) => service.services_id.title).join(', ');
          message = message.replace(new RegExp(`{{${key}}}`, 'g'), servicesText);
        } else if (key === 'city_id') {
          // Handle city_id object
          message = message.replace(new RegExp(`{{${key}}}`, 'g'), (value as any).title);
        } else if (key === 'customer') {
          // Skip customer data - don't show requester's data in the message
          // Remove any placeholders related to customer
          message = message.replace(/{{customerName}}/g, '');
        }
      } else {
        // Handle primitive values
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }
    });

    // Remove any remaining placeholders that weren't in the data object
    message = message.replace(/{{[^{}]+}}/g, '');

    return message;
  }
}
