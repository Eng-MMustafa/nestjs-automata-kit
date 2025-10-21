import { Injectable } from '@nestjs/common';
import { BaseDriver } from './base.driver';

export interface TelegramMessage {
  chat_id: string | number;
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
  reply_markup?: any;
  disable_notification?: boolean;
}

@Injectable()
export class TelegramDriver extends BaseDriver {
  getName(): string {
    return 'telegram';
  }

  async send(data: TelegramMessage, options?: any): Promise<any> {
    const botToken = this.getConfigValue('TELEGRAM_BOT_TOKEN');

    if (!botToken) {
      throw new Error('Telegram bot token is required');
    }

    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
      const response = await this.makeRequest('POST', apiUrl, {
        data: {
          chat_id: data.chat_id,
          text: data.text,
          parse_mode: data.parse_mode || 'Markdown',
          reply_markup: data.reply_markup,
          disable_notification: data.disable_notification || false,
        },
      });

      if (!response.data.ok) {
        throw new Error(`Telegram API error: ${response.data.description}`);
      }

      this.log('info', 'Message sent to Telegram', { 
        chat_id: data.chat_id, 
        message_id: response.data.result.message_id 
      });
      
      return response.data.result;
    } catch (error) {
      this.log('error', 'Failed to send Telegram message', error);
      throw error;
    }
  }

  async handleWebhook(payload: any, headers?: Record<string, string>): Promise<any> {
    // Handle Telegram updates
    if (payload.message) {
      this.log('info', 'Received Telegram message', {
        from: payload.message.from?.username,
        chat_id: payload.message.chat.id,
        text: payload.message.text
      });

      return {
        service: 'telegram',
        event: 'message',
        payload,
        processed: true,
      };
    }

    if (payload.callback_query) {
      this.log('info', 'Received Telegram callback query', {
        from: payload.callback_query.from?.username,
        data: payload.callback_query.data
      });

      return {
        service: 'telegram',
        event: 'callback_query',
        payload,
        processed: true,
      };
    }

    return {
      service: 'telegram',
      payload,
      processed: true,
    };
  }

  verifyWebhook(payload: any, signature: string): boolean {
    // Telegram doesn't use signature verification by default
    // Security is handled via the unique bot token in the webhook URL
    return true;
  }
}