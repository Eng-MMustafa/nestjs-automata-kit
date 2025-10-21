import { Injectable } from '@nestjs/common';
import { AutomationService } from '@nestjs-automata/kit';

@Injectable()
export class OrderService {
  constructor(private readonly automation: AutomationService) {}

  async processNewOrder(order: any) {
    try {
      // Send notification to Slack
      const slackSender = await this.automation.to('slack');
      await slackSender.send({
        text: `🛒 New order received!`,
        channel: '#orders',
        blocks: [
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Order ID:* ${order.id}`
              },
              {
                type: 'mrkdwn',
                text: `*Customer:* ${order.customer.name}`
              },
              {
                type: 'mrkdwn',
                text: `*Total:* $${order.total}`
              },
              {
                type: 'mrkdwn',
                text: `*Items:* ${order.items.length}`
              }
            ]
          }
        ]
      });

      // Send confirmation to customer via Telegram
      if (order.customer.telegramChatId) {
        const telegramSender = await this.automation.to('telegram');
        await telegramSender.send({
          chat_id: order.customer.telegramChatId,
          text: `🎉 Order confirmed!\\n\\nOrder #${order.id}\\nTotal: $${order.total}\\n\\nThank you for your purchase!`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '📦 Track Order',
                  callback_data: `track_${order.id}`
                },
                {
                  text: '🆘 Support',
                  callback_data: 'support'
                }
              ]
            ]
          }
        });
      }

      console.log(`Order ${order.id} processed successfully`);
      return { success: true };

    } catch (error) {
      console.error('Failed to process order:', error);
      throw error;
    }
  }

  async handleOrderCancellation(order: any) {
    // Notify relevant teams about cancellation
    const slackSender = await this.automation.to('slack');
    
    await slackSender.send({
      text: `❌ Order #${order.id} has been cancelled`,
      channel: '#orders',
      attachments: [
        {
          color: 'danger',
          fields: [
            {
              title: 'Customer',
              value: order.customer.name,
              short: true
            },
            {
              title: 'Reason',
              value: order.cancellationReason || 'No reason provided',
              short: true
            },
            {
              title: 'Refund Amount',
              value: `$${order.total}`,
              short: true
            }
          ]
        }
      ]
    });

    return { success: true };
  }
}