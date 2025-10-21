import { Test, TestingModule } from '@nestjs/testing';
import { AutomationService } from '../services/automation.service';
import { SlackDriver } from '../drivers/slack.driver';
import { TelegramDriver } from '../drivers/telegram.driver';

describe('AutomationService', () => {
  let service: AutomationService;
  let slackDriver: SlackDriver;
  let telegramDriver: TelegramDriver;

  beforeEach(async () => {
    slackDriver = new SlackDriver({ 
      SLACK_WEBHOOK_URL: 'https://test.slack.com/webhook' 
    });
    telegramDriver = new TelegramDriver({ 
      TELEGRAM_BOT_TOKEN: 'test-token' 
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationService,
        {
          provide: 'AUTOMATION_DRIVERS',
          useValue: [slackDriver, telegramDriver],
        },
      ],
    }).compile();

    service = module.get<AutomationService>(AutomationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have slack driver', () => {
    expect(service.hasDriver('slack')).toBe(true);
  });

  it('should have telegram driver', () => {
    expect(service.hasDriver('telegram')).toBe(true);
  });

  it('should return available drivers', () => {
    const drivers = service.getAvailableDrivers();
    expect(drivers).toContain('slack');
    expect(drivers).toContain('telegram');
  });

  it('should throw error for non-existent driver', () => {
    expect(() => service.getDriver('non-existent')).toThrow(
      "Automation driver 'non-existent' not found"
    );
  });

  it('should return automation sender for valid driver', async () => {
    const sender = await service.to('slack');
    expect(sender).toBeDefined();
  });
});