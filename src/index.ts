// Main module
export { AutomationModule } from './automation.module';

// Services
export { AutomationService } from './services/automation.service';

// Controllers
export { WebhookController } from './controllers/webhook.controller';

// Drivers
export { BaseDriver } from './drivers/base.driver';
export { SlackDriver } from './drivers/slack.driver';
export { TelegramDriver } from './drivers/telegram.driver';
export { N8nDriver } from './drivers/n8n.driver';
export { WhatsAppDriver } from './drivers/whatsapp.driver';

// Decorators
export {
  WebhookController as WebhookControllerDecorator,
  WebhookHandler,
  WebhookPayload,
  WebhookHeaders,
  WebhookHeader,
  WebhookService,
} from './decorators/webhook.decorators';

// Interfaces
export * from './interfaces/automation.interface';