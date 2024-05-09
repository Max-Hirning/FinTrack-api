import {Test, TestingModule} from '@nestjs/testing';
import {PortfolioAnalyticsController} from './portfolio-analytics.controller';

describe('PortfolioAnalyticsController', () => {
  let controller: PortfolioAnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioAnalyticsController],
    }).compile();

    controller = module.get<PortfolioAnalyticsController>(PortfolioAnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
