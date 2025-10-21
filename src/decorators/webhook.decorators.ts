import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WEBHOOK_CONTROLLER_METADATA = 'webhook_controller';
export const WEBHOOK_HANDLER_METADATA = 'webhook_handler';

/**
 * Decorator to mark a controller as a webhook controller
 */
export const WebhookController = (service: string) => {
  return SetMetadata(WEBHOOK_CONTROLLER_METADATA, service);
};

/**
 * Decorator to mark a method as a webhook handler
 */
export const WebhookHandler = (event?: string) => {
  return SetMetadata(WEBHOOK_HANDLER_METADATA, event || '*');
};

/**
 * Decorator to inject webhook payload
 */
export const WebhookPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.body;
  },
);

/**
 * Decorator to inject webhook headers
 */
export const WebhookHeaders = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers;
  },
);

/**
 * Decorator to inject specific webhook header
 */
export const WebhookHeader = createParamDecorator(
  (headerName: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers[headerName.toLowerCase()];
  },
);

/**
 * Decorator to inject webhook service name
 */
export const WebhookService = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.params.service;
  },
);

/**
 * Decorator to inject webhook event name
 */
export const WebhookEvent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.params.event || '*';
  },
);