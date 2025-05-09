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

  async createRequestBroadcast(
    request: RequestFormData & { id: number },
    groups: Group[],
    template: string,
  ): Promise<void> {
    const message = this.formatMessage(template, request);

    for (const group of groups) {
      await this.broadcastQueue.add('send-group-message', {
        groupId: group.group_id,
        message,
      });
    }
  }

  async updateRequestBroadcast(
    responses: Array<{
      message: string;
      price_offer: number;
      request_id: RequestFormData;
      performer_id: { user_id: { id: string } };
    }>,
    changes: Record<string, any>,
    template: string,
  ): Promise<void> {
    const fieldNameMap: Record<string, string> = {
      title: 'Название',
      address: 'Местоположение',
      budget: 'Бюджет',
      start: 'Начало',
      end: 'Окончание',
      status: 'Статус',
      services: 'Услуги',
      city_id: 'Город',
    };

    const allowedFields = Object.keys(fieldNameMap);

    for (const response of responses) {
      const request = response.request_id;
      const performerId = response.performer_id.user_id.id;

      let changesText = '';
      for (const key of Object.keys(changes)) {
        if (allowedFields.includes(key)) {
          changesText += `- <b>${fieldNameMap[key]}</b>\n`;
        }
      }

      const message = this.formatMessage(template, {
        ...request,
        changes: changesText,
      });

      await this.broadcastQueue.add('send-personal-message', {
        userId: performerId,
        message,
      });
    }
  }

  async notifyCustomerOnResponse(
    request: RequestFormData & { id: number; customer: {  id: string } },
    response: Response,
    template: string,
    performer: { full_name: string },
  ): Promise<void> {
    const message = this.formatMessage(template, {
      ...request,
      performer_id: performer.full_name,
      message: response.message || '',
      price_offer: response.price_offer || 0,
    });

    await this.broadcastQueue.add('send-personal-message', {
      userId: request.customer.id,
      message: message,
      requestId: request.id,
    });
  }

  async archiveRequestBroadcast(
    request: RequestFormData & { id: number },
    responderIds: number[],
    template: string,
  ): Promise<void> {
    const message = this.formatMessage(template, request);

    const messageWithLink = `${message}\n\nОткрыть в приложении: https://t.me/your_bot_username/app`;
    for (const responderId of responderIds) {
      await this.broadcastQueue.add('send-personal-message', {
        userId: responderId,
        message: messageWithLink,
        requestId: request.id,
      });
    }
  }

  private formatMessage(template: string, data: any): string {
    let message = template;

    if (data.status === 'new') {
      message = message.replace(/{{status}}/g, 'Новая заявка');
    } else if (data.status === 'archived') {
      message = message.replace(/{{status}}/g, 'Архив');
    }

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'status') {
        // Status is already handled above
        return;
      } else if (key === 'start' || key === 'end') {
        try {
          const date = new Date(String(value));
          const formattedDateTime = date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          message = message.replace(
            new RegExp(`{{${key}}}`, 'g'),
            formattedDateTime,
          );
        } catch (error) {
          message = message.replace(
            new RegExp(`{{${key}}}`, 'g'),
            String(value),
          );
        }
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value) && key === 'services') {
          const servicesText = value
            .map((service: any) => service.services_id.title)
            .join(', ');
          message = message.replace(
            new RegExp(`{{${key}}}`, 'g'),
            servicesText,
          );
        } else if (key === 'city_id') {
          message = message.replace(
            new RegExp(`{{${key}}}`, 'g'),
            (value as any).title,
          );
        }
      } else {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }
    });

    message = message.replace(/{{[^{}]+}}/g, '');

    return message;
  }
}
