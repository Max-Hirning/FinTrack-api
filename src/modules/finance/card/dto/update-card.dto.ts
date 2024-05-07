import {CreateCardDto} from './create-card.dto';
import {OmitType, PartialType} from '@nestjs/mapped-types';

export class UpdateCardDto extends PartialType(OmitType(CreateCardDto, ['ownerId', 'balance'])) {}