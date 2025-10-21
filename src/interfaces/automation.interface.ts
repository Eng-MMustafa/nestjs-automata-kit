export interface AutomationDriver {
  /**
   * Get the name of the driver
   */
  getName(): string;

  /**
   * Send data to the external service
   */
  send(data: any, options?: any): Promise<any>;

  /**
   * Handle incoming webhook data
   */
  handleWebhook(payload: any, headers?: Record<string, string>): Promise<any>;

  /**
   * Verify webhook signature (if supported)
   */
  verifyWebhook?(payload: any, signature: string): boolean;
}

export interface AutomationDriverConfig {
  [key: string]: any;
}

export interface WebhookEvent {
  service: string;
  event?: string;
  payload: any;
  headers: Record<string, string>;
  timestamp: Date;
}

export interface AutomationModuleOptions {
  drivers?: AutomationDriverConfig;
  webhooks?: {
    enabled?: boolean;
    prefix?: string;
    security?: {
      verifySignatures?: boolean;
      allowedIPs?: string[];
      requireHTTPS?: boolean;
    };
  };
  global?: boolean;
}