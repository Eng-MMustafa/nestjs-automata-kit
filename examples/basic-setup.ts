import { Module } from '@nestjs/common';
import { AutomationModule } from 'nestjs-automata-kit';

@Module({
  imports: [
    AutomationModule.forRoot({
      drivers: {
        slack: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          botToken: process.env.SLACK_BOT_TOKEN,
          signingSecret: process.env.SLACK_SIGNING_SECRET,
        },
        telegram: {
          botToken: process.env.TELEGRAM_BOT_TOKEN,
        },
      },
      webhooks: {
        enabled: true,
        prefix: 'automation-webhooks',
        security: {
          verifySignatures: true,
          allowedIPs: ['0.0.0.0/0'], // Allow all IPs in development
          requireHTTPS: false, // Set to true in production
        },
      },
      global: true, // Make the module global
    }),
  ],
})
export class AppModule {}