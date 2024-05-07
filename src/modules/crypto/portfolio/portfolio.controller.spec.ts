import {Test, TestingModule} from '@nestjs/testing';
import {PortfolioService} from './portfolio.service';
import {PortfolioController} from './portfolio.controller';

describe('PortfolioController', () => {
  let controller: PortfolioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [PortfolioService],
    }).compile();

    controller = module.get<PortfolioController>(PortfolioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
