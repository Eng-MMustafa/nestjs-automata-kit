import { 
  Controller, 
  Post, 
  Param, 
  Body, 
  Headers, 
  HttpException, 
  HttpStatus,
  Logger 
} from '@nestjs/common';
import { AutomationService } from '../services/automation.service';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly automationService: AutomationService) {}

  @Post(':service')
  async handleWebhook(
    @Param('service') service: string,
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ): Promise<any> {
    try {
      this.logger.log(`Received webhook for service: ${service}`);

      if (!this.automationService.hasDriver(service)) {
        throw new HttpException(
          `Service '${service}' not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const result = await this.automationService.handleWebhook(
        service,
        payload,
        headers,
      );

      this.logger.log(`Successfully processed webhook for service: ${service}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to process webhook for service: ${service}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':service/:event')
  async handleWebhookWithEvent(
    @Param('service') service: string,
    @Param('event') event: string,
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ): Promise<any> {
    try {
      this.logger.log(`Received webhook for service: ${service}, event: ${event}`);

      if (!this.automationService.hasDriver(service)) {
        throw new HttpException(
          `Service '${service}' not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Add event to payload for context
      const enrichedPayload = {
        ...payload,
        _event: event,
      };

      const result = await this.automationService.handleWebhook(
        service,
        enrichedPayload,
        headers,
      );

      this.logger.log(`Successfully processed webhook for service: ${service}, event: ${event}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to process webhook for service: ${service}, event: ${event}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}