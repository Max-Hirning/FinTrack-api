import {Test, TestingModule} from '@nestjs/testing';
import {PortfolioTransactionService} from './portfolio-transaction.service';
import {PortfolioTransactionController} from './portfolio-transaction.controller';

describe('PortfolioTransactionController', () => {
  let controller: PortfolioTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioTransactionController],
      providers: [PortfolioTransactionService],
    }).compile();

    controller = module.get<PortfolioTransactionController>(PortfolioTransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
