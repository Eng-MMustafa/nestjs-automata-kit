import { Injectable, Inject } from '@nestjs/common';
import { AutomationDriver } from '../interfaces/automation.interface';

@Injectable()
export class AutomationService {
  private drivers = new Map<string, AutomationDriver>();

  constructor(
    @Inject('AUTOMATION_DRIVERS') 
    private readonly driverInstances: AutomationDriver[],
  ) {
    // Register all provided drivers
    this.driverInstances.forEach(driver => {
      this.drivers.set(driver.getName(), driver);
    });
  }

  /**
   * Get a driver by name
   */
  getDriver(name: string): AutomationDriver {
    const driver = this.drivers.get(name);
    if (!driver) {
      throw new Error(`Automation driver '${name}' not found`);
    }
    return driver;
  }

  /**
   * Check if a driver exists
   */
  hasDriver(name: string): boolean {
    return this.drivers.has(name);
  }

  /**
   * Get all available driver names
   */
  getAvailableDrivers(): string[] {
    return Array.from(this.drivers.keys());
  }

  /**
   * Send data to a specific service
   */
  async to(service: string): Promise<AutomationServiceSender> {
    const driver = this.getDriver(service);
    return new AutomationServiceSender(driver);
  }

  /**
   * Handle webhook for a specific service
   */
  async handleWebhook(
    service: string,
    payload: any,
    headers?: Record<string, string>,
  ): Promise<any> {
    const driver = this.getDriver(service);
    
    // Verify webhook if supported
    if (driver.verifyWebhook && headers) {
      const signature = headers['x-signature'] || headers['x-hub-signature-256'] || '';
      if (!driver.verifyWebhook(payload, signature)) {
        throw new Error('Webhook signature verification failed');
      }
    }

    return await driver.handleWebhook(payload, headers);
  }

  /**
   * Register a new driver
   */
  registerDriver(driver: AutomationDriver): void {
    this.drivers.set(driver.getName(), driver);
  }
}

/**
 * Helper class for fluent API
 */
export class AutomationServiceSender {
  constructor(private readonly driver: AutomationDriver) {}

  /**
   * Send data to the service
   */
  async send(data: any, options?: any): Promise<any> {
    return await this.driver.send(data, options);
  }
}