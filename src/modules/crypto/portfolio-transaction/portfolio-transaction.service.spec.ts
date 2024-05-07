import {Test, TestingModule} from '@nestjs/testing';
import {PortfolioTransactionService} from './portfolio-transaction.service';

describe('PortfolioTransactionService', () => {
  let service: PortfolioTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioTransactionService],
    }).compile();

    service = module.get<PortfolioTransactionService>(PortfolioTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
