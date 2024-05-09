import {OmitType, PartialType} from '@nestjs/mapped-types';
import {CreatePortfolioTransactionDto} from './create-portfolio-transaction.dto';

export class UpdatePortfolioTransactionDto extends PartialType(OmitType(CreatePortfolioTransactionDto, ['asset', 'portfolioId'])) {}
