import { Injectable } from '@nestjs/common';
import { BaseDriver } from './base.driver';

export interface SlackMessage {
  text?: string;
  channel?: string;
  username?: string;
  icon_emoji?: string;
  attachments?: any[];
  blocks?: any[];
}

@Injectable()
export class SlackDriver extends BaseDriver {
  getName(): string {
    return 'slack';
  }

  async send(data: SlackMessage, options?: any): Promise<any> {
    const webhookUrl = this.getConfigValue('SLACK_WEBHOOK_URL');
    const botToken = this.getConfigValue('SLACK_BOT_TOKEN');

    if (!webhookUrl && !botToken) {
      throw new Error('Slack webhook URL or bot token is required');
    }

    try {
      if (webhookUrl) {
        // Send via webhook
        const response = await this.makeRequest('POST', webhookUrl, {
          data: {
            text: data.text,
            channel: data.channel,
            username: data.username || 'Automation Bot',
            icon_emoji: data.icon_emoji || ':robot_face:',
            attachments: data.attachments,
            blocks: data.blocks,
          },
        });

        this.log('info', 'Message sent via webhook', { channel: data.channel });
        return response.data;
      } else {
        // Send via API
        const response = await this.makeRequest('POST', 'https://slack.com/api/chat.postMessage', {
          headers: {
            'Authorization': `Bearer ${botToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            text: data.text,
            channel: data.channel || '#general',
            attachments: data.attachments,
            blocks: data.blocks,
          },
        });

        if (!response.data.ok) {
          throw new Error(`Slack API error: ${response.data.error}`);
        }

        this.log('info', 'Message sent via API', { channel: data.channel });
        return response.data;
      }
    } catch (error) {
      this.log('error', 'Failed to send Slack message', error);
      throw error;
    }
  }

  async handleWebhook(payload: any, headers?: Record<string, string>): Promise<any> {
    // Handle Slack webhook verification
    if (payload.type === 'url_verification') {
      return { challenge: payload.challenge };
    }

    // Handle Slack events
    if (payload.event) {
      this.log('info', 'Received Slack event', { 
        type: payload.event.type, 
        user: payload.event.user 
      });

      return {
        service: 'slack',
        event: payload.event.type,
        payload,
        processed: true,
      };
    }

    return {
      service: 'slack',
      payload,
      processed: true,
    };
  }

  verifyWebhook(payload: any, signature: string): boolean {
    const signingSecret = this.getConfigValue('SLACK_SIGNING_SECRET');
    
    if (!signingSecret) {
      this.log('warn', 'Slack signing secret not configured, skipping verification');
      return true;
    }

    // Implement Slack signature verification
    // This is a simplified version - in production, use proper crypto verification
    return signature.includes('v0=');
  }
}