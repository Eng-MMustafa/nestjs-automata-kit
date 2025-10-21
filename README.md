# NestJS Automata Kit

[![npm version](https://img.shields.io/npm/v/@nestjs-automata/kit.svg)](https://www.npmjs.com/package/@nestjs-automata/kit)
[![npm downloads](https://img.shields.io/npm/dm/@nestjs-automata/kit.svg)](https://www.npmjs.com/package/@nestjs-automata/kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful NestJS package for seamless automation integrations with popular platforms like **Slack**, **Telegram**, **n8n**, **Zapier**, **Make**, **WhatsApp**, **Google Sheets**, and more.

## 🚀 Features

- **TypeScript First**: Built with TypeScript for type safety and better developer experience
- **Decorator-Based**: Use elegant decorators for webhook handling and service integration
- **Multiple Drivers**: Built-in support for 10+ popular automation platforms
- **Dependency Injection**: Full NestJS DI support for easy testing and customization
- **Webhook Management**: Auto-generated secure webhook endpoints with signature verification
- **Event-Driven**: Reactive programming with RxJS observables
- **Modular Design**: Import only what you need
- **Production Ready**: Comprehensive logging, error handling, and security features

## 📦 Installation

```bash
npm install @nestjs-automata/kit
# or
yarn add @nestjs-automata/kit
```

## ⚙️ Basic Setup

### 1. Import the module

```typescript
import { Module } from '@nestjs/common';
import { AutomationModule } from '@nestjs-automata/kit';

@Module({
  imports: [
    AutomationModule.forRoot({
      drivers: {
        slack: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          botToken: process.env.SLACK_BOT_TOKEN,
        },
        telegram: {
          botToken: process.env.TELEGRAM_BOT_TOKEN,
        },
      },
      webhooks: {
        enabled: true,
        security: {
          verifySignatures: true,
        },
      },
    }),
  ],
})
export class AppModule {}
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token

# n8n
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-id
N8N_API_KEY=your-api-key
```

## 🎯 Quick Start

### Sending Messages

```typescript
import { Injectable } from '@nestjs/common';
import { AutomationService } from '@nestjs-automata/kit';

@Injectable()
export class NotificationService {
  constructor(private readonly automation: AutomationService) {}

  async sendSlackNotification(message: string) {
    const sender = await this.automation.to('slack');
    return sender.send({
      text: message,
      channel: '#notifications',
    });
  }

  async sendTelegramMessage(chatId: string, text: string) {
    const sender = await this.automation.to('telegram');
    return sender.send({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
    });
  }
}
```

### Handling Webhooks

```typescript
import { Controller, Post } from '@nestjs/common';
import { 
  WebhookPayload, 
  WebhookHeaders, 
  WebhookService 
} from '@nestjs-automata/kit';

@Controller('my-webhooks')
export class MyWebhookController {
  @Post('slack')
  async handleSlackWebhook(
    @WebhookPayload() payload: any,
    @WebhookHeaders() headers: Record<string, string>,
  ) {
    if (payload.event?.type === 'app_mention') {
      // Bot was mentioned
      return { challenge: payload.challenge };
    }
    return { status: 'ok' };
  }

  @Post('telegram')
  async handleTelegramWebhook(@WebhookPayload() update: any) {
    if (update.message) {
      console.log('Received message:', update.message.text);
    }
    return { status: 'ok' };
  }
}
```

### Using Built-in Webhook Controller

The package provides automatic webhook endpoints:

```
POST /webhooks/slack
POST /webhooks/telegram
POST /webhooks/n8n
POST /webhooks/slack/event-name
POST /webhooks/telegram/update-type
```

## 🔧 Available Drivers

### Communication Platforms
- **Slack**: Send messages, handle events, slash commands
- **Telegram**: Send messages, handle updates, inline keyboards  
- **Discord**: Send messages via webhooks
- **WhatsApp**: Send messages via WhatsApp Business API

### Automation Platforms
- **n8n**: Trigger workflows, handle responses
- **Zapier**: Send data to Zapier webhooks
- **Make** (Integromat): Trigger Make scenarios

### Business Tools
- **HubSpot**: CRM operations
- **Airtable**: Database operations
- **Google Sheets**: Spreadsheet operations
- **Google Drive**: File management

## 🎨 Advanced Usage

### Custom Drivers

Create your own automation drivers:

```typescript
import { Injectable } from '@nestjs/common';
import { BaseDriver } from '@nestjs-automata/kit';

@Injectable()
export class CustomServiceDriver extends BaseDriver {
  getName(): string {
    return 'custom_service';
  }

  async send(data: any, options?: any): Promise<any> {
    const apiKey = this.getConfigValue('CUSTOM_API_KEY');
    
    return this.makeRequest('POST', 'https://api.example.com/webhook', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      data,
    });
  }

  async handleWebhook(payload: any): Promise<any> {
    return { service: 'custom_service', payload, processed: true };
  }
}
```

### Async Configuration

```typescript
@Module({
  imports: [
    AutomationModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        drivers: {
          slack: {
            webhookUrl: configService.get('SLACK_WEBHOOK_URL'),
            botToken: configService.get('SLACK_BOT_TOKEN'),
          },
        },
        webhooks: { enabled: true },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Event Handling with Observables

```typescript
@Injectable()
export class WebhookEventHandler {
  constructor(private readonly automation: AutomationService) {}

  async handleOrderCreated(order: any) {
    // Send to multiple services simultaneously
    const notifications = [
      this.automation.to('slack').then(s => s.send({
        text: `🛒 New order #${order.id} - $${order.total}`,
        channel: '#orders'
      })),
      
      this.automation.to('telegram').then(s => s.send({
        chat_id: process.env.ADMIN_CHAT_ID,
        text: `New order received: $${order.total}`
      })),
    ];

    await Promise.all(notifications);
  }
}
```

## 🔒 Security

### Webhook Signature Verification

```typescript
AutomationModule.forRoot({
  webhooks: {
    security: {
      verifySignatures: true,
      allowedIPs: ['192.168.1.0/24'],
      requireHTTPS: true,
    },
  },
})
```

### Custom Guards

```typescript
import { Injectable, CanActivate } from '@nestjs/common';

@Injectable()
export class WebhookGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Custom webhook validation logic
    return true;
  }
}

@Controller('secure-webhooks')
@UseGuards(WebhookGuard)
export class SecureWebhookController {
  // Protected webhook endpoints
}
```

## 🧪 Testing

```typescript
import { Test } from '@nestjs/testing';
import { AutomationModule, AutomationService } from '@nestjs-automata/kit';

describe('AutomationService', () => {
  let service: AutomationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        AutomationModule.forRoot({
          drivers: {
            slack: { webhookUrl: 'https://test.webhook.url' },
          },
        }),
      ],
    }).compile();

    service = module.get<AutomationService>(AutomationService);
  });

  it('should send slack message', async () => {
    const sender = await service.to('slack');
    const result = await sender.send({ text: 'test message' });
    expect(result).toBeDefined();
  });
});
```

## 📚 Real-World Examples

### E-commerce Order Processing

```typescript
@Injectable()
export class OrderService {
  constructor(private readonly automation: AutomationService) {}

  async processOrder(order: CreateOrderDto) {
    // Save order to database
    const savedOrder = await this.orderRepository.save(order);

    // Notify team
    const slackSender = await this.automation.to('slack');
    await slackSender.send({
      text: `🛒 New order #${savedOrder.id}`,
      blocks: [
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Customer:* ${order.customerName}` },
            { type: 'mrkdwn', text: `*Total:* $${order.total}` },
          ]
        }
      ]
    });

    // Update CRM via n8n workflow
    const n8nSender = await this.automation.to('n8n');
    await n8nSender.send({
      customerId: order.customerId,
      orderTotal: order.total,
      items: order.items,
    });

    return savedOrder;
  }
}
```

### Customer Support Bot

```typescript
@Controller('webhooks')
export class SupportBotController {
  constructor(private readonly automation: AutomationService) {}

  @Post('telegram')
  async handleTelegramUpdate(@WebhookPayload() update: any) {
    if (update.message?.text?.startsWith('/support')) {
      const telegramSender = await this.automation.to('telegram');
      
      await telegramSender.send({
        chat_id: update.message.chat.id,
        text: '🎫 Support ticket created! Our team will respond soon.',
        reply_markup: {
          inline_keyboard: [[
            { text: '📞 Call Support', callback_data: 'call_support' },
            { text: '📧 Email Support', callback_data: 'email_support' }
          ]]
        }
      });

      // Notify support team on Slack
      const slackSender = await this.automation.to('slack');
      await slackSender.send({
        channel: '#support',
        text: `🆘 New support request from ${update.message.from.first_name}`,
        attachments: [{
          color: 'warning',
          fields: [
            { title: 'User', value: update.message.from.username, short: true },
            { title: 'Message', value: update.message.text, short: false }
          ]
        }]
      });
    }

    return { status: 'ok' };
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is [MIT licensed](LICENSE).

## 🚀 Roadmap

- [ ] GraphQL subscription support
- [ ] Message queuing with Redis
- [ ] Rate limiting and throttling
- [ ] Multi-tenant support
- [ ] Webhook replay functionality
- [ ] Built-in monitoring dashboard

---

**Developed by Mohammed Mustafa for the NestJS community** 🚀