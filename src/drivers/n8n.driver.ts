import { Injectable } from '@nestjs/common';
import { BaseDriver } from './base.driver';

export interface N8nWorkflowData {
  [key: string]: any;
}

@Injectable()
export class N8nDriver extends BaseDriver {
  getName(): string {
    return 'n8n';
  }

  async send(data: N8nWorkflowData, options?: any): Promise<any> {
    const webhookUrl = this.getConfigValue('N8N_WEBHOOK_URL');
    const apiKey = this.getConfigValue('N8N_API_KEY');

    if (!webhookUrl) {
      throw new Error('N8n webhook URL is required');
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['X-N8N-API-KEY'] = apiKey;
      }

      const response = await this.makeRequest('POST', webhookUrl, {
        headers,
        data,
      });

      this.log('info', 'Workflow triggered successfully', { 
        webhook: webhookUrl.replace(/\/[^\/]+$/, '/***'),
        dataKeys: Object.keys(data)
      });

      return response.data;
    } catch (error) {
      this.log('error', 'Failed to trigger N8n workflow', error);
      throw error;
    }
  }

  async handleWebhook(payload: any, headers?: Record<string, string>): Promise<any> {
    this.log('info', 'Received N8n webhook', {
      payloadKeys: Object.keys(payload || {}),
      contentType: headers?.['content-type']
    });

    return {
      service: 'n8n',
      payload,
      processed: true,
      timestamp: new Date().toISOString(),
    };
  }

  verifyWebhook(payload: any, signature: string): boolean {
    // N8n doesn't use signature verification by default
    // You can implement custom verification if needed
    return true;
  }
}