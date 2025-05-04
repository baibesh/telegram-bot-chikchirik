import { Test, TestingModule } from '@nestjs/testing';
import { RequestBroadcastService } from './request-broadcast.service';
import { getQueueToken } from '@nestjs/bull';
import { TELEGRAF_TOKEN } from 'nestjs-telegraf';
import { RequestFormData, Group, User, Response } from '../../common/types/request.types';

describe('RequestBroadcastService', () => {
  let service: RequestBroadcastService;
  let mockQueue: any;
  let mockBot: any;

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn().mockResolvedValue({}),
    };

    mockBot = {
      telegram: {
        sendMessage: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestBroadcastService,
        {
          provide: getQueueToken('request-broadcast'),
          useValue: mockQueue,
        },
        {
          provide: TELEGRAF_TOKEN,
          useValue: mockBot,
        },
      ],
    }).compile();

    service = module.get<RequestBroadcastService>(RequestBroadcastService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRequestBroadcast', () => {
    it('should add a job to the queue for each group', async () => {
      // Arrange
      const request: RequestFormData & { id: number } = {
        id: 1,
        services: [{ services_id: { title: 'Service 1' } }, { services_id: { title: 'Service 2' } }],
        city_id: { title: 'New York' },
        start: '2023-01-01T10:00:00',
        end: '2023-01-01T12:00:00',
        title: 'Test Request',
        budget: 100,
        description: 'Test description',
      };

      const groups: Group[] = [
        { group_id: 101, title: 'Group 1' },
        { group_id: 102, title: 'Group 2' },
      ];

      const template = 'Request: {{title}}, Budget: {{budget}}';

      // Act
      await service.createRequestBroadcast(request, groups, template);

      // Assert
      expect(mockQueue.add).toHaveBeenCalledTimes(2);
      expect(mockQueue.add).toHaveBeenCalledWith('send-group-message', {
        groupId: 101,
        message: 'Request: Test Request, Budget: 100',
        requestId: 1,
      });
      expect(mockQueue.add).toHaveBeenCalledWith('send-group-message', {
        groupId: 102,
        message: 'Request: Test Request, Budget: 100',
        requestId: 1,
      });
    });
  });

  describe('updateRequestBroadcast', () => {
    it('should add a job to the queue for each responder', async () => {
      // Arrange
      const request: RequestFormData & { id: number } = {
        id: 1,
        services: [{ services_id: { title: 'Service 1' } }, { services_id: { title: 'Service 2' } }],
        city_id: { title: 'New York' },
        start: '2023-01-01T10:00:00',
        end: '2023-01-01T12:00:00',
        title: 'Test Request',
        budget: 100,
        description: 'Test description',
      };

      const responderIds = [201, 202];
      const template = 'Updated request: {{title}}, New budget: {{budget}}';

      // Act
      await service.updateRequestBroadcast(request, responderIds, template);

      // Assert
      expect(mockQueue.add).toHaveBeenCalledTimes(2);
      expect(mockQueue.add).toHaveBeenCalledWith('send-personal-message', {
        userId: 201,
        message: 'Updated request: Test Request, New budget: 100',
        requestId: 1,
      });
      expect(mockQueue.add).toHaveBeenCalledWith('send-personal-message', {
        userId: 202,
        message: 'Updated request: Test Request, New budget: 100',
        requestId: 1,
      });
    });
  });

  describe('notifyCustomerOnResponse', () => {
    it('should add a job to notify the customer', async () => {
      // Arrange
      const request: RequestFormData & { id: number; customer: User } = {
        id: 1,
        services: [{ services_id: { title: 'Service 1' } }],
        city_id: { title: 'New York' },
        start: '2023-01-01T10:00:00',
        end: '2023-01-01T12:00:00',
        title: 'Test Request',
        budget: 100,
        description: 'Test description',
        customer: { id: 301, firstName: 'John', lastName: 'Doe' },
      };

      const performerId = 401;
      const response: Response = {
        id: 501,
        request_id: 1,
        performer_id: 401,
        message: 'I can do this',
        price_offer: 90,
        date_created: '2023-01-01T10:00:00Z',
      };

      const template = 'New response from performer for request: {{title}}';

      // Act
      await service.notifyCustomerOnResponse(request, performerId, response, template);

      // Assert
      expect(mockQueue.add).toHaveBeenCalledTimes(1);
      expect(mockQueue.add).toHaveBeenCalledWith('send-personal-message', {
        userId: 301,
        message: expect.stringContaining('New response from performer for request: Test Request'),
        requestId: 1,
      });
    });
  });

  describe('archiveRequestBroadcast', () => {
    it('should add a job to notify each responder about archiving', async () => {
      // Arrange
      const request: RequestFormData & { id: number } = {
        id: 1,
        services: [{ services_id: { title: 'Service 1' } }],
        city_id: { title: 'New York' },
        start: '2023-01-01T10:00:00',
        end: '2023-01-01T12:00:00',
        title: 'Test Request',
        budget: 100,
        description: 'Test description',
      };

      const responderIds = [201, 202];
      const template = 'Request #{{id}} has been archived';

      // Act
      await service.archiveRequestBroadcast(request, responderIds, template);

      // Assert
      expect(mockQueue.add).toHaveBeenCalledTimes(2);
      expect(mockQueue.add).toHaveBeenCalledWith('send-personal-message', {
        userId: 201,
        message: expect.stringContaining('Request #1 has been archived'),
        requestId: 1,
      });
      expect(mockQueue.add).toHaveBeenCalledWith('send-personal-message', {
        userId: 202,
        message: expect.stringContaining('Request #1 has been archived'),
        requestId: 1,
      });
    });
  });
});
