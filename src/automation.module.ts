import { Module, DynamicModule, Provider } from '@nestjs/common';
import { AutomationService } from './services/automation.service';
import { WebhookController } from './controllers/webhook.controller';
import { AutomationModuleOptions, AutomationDriver } from './interfaces/automation.interface';

// Import all drivers
import { SlackDriver } from './drivers/slack.driver';
import { TelegramDriver } from './drivers/telegram.driver';
import { N8nDriver } from './drivers/n8n.driver';
import { WhatsAppDriver } from './drivers/whatsapp.driver';

@Module({})
export class AutomationModule {
  static forRoot(options: AutomationModuleOptions = {}): DynamicModule {
    const drivers: Provider[] = [
      {
        provide: 'AUTOMATION_DRIVERS',
        useFactory: () => {
          const driverInstances: AutomationDriver[] = [];

          // Register default drivers
          if (!options.drivers || options.drivers.slack !== false) {
            driverInstances.push(new SlackDriver(options.drivers?.slack || {}));
          }

          if (!options.drivers || options.drivers.telegram !== false) {
            driverInstances.push(new TelegramDriver(options.drivers?.telegram || {}));
          }

          if (!options.drivers || options.drivers.n8n !== false) {
            driverInstances.push(new N8nDriver(options.drivers?.n8n || {}));
          }

          if (!options.drivers || options.drivers.whatsapp !== false) {
            driverInstances.push(new WhatsAppDriver(options.drivers?.whatsapp || {}));
          }

          return driverInstances;
        },
      },
    ];

    const providers: Provider[] = [
      ...drivers,
      AutomationService,
    ];

    const controllers = [];

    // Add webhook controller if enabled
    if (options.webhooks?.enabled !== false) {
      controllers.push(WebhookController);
    }

    return {
      module: AutomationModule,
      providers,
      controllers,
      exports: [AutomationService],
      global: options.global || false,
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<AutomationModuleOptions> | AutomationModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: AutomationModule,
      providers: [
        {
          provide: 'AUTOMATION_MODULE_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: 'AUTOMATION_DRIVERS',
          useFactory: async (moduleOptions: AutomationModuleOptions) => {
            const driverInstances: AutomationDriver[] = [];

            // Register default drivers based on options
            if (!moduleOptions.drivers || moduleOptions.drivers.slack !== false) {
              driverInstances.push(new SlackDriver(moduleOptions.drivers?.slack || {}));
            }

            if (!moduleOptions.drivers || moduleOptions.drivers.telegram !== false) {
              driverInstances.push(new TelegramDriver(moduleOptions.drivers?.telegram || {}));
            }

            if (!moduleOptions.drivers || moduleOptions.drivers.n8n !== false) {
              driverInstances.push(new N8nDriver(moduleOptions.drivers?.n8n || {}));
            }

            if (!moduleOptions.drivers || moduleOptions.drivers.whatsapp !== false) {
              driverInstances.push(new WhatsAppDriver(moduleOptions.drivers?.whatsapp || {}));
            }

            return driverInstances;
          },
          inject: ['AUTOMATION_MODULE_OPTIONS'],
        },
        AutomationService,
      ],
      controllers: [WebhookController],
      exports: [AutomationService],
      global: true,
    };
  }
}