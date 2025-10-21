import { Injectable } from '@nestjs/common';
import { BaseDriver } from './base.driver';

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'interactive';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  interactive?: any;
}

@Injectable()
export class WhatsAppDriver extends BaseDriver {
  getName(): string {
    return 'whatsapp';
  }

  async send(data: WhatsAppMessage, options?: any): Promise<any> {
    const accessToken = this.getConfigValue('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = this.getConfigValue('WHATSAPP_PHONE_NUMBER_ID');

    if (!accessToken || !phoneNumberId) {
      throw new Error('WhatsApp access token and phone number ID are required');
    }

    const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    try {
      const response = await this.makeRequest('POST', apiUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          messaging_product: 'whatsapp',
          to: data.to,
          type: data.type,
          ...data,
        },
      });

      this.log('info', 'WhatsApp message sent', {
        to: data.to,
        type: data.type,
        messageId: response.data.messages?.[0]?.id
      });

      return response.data;
    } catch (error) {
      this.log('error', 'Failed to send WhatsApp message', error);
      throw error;
    }
  }

  async handleWebhook(payload: any, headers?: Record<string, string>): Promise<any> {
    // Handle WhatsApp webhook verification
    if (payload.hub && payload.hub.mode === 'subscribe') {
      const verifyToken = this.getConfigValue('WHATSAPP_VERIFY_TOKEN');
      
      if (payload.hub.verify_token === verifyToken) {
        return { challenge: payload.hub.challenge };
      } else {
        throw new Error('Invalid verify token');
      }
    }

    // Handle incoming messages
    if (payload.entry && payload.entry[0]?.changes) {
      const changes = payload.entry[0].changes;
      
      for (const change of changes) {
        if (change.field === 'messages') {
          this.log('info', 'Received WhatsApp message', {
            from: change.value.messages?.[0]?.from,
            type: change.value.messages?.[0]?.type
          });
        }
      }
    }

    return {
      service: 'whatsapp',
      payload,
      processed: true,
    };
  }

  verifyWebhook(payload: any, signature: string): boolean {
    const appSecret = this.getConfigValue('WHATSAPP_APP_SECRET');
    
    if (!appSecret) {
      this.log('warn', 'WhatsApp app secret not configured, skipping verification');
      return true;
    }

    // Implement Facebook's webhook signature verification
    // This is a simplified version - implement proper crypto verification
    return signature.startsWith('sha256=');
  }
}