import { Injectable } from '@nestjs/common';
import { AutomationDriver } from '../interfaces/automation.interface';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

@Injectable()
export abstract class BaseDriver implements AutomationDriver {
  protected config: Record<string, any> = {};

  constructor(config?: Record<string, any>) {
    this.config = config || {};
  }

  /**
   * Get the name of the driver
   */
  abstract getName(): string;

  /**
   * Send data to the external service
   */
  abstract send(data: any, options?: any): Promise<any>;

  /**
   * Handle incoming webhook data
   */
  abstract handleWebhook(payload: any, headers?: Record<string, string>): Promise<any>;

  /**
   * Verify webhook signature (if supported)
   */
  verifyWebhook?(payload: any, signature: string): boolean;

  /**
   * Get configuration value
   */
  protected getConfigValue(key: string, defaultValue?: any): any {
    return this.config[key] ?? process.env[key.toUpperCase()] ?? defaultValue;
  }

  /**
   * Make HTTP request
   */
  protected async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    try {
      const response = await axios({
        method: method.toLowerCase() as any,
        url,
        ...config,
      });

      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `HTTP ${error.response?.status}: ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`
        );
      }
      throw error;
    }
  }

  /**
   * Log activity (override in subclasses for custom logging)
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.getName().toUpperCase()}] [${level.toUpperCase()}] ${message}`, data || '');
  }
}